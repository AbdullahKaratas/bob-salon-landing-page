# Terminreservierung — Entwicklungsstand

Branch `reservierung`. Noch nichts davon ist live oder mit einem Supabase-Projekt
verbunden.

## Rahmenbedingungen

- Francisco arbeitet **allein**. Es gibt genau eine Ressource, deshalb reicht
  eine einzige Überschneidungsregel statt einer Ressourcenplanung.
- Sein Kalender liegt bei **GMX** (`bob-ma@gmx.de`). GMX spricht CalDAV über
  `https://caldav.gmx.net/` mit einem anwendungsspezifischen Passwort — kein
  OAuth nötig, und das Passwort lässt sich einzeln widerrufen.
- GMX gehört 1&1 Mail & Media, Montabaur. Der Kalender bleibt damit in
  Deutschland.
- CalDAV läuft über gewöhnliches HTTP. Die Portsperre von Supabase, die bei
  SMTP im Weg stand, greift hier nicht.

## Was steht

| Datei | Inhalt |
|---|---|
| `supabase/migrations/20260821120000_reservierung.sql` | Schema: Leistungen, Öffnungszeiten, Ausnahmen, Termine, RLS |
| `supabase/seed.sql` | Leistungen mit geschätzten Dauern, Platzhalter-Öffnungszeiten |
| `supabase/migrations/20260822090000_zeitfenster.sql` | SQL-Funktionen `oeffnungsfenster` und `belegte_zeiten` |
| `supabase/functions/_shared/verfuegbarkeit.mjs` | Slot-Berechnung, reine Arithmetik |
| `supabase/functions/_shared/planung.mjs` | Verfügbarkeit ermitteln, von beiden Endpunkten genutzt |
| `supabase/functions/_shared/regeln.mjs` | Raster, Puffer, Vorlauf, Buchungshorizont |
| `supabase/functions/_shared/http.mjs` | CORS, JSON, Eingabeprüfungen |
| `supabase/functions/slots/index.ts` | POST → freie Zeiten |
| `supabase/functions/buchen/index.ts` | POST → Termin anlegen |
| `…/*.test.mjs` | 26 Tests, laufen ohne Infrastruktur |

Tests: `npm run test:reservierung`

## Zwei Entscheidungen, die den Rest tragen

**Doppelbuchungen verhindert die Datenbank, nicht der Code.** In `termine` sitzt
ein Exclusion-Constraint auf `tstzrange`. Klicken zwei Leute im selben Moment auf
denselben Slot, scheitert der zweite Insert. Eine Prüfung in der Anwendung
könnte das nicht garantieren, weil zwischen Prüfen und Schreiben immer eine
Lücke bleibt.

**Zeitzonen rechnet Postgres, nie JavaScript.** Öffnungszeiten stehen als lokale
Uhrzeit pro Wochentag; die Umrechnung auf konkrete Zeitpunkte macht Postgres mit
`at time zone 'Europe/Berlin'`. Die JS-Logik sieht nur absolute Zeitstempel.
Deshalb ist sie ohne Datenbank testbar, und die Sommerzeit geht nicht kaputt.

## Was Francisco noch bestätigen muss

1. **Dauer je Leistung.** Die Werte in `seed.sql` sind geschätzt.
2. **Einwirkzeit.** Bedient er während der Einwirkzeit jemand anderen? Falls ja,
   kann `arbeits_minuten` genutzt werden, um Termine zu verschachteln. Version 1
   blockt die volle Stuhlzeit.
3. **Öffnungszeiten.** Die in `seed.sql` sind frei erfunden.
4. **Puffer zwischen Terminen.** Aufräumen, durchfegen, kurz durchatmen.
5. **Mindestvorlauf.** Wie kurzfristig darf online gebucht werden?
6. **Storno-Frist.**

## Nächste Schritte

- [x] Edge Function `slots` — freie Zeiten für Leistung und Datum
- [x] Edge Function `buchen` — Termin anlegen, Constraint-Verletzung sauber
      abfangen und als „Slot inzwischen vergeben" zurückgeben
- [ ] Bestätigungsmail mit Storno-Link
- [ ] CalDAV-Abgleich mit dem GMX-Kalender, beide Richtungen
- [ ] Buchungsstrecke im Frontend
- [ ] Adminansicht für Francisco
- [ ] Abschnitt in der Datenschutzerklärung: jetzt werden Daten gespeichert,
      nicht mehr nur durchgereicht. Löschkonzept und Fristen nötig.
- [ ] AVV mit Supabase

## Die Endpunkte

```
POST /functions/v1/slots
  { "datum": "2026-09-03", "leistung_ids": ["damen-schnitt-kurz"] }
  → { "ok": true, "dauer_minuten": 60, "slots": ["2026-09-03T07:00:00.000Z", …] }

POST /functions/v1/buchen
  { "datum", "leistung_ids", "start", "name", "email", "telefon?", "anmerkung?" }
  → 201 { "ok": true, "termin_id", "storno_token", "start", "ende" }
  → 409 { "ok": false, "fehler": "slot_inzwischen_vergeben" }
```

Zeiten gehen als UTC über die Leitung. Die Anzeige in Ortszeit macht das
Frontend.

### Warum `buchen` die Verfügbarkeit noch einmal rechnet

Zwei Absicherungen greifen ineinander. Erstens wird der gewünschte Start gegen
die frisch berechnete Slot-Liste geprüft — was nie angeboten wurde, wird nicht
gebucht, sonst könnte jemand per `curl` einen Termin um drei Uhr nachts
eintragen. Zweitens bleibt selbst danach ein Spalt zwischen Rechnen und
Schreiben, und genau den schließt der Exclusion-Constraint: Postgres lässt den
zweiten Insert mit `23P01` scheitern, und der Endpunkt meldet ehrlich „inzwischen
vergeben".

Beide Endpunkte nutzen dieselbe Funktion `ermittleSlots`. Zwei getrennte
Implementierungen würden früher oder später auseinanderlaufen, und dann wäre
buchbar, was nicht angezeigt wurde.

## Was ich zum Deployen brauche

- Projekt-URL und `anon`-Key des Supabase-Projekts
- Anwendungsspezifisches Passwort für `bob-ma@gmx.de` (als Supabase-Secret,
  nicht ins Repository)
- Entscheidung, worüber Bestätigungsmails laufen. EmailJS ist bei 200 Nachrichten
  im Monat gedeckelt; pro Buchung fallen zwei an (Bestätigung und Erinnerung).

## Altlast

`src/Components/Reservation.js` ist ein früherer Anlauf, der nie eingebunden
wurde: 152 Zeilen, verschickt per EmailJS an dieselbe Vorlage wie das
Kontaktformular. Wird durch die neue Buchungsstrecke ersetzt und kann dann weg.
