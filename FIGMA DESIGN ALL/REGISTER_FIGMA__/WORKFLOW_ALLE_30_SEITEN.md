# SmileScan - Workflow für alle 30 Seiten

So redesignst du alle 30 SmileScan-Seiten konsistent und effizient.

---

## 📋 Übersicht: Deine 30 Seiten

### Öffentlich / Patientenseite (6 Seiten)
1. `/` - Startseite
2. `/doc/[slug]` - Praxisprofil
3. `/doc/[slug]/upload` - Patient Upload
4. `/doc/[slug]/upload/success` - Upload-Bestätigung
5. `/doc/[slug]/journal` - Journal-Übersicht
6. `/doc/[slug]/journal/[articleSlug]` - Artikel-Detail

### Auth / Zugang (5 Seiten)
7. `/login` - Login ✅ **FERTIG**
8. `/register` - Registrierung
9. `/forgot-password` - Passwort vergessen
10. `/reset-password` - Passwort zurücksetzen
11. `/accept-invite` - Einladung annehmen

### Interner App-Kern (5 Seiten)
12. `/dashboard` - Hauptübersicht
13. `/inbox` - Eingangs-Liste
14. `/inbox/[id]` - Fall-Detailansicht
15. `/my-tasks` - Aufgaben-Board
16. `/my-tasks/[id]` - Aufgaben-Detail

### Profil / Einstellungen (2 Seiten)
17. `/profile` - Profil-Übersicht
18. `/profile/editor` - Profil bearbeiten
19. `/settings` - Workspace-Einstellungen

### Journal intern (3 Seiten)
20. `/journal` - Journal-Verwaltung (intern)
21. `/journal/new` - Neuer Artikel
22. `/journal/[id]/edit` - Artikel bearbeiten

### Weitere mögliche Seiten (8 Seiten)
23. `/patients` - Patienten-Liste (falls vorhanden)
24. `/patients/[id]` - Patient-Detail
25. `/team` - Team-Verwaltung
26. `/team/invite` - Team-Mitglied einladen
27. `/analytics` - Statistiken/Reports
28. `/notifications` - Benachrichtigungen
29. `/help` - Hilfe/Support
30. `/onboarding` - Onboarding-Flow

---

## 🎯 Schritt-für-Schritt Workflow

### Phase 1: Vorbereitung (1x durchführen)

#### 1.1 Theme wählen
Öffne die Login-Seite in diesem Preview und wähle dein Theme:

- **Default (Blue-Purple)** → Allgemein medical professional
- **Medical (Teal-Cyan)** → Klinisch, steril, Zahnarzt
- **Premium (Slate-Blue)** → Modern, Tech, hochwertig
- **Warm (Orange-Pink)** → Freundlich, zugänglich
- **Minimal (Pure White)** → Clean, einfach
- **Dark Mode** → Modern, Augen-schonend

📝 **Entscheidung notieren:**
```
Gewähltes Theme: [z.B. Medical (Teal-Cyan)]
Primärfarbe: [z.B. teal-600]
```

#### 1.2 Design-Token-Tabelle erstellen
Erstelle eine Datei `DESIGN_TOKENS.md` in deinem Projekt:

```markdown
# SmileScan Design Tokens

## Gewähltes Theme: Medical (Teal-Cyan)

### Farben
- Primary: `bg-teal-600 hover:bg-teal-700`
- Primary Text: `text-white`
- Link: `text-teal-600 hover:text-teal-700`
- Background: `from-teal-50 via-white to-cyan-50`
- Input: `bg-white/70 border-gray-200 focus:border-teal-500`
- Error: `text-destructive bg-destructive/10`
- Success: `text-teal-600 bg-teal-50`

### Spacing
- Container: `p-4 md:p-6 lg:p-8`
- Sections: `space-y-6 md:space-y-8`
- Elements: `gap-4`

### Typography
- H1: `text-2xl md:text-3xl font-semibold`
- H2: `text-xl font-semibold`
- H3: `text-lg font-medium`
- Body: `text-base`
- Small: `text-sm text-muted-foreground`

### Components
- Button Primary: `bg-teal-600 hover:bg-teal-700 text-white h-10 px-6 rounded-md`
- Button Secondary: `bg-secondary hover:bg-secondary/80 h-10 px-6 rounded-md`
- Card: `bg-card border border-border rounded-lg shadow-sm p-6`
- Input: `bg-white/70 border-gray-200 h-10 px-3 rounded-md`
```

#### 1.3 Screenshot-Ordner anlegen
Erstelle Ordner für deine Seiten-Screenshots:
```
/screenshots/
  /before/    (aktuelle Seiten)
  /reference/ (Design-Referenzen)
  /after/     (neue Designs)
```

---

### Phase 2: Seiten kategorisieren

Sortiere deine 30 Seiten nach Priorität:

#### 🔴 Priorität 1: Kritischer Pfad (7 Seiten)
Start → Upload → Login → Dashboard → Inbox
```
1. /login ✅ FERTIG
2. /doc/[slug] (Praxisprofil)
3. /doc/[slug]/upload (Patient Upload)
4. /register
5. /dashboard
6. /inbox
7. /my-tasks
```

#### 🟡 Priorität 2: Häufig genutzt (8 Seiten)
```
8. /inbox/[id] (Fall-Detail)
9. /my-tasks/[id] (Aufgaben-Detail)
10. /profile
11. /settings
12. /doc/[slug]/upload/success
13. /forgot-password
14. /reset-password
15. /accept-invite
```

#### 🟢 Priorität 3: Sekundäre Seiten (15 Seiten)
```
16-30. Alle weiteren Seiten
```

---

### Phase 3: Seite für Seite durchgehen

Für **jede Seite** wiederhole diese 6 Schritte:

#### Schritt 1: Screenshot machen
- Öffne die aktuelle Seite in deinem Projekt
- Mache Fullscreen-Screenshot (Desktop + Mobile)
- Speichere in `/screenshots/before/[seitenname].png`

#### Schritt 2: Prompt vorbereiten
- Öffne `UNIVERSAL_PAGE_REDESIGN_PROMPT.md`
- Kopiere den gesamten Prompt
- Fülle alle `[...]` Platzhalter aus (nutze `EXAMPLE_FILLED_PROMPT.md` als Vorlage)

**Wichtig:** Beim Theme-Abschnitt **nur dein gewähltes Theme behalten**, die anderen 5 löschen!

#### Schritt 3: Seiten-Infos sammeln
Öffne die aktuelle Seiten-Datei und beantworte:

**Funktionen:**
- Was kann der User auf dieser Seite tun?
- Welche Buttons/Links gibt es?
- Welche Formulare existieren?

**Daten:**
- Welche Informationen werden angezeigt?
- Woher kommen die Daten (API, Props, State)?

**States:**
- Empty, Loading, Error, Success?
- Welche Validierungen?

**Navigation:**
- Woher kommt der User?
- Wohin geht er danach?

#### Schritt 4: In Cursor einfügen
1. Öffne Cursor in deinem SmileScan-Projekt
2. Erstelle neuen Chat oder nutze bestehenden
3. Paste den ausgefüllten Prompt
4. Hänge Screenshot an (Drag & Drop)
5. Optional: Hänge Design-Referenz an (z.B. von dribbble.com)
6. Sende Prompt

#### Schritt 5: Review & Iteration
Cursor generiert das Redesign. Prüfe:

**✓ Funktionalität:**
- Alle ursprünglichen Features erhalten?
- Navigation funktioniert?
- Forms validieren korrekt?

**✓ Design:**
- Theme-Farben korrekt verwendet?
- Konsistent mit vorherigen Seiten?
- Spacing einheitlich?

**✓ Responsive:**
- Mobile: funktioniert, Touch-optimiert?
- Desktop: optimale Nutzung des Platzes?

**Falls Nachbesserungen nötig:**
```
Bitte ändere:
- [Änderung 1]
- [Änderung 2]

Behalte dabei bei:
- Alle Funktionen
- Das Medical Teal Theme
- Die Spacing-Vorgaben
```

#### Schritt 6: Screenshot + abhaken
- Screenshot vom neuen Design machen
- In `/screenshots/after/[seitenname].png` speichern
- In Tracking-Liste abhaken

---

### Phase 4: Konsistenz-Check

Nach je 5 Seiten: Konsistenz prüfen

#### 4.1 Visueller Vergleich
Öffne alle 5 Screenshots nebeneinander:
- Gleiche Farben? ✓
- Gleiche Button-Stile? ✓
- Gleiches Spacing? ✓
- Gleiche Typography? ✓

#### 4.2 Code-Review
Suche in allen 5 Dateien nach:
```bash
# Primary Button - sollte überall gleich sein
grep -r "bg-teal-600" src/app/

# Spacing - sollte konsistent sein
grep -r "space-y-6" src/app/

# Card-Styling
grep -r "bg-card border" src/app/
```

#### 4.3 Inkonsistenzen fixen
Falls unterschiedliche Styles:
- Notiere Unterschiede
- Gehe zurück zu Cursor
- Bitte um Angleichung

---

## 📊 Tracking-System

Erstelle `REDESIGN_PROGRESS.md`:

```markdown
# SmileScan Redesign Progress

Theme: Medical (Teal-Cyan)
Start: [Datum]

## Priorität 1 (7/7)
- [x] 1. /login - FERTIG
- [ ] 2. /doc/[slug]
- [ ] 3. /doc/[slug]/upload
- [ ] 4. /register
- [ ] 5. /dashboard
- [ ] 6. /inbox
- [ ] 7. /my-tasks

## Priorität 2 (0/8)
- [ ] 8. /inbox/[id]
- [ ] 9. /my-tasks/[id]
- [ ] ...

## Priorität 3 (0/15)
- [ ] 16. ...

## Notizen
- Login-Seite: Teal-Theme gewählt, Glass-morphism Style
- [weitere Notizen]

## Probleme / Fragen
- [offene Fragen]
```

---

## ⚡ Effizienz-Tipps

### 1. Batch-Processing
Bearbeite ähnliche Seiten zusammen:
- Alle Auth-Seiten (Login, Register, Forgot, Reset, Invite) in einer Session
- Alle List-Views (Inbox, Tasks, Patients) in einer Session
- Alle Detail-Views (Inbox-Detail, Task-Detail, Patient-Detail) in einer Session

**Vorteil:** Cursor "lernt" den Stil und macht weniger Fehler

### 2. Template-Seiten zuerst
Starte mit Template-Seiten, von denen andere ableiten:
1. Login → Register, Forgot-Password (ähnlicher Aufbau)
2. Inbox-Liste → Patients-Liste, Tasks-Liste (gleiche Komponenten)
3. Dashboard → Analytics (ähnliche Cards/Widgets)

### 3. Komponenten extrahieren
Nach 3-5 Seiten: Wiederholende Elemente als Komponenten:
```tsx
// src/components/common/PageHeader.tsx
export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="mb-6 md:mb-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      {action}
    </header>
  );
}
```

Dann im Prompt erwähnen:
```
Verwende die PageHeader-Komponente aus src/components/common/PageHeader.tsx
statt eigenes Header-Markup zu erstellen.
```

### 4. Referenz-Screenshots sammeln
Sammle 5-10 Screenshots von gut gestalteten Medical/Dental Websites:
- Jameda.de (Arztsuche)
- Doctolib.com (Terminbuchung)
- Dental-Praxis Websites (moderne)

Füge diese als "Style-Inspiration" dem Prompt bei (optional).

### 5. Prompt-Snippets
Speichere häufig verwendete Prompt-Teile als Snippets:

**Snippet: Theme-Selection**
```
Gewähltes Design-System: Medical (Teal-Cyan)
- Primärfarbe: bg-teal-600 hover:bg-teal-700
- Links: text-teal-600 hover:text-teal-700
[...]
```

**Snippet: Design-Prinzipien**
```
Design-Prinzipien (IMMER EINHALTEN):
✓ Vertrauenswürdige medizinisch-professionelle Ästhetik
[...]
```

**Snippet: Responsive-Anforderungen**
```
Mobile (<640px): Single-column, Touch-optimiert
Tablet (640-1024px): Two-column möglich
Desktop (>1024px): Full Layout
```

---

## 🎨 Konsistenz-Checkliste (nach jeder Seite)

- [ ] Theme-Farben korrekt (Primary = teal-600)?
- [ ] Button-Styles konsistent (height, padding, rounded)?
- [ ] Input-Styles konsistent (bg-white/70, border-gray-200)?
- [ ] Spacing konsistent (space-y-6 zwischen Sections)?
- [ ] Typography konsistent (h1 = text-2xl font-semibold)?
- [ ] Cards konsistent (bg-card, border, rounded-lg, shadow-sm)?
- [ ] Error-States konsistent (destructive Alert)?
- [ ] Loading-States konsistent (Skeleton oder Spinner)?
- [ ] Mobile: Touch-Targets min. 44px?
- [ ] Accessibility: Labels, Focus-States, Keyboard-Nav?

---

## 🐛 Häufige Probleme & Lösungen

### Problem: Cursor verändert Funktionalität
**Lösung:** Im Prompt explizit schreiben:
```
KRITISCH: Verändere NICHT die Funktionalität!
Behalte bei:
- Alle Server Actions
- Alle API-Calls
- Alle State-Management-Logic
- Alle Event-Handler

Ändere NUR:
- Tailwind-Klassen
- Layout-Struktur
- Spacing
- Farben
```

### Problem: Inkonsistente Farben über Seiten
**Lösung:** Vor jeder Seite explizit Theme wiederholen:
```
Verwende EXAKT diese Farben (wie auf Login-Seite):
Primary Button: bg-teal-600 hover:bg-teal-700 text-white
Links: text-teal-600 hover:text-teal-700
```

### Problem: Responsive bricht auf Mobile
**Lösung:** Nach jedem Redesign testen:
```bash
# DevTools öffnen → Device Toolbar → iPhone SE (375px)
# Prüfen: lesbar? Buttons erreichbar? Overflow?
```

Falls kaputt, zurück zu Cursor:
```
Mobile-Layout ist kaputt auf 375px Breite.
Bitte fixe:
- Text zu klein → mindestens text-sm
- Buttons zu klein → mindestens h-11 (44px)
- Horizontal scroll → alle Container max-w-full
```

### Problem: Zu viel Zeit pro Seite
**Lösung:** Zeitlimit setzen:
- Max. 15 Min. Prompt ausfüllen
- Max. 10 Min. Review
- Max. 5 Min. Nachbesserungen
- **= 30 Min. pro Seite**

Bei 30 Seiten = 15 Stunden Arbeit total
→ Über 2-3 Tage verteilen (5-7 Seiten/Tag)

---

## 📅 Empfohlener Zeitplan

### Tag 1: Priorität 1 (7 Seiten)
- 08:00-09:00 → Vorbereitung (Theme wählen, Tokens definieren)
- 09:00-11:30 → Seiten 1-5 redesignen
- 11:30-12:00 → Konsistenz-Check
- 13:00-15:00 → Seiten 6-7 redesignen
- 15:00-16:00 → Testing (Mobile, Desktop, Flows)

### Tag 2: Priorität 2 (8 Seiten)
- 08:00-12:00 → Seiten 8-15 redesignen
- 12:00-13:00 → Konsistenz-Check
- 14:00-16:00 → Testing + Nachbesserungen

### Tag 3: Priorität 3 (15 Seiten)
- 08:00-13:00 → Seiten 16-30 redesignen (schneller, da Routine)
- 13:00-14:00 → Finaler Konsistenz-Check
- 14:00-16:00 → End-to-End Testing aller Flows
- 16:00-17:00 → Dokumentation + Screenshots

**Total: 3 Tage für 30 Seiten**

---

## ✅ Final Checklist (nach allen 30 Seiten)

### Design-Konsistenz
- [ ] Alle Seiten nutzen das gleiche Theme
- [ ] Primärfarbe überall identisch
- [ ] Button-Styles einheitlich
- [ ] Input-Styles einheitlich
- [ ] Spacing-System konsistent (16/24/32px Grid)
- [ ] Typography-Skala einheitlich
- [ ] Card-Styles identisch

### Funktionalität
- [ ] Alle ursprünglichen Features funktionieren
- [ ] Keine kaputten Links
- [ ] Navigation zwischen Seiten funktioniert
- [ ] Formulare validieren korrekt
- [ ] API-Calls funktionieren
- [ ] Authentifizierung funktioniert
- [ ] Berechtigungen funktionieren

### Responsive Design
- [ ] Alle Seiten auf Mobile getestet (375px)
- [ ] Alle Seiten auf Tablet getestet (768px)
- [ ] Alle Seiten auf Desktop getestet (1440px)
- [ ] Touch-Targets min. 44px
- [ ] Kein horizontaler Scroll
- [ ] Text lesbar auf allen Größen

### Performance
- [ ] Bilder optimiert
- [ ] Keine unnötigen Re-Renders
- [ ] Lazy-Loading wo sinnvoll
- [ ] Page-Load-Time < 2 Sekunden

### Accessibility
- [ ] Alle Inputs haben Labels
- [ ] Focus-States sichtbar
- [ ] Keyboard-Navigation funktioniert
- [ ] Farbkontrast WCAG AA
- [ ] Screen-Reader freundlich

### Testing
- [ ] Kritische User-Flows getestet
  - [ ] Patient: Upload-Flow (Startseite → Praxis → Upload → Success)
  - [ ] Team: Triage-Flow (Login → Inbox → Fall-Detail → Task erstellen)
  - [ ] Arzt: Approval-Flow (Dashboard → Tasks → Bestätigen → Done)
- [ ] Edge-Cases getestet
  - [ ] Sehr lange Namen/Texte
  - [ ] Viele Items in Listen (100+)
  - [ ] Leere States (keine Daten)
  - [ ] Error-States (API-Fehler)
- [ ] Browser-Kompatibilität
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

### Dokumentation
- [ ] Screenshots aller 30 Seiten (Before/After)
- [ ] Design-Token-Dokumentation aktualisiert
- [ ] Component-Library dokumentiert
- [ ] README mit Design-Entscheidungen
- [ ] Changelog mit allen Änderungen

---

## 🎉 Geschafft!

Nach diesem Workflow hast du:
✅ 30 konsistent gestaltete Seiten
✅ Ein einheitliches Design-System
✅ Eine vollständig dokumentierte Redesign-Historie
✅ Ein produktionsreifes, modernes UI

**Nächste Schritte:**
1. Stakeholder-Review (zeige Screenshots)
2. User-Testing (5-10 Test-User)
3. Feinschliff basierend auf Feedback
4. Production-Deployment

---

**Viel Erfolg! 🚀**
