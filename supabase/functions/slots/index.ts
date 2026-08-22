// Freie Termine fuer ein Datum und eine Auswahl an Leistungen.
//
// POST { datum: "2026-09-03", leistung_ids: ["damen-schnitt-kurz"] }
//   -> { ok: true, dauer_minuten: 60, slots: ["2026-09-03T07:00:00.000Z", ...] }
//
// Antwortet mit absoluten Zeitpunkten in UTC. Die Anzeige in Ortszeit ist
// Sache des Frontends.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { json, fehler, istDatum } from "../_shared/http.mjs";
import { pruefeDatum } from "../_shared/regeln.mjs";
import { ermittleSlots } from "../_shared/planung.mjs";

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

  const datum = anfrage.datum;
  const leistungIds = anfrage.leistung_ids;

  if (!istDatum(datum)) return fehler("datum_ungueltig", { ursprung });
  if (!Array.isArray(leistungIds) || leistungIds.some((id) => typeof id !== "string")) {
    return fehler("leistung_ids_ungueltig", { ursprung });
  }
  if (leistungIds.length > 5) return fehler("zu_viele_leistungen", { ursprung });

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

    return json(
      {
        ok: true,
        dauer_minuten: ergebnis.dauerMinuten,
        slots: ergebnis.slots!.map((ms) => new Date(ms).toISOString()),
      },
      { ursprung },
    );
  } catch (err) {
    console.error("slots fehlgeschlagen:", err);
    return fehler("intern", { status: 500, ursprung });
  }
});
