-- Ausgangsdaten fuer die Reservierung.
--
-- Die Dauern sind Schaetzungen und muessen mit Francisco abgeglichen werden,
-- bevor das System live geht. Sie orientieren sich am Preisgefuege der
-- Preisliste: was mehr kostet, dauert in der Regel laenger.
--
-- arbeits_minuten weicht nur bei Farbe von stuhl_minuten ab (Einwirkzeit).
-- Genutzt wird das Feld noch nicht, siehe Kommentar in der Migration.

insert into leistungen
  (id, kategorie, gruppe, bezeichnung, preis_text, stuhl_minuten, arbeits_minuten, sortierung)
values
  ('damen-schnitt-kurz',    'schnitt', 'damen',  'schnitt · kurz',                            '75 €',     60,  60, 10),
  ('damen-schnitt-mittel',  'schnitt', 'damen',  'schnitt · mittel',                          '79 €',     60,  60, 20),
  ('damen-schnitt-lang',    'schnitt', 'damen',  'schnitt · lang',                            '85 €',     75,  75, 30),
  ('damen-schnitt-neu',     'schnitt', 'damen',  'neuer schnitt · bei größerer veränderung',  'ab 90 €',  90,  90, 40),

  ('herren-schnitt',        'schnitt', 'herren', 'schnitt',                                   '50 €',     45,  45, 50),
  ('herren-schnitt-neu',    'schnitt', 'herren', 'neuer schnitt · bei größerer veränderung',  'ab 60 €',  60,  60, 60),
  ('kids-schnitt',          'schnitt', 'herren', 'kids · 12–16 jahre',                        '39 €',     30,  30, 70),

  ('farbe-ansatz',          'farbe',   null,     'ansatz',                                    'ab 55 €',  90,  45, 80),
  ('farbe-ansatz-laengen',  'farbe',   null,     'ansatz + längen & spitzen',                 'ab 85 €', 120,  60, 90),
  ('farbe-painting',        'farbe',   null,     'painting',                                  'ab 80 €', 150,  90, 100),
  ('farbe-straehnen',       'farbe',   null,     'strähnen',                                  'ab 70 €', 120,  75, 110),

  ('styling',               'styling', null,     'styling',                                   'ab 40 €',  45,  45, 120),
  ('styling-event',         'styling', null,     'event hair styling',                        'ab 60 €',  60,  60, 130),

  ('brows-zupfen',          'brows',   null,     'augenbrauen zupfen',                        '10 €',     15,  15, 140),
  ('brows-faerben',         'brows',   null,     'augenbrauen färben',                        '12 €',     15,  15, 150)
on conflict (id) do nothing;

-- Platzhalter-Oeffnungszeiten. Stehen nirgends auf der Website und muessen
-- ebenfalls von Francisco bestaetigt werden. 0 = Sonntag, 6 = Samstag.
insert into oeffnungszeiten (wochentag, von, bis) values
  (2, '09:00', '18:00'),  -- Dienstag
  (3, '09:00', '18:00'),  -- Mittwoch
  (4, '09:00', '20:00'),  -- Donnerstag, langer Tag
  (5, '09:00', '18:00'),  -- Freitag
  (6, '09:00', '14:00')   -- Samstag
on conflict do nothing;
