// Verfuegbarkeit ermitteln.
//
// Bewusst geteilt zwischen beiden Funktionen: `slots` zeigt an, was frei ist,
// und `buchen` rechnet dasselbe noch einmal nach. Wuerde `buchen` der Anfrage
// glauben, koennte jemand einen beliebigen Zeitpunkt schicken - etwa nachts um
// drei oder mitten in einen anderen Termin hinein.

import { freieSlots, gesamtdauer } from "./verfuegbarkeit.mjs";
import { REGELN } from "./regeln.mjs";

const MINUTE = 60_000;

/**
 * @param {object} db Supabase-Client mit Service-Rolle
 * @param {object} anfrage
 * @param {string} anfrage.datum        'YYYY-MM-DD'
 * @param {string[]} anfrage.leistungIds
 * @param {Date} anfrage.jetzt
 * @returns {Promise<{fehler?: string, dauerMinuten?: number, slots?: number[]}>}
 */
export async function ermittleSlots(db, { datum, leistungIds, jetzt }) {
  const eindeutige = [...new Set(leistungIds)];
  if (eindeutige.length === 0) return { fehler: "keine_leistung" };

  const { data: leistungen, error: leistungsFehler } = await db
    .from("leistungen")
    .select("id, stuhl_minuten, online_buchbar")
    .in("id", eindeutige);

  if (leistungsFehler) throw leistungsFehler;
  if (leistungen.length !== eindeutige.length) return { fehler: "leistung_unbekannt" };
  if (leistungen.some((l) => !l.online_buchbar)) return { fehler: "leistung_nicht_buchbar" };

  const dauerMinuten = gesamtdauer(leistungen);

  const { data: fensterRoh, error: fensterFehler } = await db.rpc("oeffnungsfenster", {
    p_datum: datum,
  });
  if (fensterFehler) throw fensterFehler;

  // Geschlossen: keine Oeffnungszeiten, also auch keine Slots.
  if (!fensterRoh?.length) return { dauerMinuten, slots: [] };

  const fenster = fensterRoh.map((f) => ({
    von: Date.parse(f.von),
    bis: Date.parse(f.bis),
  }));

  // Etwas ueber den Tagesrand hinaus abfragen, damit ein Termin, der kurz vor
  // Ladenschluss beginnt und in den Puffer hineinragt, noch erfasst wird.
  const rand = REGELN.pufferMinuten * MINUTE;
  const tagVon = Math.min(...fenster.map((f) => f.von)) - rand;
  const tagBis = Math.max(...fenster.map((f) => f.bis)) + rand;

  const { data: belegtRoh, error: belegtFehler } = await db.rpc("belegte_zeiten", {
    p_von: new Date(tagVon).toISOString(),
    p_bis: new Date(tagBis).toISOString(),
  });
  if (belegtFehler) throw belegtFehler;

  const belegt = (belegtRoh ?? []).map((b) => ({
    von: Date.parse(b.von),
    bis: Date.parse(b.bis),
  }));

  const slots = freieSlots({
    fenster,
    belegt,
    dauerMinuten,
    rasterMinuten: REGELN.rasterMinuten,
    pufferMinuten: REGELN.pufferMinuten,
    fruehestens: jetzt.getTime() + REGELN.vorlaufMinuten * MINUTE,
  });

  return { dauerMinuten, slots };
}
