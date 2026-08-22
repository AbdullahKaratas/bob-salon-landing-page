// Tests fuer Planung und Regeln. Laufen ohne Datenbank: der Supabase-Client
// wird durch eine Attrappe ersetzt, die feste Antworten liefert.
//
//   npm run test:reservierung

import { test } from "node:test";
import assert from "node:assert/strict";
import { ermittleSlots } from "./planung.mjs";
import { pruefeDatum, REGELN } from "./regeln.mjs";
import { istDatum, istEmail, eineZeile, corsKopf } from "./http.mjs";

/**
 * Minimale Attrappe des Supabase-Clients. Deckt genau die zwei Zugriffsmuster
 * ab, die planung.mjs nutzt: ein select().in() auf leistungen und zwei rpc().
 */
function attrappe({ leistungen = [], fenster = [], belegt = [] } = {}) {
  return {
    from() {
      return {
        select() {
          return {
            in(_spalte, ids) {
              return Promise.resolve({
                data: leistungen.filter((l) => ids.includes(l.id)),
                error: null,
              });
            },
          };
        },
      };
    },
    rpc(name) {
      if (name === "oeffnungsfenster") return Promise.resolve({ data: fenster, error: null });
      if (name === "belegte_zeiten") return Promise.resolve({ data: belegt, error: null });
      throw new Error(`unerwarteter Aufruf: ${name}`);
    },
  };
}

const TAG = "2026-09-03";
const iso = (hhmm) => `${TAG}T${hhmm}:00.000Z`;
const uhrzeit = (isoText) => isoText.slice(11, 16);

const schnitt = { id: "damen-schnitt-kurz", stuhl_minuten: 60, online_buchbar: true };
const farbe = { id: "farbe-ansatz", stuhl_minuten: 90, online_buchbar: true };
// Weit vor dem Testtag, damit der Mindestvorlauf nie hineinspielt.
const JETZT = new Date("2026-09-01T00:00:00.000Z");

test("freier Tag liefert Slots ueber die ganze Oeffnungszeit", async () => {
  const db = attrappe({
    leistungen: [schnitt],
    fenster: [{ von: iso("08:00"), bis: iso("11:00") }],
  });

  const { dauerMinuten, slots } = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [schnitt.id],
    jetzt: JETZT,
  });

  assert.equal(dauerMinuten, 60);
  assert.equal(uhrzeit(new Date(slots[0]).toISOString()), "08:00");
  assert.equal(uhrzeit(new Date(slots.at(-1)).toISOString()), "10:00");
});

test("bestehender Termin blockt samt Puffer", async () => {
  // Termin 09:00-10:00, Puffer 15 Minuten -> gesperrt ist 08:45 bis 10:15.
  const db = attrappe({
    leistungen: [schnitt],
    fenster: [{ von: iso("08:00"), bis: iso("12:00") }],
    belegt: [{ von: iso("09:00"), bis: iso("10:00") }],
  });

  const { slots } = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [schnitt.id],
    jetzt: JETZT,
  });

  // Vor dem Termin bleiben nur 45 Minuten - fuer einen 60-Minuten-Schnitt zu
  // wenig. Danach geht es direkt hinter dem Puffer weiter.
  assert.deepEqual(
    slots.map((s) => uhrzeit(new Date(s).toISOString())),
    ["10:15", "10:30", "10:45", "11:00"]
  );
});

test("kurze Leistung passt noch in die Luecke vor einem Termin", async () => {
  const brows = { id: "brows-zupfen", stuhl_minuten: 30, online_buchbar: true };
  const db = attrappe({
    leistungen: [brows],
    fenster: [{ von: iso("08:00"), bis: iso("09:00") }],
    belegt: [{ von: iso("09:00"), bis: iso("10:00") }],
  });

  const { slots } = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [brows.id],
    jetzt: JETZT,
  });

  // 08:15 endet exakt um 08:45, wo der Puffer beginnt - das ist noch erlaubt.
  assert.deepEqual(
    slots.map((s) => uhrzeit(new Date(s).toISOString())),
    ["08:00", "08:15"]
  );
});

test("mehrere Leistungen werden zu einem laengeren Termin summiert", async () => {
  const db = attrappe({
    leistungen: [schnitt, farbe],
    fenster: [{ von: iso("08:00"), bis: iso("11:00") }],
  });

  const { dauerMinuten, slots } = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [schnitt.id, farbe.id],
    jetzt: JETZT,
  });

  assert.equal(dauerMinuten, 150);
  // 150 Minuten passen nur noch einmal in ein Dreistundenfenster.
  assert.deepEqual(
    slots.map((s) => uhrzeit(new Date(s).toISOString())),
    ["08:00", "08:15", "08:30"]
  );
});

test("geschlossener Tag liefert keine Slots, aber keinen Fehler", async () => {
  const db = attrappe({ leistungen: [schnitt], fenster: [] });

  const ergebnis = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [schnitt.id],
    jetzt: JETZT,
  });

  assert.equal(ergebnis.fehler, undefined);
  assert.deepEqual(ergebnis.slots, []);
});

test("unbekannte Leistung wird abgewiesen", async () => {
  const db = attrappe({ leistungen: [schnitt], fenster: [{ von: iso("08:00"), bis: iso("11:00") }] });

  const ergebnis = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: ["gibt-es-nicht"],
    jetzt: JETZT,
  });

  assert.equal(ergebnis.fehler, "leistung_unbekannt");
});

test("nicht online buchbare Leistung wird abgewiesen", async () => {
  const db = attrappe({
    leistungen: [{ ...schnitt, online_buchbar: false }],
    fenster: [{ von: iso("08:00"), bis: iso("11:00") }],
  });

  const ergebnis = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [schnitt.id],
    jetzt: JETZT,
  });

  assert.equal(ergebnis.fehler, "leistung_nicht_buchbar");
});

test("doppelt geschickte Leistung zaehlt nur einmal", async () => {
  const db = attrappe({
    leistungen: [schnitt],
    fenster: [{ von: iso("08:00"), bis: iso("11:00") }],
  });

  const { dauerMinuten } = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [schnitt.id, schnitt.id],
    jetzt: JETZT,
  });

  assert.equal(dauerMinuten, 60);
});

test("Mindestvorlauf schneidet kurzfristige Slots ab", async () => {
  const db = attrappe({
    leistungen: [schnitt],
    fenster: [{ von: iso("08:00"), bis: iso("12:00") }],
  });

  const { slots } = await ermittleSlots(db, {
    datum: TAG,
    leistungIds: [schnitt.id],
    jetzt: new Date(iso("08:00")), // Vorlauf: 120 Minuten
  });

  assert.equal(uhrzeit(new Date(slots[0]).toISOString()), "10:00");
});

// ------------------------------------------------------------------ Regeln

test("vergangene und zu weit entfernte Daten werden abgewiesen", () => {
  const jetzt = new Date("2026-09-03T10:00:00.000Z");
  assert.equal(pruefeDatum("2026-09-03", jetzt), null, "heute ist erlaubt");
  assert.equal(pruefeDatum("2026-09-02", jetzt), "datum_vergangen");
  assert.equal(pruefeDatum("2030-01-01", jetzt), "datum_zu_weit");
  assert.equal(pruefeDatum("kein-datum", jetzt), "datum_ungueltig");

  const gerade_noch = new Date(Date.parse("2026-09-03T00:00:00.000Z") + REGELN.horizontTage * 86_400_000);
  assert.equal(pruefeDatum(gerade_noch.toISOString().slice(0, 10), jetzt), null);
});

// -------------------------------------------------------------------- HTTP

test("Eingabepruefungen", () => {
  assert.ok(istDatum("2026-09-03"));
  assert.ok(!istDatum("3.9.2026"));
  assert.ok(!istDatum("2026-09-03T10:00:00Z"));

  assert.ok(istEmail("kunde@example.com"));
  assert.ok(!istEmail("kunde@example"));
  assert.ok(!istEmail("kein email"));
});

test("Zeilenumbrueche werden aus Kopfzeilenwerten entfernt", () => {
  assert.equal(eineZeile("Anna\r\nBcc: opfer@example.com"), "Anna Bcc: opfer@example.com");
  assert.equal(eineZeile("  Anna  "), "Anna");
  assert.equal(eineZeile(undefined), "");
});

test("CORS spiegelt nur localhost, sonst die Live-Domain", () => {
  assert.equal(corsKopf("http://localhost:3000")["Access-Control-Allow-Origin"], "http://localhost:3000");
  assert.equal(corsKopf("https://boese.example")["Access-Control-Allow-Origin"], "https://bob.salon");
  assert.equal(corsKopf(undefined)["Access-Control-Allow-Origin"], "https://bob.salon");
});
