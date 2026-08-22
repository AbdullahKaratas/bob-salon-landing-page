-- Zeitfenster-Abfragen fuer die Slot-Berechnung.
--
-- Diese Funktionen existieren, damit die Zeitzonenumrechnung in Postgres
-- passiert und nicht in JavaScript. Postgres kennt Europe/Berlin samt
-- Sommerzeitumstellung; die Edge Function bekommt nur noch absolute
-- Zeitpunkte und muss ueber Kalender nichts wissen.

-- Oeffnungszeiten eines konkreten Tages als absolute Zeitpunkte.
-- Eine Ausnahme fuer den Tag ersetzt die regulaeren Zeiten vollstaendig:
-- ist sie als geschlossen eingetragen, kommt nichts zurueck.
create or replace function oeffnungsfenster(p_datum date)
returns table (von timestamptz, bis timestamptz)
language sql
stable
set search_path = public
as $$
  with ausnahme as (
    select * from ausnahmen where datum = p_datum
  )
  select
    (p_datum + a.von) at time zone 'Europe/Berlin',
    (p_datum + a.bis) at time zone 'Europe/Berlin'
  from ausnahme a
  where not a.geschlossen

  union all

  select
    (p_datum + o.von) at time zone 'Europe/Berlin',
    (p_datum + o.bis) at time zone 'Europe/Berlin'
  from oeffnungszeiten o
  where o.wochentag = extract(dow from p_datum)
    and not exists (select 1 from ausnahme)

  order by 1;
$$;

comment on function oeffnungsfenster(date) is
  'Oeffnungszeiten eines Tages als absolute Zeitpunkte. Ausnahmen schlagen die Regelzeiten.';

-- Belegte Zeiten in einem Bereich. Umfasst Online-Buchungen und die aus
-- Franciscos GMX-Kalender uebernommenen Termine gleichermassen - beide
-- blocken.
create or replace function belegte_zeiten(p_von timestamptz, p_bis timestamptz)
returns table (von timestamptz, bis timestamptz)
language sql
stable
set search_path = public
as $$
  select lower(zeitraum), upper(zeitraum)
  from termine
  where status = 'bestaetigt'
    and zeitraum && tstzrange(p_von, p_bis, '[)')
  order by 1;
$$;

comment on function belegte_zeiten(timestamptz, timestamptz) is
  'Bestaetigte Termine, die den angefragten Bereich schneiden.';

-- Die Funktionen laufen ueber den Service-Key aus den Edge Functions.
-- Anonymer Zugriff ist nicht vorgesehen: oeffnungsfenster waere harmlos,
-- belegte_zeiten wuerde aber Franciscos Auslastung offenlegen.
revoke execute on function oeffnungsfenster(date) from anon;
revoke execute on function belegte_zeiten(timestamptz, timestamptz) from anon;
