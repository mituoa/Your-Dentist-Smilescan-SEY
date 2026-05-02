# Beispiel: Ausgefüllter Prompt für "Patient Upload Page"

So sieht der Prompt aus, wenn du ihn für eine konkrete Seite ausfüllst.

---

# DESIGN-REDESIGN | SmileScan – Patient Upload Page

## PROJEKT-KONTEXT

SmileScan ist eine Workflow-Plattform für Zahnarztpraxen. Patienten laden Fotos hoch (öffentlich), das Praxisteam verarbeitet Fälle intern (Dashboard, Inbox, Tasks).

### Gewähltes Design-System: Medical (Teal-Cyan)

- Primärfarbe: bg-teal-600 hover:bg-teal-700
- Links: text-teal-600 hover:text-teal-700
- Hintergrund: from-teal-50 via-white to-cyan-50
- Gefühl: Clinical, clean, sterile

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

**Route:** /doc/[slug]/upload

**Seitentyp:** Öffentlich

**Hauptzweck:** Patient:innen laden Fotos/Unterlagen hoch und senden ihren Fall ein

**Nutzer:** Patient (öffentlich, nicht eingeloggt)

**Kontext:** Nach Klick auf 'Fall einreichen' auf Praxisprofil (/doc/[slug])

**Primäres Gerät:** Mobile (ca. 70% der Nutzung), dann Desktop

---

### 2. DATEN & INHALTE

**Angezeigte Felder/Informationen:**
- Praxis-Logo und Name (aus Workspace-Daten)
- Überschrift: "Fall einreichen"
- Beschreibungstext: "Senden Sie uns Ihre Fotos und wir melden uns schnellstmöglich"
- Upload-Bereich für Fotos (Drag & Drop + Click to upload)
- Formular: Vorname, Nachname, E-Mail, Telefon
- Textarea: "Ihr Anliegen / Was möchten Sie behandeln lassen?"
- Checkbox: Datenschutz-Einwilligung
- Submit-Button: "Fall absenden"
- Footer: Link zurück zu Praxisprofil

**Datenquellen:**
- Workspace-Daten (Name, Logo) – aus API: GET /api/workspaces/[slug]
- User-Input (Formular)
- File-Upload (Photos)

---

### 3. UI-KOMPONENTEN (AKTUELL VORHANDEN)

**Layout-Struktur:**
- Header mit Praxis-Logo + Name (links), zurück-Link (rechts)
- Main Content Area: single-column auf Mobile, two-column auf Desktop
  - Links: Upload-Bereich
  - Rechts: Formular
- Footer mit "Zurück zur Praxis" Link

**Interaktive Elemente:**
- Upload-Dropzone (File-Input, Drag & Drop, Preview-Grid)
- Textfelder (Vorname, Nachname, E-Mail, Telefon)
- Textarea (Anliegen)
- Checkbox (Datenschutz)
- Submit-Button (primär, groß, teal)
- Foto-Vorschau mit Remove-Icon (X)
- Progress-Bar während Upload

**Komponenten-Liste:**
- [x] Button (Primary: Submit, Secondary: zurück)
- [x] Input (Text: Name, Email, Tel)
- [x] Textarea (Anliegen)
- [ ] Select/Dropdown
- [x] Checkbox (Datenschutz)
- [ ] Radio Buttons
- [ ] Toggle/Switch
- [x] Upload-Zone
- [ ] Table/Grid
- [x] Card (für Upload-Preview)
- [x] Alert/Banner (für Errors)
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
- Fotos per Drag & Drop oder Click hinzufügen
- Fotos per Smartphone-Kamera direkt aufnehmen (Mobile only)
- Foto-Vorschau anklicken → Lightbox öffnen (Vollbild-Ansicht)
- Einzelnes Foto entfernen (X-Icon)
- Alle Fotos entfernen (Link "Alle löschen")
- Formular ausfüllen (alle Felder required außer Telefon)
- Datenschutz-Checkbox aktivieren (required)
- "Fall absenden" → Validierung → Upload → Success/Error

**Workflow-Schritte:**
1. Patient öffnet Upload-Seite via Link von Praxisprofil
2. Patient fügt Fotos hinzu (min. 3 Fotos erforderlich)
3. Patient füllt Formular aus (Name, E-Mail, Anliegen)
4. Patient aktiviert Datenschutz-Checkbox
5. Client-side Validierung läuft
6. Submit → Server Upload (mit Progress-Bar)
7. Server-Validierung → Inbox-Entry für Praxis erstellt
8. Redirect zu Success-Seite (/doc/[slug]/upload/success)

---

### 5. STATES & FEHLERFÄLLE

**Zustände:**
- [x] Empty/Initial State (keine Fotos, leeres Formular)
- [x] Filled/Active State (Fotos hinzugefügt, Formular ausgefüllt)
- [x] Loading State (Upload läuft, Progress-Bar, Button disabled)
- [x] Success State (Redirect zu Success-Seite)
- [x] Error State (Banner oben, Error-Messages unter Feldern)
- [x] Disabled State (Button disabled bis Validierung OK)
- [x] Focus State (Input-Felder)
- [x] Hover State (Buttons, Links, Foto-Vorschau)

**Validierung & Fehler:**
- Vorname: required, min. 2 Zeichen
- Nachname: required, min. 2 Zeichen
- E-Mail: required, format-check (HTML5 + Server-side)
- Telefon: optional, aber wenn ausgefüllt: format-check
- Anliegen: required, min. 10 Zeichen
- Fotos: min. 3 Fotos, max. 15 Fotos
- Dateityp: nur JPG, PNG, HEIC erlaubt
- Dateigröße: max. 10MB pro Foto
- Datenschutz: required (Checkbox muss aktiviert sein)

**Error-Handling:**
- Inline-Feedback unter Feld (rot, mit Icon)
- Banner oben auf Seite bei Server-Error (Alert destructive)
- Toast-Notification bei Success (grün)
- Disabled Submit-Button bis alle Pflichtfelder OK

---

### 6. FOTO-SPEZIFISCHE ANFORDERUNGEN

- [x] Upload-Funktion (Drag & Drop, Click, Kamera auf Mobile)
- [x] Vorschau-Thumbnails (Grid-Layout, 2 cols Mobile, 4 cols Desktop)
- [x] Lightbox/Fullscreen-View (Click auf Thumbnail)
- [x] Remove/Delete-Funktion (X-Icon auf Hover)
- [ ] Reihenfolge ändern (nicht erforderlich)
- [ ] Beschriftung/Notizen zu Fotos (nicht erforderlich)
- [ ] Foto-Kategorien/Tags (nicht erforderlich)
- [ ] Vergleichs-Ansicht (nicht erforderlich)
- [x] Zoom/Pan-Funktionalität (in Lightbox)
- [ ] Download-Option (nicht erforderlich)

**Foto-Constraints:**
- Min. Anzahl: 3 Fotos
- Max. Anzahl: 15 Fotos
- Dateitypen: JPG, PNG, HEIC
- Max. Größe pro Foto: 10MB
- Empfohlene Auflösung: min. 1920x1080px (Info-Text unter Upload-Zone)

**Upload-Progress:**
- Progress-Bar pro Foto während Upload
- Gesamtfortschritt (3 von 5 hochgeladen)
- Cancel-Option während Upload

---

### 7. NAVIGATION & FLOW

**Einstieg:**
Von /doc/[slug] via CTA-Button "Fall einreichen" oder "Fotos hochladen"

**Ausstieg/Nächster Schritt:**
Nach erfolgreichem Submit → Redirect zu /doc/[slug]/upload/success

**Zurück-Navigation:**
Header: Link "← Zurück zur Praxis" → /doc/[slug]
Footer: Link "Abbrechen" → /doc/[slug]

**Breadcrumb:**
Nicht vorhanden auf dieser Seite (da öffentlich, einfacher Flow)

---

### 8. ROLLEN & BERECHTIGUNGEN

**Wer hat Zugriff?**
- [x] Öffentlich (alle)
- [ ] Authentifiziert
- [ ] Patient
- [ ] Praxisteam
- [ ] Arzt
- [ ] Admin

**Rollen-spezifische Funktionen:**
Keine – Seite ist komplett öffentlich ohne Login

**Rate-Limiting:**
- Max. 5 Submissions pro IP pro Stunde (Server-side Check)
- Bei Überschreitung: Error-Banner "Zu viele Anfragen, bitte später erneut"

---

### 9. COMPLIANCE & SICHERHEIT

- [x] DSGVO: Consent-Checkbox für Datenschutz (required)
- [x] DSGVO: Link zu Datenschutzerklärung im Checkbox-Text
- [ ] DSGVO: Daten-Verschleierung (nicht nötig, da eigene Daten)
- [ ] DSGVO: Daten-Lösch-Option (wird auf Success-Seite erwähnt)
- [x] Verschlüsselte Übertragung (HTTPS)
- [x] Kein Tracking ohne Consent
- [ ] Session-Timeout (nicht nötig, keine Session)
- [x] XSS-Schutz (Input-Sanitization Server-side)
- [x] CSRF-Protection (Server-Action mit Token)

**Besondere Anforderungen:**
- Hochgeladene Fotos werden verschlüsselt gespeichert
- Fotos werden automatisch nach 90 Tagen gelöscht wenn Fall nicht bearbeitet
- Virus-Scan bei jedem Upload (Server-side)
- Info-Text: "Ihre Daten werden vertraulich behandelt und nur für die Terminplanung verwendet"

---

### 10. RESPONSIVE-ANFORDERUNGEN

**Mobile (<640px):**
- Single-column Layout (Upload oben, Formular darunter)
- Upload-Button groß, Touch-optimiert (min. 48px height)
- Foto-Grid: 2 Spalten
- Formular: full-width Inputs
- Kamera-Button sichtbar (nur auf Mobile)
- Sticky Submit-Button am unteren Rand

**Tablet (640px - 1024px):**
- Two-column Layout (Upload links 40%, Formular rechts 60%)
- Foto-Grid: 3 Spalten
- Inputs: optimale Breite für Touch

**Desktop (>1024px):**
- Two-column Layout (Upload links 50%, Formular rechts 50%)
- Foto-Grid: 4 Spalten
- Lightbox mit Keyboard-Navigation (Arrows, ESC)
- Hover-States auf allen interaktiven Elementen

---

### 11. PERFORMANCE & OPTIMIERUNG

- [x] Lazy-Loading für Foto-Preview-Thumbnails
- [ ] Virtualized Lists (nicht nötig, max. 15 Fotos)
- [ ] Debounced Search (nicht vorhanden)
- [x] Optimistic UI Updates (Foto erscheint sofort in Preview)
- [x] Skeleton Loaders während Upload
- [ ] Code-Splitting (nicht kritisch für diese Seite)
- [x] Image-Compression (Client-side vor Upload, max. 2000px Breite)

**Image-Optimization:**
- Client-side Resize auf max. 2000px Breite (falls größer)
- Client-side Compression auf ~85% Quality
- HEIC → JPG Konvertierung (Client-side)
- Progress-Feedback während Compression

---

### 12. AKTUELLER DATEIPFAD

**Komponente:** src/app/(public)/doc/[slug]/upload/page.tsx

**Zugehörige Dateien:**
- src/app/actions/submitPatientCase.ts (Server Action für Upload)
- src/components/upload/PhotoDropzone.tsx (Upload-Komponente)
- src/components/upload/PhotoPreview.tsx (Thumbnail-Grid)
- src/components/upload/PhotoLightbox.tsx (Fullscreen-View)
- src/lib/imageCompression.ts (Client-side Compression)

---

## REFERENZBILD

**[HIER SCREENSHOT DER AKTUELLEN UPLOAD-SEITE EINFÜGEN]**

---

## AUFGABE FÜR CURSOR

1. **Analysiere** die aktuelle Seite in src/app/(public)/doc/[slug]/upload/page.tsx

2. **Erfasse** alle Funktionen, Datenfelder, Interaktionen aus der Liste oben

3. **Redesigne** die Seite basierend auf:
   - SmileScan Design-Prinzipien (medical-professional, clean, scanbar)
   - Medical (Teal-Cyan) Theme
   - Dem beigefügten Referenzbild (Layout, Komponenten-Stil)

4. **Behalte bei:**
   - Alle Funktionen (Upload, Drag & Drop, Validation, Submit, Lightbox)
   - Alle Datenfelder (Vorname, Nachname, E-Mail, Tel., Anliegen)
   - Alle Workflows (States, Error-Handling, Progress, Success-Redirect)
   - React + Tailwind CSS Struktur
   - Server Action submitPatientCase

5. **Verbessere:**
   - Visuelle Hierarchie (Upload-Bereich prominent, Submit-CTA klar)
   - Spacing & Breathing-Room (24px/32px zwischen Sektionen)
   - User-Guidance (Hilfetext "Min. 3 Fotos", Format-Hinweise)
   - Mobile Usability (Sticky Submit-Button, Kamera-Access)
   - Trust-Signale (DSGVO-Hinweis, Verschlüsselung-Icon, "Vertraulich")
   - Konsistenz mit Login-Seite (gleiche teal-Farben, Buttons, Inputs)

6. **Design-Tokens verwenden:**

**Farben (Medical Teal-Cyan Theme):**
```tsx
// Primär-Button (Submit)
className="bg-teal-600 hover:bg-teal-700 text-white"

// Sekundär-Button (Abbrechen)
className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"

// Links (zurück zur Praxis)
className="text-teal-600 hover:text-teal-700 hover:underline"

// Input-Felder
className="bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500/50"

// Upload-Zone (Empty State)
className="border-2 border-dashed border-gray-300 hover:border-teal-400 bg-teal-50/30"

// Upload-Zone (Drag Active)
className="border-2 border-dashed border-teal-500 bg-teal-100/50"

// Error-Elemente
className="text-destructive bg-destructive/10 border-destructive"

// Success-Feedback
className="text-teal-600 bg-teal-50 border-teal-200"

// Cards (Foto-Thumbnails)
className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
```

**Spacing:**
```tsx
// Page-Container
className="p-4 md:p-6 lg:p-8"

// Section-Gaps (Upload-Bereich zu Formular)
className="space-y-6 md:space-y-8"

// Form-Field-Gaps
className="space-y-4"

// Foto-Grid
className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

**Typography:**
```tsx
// Page Title
className="text-2xl md:text-3xl font-semibold text-gray-900"

// Section Title
className="text-lg font-medium text-gray-800"

// Help Text
className="text-sm text-gray-600"

// Label
className="text-sm font-medium text-gray-700"

// Error Text
className="text-sm text-destructive"
```

---

## OUTPUT-ANFORDERUNGEN

✓ Vollständig überarbeitete page.tsx

✓ Inline-Kommentare bei wichtigen Design-Entscheidungen

✓ Liste der Design-Änderungen am Ende:
```tsx
/*
DESIGN-ÄNDERUNGEN:
- Upload-Bereich: Soft teal-50 Background statt weiß, größerer Drop-Bereich
- Formular: white/70 Inputs mit teal Focus-States (konsistent mit Login)
- Submit-Button: teal-600 statt generic blue (Theme-konsistent)
- Foto-Grid: 4-spaltig Desktop, 2-spaltig Mobile, hover-shadow auf Thumbnails
- Trust-Signale: DSGVO-Icon + "Vertraulich behandelt" Text unter Checkbox
- Mobile: Sticky Submit-Button für bessere Erreichbarkeit
- Progress-Bar: teal-farbig mit Prozent-Anzeige
- Error-States: konsistente destructive-Farben mit Icon-Support
*/
```

---

## QUALITÄTSKRITERIEN

✓ Medical Teal-Cyan Theme durchgängig verwendet
✓ Konsistent mit Login-Seite (Farben, Spacing, Components)
✓ Mobile-optimiert (Touch-Targets, Sticky-Button, Kamera-Access)
✓ Trust-Signale eingebaut (DSGVO, Verschlüsselung, Vertraulichkeit)
✓ Upload-UX verbessert (größere Drop-Zone, klare States)
✓ Alle 11 Error-Cases behandelt
✓ Performance: Image-Compression vor Upload
✓ Accessibility: Labels, Focus-States, Keyboard-Support

---

**Fertig zum Einfügen in Cursor!**
