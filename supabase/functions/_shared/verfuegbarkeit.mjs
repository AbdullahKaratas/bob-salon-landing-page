// Berechnung freier Termin-Slots.
//
// Bewusst reine Arithmetik auf absoluten Zeitpunkten (Millisekunden seit Epoch):
// keine Zeitzonen, keine Kalenderlogik, keine Abhaengigkeiten. Die Umrechnung
// von "Dienstag, 9 bis 18 Uhr in Europe/Berlin" auf konkrete Zeitpunkte macht
// Postgres, weil Postgres Sommerzeit korrekt kann und JavaScript nicht.
//
// Dadurch laesst sich diese Datei mit `node --test` pruefen, ohne dass eine
// Datenbank oder ein Supabase-Projekt laufen muss.

const MINUTE = 60_000;

/**
 * Legt ueberlappende oder aneinandergrenzende Zeitraeume zusammen.
 * @param {Array<{von: number, bis: number}>} zeitraeume
 * @returns {Array<{von: number, bis: number}>} aufsteigend sortiert, ohne Ueberlappungen
 */
export function fasseZusammen(zeitraeume) {
  const sortiert = [...zeitraeume]
    .filter((z) => z.bis > z.von)
    .sort((a, b) => a.von - b.von);

  const ergebnis = [];
  for (const z of sortiert) {
    const letzter = ergebnis[ergebnis.length - 1];
    if (letzter && z.von <= letzter.bis) {
      letzter.bis = Math.max(letzter.bis, z.bis);
    } else {
      ergebnis.push({ von: z.von, bis: z.bis });
    }
  }
  return ergebnis;
}

/**
 * Freie Startzeitpunkte fuer einen Termin bestimmter Laenge.
 *
 * @param {object} eingabe
 * @param {Array<{von: number, bis: number}>} eingabe.fenster
 *        Oeffnungszeiten des Tages als absolute Zeitpunkte. Mehrere Fenster
 *        sind erlaubt, etwa wenn mittags geschlossen ist.
 * @param {Array<{von: number, bis: number}>} eingabe.belegt
 *        Bereits vergebene Zeiten - Online-Buchungen und Termine aus Franciscos
 *        Kalender gleichermassen.
 * @param {number} eingabe.dauerMinuten      Laenge des gewuenschten Termins.
 * @param {number} [eingabe.rasterMinuten]   Startzeiten nur auf diesem Raster, Standard 15.
 * @param {number} [eingabe.pufferMinuten]   Freizuhaltende Zeit vor und nach jedem Termin.
 * @param {number} [eingabe.fruehestens]     Kein Slot davor. Fuer Mindestvorlauf.
 * @returns {number[]} Startzeitpunkte, aufsteigend.
 */
export function freieSlots({
  fenster,
  belegt = [],
  dauerMinuten,
  rasterMinuten = 15,
  pufferMinuten = 0,
  fruehestens = Number.NEGATIVE_INFINITY,
}) {
  if (!Number.isFinite(dauerMinuten) || dauerMinuten <= 0) {
    throw new Error("dauerMinuten muss eine positive Zahl sein");
  }
  if (!Number.isFinite(rasterMinuten) || rasterMinuten <= 0) {
    throw new Error("rasterMinuten muss eine positive Zahl sein");
  }

  const dauer = dauerMinuten * MINUTE;
  const raster = rasterMinuten * MINUTE;
  const puffer = pufferMinuten * MINUTE;

  // Puffer gehoert an die belegten Zeiten, nicht an den Slot: sonst wuerde er
  // auch am Rand der Oeffnungszeit abgezogen, wo er nicht noetig ist.
  const gesperrt = fasseZusammen(
    belegt.map((b) => ({ von: b.von - puffer, bis: b.bis + puffer }))
  );

  const slots = [];

  for (const f of fasseZusammen(fenster)) {
    // Auf das Raster aufrunden, relativ zum Fensterbeginn. Oeffnet der Salon
    // um 9:00, liegen die Slots bei 9:00, 9:15, ... - nicht bei 9:07.
    let start = f.von;

    while (start + dauer <= f.bis) {
      const ende = start + dauer;

      if (start < fruehestens) {
        start += raster;
        continue;
      }

      // Erste Sperre, die diesen Slot schneidet.
      const kollision = gesperrt.find((g) => g.von < ende && start < g.bis);

      if (!kollision) {
        slots.push(start);
        start += raster;
        continue;
      }

      // Direkt hinter die Sperre springen und wieder aufs Raster legen,
      // statt sich in Rasterschritten durch einen langen Termin zu arbeiten.
      const versatz = (kollision.bis - f.von) % raster;
      start = versatz === 0
        ? kollision.bis
        : kollision.bis + (raster - versatz);
    }
  }

  return slots;
}

/**
 * Gesamtdauer mehrerer Leistungen.
 *
 * Kombinationen sind in der Praxis kuerzer als die Summe, weil etwa nur einmal
 * gewaschen wird. Solange Francisco keine konkreten Kombi-Zeiten nennt, wird
 * schlicht summiert - lieber zu viel Zeit einplanen als einen Kunden warten
 * lassen.
 *
 * @param {Array<{stuhl_minuten: number}>} leistungen
 * @returns {number}
 */
export function gesamtdauer(leistungen) {
  return leistungen.reduce((summe, l) => summe + l.stuhl_minuten, 0);
}
