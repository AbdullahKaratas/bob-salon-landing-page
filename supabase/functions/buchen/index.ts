// Einen Termin verbindlich eintragen.
//
// POST { datum, leistung_ids, start, name, email, telefon?, anmerkung?, website? }
//   -> { ok: true, termin_id, storno_token, start, ende }
//
// Zwei Absicherungen greifen hier ineinander:
//
//  1. Der gewuenschte Start wird gegen die frisch berechnete Slot-Liste
//     geprueft. Was nicht angeboten wurde, wird nicht gebucht - sonst koennte
//     jemand einen Zeitpunkt schicken, den das Frontend nie angezeigt hat.
//
//  2. Selbst danach bleibt ein Spalt: zwischen Berechnen und Schreiben kann
//     jemand anderes denselben Slot belegen. Diesen Spalt schliesst der
//     Exclusion-Constraint in der Datenbank. Schlaegt er zu, melden wir
//     ehrlich "inzwischen vergeben" statt doppelt zu buchen.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { json, fehler, istDatum, istEmail, eineZeile } from "../_shared/http.mjs";
import { pruefeDatum } from "../_shared/regeln.mjs";
import { ermittleSlots } from "../_shared/planung.mjs";

/** Postgres meldet eine verletzte Exclusion-Bedingung mit diesem Code. */
const EXCLUSION_VIOLATION = "23P01";

Deno.serve(async (req: Request) => {
  const ursprung = req.headers.get("origin") ?? undefined;

  if (req.method === "OPTIONS") {
    return json({}, { status: 204, ursprung });
  }
  if (req.method !== "POST") {
    return fehler("methode_nicht_erlaubt", { status: 405, ursprung });
  }

  let anfrage: Record<string, unknown>;
  try {
    anfrage = await req.json();
  } catch {
    return fehler("kein_gueltiges_json", { ursprung });
  }

  // Honigtopf: ein im Formular verstecktes Feld, das nur Bots ausfuellen.
  // Wir bestaetigen still, damit der Bot nicht lernt, dass er erkannt wurde.
  if (typeof anfrage.website === "string" && anfrage.website.length > 0) {
    return json({ ok: true, termin_id: null }, { ursprung });
  }

  const datum = anfrage.datum;
  const leistungIds = anfrage.leistung_ids;
  const start = anfrage.start;

  if (!istDatum(datum)) return fehler("datum_ungueltig", { ursprung });
  if (!Array.isArray(leistungIds) || leistungIds.some((id) => typeof id !== "string")) {
    return fehler("leistung_ids_ungueltig", { ursprung });
  }
  if (leistungIds.length === 0 || leistungIds.length > 5) {
    return fehler("leistungsauswahl_ungueltig", { ursprung });
  }

  const startMs = typeof start === "string" ? Date.parse(start) : NaN;
  if (Number.isNaN(startMs)) return fehler("start_ungueltig", { ursprung });

  const name = eineZeile(anfrage.name);
  const email = eineZeile(anfrage.email);
  const telefon = anfrage.telefon ? eineZeile(anfrage.telefon) : null;
  const anmerkung = typeof anfrage.anmerkung === "string"
    ? anfrage.anmerkung.trim().slice(0, 2000)
    : null;

  if (!name || name.length > 100) return fehler("name_ungueltig", { ursprung });
  if (!istEmail(email) || email.length > 200) return fehler("email_ungueltig", { ursprung });
  if (telefon && telefon.length > 40) return fehler("telefon_ungueltig", { ursprung });

  const jetzt = new Date();
  const datumsFehler = pruefeDatum(datum as string, jetzt);
  if (datumsFehler) return fehler(datumsFehler, { ursprung });

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    const ergebnis = await ermittleSlots(db, {
      datum: datum as string,
      leistungIds: leistungIds as string[],
      jetzt,
    });

    if (ergebnis.fehler) return fehler(ergebnis.fehler, { ursprung });

    // Absicherung 1: Wurde dieser Zeitpunkt ueberhaupt angeboten?
    if (!ergebnis.slots!.includes(startMs)) {
      return fehler("slot_nicht_verfuegbar", { status: 409, ursprung });
    }

    const endeMs = startMs + ergebnis.dauerMinuten! * 60_000;
    const zeitraum = `[${new Date(startMs).toISOString()},${new Date(endeMs).toISOString()})`;

    const { data: termin, error: schreibFehler } = await db
      .from("termine")
      .insert({
        zeitraum,
        leistung_ids: leistungIds,
        name,
        email,
        telefon,
        anmerkung,
        quelle: "online",
      })
      .select("id, storno_token")
      .single();

    // Absicherung 2: In der Zwischenzeit hat jemand anders gebucht.
    if (schreibFehler?.code === EXCLUSION_VIOLATION) {
      return fehler("slot_inzwischen_vergeben", { status: 409, ursprung });
    }
    if (schreibFehler) throw schreibFehler;

    return json(
      {
        ok: true,
        termin_id: termin.id,
        storno_token: termin.storno_token,
        start: new Date(startMs).toISOString(),
        ende: new Date(endeMs).toISOString(),
      },
      { status: 201, ursprung },
    );
  } catch (err) {
    console.error("buchen fehlgeschlagen:", err);
    return fehler("intern", { status: 500, ursprung });
  }
});
