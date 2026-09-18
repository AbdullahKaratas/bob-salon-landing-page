/* ==========================================================================

   DIE BILDER DER SEITE

   Hier steht, welches Foto an welcher Stelle der Seite erscheint.
   Wer ein Foto austauschen will, muss nur zwei Dinge tun:

     1. Die neue Bilddatei in diesen Ordner legen (src/images/)
     2. Unten in der passenden Zeile den Dateinamen austauschen

   Drei Plaetze sind noch frei - sie stehen unten auf "null" und werden
   auf der Seite einfach uebersprungen, solange kein Foto da ist.
   Wie man sie fuellt, steht jeweils direkt darueber.

   ========================================================================== */

import handFoto from "./hand.jpg";
import innenFoto from "./innerplace.jpg";
import lichtFoto from "./lights.jpg";
import gruenFoto from "./green.jpg";
import salonFoto from "./aboutbob.jpg";

/* --------------------------------------------------------------------------
   1. DAS STARTBILD (ganz oben, hinter dem gelben bob-Schriftzug)

   Gewuenscht ist ein farbiges Foto von Haaren - gerne mit Haenden drin.
   Sobald es da ist:
       - Foto als z.B. "start-haare.jpg" in diesen Ordner legen
       - oben eine Zeile ergaenzen:  import startFoto from "./start-haare.jpg";
       - unten bei startbild  gruenFoto  durch  startFoto  ersetzen

   Fuer Handys darf es ein hochkant-Ausschnitt desselben Fotos sein.
   -------------------------------------------------------------------------- */

export const startbild = gruenFoto;
export const startbildMobil = gruenFoto;

/* --------------------------------------------------------------------------
   2. DAS PORTRAIT VON FRANCISCO (im Abschnitt "ueber bob-salon")

   Gewuenscht ist ein Foto, auf dem man Francisco in die Augen schaut.
   Solange hier null steht, zeigt der Abschnitt nur das Salonfoto.

   Sobald das Portrait da ist:
       - Foto als z.B. "portrait-francisco.jpg" in diesen Ordner legen
       - oben eine Zeile ergaenzen:  import portraitFoto from "./portrait-francisco.jpg";
       - unten bei portrait  null  durch  portraitFoto  ersetzen
   -------------------------------------------------------------------------- */

export const portrait = null;

/* --------------------------------------------------------------------------
   3. DAS SALONFOTO (im Abschnitt "ueber bob-salon", neben dem Text)
   -------------------------------------------------------------------------- */

export const salon = salonFoto;

/* --------------------------------------------------------------------------
   4. DIE GALERIE

   Die Fotos laufen in dieser Reihenfolge durch. Das Handfoto in Schwarz-Weiss
   steht bewusst am Schluss.

   Der erste Platz ist fuer ein Foto von Haaren frei. Sobald es da ist:
       - Foto als z.B. "galerie-haare.jpg" in diesen Ordner legen
       - oben eine Zeile ergaenzen:  import haareFoto from "./galerie-haare.jpg";
       - unten in der Liste  null  durch  haareFoto  ersetzen

   Plaetze, auf denen null steht, werden uebersprungen.
   -------------------------------------------------------------------------- */

export const galerie = [
   null,        /* <- hier kommt das Foto von Haaren hin */
   innenFoto,
   lichtFoto,
   gruenFoto,
   handFoto,    /* Hand in Schwarz-Weiss, bleibt am Schluss */
];
