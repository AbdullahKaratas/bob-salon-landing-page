-- Terminreservierung fuer bob salon.
--
-- Grundannahme: Francisco arbeitet allein. Es gibt also genau eine Ressource,
-- und zwei bestaetigte Termine duerfen sich niemals ueberschneiden. Diese Regel
-- steht bewusst als Constraint in der Datenbank und nicht in der Anwendung -
-- sie muss auch dann halten, wenn zwei Leute im selben Moment auf denselben
-- Slot klicken.
--
-- Zeitzonen: Alle Zeitpunkte werden als timestamptz (also UTC) gespeichert.
-- Die Umrechnung nach Europe/Berlin passiert ausschliesslich in Postgres,
-- niemals in JavaScript - sonst geht die Sommerzeit irgendwann schief.

-- ---------------------------------------------------------------- Leistungen

create table if not exists leistungen (
  id              text primary key,
  kategorie       text not null,
  gruppe          text,
  bezeichnung     text not null,
  preis_text      text not null,
  -- Wie lange der Platz belegt ist.
  stuhl_minuten   integer not null check (stuhl_minuten > 0),
  -- Wie lange Francisco tatsaechlich gebunden ist. Bei Farbe liegt dazwischen
  -- die Einwirkzeit. Version 1 blockt die volle Stuhlzeit; das Feld ist da,
  -- damit spaeter Termine verschachtelt werden koennen, ohne migrieren zu muessen.
  arbeits_minuten integer not null check (arbeits_minuten > 0),
  online_buchbar  boolean not null default true,
  sortierung      integer not null default 0,
  constraint arbeit_passt_in_stuhlzeit check (arbeits_minuten <= stuhl_minuten)
);

comment on column leistungen.arbeits_minuten is
  'Noch ungenutzt. Vorbereitung fuer verschachtelte Termine waehrend der Einwirkzeit.';

-- ------------------------------------------------------------ Oeffnungszeiten

create table if not exists oeffnungszeiten (
  id        bigserial primary key,
  -- 0 = Sonntag, 6 = Samstag (wie extract(dow ...) in Postgres)
  wochentag integer not null check (wochentag between 0 and 6),
  von       time not null,
  bis       time not null,
  constraint zeitfenster_sinnvoll check (von < bis)
);

-- Abweichungen: Urlaub, Feiertage, verkuerzte Tage.
create table if not exists ausnahmen (
  id          bigserial primary key,
  datum       date not null unique,
  geschlossen boolean not null default true,
  von         time,
  bis         time,
  grund       text,
  constraint zeiten_nur_wenn_geoeffnet check (
    (geschlossen and von is null and bis is null)
    or (not geschlossen and von is not null and bis is not null and von < bis)
  )
);

-- ------------------------------------------------------------------- Termine

create table if not exists termine (
  id            uuid primary key default gen_random_uuid(),
  zeitraum      tstzrange not null,
  leistung_ids  text[] not null check (array_length(leistung_ids, 1) > 0),

  name          text not null check (length(trim(name)) between 1 and 100),
  email         text not null check (length(email) between 3 and 200),
  telefon       text,
  anmerkung     text check (anmerkung is null or length(anmerkung) <= 2000),

  status        text not null default 'bestaetigt'
                  check (status in ('bestaetigt', 'abgesagt')),
  -- Erlaubt Absagen per Link, ohne dass sich jemand anmelden muss.
  storno_token  uuid not null default gen_random_uuid(),

  -- 'kalender' sind Termine, die aus Franciscos GMX-Kalender stammen, also
  -- Laufkundschaft und Telefontermine. Sie blocken genauso.
  quelle        text not null default 'online'
                  check (quelle in ('online', 'kalender')),
  caldav_uid    text unique,

  erstellt_am   timestamptz not null default now(),
  geaendert_am  timestamptz not null default now(),

  -- Das Herzstueck: zwei bestaetigte Termine koennen sich nicht ueberlappen.
  -- Auch nicht bei gleichzeitigen Schreibzugriffen - Postgres laesst den
  -- zweiten Insert scheitern statt doppelt zu buchen.
  constraint keine_doppelbuchung
    exclude using gist (zeitraum with &&) where (status = 'bestaetigt')
);

create index if not exists termine_zeitraum_idx on termine using gist (zeitraum);
create index if not exists termine_storno_token_idx on termine (storno_token);

create or replace function setze_geaendert_am() returns trigger
language plpgsql as $$
begin
  new.geaendert_am := now();
  return new;
end;
$$;

drop trigger if exists termine_geaendert_am on termine;
create trigger termine_geaendert_am
  before update on termine
  for each row execute function setze_geaendert_am();

-- --------------------------------------------------------------------- RLS
--
-- Standard ist: niemand kommt ueber die PostgREST-API an die Daten. Buchungen
-- laufen ausschliesslich ueber Edge Functions mit dem Service-Key, weil nur
-- dort geprueft werden kann, ob ein Slot ueberhaupt angeboten wurde.
-- Leistungen und Oeffnungszeiten sind oeffentliche Informationen und duerfen
-- direkt gelesen werden.

alter table termine         enable row level security;
alter table leistungen      enable row level security;
alter table oeffnungszeiten enable row level security;
alter table ausnahmen       enable row level security;

-- Bewusst keine Policy fuer "termine": kein Zugriff ueber die oeffentliche API.

create policy "leistungen sind oeffentlich lesbar"
  on leistungen for select using (true);

create policy "oeffnungszeiten sind oeffentlich lesbar"
  on oeffnungszeiten for select using (true);

create policy "ausnahmen sind oeffentlich lesbar"
  on ausnahmen for select using (true);
