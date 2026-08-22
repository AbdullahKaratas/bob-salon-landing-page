// Buchungsregeln an einer Stelle.
//
// Alle Werte muessen noch mit Francisco abgestimmt werden - sie stehen hier
// zusammen, damit das eine Aenderung an einer Datei ist und nicht eine Suche
// durch den Code.

export const REGELN = {
  /** Startzeiten liegen nur auf diesem Raster. */
  rasterMinuten: 15,
  /** Freizuhaltende Zeit vor und nach jedem Termin: aufraeumen, durchfegen. */
  pufferMinuten: 15,
  /** So kurzfristig darf online nicht mehr gebucht werden. */
  vorlaufMinuten: 120,
  /** So weit im Voraus darf gebucht werden. */
  horizontTage: 90,
};

/**
 * Prueft, ob ein Datum im buchbaren Zeitraum liegt.
 * @param {string} datum 'YYYY-MM-DD'
 * @param {Date} jetzt
 * @returns {null|string} null wenn in Ordnung, sonst ein Fehlercode
 */
export function pruefeDatum(datum, jetzt) {
  const tag = Date.parse(`${datum}T00:00:00.000Z`);
  if (Number.isNaN(tag)) return "datum_ungueltig";

  const heute = Date.parse(`${jetzt.toISOString().slice(0, 10)}T00:00:00.000Z`);
  if (tag < heute) return "datum_vergangen";

  const grenze = heute + REGELN.horizontTage * 86_400_000;
  if (tag > grenze) return "datum_zu_weit";

  return null;
}
