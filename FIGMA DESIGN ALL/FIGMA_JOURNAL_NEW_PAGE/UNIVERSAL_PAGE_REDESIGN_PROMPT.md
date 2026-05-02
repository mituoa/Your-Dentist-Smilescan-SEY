# SmileScan - Universeller Seiten-Redesign Prompt für Cursor

**Diesen Prompt kannst du für ALLE 30 SmileScan-Seiten verwenden.**

Fülle die Platzhalter `[...]` aus und füge dein Referenzbild ein.

---

## CURSOR PROMPT (KOPIERBEREIT)

```
# DESIGN-REDESIGN | SmileScan – [SEITENNAME EINFÜGEN]

## PROJEKT-KONTEXT

SmileScan ist eine Workflow-Plattform für Zahnarztpraxen. Patienten laden Fotos hoch (öffentlich), das Praxisteam verarbeitet Fälle intern (Dashboard, Inbox, Tasks).

### Gewähltes Design-System: [THEME WÄHLEN]

**Option 1: Default (Blue-Purple)**
- Primärfarbe: bg-blue-600 hover:bg-blue-700
- Links: text-blue-600 hover:text-blue-700
- Hintergrund: from-blue-50 via-white to-purple-50
- Gefühl: Soft medical professional

**Option 2: Medical (Teal-Cyan)**
- Primärfarbe: bg-teal-600 hover:bg-teal-700
- Links: text-teal-600 hover:text-teal-700
- Hintergrund: from-teal-50 via-white to-cyan-50
- Gefühl: Clinical, clean, sterile

**Option 3: Premium (Slate-Blue)**
- Primärfarbe: bg-slate-700 hover:bg-slate-800
- Links: text-slate-700 hover:text-slate-800
- Hintergrund: from-slate-50 via-white to-blue-50
- Gefühl: Modern tech, sophisticated

**Option 4: Warm (Orange-Pink)**
- Primärfarbe: bg-orange-600 hover:bg-orange-700
- Links: text-orange-600 hover:text-orange-700
- Hintergrund: from-orange-50 via-white to-pink-50
- Gefühl: Friendly, approachable

**Option 5: Minimal (Pure White)**
- Primärfarbe: bg-gray-900 hover:bg-gray-800
- Links: text-gray-900 hover:text-gray-700
- Hintergrund: from-white via-gray-50 to-white
- Gefühl: Clean, simple

**Option 6: Dark Mode**
- Primärfarbe: bg-blue-600 hover:bg-blue-700
- Links: text-blue-400 hover:text-blue-300
- Hintergrund: from-gray-900 via-gray-800 to-slate-900
- Gefühl: Modern, reduces eye strain

### Design-Prinzipien (IMMER EINHALTEN)

✓ Vertrauenswürdige medizinisch-professionelle Ästhetik
✓ Hohe Scanbarkeit für dichte Arbeitsbildschirme
✓ Klare Hierarchie für Actions, Status, Prioritäten
✓ Schnelle Bedienbarkeit für tägliche Workflows
✓ Fully responsive (Desktop/Tablet/Mobile)
✓ Konsistentes Design-System (Tokens, Spacing, Typografie)

**Tone:** Modern, premium, minimal – medizinische Tech-Kompetenz, NICHT generischer Startup-Look.

---

## SEITEN-INFORMATIONEN

### 1. IDENTITÄT & ZWECK

**Route:** [z.B. /doc/[slug]/upload]

**Seitentyp:** [Öffentlich / Auth / Geschützt-Intern]

**Hauptzweck:** [z.B. "Patient:innen laden Fotos/Unterlagen hoch und senden Fall ein"]

**Nutzer:** [z.B. "Patient (öffentlich, nicht eingeloggt)" / "Praxisteam (intern)" / "Arzt (admin)"]

**Kontext:** [z.B. "Nach Klick auf 'Fall einreichen' auf Praxisprofil"]

**Primäres Gerät:** [Mobile / Tablet / Desktop / Alle]

---

### 2. DATEN & INHALTE

**Angezeigte Felder/Informationen:**
- [Feld 1: z.B. "Praxis-Logo und Name"]
- [Feld 2: z.B. "Upload-Bereich für Fotos (Drag & Drop)"]
- [Feld 3: z.B. "Formular: Name, E-Mail, Tel., Behandlungswunsch"]
- [Feld 4: ...]
- [Feld 5: ...]

**Datenquellen:**
- [z.B. "Workspace-Daten (Name, Logo)"]
- [z.B. "User-Input"]
- [z.B. "API: GET /api/patients"]

---

### 3. UI-KOMPONENTEN (AKTUELL VORHANDEN)

**Layout-Struktur:**
- [z.B. "Header mit Logo + Navigation"]
- [z.B. "Main Content Area: zweispaltig (Formular links, Preview rechts)"]
- [z.B. "Footer mit Links"]

**Interaktive Elemente:**
- [z.B. "Upload-Dropzone (File-Input, Preview-Grid)"]
- [z.B. "Textfelder (Name, E-Mail, Tel.)"]
- [z.B. "Textarea (Anliegen)"]
- [z.B. "Submit-Button (primär, groß)"]
- [z.B. "Datei-Vorschau mit Remove-Icon"]

**Komponenten-Liste:**
- [ ] Button (Primary, Secondary, Outline, Ghost)
- [ ] Input (Text, Email, Password, Number)
- [ ] Textarea
- [ ] Select/Dropdown
- [ ] Checkbox
- [ ] Radio Buttons
- [ ] Toggle/Switch
- [ ] Upload-Zone
- [ ] Table/Grid
- [ ] Card
- [ ] Alert/Banner
- [ ] Modal/Dialog
- [ ] Tabs
- [ ] Badge/Tag
- [ ] Avatar
- [ ] Tooltip
- [ ] Breadcrumb
- [ ] Pagination

---

### 4. INTERAKTIONEN & AKTIONEN

**User kann:**
- [Aktion 1: z.B. "Fotos per Drag & Drop oder Click hinzufügen"]
- [Aktion 2: z.B. "Foto-Vorschau anklicken → Lightbox/Remove-Option"]
- [Aktion 3: z.B. "Formular ausfüllen + validieren (required fields)"]
- [Aktion 4: z.B. "Fall absenden → Loading-State → Redirect zu /success"]
- [Aktion 5: ...]

**Workflow-Schritte:**
1. [Schritt 1: z.B. "Patient öffnet Upload-Seite"]
2. [Schritt 2: z.B. "Patient fügt Fotos hinzu (min. 3)"]
3. [Schritt 3: z.B. "Patient füllt Formular aus"]
4. [Schritt 4: z.B. "Validierung läuft (Client-side)"]
5. [Schritt 5: z.B. "Submit → Server-Validierung → Inbox-Entry erstellt"]
6. [Schritt 6: z.B. "Redirect zu Success-Seite"]

---

### 5. STATES & FEHLERFÄLLE

**Zustände:**
- [ ] Empty/Initial State
- [ ] Filled/Active State
- [ ] Loading State
- [ ] Success State
- [ ] Error State
- [ ] Disabled State
- [ ] Focus State
- [ ] Hover State

**Validierung & Fehler:**
- [z.B. "Name required, min. 2 Zeichen"]
- [z.B. "E-Mail format prüfen"]
- [z.B. "Mindestens 3 Fotos erforderlich"]
- [z.B. "Max. 10MB pro Foto"]
- [z.B. "Error-Messages: inline rot unter Feld, Icon-Support"]
- [z.B. "Disabled Submit-Button bis Pflichtfelder gefüllt"]

**Error-Handling:**
- [z.B. "Inline-Feedback unter Feld"]
- [z.B. "Banner oben auf Seite bei Server-Error"]
- [z.B. "Toast-Notification bei Success"]

---

### 6. FOTO-SPEZIFISCHE ANFORDERUNGEN

(Nur ausfüllen wenn die Seite Fotos/Bilder verwaltet)

- [ ] Upload-Funktion (Drag & Drop, Click, Kamera)
- [ ] Vorschau-Thumbnails
- [ ] Lightbox/Fullscreen-View
- [ ] Remove/Delete-Funktion
- [ ] Reihenfolge ändern (Drag to reorder)
- [ ] Beschriftung/Notizen zu Fotos
- [ ] Foto-Kategorien/Tags
- [ ] Vergleichs-Ansicht (Before/After)
- [ ] Zoom/Pan-Funktionalität
- [ ] Download-Option

**Foto-Constraints:**
- Min. Anzahl: [z.B. 3 Fotos]
- Max. Anzahl: [z.B. 15 Fotos]
- Dateitypen: [z.B. JPG, PNG, HEIC]
- Max. Größe pro Foto: [z.B. 10MB]
- Empfohlene Auflösung: [z.B. min. 1920x1080px]

---

### 7. NAVIGATION & FLOW

**Einstieg:**
[z.B. "Von /doc/[slug] via CTA 'Fall einreichen'"]

**Ausstieg/Nächster Schritt:**
[z.B. "Nach Submit → /doc/[slug]/upload/success"]

**Zurück-Navigation:**
[z.B. "Link/Button zurück zu Praxisprofil"]

**Breadcrumb (falls vorhanden):**
[z.B. "Praxisprofil > Fall einreichen"]

---

### 8. ROLLEN & BERECHTIGUNGEN

**Wer hat Zugriff?**
- [ ] Öffentlich (alle)
- [ ] Authentifiziert (eingeloggt)
- [ ] Patient (eigene Daten)
- [ ] Praxisteam (alle Patientendaten)
- [ ] Arzt (alle + Bestätigungsrechte)
- [ ] Admin (alle + Workspace-Settings)

**Rollen-spezifische Funktionen:**
- [z.B. "Nur Ärzte können Tasks auf 'Done' setzen"]
- [z.B. "Praxisteam sieht alle Submissions, Patienten nur eigene"]

---

### 9. COMPLIANCE & SICHERHEIT

- [ ] DSGVO: Daten-Verschleierung (z.B. Patientenname schwärzen)
- [ ] DSGVO: Consent-Checkbox für Datenschutz
- [ ] DSGVO: Daten-Lösch-Option
- [ ] Verschlüsselte Übertragung (HTTPS)
- [ ] Kein Tracking ohne Consent
- [ ] Session-Timeout (Auto-Logout)
- [ ] XSS-Schutz (Input-Sanitization)
- [ ] CSRF-Protection

**Besondere Anforderungen:**
[z.B. "Patientenfotos dürfen nicht in Browser-Cache gespeichert werden"]

---

### 10. RESPONSIVE-ANFORDERUNGEN

**Mobile (<640px):**
- [z.B. "Single-column Layout"]
- [z.B. "Upload-Button groß, Touch-optimiert (min. 44px)"]
- [z.B. "Formular stapelt vertikal"]
- [z.B. "Foto-Grid: 2 Spalten"]

**Tablet (640px - 1024px):**
- [z.B. "Two-column Layout möglich"]
- [z.B. "Formular links, Upload-Preview rechts"]
- [z.B. "Foto-Grid: 3-4 Spalten"]

**Desktop (>1024px):**
- [z.B. "Full two-column Layout"]
- [z.B. "Sidebar-Navigation sichtbar"]
- [z.B. "Foto-Grid: 4-6 Spalten"]

---

### 11. PERFORMANCE & OPTIMIERUNG

- [ ] Lazy-Loading für Bilder
- [ ] Virtualized Lists (bei >100 Items)
- [ ] Debounced Search (bei Suchfeldern)
- [ ] Optimistic UI Updates
- [ ] Skeleton Loaders während Datenladung
- [ ] Code-Splitting (dynamische Imports)
- [ ] Image-Compression (Client-side vor Upload)

---

### 12. AKTUELLER DATEIPFAD

**Komponente:** [z.B. src/app/components/public/PatientUploadPage.tsx]

**Zugehörige Dateien:**
- [z.B. src/app/actions/uploadSubmission.ts (Server Action)]
- [z.B. src/app/components/upload/PhotoDropzone.tsx]
- [z.B. src/app/components/upload/PhotoPreview.tsx]

---

## REFERENZBILD

**[HIER SCREENSHOT/DESIGN-REFERENZ EINFÜGEN]**

---

## AUFGABE FÜR CURSOR

1. **Analysiere** die aktuelle Seite in [Dateipfad]

2. **Erfasse** alle Funktionen, Datenfelder, Interaktionen aus der Liste oben

3. **Redesigne** die Seite basierend auf:
   - SmileScan Design-Prinzipien (medical-professional, clean, scanbar)
   - Dem gewählten Theme ([Theme-Name])
   - Dem beigefügten Referenzbild (Layout, Komponenten-Stil)

4. **Behalte bei:**
   - Alle Funktionen (Upload, Validation, Submit, etc.)
   - Alle Datenfelder
   - Alle Workflows (States, Error-Handling)
   - React + Tailwind CSS Struktur
   - Existing Server Actions / API-Calls

5. **Verbessere:**
   - Visuelle Hierarchie (wichtige CTAs klar erkennbar)
   - Spacing & Breathing-Room (16px/24px/32px Grid)
   - User-Guidance (Labels, Hints, Feedback)
   - Mobile Usability (Touch-Targets, Form-Flow)
   - Trust-Signale (Medical-Feel, Sicherheitshinweise)
   - Konsistenz mit Login-Seite (gleiche Farben, Buttons, Inputs)

6. **Design-Tokens verwenden:**

**Farben (aus gewähltem Theme):**
```tsx
// Primär-Button
className="bg-[PRIMARY-COLOR] hover:bg-[PRIMARY-COLOR-DARK] text-white"

// Sekundär-Button
className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"

// Outline-Button
className="border border-border bg-background hover:bg-accent"

// Links
className="text-[LINK-COLOR] hover:text-[LINK-COLOR-DARK] hover:underline"

// Input-Felder
className="bg-input-background border-input focus:border-ring focus:ring-ring/50"

// Error-Elemente
className="text-destructive bg-destructive/10 border-destructive"

// Cards/Container
className="bg-card text-card-foreground border border-border rounded-lg shadow-sm"
```

**Spacing (konsistent):**
```tsx
// Container-Padding
className="p-4 md:p-6 lg:p-8"

// Section-Gaps
className="space-y-4 md:space-y-6"

// Element-Gaps
className="gap-2 md:gap-3 lg:gap-4"

// Grid-Gaps
className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

**Typography (konsistent mit theme.css):**
```tsx
// Page Title
className="text-2xl font-semibold"  // h1 default

// Section Title
className="text-xl font-semibold"   // h2 default

// Subsection Title
className="text-lg font-medium"     // h3 default

// Body Text
className="text-base"               // p default

// Small Text
className="text-sm text-muted-foreground"

// Label Text
className="text-sm font-medium"     // label default
```

**Komponenten-Stil (wie Login-Seite):**
```tsx
// Wenn Auth-Seite: Glass-morphism Card verwenden
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">

// Wenn Intern-Seite: Standard Card verwenden
<div className="bg-card border border-border rounded-lg shadow-sm p-6">

// Wenn Öffentlich-Seite: Mix aus beidem möglich
```

---

## OUTPUT-ANFORDERUNGEN

✓ Vollständig überarbeitete `.tsx`-Datei(en)

✓ Inline-Kommentare bei wichtigen Design-Entscheidungen

✓ Liste der wichtigsten Design-Änderungen am Ende als Kommentar:
```tsx
/*
DESIGN-ÄNDERUNGEN:
- [Änderung 1]
- [Änderung 2]
- [Änderung 3]
*/
```

✓ Konsistenz-Check mit Login-Seite:
- [ ] Gleiche Farben verwendet
- [ ] Gleiche Button-Stile
- [ ] Gleiche Input-Stile
- [ ] Gleiches Spacing-System
- [ ] Gleiche Typography

---

## QUALITÄTSKRITERIEN

Vor dem Abschließen prüfen:

**Funktionalität:**
- [ ] Alle ursprünglichen Funktionen erhalten
- [ ] Keine kaputten Links/Buttons
- [ ] Validierung funktioniert
- [ ] States korrekt implementiert

**Design:**
- [ ] Konsistent mit gewähltem Theme
- [ ] Konsistent mit Login-Seite
- [ ] Klare visuelle Hierarchie
- [ ] Ausreichend Whitespace

**Responsive:**
- [ ] Mobile: lesbar, bedienbar, Touch-optimiert
- [ ] Tablet: Layout angepasst
- [ ] Desktop: optimale Nutzung des Platzes

**Accessibility:**
- [ ] Labels für alle Inputs
- [ ] Focus-States sichtbar
- [ ] Keyboard-Navigation funktioniert
- [ ] Farbkontrast WCAG AA

**Performance:**
- [ ] Keine unnötigen Re-Renders
- [ ] Bilder optimiert
- [ ] Code-Splitting wo sinnvoll

---
```

## VERWENDUNG FÜR JEDE SEITE

**Schritt 1:** Kopiere den Prompt oben

**Schritt 2:** Fülle die Platzhalter aus:
- `[SEITENNAME EINFÜGEN]` → z.B. "Patient Upload Page"
- `[THEME WÄHLEN]` → Wähle 1 der 6 Optionen und lösche die anderen
- Alle `[...]` Platzhalter mit deinen Seiten-Infos füllen

**Schritt 3:** Mache Screenshot der aktuellen Seite

**Schritt 4:** Paste in Cursor + Screenshot anhängen

**Schritt 5:** Cursor generiert das Redesign

---

## BEISPIEL: Ausgefüllter Prompt

Siehe nächste Datei: `EXAMPLE_FILLED_PROMPT.md`
