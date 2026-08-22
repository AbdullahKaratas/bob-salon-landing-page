// Gemeinsames HTTP-Handwerkszeug fuer die Edge Functions.

const ERLAUBTER_URSPRUNG = "https://bob.salon";

/** @param {string|undefined} ursprung Origin-Header der Anfrage */
export function corsKopf(ursprung) {
  // Waehrend der Entwicklung laeuft das Frontend auf localhost. Nur diese
  // beiden Ursprunge werden gespiegelt, alles andere bekommt die Live-Domain
  // und damit vom Browser einen Riegel vorgeschoben.
  const erlaubt =
    ursprung && /^http:\/\/localhost:\d+$/.test(ursprung)
      ? ursprung
      : ERLAUBTER_URSPRUNG;

  return {
    "Access-Control-Allow-Origin": erlaubt,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(daten, { status = 200, ursprung } = {}) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: {
      ...corsKopf(ursprung),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function fehler(code, { status = 400, ursprung } = {}) {
  return json({ ok: false, fehler: code }, { status, ursprung });
}

/** Kopfzeilen duerfen keine Zeilenumbrueche enthalten - sonst Header-Injection. */
export function eineZeile(wert) {
  return String(wert ?? "").replace(/[\r\n]+/g, " ").trim();
}

export function istEmail(wert) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert);
}

/** 'YYYY-MM-DD' - bewusst streng, damit keine Zeitzonen durch die Hintertuer kommen. */
export function istDatum(wert) {
  return typeof wert === "string" && /^\d{4}-\d{2}-\d{2}$/.test(wert);
}
