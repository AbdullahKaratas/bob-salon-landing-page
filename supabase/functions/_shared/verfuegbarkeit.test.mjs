// Tests fuer die Slot-Berechnung. Laufen ohne Datenbank und ohne Supabase:
//   node --test supabase/functions/_shared/
//
// Alle Zeiten in diesen Tests sind UTC. Das ist Absicht - die Funktion kennt
// keine Zeitzonen, und die Tests sollen das widerspiegeln.

import { test } from "node:test";
import assert from "node:assert/strict";
import { freieSlots, fasseZusammen, gesamtdauer } from "./verfuegbarkeit.mjs";

/** Kurzschreibweise: uhr("09:00") -> Zeitstempel am 1.9.2026 */
const uhr = (hhmm) => Date.parse(`2026-09-01T${hhmm}:00.000Z`);
/** Zeitstempel zurueck nach "HH:MM", damit Fehlermeldungen lesbar sind. */
const alsUhrzeit = (ms) => new Date(ms).toISOString().slice(11, 16);

const tag = [{ von: uhr("09:00"), bis: uhr("12:00") }];

test("leerer Tag wird komplett gerastert", () => {
  const slots = freieSlots({ fenster: tag, dauerMinuten: 60, rasterMinuten: 60 });
  assert.deepEqual(slots.map(alsUhrzeit), ["09:00", "10:00", "11:00"]);
});

test("ein Termin, der nicht mehr ganz ins Fenster passt, entfaellt", () => {
  const slots = freieSlots({ fenster: tag, dauerMinuten: 90, rasterMinuten: 60 });
  assert.deepEqual(slots.map(alsUhrzeit), ["09:00", "10:00"]);
});

test("belegte Zeit wird ausgespart", () => {
  const slots = freieSlots({
    fenster: tag,
    belegt: [{ von: uhr("10:00"), bis: uhr("11:00") }],
    dauerMinuten: 60,
    rasterMinuten: 60,
  });
  assert.deepEqual(slots.map(alsUhrzeit), ["09:00", "11:00"]);
});

test("ein Slot darf direkt an einen Termin angrenzen", () => {
  const slots = freieSlots({
    fenster: tag,
    belegt: [{ von: uhr("09:00"), bis: uhr("10:00") }],
    dauerMinuten: 60,
    rasterMinuten: 60,
  });
  assert.deepEqual(slots.map(alsUhrzeit), ["10:00", "11:00"]);
});

test("Puffer haelt Zeit vor und nach einem Termin frei", () => {
  const slots = freieSlots({
    fenster: tag,
    belegt: [{ von: uhr("10:00"), bis: uhr("10:30") }],
    dauerMinuten: 30,
    rasterMinuten: 30,
    pufferMinuten: 15,
  });
  // 09:30 faellt weg (endet 10:00, kollidiert mit dem Puffer ab 09:45),
  // 10:30 ebenso (Puffer laeuft bis 10:45).
  assert.deepEqual(slots.map(alsUhrzeit), ["09:00", "11:00", "11:30"]);
});

test("Puffer wird am Rand der Oeffnungszeit nicht abgezogen", () => {
  const slots = freieSlots({
    fenster: [{ von: uhr("09:00"), bis: uhr("10:00") }],
    dauerMinuten: 60,
    rasterMinuten: 15,
    pufferMinuten: 30,
  });
  assert.deepEqual(slots.map(alsUhrzeit), ["09:00"]);
});

test("Mindestvorlauf blendet zu kurzfristige Slots aus", () => {
  const slots = freieSlots({
    fenster: tag,
    dauerMinuten: 60,
    rasterMinuten: 60,
    fruehestens: uhr("10:30"),
  });
  assert.deepEqual(slots.map(alsUhrzeit), ["11:00"]);
});

test("mehrere Fenster, etwa mit Mittagspause", () => {
  const slots = freieSlots({
    fenster: [
      { von: uhr("09:00"), bis: uhr("11:00") },
      { von: uhr("13:00"), bis: uhr("15:00") },
    ],
    dauerMinuten: 60,
    rasterMinuten: 60,
  });
  assert.deepEqual(slots.map(alsUhrzeit), ["09:00", "10:00", "13:00", "14:00"]);
});

test("Slots bleiben auf dem Raster, auch hinter einem krummen Termin", () => {
  const slots = freieSlots({
    fenster: tag,
    belegt: [{ von: uhr("09:00"), bis: uhr("09:50") }],
    dauerMinuten: 30,
    rasterMinuten: 15,
  });
  // 09:50 waere frei, liegt aber nicht auf dem Raster - der naechste ist 10:00.
  assert.equal(alsUhrzeit(slots[0]), "10:00");
  for (const s of slots) {
    assert.equal((s - uhr("09:00")) % (15 * 60_000), 0, `${alsUhrzeit(s)} liegt nicht auf dem Raster`);
  }
});

test("ein ganztaegig belegter Tag liefert nichts", () => {
  const slots = freieSlots({
    fenster: tag,
    belegt: [{ von: uhr("08:00"), bis: uhr("13:00") }],
    dauerMinuten: 30,
  });
  assert.deepEqual(slots, []);
});

test("ueberlappende Sperren werden zusammengefasst", () => {
  const zusammen = fasseZusammen([
    { von: uhr("10:00"), bis: uhr("11:00") },
    { von: uhr("10:30"), bis: uhr("12:00") },
    { von: uhr("09:00"), bis: uhr("09:30") },
  ]);
  assert.deepEqual(
    zusammen.map((z) => `${alsUhrzeit(z.von)}-${alsUhrzeit(z.bis)}`),
    ["09:00-09:30", "10:00-12:00"]
  );
});

test("unsinnige Dauer wird abgewiesen", () => {
  assert.throws(() => freieSlots({ fenster: tag, dauerMinuten: 0 }), /dauerMinuten/);
  assert.throws(() => freieSlots({ fenster: tag, dauerMinuten: 60, rasterMinuten: 0 }), /rasterMinuten/);
});

test("Kombinationen werden aufsummiert", () => {
  assert.equal(gesamtdauer([{ stuhl_minuten: 60 }, { stuhl_minuten: 90 }]), 150);
  assert.equal(gesamtdauer([]), 0);
});
