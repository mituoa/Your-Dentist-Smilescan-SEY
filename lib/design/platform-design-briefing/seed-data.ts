import type { PlatformDesignBriefingAreaSlug } from "@/lib/design/platform-design-briefing/types";
import { PLATFORM_DESIGN_BRIEFING_SLUG } from "@/lib/design/platform-design-briefing/types";

export type BriefingSeedSection = {
  sectionNumber: number;
  slug: string;
  title: string;
  contentMarkdown: string;
};

export type BriefingSeedArea = {
  slug: PlatformDesignBriefingAreaSlug;
  title: string;
  description: string;
  sortOrder: number;
  sectionNumbers: number[];
};

export const PLATFORM_DESIGN_BRIEFING_SEED = {
  slug: PLATFORM_DESIGN_BRIEFING_SLUG,
  title: "Internes Design-Briefing — UI/UX, Website und visuelle Außendarstellung",
  version: 1,
  status: "active" as const,
  scopeLabel:
    "Gestaltung der Softwareoberflächen, Website-Struktur, Landingpages, Partnerbereiche, Patientenbereiche, PDF-nahen Ansichten, visuellen Kommunikationsflächen, Bildauswahl, Komponenten, Layouts und digitalen Markendarstellung.",
  targetAudience:
    "Zahnärzt:innen, Kieferorthopäd:innen, Praxisinhaber:innen, Behandler:innen, zahnmedizinische Entscheider:innen, Praxisteams sowie Patient:innen im Kontext einer zahnärztlich begleiteten Ersteinschätzung.",
  preambleMarkdown: `INTERNES DESIGN-BRIEFING

UI/UX, Website-Gestaltung und visuelle Außendarstellung für zahnmedizinische Zielgruppen

**Geltungsbereich:**
Dieses Dokument gilt für die Gestaltung der Softwareoberflächen, Website-Struktur, Landingpages, Partnerbereiche, Patientenbereiche, PDF-nahen Ansichten, visuellen Kommunikationsflächen, Bildauswahl, Komponenten, Layouts und digitalen Markendarstellung.

**Zielgruppe:**
Zahnärzt:innen, Kieferorthopäd:innen, Praxisinhaber:innen, Behandler:innen, zahnmedizinische Entscheider:innen, Praxisteams sowie Patient:innen im Kontext einer zahnärztlich begleiteten Ersteinschätzung.`,
  sections: [
    {
      sectionNumber: 1,
      slug: "designauftrag",
      title: "Designauftrag",
      contentMarkdown: `Das Design soll nicht wie eine klassische Dental-Website, eine Marketing-App oder ein SaaS-Vertriebssystem wirken.

Die Gestaltung muss den Eindruck eines strukturierten, fachlich ernstzunehmenden und präzise kontrollierten Systems vermitteln.

Die visuelle Sprache soll zahnärztliche Kompetenz nicht überstrahlen, sondern unterstützen. Das System steht nicht über der Praxis. Es schafft Ordnung, Übersicht, Dokumentation und eine hochwertige digitale Umgebung für zahnärztliche Kommunikation.

Der zentrale Anspruch lautet:

Die Gestaltung muss klinische Ruhe, technische Präzision und institutionelle Wertigkeit verbinden.`,
    },
    {
      sectionNumber: 2,
      slug: "strategische-designhaltung",
      title: "Strategische Designhaltung",
      contentMarkdown: `Die Zielgruppe reagiert stark auf visuelle Signale von Qualität, Kontrolle, Ordnung und Seriosität.

Deshalb darf die Gestaltung nicht werblich, verspielt, bunt, modisch oder überaktiv wirken. Sie muss reduziert, präzise und fachlich anschlussfähig sein.

Das Design soll folgende Wirkung erzeugen:

* geordnet
* hochwertig
* kontrolliert
* medizinisch anschlussfähig
* technisch präzise
* ruhig
* substanziell
* vertrauenswürdig
* nicht aufdringlich
* nicht verkäuferisch
* nicht konsumorientiert

Die Nutzer:innen sollen nicht das Gefühl haben, eine Werbefläche zu betreten. Sie sollen den Eindruck eines strukturierten digitalen Arbeits- und Orientierungssystems erhalten.`,
    },
    {
      sectionNumber: 3,
      slug: "visuelle-grundrichtung",
      title: "Visuelle Grundrichtung",
      contentMarkdown: `Die visuelle Welt basiert auf:

1. klinischer Reduktion
2. präziser Typografie
3. ruhigen Flächen
4. kontrolliertem Kontrast
5. hochwertiger Materialwirkung
6. anatomischer und dentaler Detailnähe
7. klarer Informationshierarchie
8. zurückhaltender Bewegung
9. dokumentationsfähiger Struktur
10. professioneller Distanz

Die Gestaltung darf nicht versuchen, durch dekorative Elemente aufzuwerten. Wertigkeit entsteht durch Proportion, Abstand, Licht, Material, Ordnung und konsequente Reduktion.`,
    },
    {
      sectionNumber: 4,
      slug: "gestaltungsprinzipien",
      title: "Gestaltungsprinzipien",
      contentMarkdown: `### 4.1 Ordnung vor Dekoration

Jedes visuelle Element muss eine funktionale oder strukturelle Aufgabe erfüllen. Dekorative Elemente ohne klare Funktion sind zu vermeiden.

### 4.2 Ruhe vor Aktivierung

Die Oberfläche soll führen, nicht drängen. CTAs, Hinweise, Statusflächen und Navigationselemente müssen klar erkennbar sein, dürfen aber keine werbliche Dringlichkeit erzeugen.

### 4.3 Präzision vor Effekt

Animationen, Verläufe, Schatten, Icons und Übergänge sind nur einzusetzen, wenn sie Orientierung, Hierarchie oder Bedienbarkeit verbessern.

### 4.4 Klinische Anschlussfähigkeit

Die Gestaltung muss in einem zahnmedizinischen Qualitätsumfeld bestehen können. Sie darf nicht wie ein branchenfremdes Startup-Template wirken.

### 4.5 Fachliche Hierarchie

Die Oberfläche muss klar zeigen, welche Informationen primär, sekundär und ergänzend sind. Befunde, Fotos, Freigaben, Status und Reports benötigen eindeutige visuelle Priorität.

### 4.6 Kontrollierte Wertigkeit

Die Marke soll hochwertig wirken, ohne Luxusklischees zu verwenden. Kein plakativer Gold-Schwarz-Luxus, keine Beauty-Ästhetik, keine künstliche Exklusivität.

### 4.7 Dokumentationslogik

Die Software muss visuell wie ein System für strukturierte Fallbearbeitung wirken. Jeder Schritt soll nachvollziehbar, ruhig und geordnet erscheinen.

### 4.8 Zurückhaltende Technologie

Digitale Elemente sollen präzise und modern wirken, aber nicht dominant. Die Technologie ist Infrastruktur, nicht Showelement.

### 4.9 Patient:innenverständlichkeit

Patientenansichten müssen klar, zugänglich und ruhig sein. Sie dürfen nicht wie Konsumwerbung wirken und keine medizinische Endgültigkeit suggerieren.

### 4.10 Langfristige visuelle Stabilität

Die Gestaltung soll nicht auf kurzfristigen Designtrends basieren. Layout, Typografie, Farbwelt und Bildsprache müssen dauerhaft tragfähig sein.`,
    },
    {
      sectionNumber: 5,
      slug: "farbwelt",
      title: "Farbwelt",
      contentMarkdown: `Die Farbwelt soll Tiefe, Ruhe, Präzision und medizinische Wertigkeit erzeugen.

**Primäre Farbrichtung**

* Tiefschwarz
* Graphit
* Anthrazit
* dunkles Navy
* klinisches Dunkelblau
* mineralisches Grau
* Off-White
* kühles Silber
* gedämpftes Blau

**Akzentfarben**

Akzentfarben dürfen nur sparsam eingesetzt werden. Sie dienen der Orientierung, nicht der Dekoration.

Geeignete Akzente:

* helles, klinisches Blau
* gedämpftes Cyan
* sehr dezentes Silber
* zurückhaltendes Elfenbein
* minimaler warmer Akzent für Hervorhebung, nicht als Luxuscode

**Zu vermeiden**

* grelles Dental-Blau
* Neonfarben
* knalliges Grün
* Pink
* aggressive Farbverläufe
* übertriebene Goldakzente
* bunte SaaS-Farbpaletten
* freundliche Illustrationsfarben ohne klinische Tiefe
* klassische Zahnarztpraxis-Farbwelten ohne Eigenständigkeit

Farbe wird nicht eingesetzt, um Aufmerksamkeit zu erzwingen. Farbe dient Orientierung, Status, Hierarchie und Markenruhe.`,
    },
    {
      sectionNumber: 6,
      slug: "typografie",
      title: "Typografie",
      contentMarkdown: `Die Typografie muss sachlich, präzise und hochwertig wirken.

**Anforderungen**

* klare Sans-Serif-Typografie
* starke Lesbarkeit auf Desktop und Mobile
* kontrollierte Größenhierarchie
* großzügige Zeilenhöhe
* klare Headline-Struktur
* ruhige Großbuchstaben nur bei Haupttiteln oder Systembezeichnungen
* keine verspielten Schriftschnitte
* keine aggressiven Display-Fonts
* keine modischen Editorial-Fonts ohne funktionale Lesbarkeit

**Wirkung**

Die Typografie soll an folgende Bereiche anschließen:

* medizinische Dokumentation
* Fachpublikation
* Laborumgebung
* klinisches System
* Architektur
* technische Präzision

Textflächen müssen visuell atmen. Zu enge Abstände, überladene Blöcke und schwache Hierarchien sind zu vermeiden.`,
    },
    {
      sectionNumber: 7,
      slug: "layoutsystem",
      title: "Layoutsystem",
      contentMarkdown: `Das Layout muss klar, modular und skalierbar sein.

**Grundanforderungen**

* großzügige Abstände
* klare Rasterstruktur
* reduzierte Sektionen
* starke vertikale Ordnung
* eindeutige Informationsgruppen
* ruhige Cards
* kontrollierte Linien
* dezente Trennungen
* keine überladenen Hero-Bereiche
* keine chaotische Icon-Kommunikation
* keine unnötigen dekorativen Ebenen

**Website-Layout**

Die Website muss wie ein fachlich geordnetes Zugangssystem wirken. Sie darf nicht wie ein Vertriebstrichter aufgebaut sein.

Die Seitenstruktur soll folgende Ordnung unterstützen:

1. fachlicher Gegenstand
2. Systemfunktion
3. Rolle der Praxis
4. Prozessstruktur
5. Patient:innenverständlichkeit
6. Sicherheit und Begrenzung
7. sachliche Handlung

**Software-Layout**

Die Software muss wie ein klinisches Arbeitsinstrument wirken.

Priorität haben:

1. Fallstatus
2. Fotoqualität
3. sichtbare Merkmale
4. Befundmodule
5. interne Prüfung
6. Freigabe
7. Reportstatus
8. Patient:innenansicht
9. Dokumentation

Die Oberfläche muss sofort erkennen lassen, wo ein Fall steht, welche Schritte offen sind und welche Informationen prüfungsrelevant sind.`,
    },
    {
      sectionNumber: 8,
      slug: "ui-komponenten",
      title: "UI-Komponenten",
      contentMarkdown: `Alle Komponenten müssen ruhig, klar und funktional gestaltet sein.

**Buttons**

Buttons sind sachliche Handlungselemente. Sie dürfen nicht aggressiv oder werblich wirken.

Geeignete Button-Logik:

* primäre Aktion klar sichtbar
* sekundäre Aktionen zurückhaltend
* gefährliche Aktionen eindeutig getrennt
* Freigaben visuell klar markiert
* keine unnötige Animation
* keine übertriebenen Hover-Effekte

**Cards**

Cards dienen der Strukturierung von Fällen, Modulen, Fotos, Berichten und Statusinformationen.

Anforderungen:

* klare Ränder oder Flächen
* präzise Abstände
* eindeutige Statuskennzeichnung
* reduzierte Metadaten
* kein visuelles Rauschen
* keine unnötigen Icons

**Statusanzeigen**

Statusanzeigen müssen funktional und eindeutig sein.

Beispiele für Statuslogik:

* Eingereicht
* Prüfung ausstehend
* Rückfrage erforderlich
* In Bearbeitung
* Freigabe erforderlich
* Abgeschlossen
* Bericht erstellt

Statusfarben müssen zurückhaltend, aber unterscheidbar sein.

**Formulare**

Formulare müssen seriös, einfach und vertrauenswürdig wirken.

Anforderungen:

* klare Feldbeschriftungen
* keine überflüssigen Pflichtfelder
* ruhige Fehlerzustände
* eindeutige Hilfetexte
* mobile Nutzbarkeit
* klare Upload-Logik
* keine verspielt animierten Eingabeelemente`,
    },
    {
      sectionNumber: 9,
      slug: "software-ui-vorgaben",
      title: "Software-spezifische UI-Vorgaben",
      contentMarkdown: `Die Softwareoberfläche darf nicht wie ein CRM, Vertriebssystem oder Marketing-Dashboard wirken.

**Verbindliche Wirkung**

* klinisches Arbeitsinstrument
* strukturierte Fallverwaltung
* ruhige Prüfoberfläche
* nachvollziehbare Dokumentation
* kontrollierter Freigabeprozess

**Zentrale Ansichten**

Die folgenden Bereiche müssen besonders sorgfältig gestaltet werden:

1. Fallübersicht
2. Fall-Detailansicht
3. Foto-Upload und Fotoqualität
4. Befundmodul-Ansicht
5. interne zahnärztliche Prüfung
6. Report-Erstellung
7. Report-Freigabe
8. Patient:innenansicht
9. Partnerpraxis-Bereich
10. Admin- und Qualitätskontrollbereich

**Designziel der Fallansicht**

Die Fallansicht muss innerhalb weniger Sekunden zeigen:

* Wer ist der Fall?
* Welche Fotos liegen vor?
* Ist die Qualität ausreichend?
* Welche Module sind relevant?
* Was wurde bereits geprüft?
* Was fehlt?
* Was ist freizugeben?
* Welcher Reportstatus liegt vor?

Die Fallansicht ist der operative Kern der Software. Sie muss maximale Klarheit bieten und darf visuell nicht überladen sein.`,
    },
    {
      sectionNumber: 10,
      slug: "website-design-vorgaben",
      title: "Website-spezifische Designvorgaben",
      contentMarkdown: `Die Website muss fachliche Wertigkeit und digitale Zugänglichkeit verbinden.

Sie soll wirken wie:

* ein medizinisch-digitales System
* eine strukturierte Plattform
* ein professioneller Zugang für Praxen und Patient:innen
* eine hochwertige, kontrollierte Markenarchitektur

Sie darf nicht wirken wie:

* klassische Zahnarztwerbung
* Beauty-Landingpage
* Lead-Funnel
* Startup-SaaS-Seite
* überladene Dental-Agentur-Seite
* Template-Website
* Kampagnenseite mit künstlicher Dringlichkeit

**Hero-Bereiche**

Hero-Bereiche müssen reduziert, klar und hochwertig sein.

Erlaubt:

* starke, ruhige Headline
* knappe Subline
* kontrollierte Bildwelt
* sachlicher Einstieg
* klare primäre Handlung

Zu vermeiden:

* viele Claims
* mehrere CTAs gleicher Priorität
* lächelnde Stock-Fotos
* überladene Mockups
* bewegte Effekthintergründe
* aggressive Verkaufsargumente`,
    },
    {
      sectionNumber: 11,
      slug: "bildsprache",
      title: "Bildsprache",
      contentMarkdown: `Die Bildsprache muss fachlich, materialnah und hochwertig sein.

**Geeignete Motive**

* Makroaufnahmen von Zähnen
* Zahnschmelzstrukturen
* intraorale Scans
* Aligner
* Modelle
* klinische Instrumente
* Handschuhe
* reduzierte Behandlungsumgebungen
* Licht auf dentalen Oberflächen
* technische Detailansichten
* strukturierte Fotodokumentation
* abstrakte, ruhige Materialflächen
* dentalmedizinische Nahaufnahmen

**Nicht geeignete Motive**

* generische Stock-Patient:innen
* übertrieben weiße Lächeln
* Hollywood-Smile-Optik
* Familienwerbung
* Cartoon-Zähne
* Zahnarzt mit Daumen hoch
* überinszenierte Praxisbilder
* Influencer-Ästhetik
* Beauty-Salon-Bildwelt
* generische SaaS-Illustrationen
* bunte 3D-Icons
* emotionale Lifestyle-Szenen ohne fachlichen Bezug

**Bildwirkung**

Die Bilder sollen nicht primär Emotion erzeugen. Sie sollen Substanz, Material, Präzision und zahnmedizinische Nähe vermitteln.`,
    },
    {
      sectionNumber: 12,
      slug: "icons-illustrationen",
      title: "Icons und Illustrationen",
      contentMarkdown: `Icons dürfen nur funktional eingesetzt werden.

**Anforderungen**

* reduziert
* linear oder minimal flächig
* einheitliche Strichstärke
* keine verspielten Formen
* keine Cartoon-Sprache
* keine bunten Illustrationssets
* keine generischen SaaS-Symbole ohne Bezug
* keine dekorative Übernutzung

Icons dienen Orientierung und Struktur. Sie sind kein Ersatz für fachliche Gestaltung.`,
    },
    {
      sectionNumber: 13,
      slug: "animation-interaktion",
      title: "Animation und Interaktion",
      contentMarkdown: `Animationen müssen zurückhaltend und funktional sein.

**Zulässig**

* dezente Übergänge
* klare Ladezustände
* ruhige Hover-Zustände
* strukturierte Upload-Rückmeldung
* eindeutige Fortschrittsanzeigen
* kontrollierte Modale

**Nicht zulässig**

* verspielte Animationen
* übertriebene Parallax-Effekte
* bounce effects
* aggressive Hover-Bewegungen
* animierte Verkaufsargumente
* unnötige Bewegung im klinischen Arbeitskontext

Interaktion soll Vertrauen und Orientierung verbessern, nicht Aufmerksamkeit erzwingen.`,
    },
    {
      sectionNumber: 14,
      slug: "mobile-design",
      title: "Mobile Design",
      contentMarkdown: `Mobile Ansichten sind nicht nachträglich abzuleiten, sondern eigenständig zu gestalten.

**Anforderungen**

* klare Touch-Flächen
* reduzierte Informationsdichte
* stabile Formularführung
* einfache Foto-Upload-Logik
* klare Fortschrittsanzeige
* lesbare Reportansichten
* keine überladenen Sektionen
* keine Desktop-Elemente, die nur verkleinert werden

Mobile muss besonders ruhig und eindeutig sein, da Upload, Patient:innenkommunikation und Erstkontakt häufig mobil stattfinden.`,
    },
    {
      sectionNumber: 15,
      slug: "pdf-report-logik",
      title: "PDF-nahe Gestaltung und Report-Logik",
      contentMarkdown: `Reports und reportnahe Ansichten müssen statisch, hochwertig und dokumentierbar wirken.

**Anforderungen**

* klare Seitenhierarchie
* ruhige Kopfbereiche
* eindeutige Modulstruktur
* verständliche Parameterdarstellung
* keine überladenen Grafiken
* keine Spielerei mit Scores
* klare Hinweise auf Einordnung und Prüfung
* hochwertige Tabellen- und Abschnittsgestaltung
* druckfähige Lesbarkeit
* digitale Lesbarkeit auf Mobile und Desktop

Der Report darf nicht wie ein Marketingdokument wirken. Er muss wie eine strukturierte zahnärztliche Orientierung wirken.`,
    },
    {
      sectionNumber: 16,
      slug: "markenwirkung",
      title: "Markenwirkung",
      contentMarkdown: `Die visuelle Marke soll nicht erklären, dass sie hochwertig ist. Sie muss durch Gestaltung so wirken.

Die Wirkung entsteht aus:

* Reduktion
* Tiefe
* Proportion
* Materialnähe
* präzisem Licht
* typografischer Kontrolle
* fachlicher Bildauswahl
* geordneter Oberfläche
* klarer Navigation
* konsequenter Zurückhaltung

Jede visuelle Entscheidung muss die Frage beantworten:

Stärkt dieses Element die fachliche Glaubwürdigkeit des Systems?

Wenn nicht, ist es zu entfernen oder zu reduzieren.`,
    },
    {
      sectionNumber: 17,
      slug: "designsystem",
      title: "Designsystem",
      contentMarkdown: `Es ist ein konsistentes Designsystem aufzubauen.

**Mindestbestandteile**

* Farbpalette
* Typografiesystem
* Spacing-System
* Grid-System
* Button-System
* Card-System
* Status-System
* Formularsystem
* Icon-System
* Tabellen
* Modale
* Upload-Komponenten
* Report-Komponenten
* Navigationslogik
* Responsive Regeln
* Fehler- und Leerzustände
* Freigabe- und Prüfzustände

Das Designsystem muss für Website, Software und Reports konsistent nutzbar sein. Einzelne Bereiche dürfen unterschiedliche Schwerpunkte haben, müssen aber aus derselben visuellen Ordnung stammen.`,
    },
    {
      sectionNumber: 18,
      slug: "qualitaetskriterien",
      title: "Qualitätskriterien vor Freigabe",
      contentMarkdown: `Ein Design ist erst freigabefähig, wenn folgende Kriterien erfüllt sind:

1. Die Oberfläche wirkt fachlich ernstzunehmend.
2. Die Gestaltung stärkt die zahnärztliche Autorität.
3. Die Informationshierarchie ist sofort erkennbar.
4. Die Oberfläche wirkt nicht wie ein Vertriebssystem.
5. Die Bildsprache ist materialnah, klinisch und hochwertig.
6. Farben werden kontrolliert und funktional eingesetzt.
7. Typografie und Abstände erzeugen Ruhe und Präzision.
8. Die Softwareansichten unterstützen konkrete Arbeitsabläufe.
9. Patient:innenansichten bleiben verständlich und seriös.
10. Mobile Ansichten sind eigenständig sauber gelöst.
11. Status, Freigabe und Prüfung sind visuell eindeutig.
12. Das Design kann ohne Erklärung als zahnmedizinisch anschlussfähig verstanden werden.`,
    },
    {
      sectionNumber: 19,
      slug: "schlussvorgabe",
      title: "Schlussvorgabe",
      contentMarkdown: `Das Design hat nicht die Aufgabe, Aufmerksamkeit zu erzwingen.
Es hat die Aufgabe, Vertrauen durch Ordnung herzustellen.

Die Gestaltung soll keine Werbewirkung simulieren.
Sie soll fachliche Struktur sichtbar machen.

Die Software darf nicht wie ein Verkaufswerkzeug erscheinen.
Sie muss wie ein präzises Arbeitsinstrument wirken.

Die Website darf nicht wie eine Kampagne auftreten.
Sie muss wie ein professioneller Zugang zu einem strukturierten System wirken.

Die Außendarstellung darf nicht dekorieren.
Sie muss Substanz, Präzision und Verantwortung sichtbar machen.

Das ist der verbindliche Maßstab für UI, Website und visuelle Markenführung.`,
    },
  ] satisfies BriefingSeedSection[],
  areas: [
    {
      slug: "software_interfaces",
      title: "Softwareoberflächen",
      description: "Atlas, Tracker, Relay, Journals, Command AI und alle internen Arbeitsansichten.",
      sortOrder: 1,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 16, 17, 18, 19],
    },
    {
      slug: "website_structure",
      title: "Website-Struktur",
      description: "Öffentliche Website, Informationsarchitektur und Zugangslogik für Praxen und Patient:innen.",
      sortOrder: 2,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 16, 17, 18, 19],
    },
    {
      slug: "landingpages",
      title: "Landingpages",
      description: "Einstiegsseiten mit reduzierter Hero-Logik und sachlicher Handlungsführung.",
      sortOrder: 3,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 16, 18, 19],
    },
    {
      slug: "partner_areas",
      title: "Partnerbereiche",
      description: "Partnerpraxis-Bereiche, Übergaben und fachlich kontrollierte Zugänge.",
      sortOrder: 4,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 16, 17, 18, 19],
    },
    {
      slug: "patient_areas",
      title: "Patientenbereiche",
      description: "Upload, Ersteinschätzung, Patient:innenansichten und verständliche Kommunikation.",
      sortOrder: 5,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 18, 19],
    },
    {
      slug: "pdf_views",
      title: "PDF-nahe Ansichten",
      description: "Reports, Orientierungsdokumente und druckfähige Darstellungen.",
      sortOrder: 6,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 19],
    },
    {
      slug: "visual_communication",
      title: "Visuelle Kommunikationsflächen",
      description: "Status, Hinweise, Trust-Kommunikation und systemische Rückmeldungen.",
      sortOrder: 7,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 8, 11, 12, 13, 16, 18, 19],
    },
    {
      slug: "image_selection",
      title: "Bildauswahl",
      description: "Materialnahe, klinische Bildwelt ohne Stock- oder Beauty-Klischees.",
      sortOrder: 8,
      sectionNumbers: [1, 2, 3, 4, 11, 16, 18, 19],
    },
    {
      slug: "components",
      title: "Komponenten",
      description: "Buttons, Cards, Status, Formulare, Modale, Upload- und Report-Komponenten.",
      sortOrder: 9,
      sectionNumbers: [4, 5, 6, 8, 12, 13, 17, 18],
    },
    {
      slug: "layouts",
      title: "Layouts",
      description: "Raster, Sektionen, Informationsgruppen und responsive Struktur.",
      sortOrder: 10,
      sectionNumbers: [3, 4, 6, 7, 10, 14, 17, 18],
    },
    {
      slug: "digital_brand",
      title: "Digitale Markendarstellung",
      description: "Markenwirkung, visuelle Ordnung und institutionelle Wertigkeit über alle Kanäle.",
      sortOrder: 11,
      sectionNumbers: [1, 2, 3, 4, 5, 6, 11, 16, 17, 18, 19],
    },
  ] satisfies BriefingSeedArea[],
} as const;
