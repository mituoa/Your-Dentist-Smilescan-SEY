<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Function Buildout — Arbeitsmodus (Your Dentist)

Gilt ab Function-Buildout-Phase für **jeden** Produkt-Schritt. Ergänzt den Medical-/Enterprise-Standard unten; bei Konflikt gilt: **kein Redesign, keine neue Navigation, bestehende Module**.

### Produktkern (unverändert)

```text
Patient → KI-Vorbereitung → Praxisentscheidung → Teamumsetzung
```

Jede neue Funktion muss mindestens eines erfüllen: weniger Telefonate · weniger interne Rückfragen · weniger organisatorischer Aufwand · schnellere Bearbeitung · bessere Nachverfolgung · mehr Automatisierung bei gleichbleibender ärztlicher Kontrolle.

**Erfolgstest:** Praxen fühlen sich entlastet („digitale Mitarbeiterin“), nicht verwaltet („noch ein Dashboard“).

### Feste Modul-Struktur (nicht erweitern)

| Modul | Route(n) | Rolle |
|--------|----------|--------|
| **Atlas** | `/dashboard` | Überblick, Prioritäten, Entscheidungen |
| **Tracker** | `/inbox`, `/inbox/[id]` | Patientenfälle, Einsendungen, Fotos, Verlauf |
| **Relay** | `/relay`, `/my-tasks` | Aufgaben, Team, Umsetzung, Erinnerungen |
| **Journals** | `/journal`, … | Praxiswissen für Patient:innen |
| **Command AI** | Assistenzschicht (⌘K / FAB) | Über allem; **kein** eigener großer Workspace |

Neue Funktionen **nur** in diese Struktur einhängen — **keine** neuen Sidebar-Module, **keine** Architektur-Neuerfindung.

### Explizit verboten in diesem Modus

- Große Redesigns, UI-Experimente, Template-SaaS-Optik
- Zusätzliche Analytics/Charts/Verwaltungsflächen ohne Workflow-Gewinn
- Tote Buttons, Fake-Funktionen, MVP-Rohzustände in kritischen Pfaden
- Roh-Technikfehler in der UI; automatische **medizinische** Entscheidung oder Versand ohne Freigabe

### Arbeitsweise pro Schritt

1. **Nur einen Schritt** umsetzen (ein klar abgrenzbares Ziel).
2. **Vorher** bestehende Datenstrukturen/Queries/RLS prüfen — nichts doppelt erfinden.
3. **Nur nötige Dateien** ändern; bestehende UI-Komponenten und Copy-Ton respektieren.
4. Nach Umsetzung: **Build/Typecheck** (`npm run build` oder projektüblicher Check).
5. Keine Neben-Refactors „nebenbei“.

### Prioritäten-Reihenfolge (Function-Backlog)

1. Tracker/Inbox als zentrale Arbeitsliste (innerhalb bestehender Struktur)
2. Command AI (Sprache, automatische Aufgaben — Assistenzschicht)
3. Fotoverlauf (Nachsorge / Telemonitoring am Fall)
4. Praxiswissen / Antwortbibliothek (Journals-Ökosystem)
5. Recall- und Nachsorge-Automationen (Relay)
6. Morning Briefing (Atlas, entscheidungsorientiert)
7. Praxisgedächtnis (fallübergreifender Kontext)

## Medical / Enterprise SaaS — globaler Produktstandard

Dieser Abschnitt gilt **dauerhaft für das gesamte Programm**: neue Features, Refactorings, UI-Polish, Uploads, Auth, Dashboard, Inbox/Relay, Create-Case, Billing, Settings, E-Mail-Flows, Mobile, Error-/Loading-/Pending-Zustände, Security/Storage sowie **rechtliche und Trust-/Compliance-Kommunikation** — einschließlich **Security-, Datenschutz- und Registrierungs-Flows** nach Medical-/Health-SaaS-Qualität.

Implementierungen sind **nicht nur bei expliziten Audits**, sondern **standardmäßig** dagegen zu prüfen und auszurichten.

**Orientierung:** an etablierten, hochwertigen Medical-/Health-SaaS-Produkten — **ruhig, präzise, vertrauenswürdig, professionell**; nicht marketing-lastig und nicht übertrieben technisch (keine „Fear, Uncertainty and Doubt“-Security-Claims).

### Leitprinzipien

- **Enterprise-glatte UX:** kontrollierte Flows, klare nächste Schritte, keine „weiß nicht wie weiter“-Momente, keine Template-SaaS-Wirkung (willkürige Abstände, generische Microcopy, hektische Layout-Sprünge).
- **DSGVO- und medical-taugliche Kommunikation:** sachlich, ruhig, ohne Übertreibung; **keine Fake-Claims** oder unbelegte Heilsversprechen; medizinische/rechtliche Formulierungen nur dort, wo fachlich abgesichert und konsistent mit AGB/Datenschutz/Widerruf.
- **Trust & Compliance:** Transparenz bei Datenverarbeitung und Speicherung (z. B. Uploads); keine irreführenden Zustände („erfolgreich“, wenn nur ein Teilschritt gelungen ist).
- **Sichere Server-Patterns:** Server Actions / API-Routen mit klarer Autorisierung, keine Geheimnisse im Client, sensible Operationen serverseitig; Logs mit Rohfehlern serverseitig, **nie** unkontrolliert roh an den Browser.
- **Keine halben Zustände:** keine leeren Cards, keine stillen Teil-Erfolge, keine widersprüchlichen Success+Error-Kombinationen ohne erklärende Copy; Recovery-Pfade nach Fehlern erkennbar.
- **Keine rohen technischen Fehler** in der UI: nutzerorientierte, ruhige deutsche Texte (z. B. `userFacingAuthError` oder gleichwertige zentrale Mapper); unbekannte kurze Strings nicht willkürlich verwischen, wenn sie bereits verifizierte Produktcopy sind (siehe bestehende Auth-Error-Helfer).
- **Stabile Pending-/Race-/Retry-Flows:** während Mutationen konkurrierende Aktionen sperren; Submit-Intent nach Fehler zurücksetzen; Back/Forward und Multi-Tab berücksichtigen (`aria-busy`, Redirect-Keys, Session-Flags wo sinnvoll).

### Premium UX, Trust & Recovery (**streng** — nicht nur „technisch OK“)

Technisch funktionierende UI **reicht nicht**. Jede **wichtige Oberfläche** (u. a. Login, Register, Forgot/Reset-Passwort, Uploads sensibler Nachweise, kritische Schritte in Dashboard/Case/Billing) muss **zusätzlich** gegen folgende Wahrnehmungskriterien geprüft und ausgerichtet werden:

- Wirkt die Oberfläche **ruhig**? **vertrauenswürdig**? **hochwertig**? **medizinisch-professionell**? **kontrolliert**? Wie **echte Enterprise-Software**?
- Fühlt sich der Flow **stabil und bewusst gestaltet** an (Leseführung, Rhythmus, keine hektischen Sprünge)?

**Besonders prüfen:** Error-, Success- und **Recovery**-Zustände; **Resend**-Flows; **leere** Zustände; **Invite**-Flows; **langsames Netz**; **Mobile Safari** / kleine Geräte; **Browser Back/Forward**; **Multi-Tab**; **Session-Wechsel**; **abgelaufene Links/Tokens**; **Loading/Pending** (konsistente Disabled-Zustände, keine widersprüchlichen Spinner).

**Visuell & inhaltlich vermeiden:** generische **Template-SaaS**-Muster; **zu laute** Preis-/Commerce-Optik wo kein Shop-Kontext; **aggressive** CTAs; **unstabile** Übergänge; **billige** Wizard-/Auth-Momente; **visuelle Unruhe** und schwache **vertikale Rhythmik**; **unkontrollierte** Scroll-Erfahrung (abgeschnittene CTAs, doppelte Scroll-Ketten).

**Security- und Datenschutz-Kommunikation in der UI** (nicht die technische Implementierung — die bleibt serverseitig streng):

- **Ruhig, professionell, präzise, vertrauenswürdig** formulieren.
- **Keine** unnötig **technischen** Security-Hinweise und **kein** StackOverflow-/Developer-Jargon für Endnutzerinnen.
- **Keine Fake-Trust-Claims** (siehe auch Zertifizierungs-Regel oben).
- Enumeration und andere Schutzmechanismen **elegant** kommunizieren (Recovery-Hinweise, Posteingang/Spam, neutrale Formulierungen) — nicht als kalter „Security-Disclaimer“.

**Orientierung:** etablierte **Medical-/Health-/Enterprise**-Produkte — **Enterprise-glatte UX**, nicht nur funktional korrekte UX.

### Security, Datenschutz & Registrierung (Medical / Health SaaS)

Alle Security-, Datenschutz- und Registrierungs-Flows so bewerten und gestalten, dass sie diesen Standard erfüllen — **ab jetzt standardmäßig** bei jeder relevanten Änderung mitdenken.

- **DSGVO & Datenminimierung:** nur Daten erheben und speichern, die für den jeweiligen Zweck **erforderlich** sind; Zwecke und Speicherung für Nutzerinnen **nachvollziehbar** (Copy, Einstellungen, ggf. Hinweise am Upload); keine „Sammelmentalität“ ohne fachliche Notwendigkeit.
- **Security-Kommunikation:** **ruhig und ehrlich** — was getan wird (z. B. verschlüsselte Übertragung, Zugriff nur nach Freigabe) sachlich benennen; **keine** übertriebenen oder nicht verifizierbaren Sicherheitsversprechen.
- **Keine unbelegten Zertifizierungs- / Compliance-Claims:** keine SOC-2-, ISO-, „HIPAA-ready“, „TÜV“- o. Ä. **Behauptungen** in UI, Marketing oder Tooltips, solange sie im Projekt **nicht belegt** und rechtlich nicht sauber geführt sind.
- **Sensible Praxis- und Nachweisdaten** (Zulassung, Dokumente, Fallinhalte): Verarbeitung **serverside**, mit klarer **Autorisierung** und ohne unnötige Exposition in URLs, Client-Logs oder Fehlermeldungen; Zugriff nur für vorgesehene Rollen/Workspaces.
- **Einwilligungs- und Vertragslogik:** Checkboxen, Zeitpunkte und **Versionsbezug** (z. B. Vertragsversion) **konsistent** zwischen UI, Server und gespeicherten Datensätzen; keine widersprüchlichen „opt-in“-Zustände.
- **Keine unkontrollierten sensiblen Orphans:** fehlgeschlagene Registrierung → `rollbackIncompleteRegistrationAfterFailure` (s. `lib/register-signup-rollback.ts`); verwaiste Pending-Lizenzen → TTL-Route `POST /api/internal/cleanup-register-license-pending` (Betrieb: `docs/operations/register-production-hardening.md`).
- **Vertrauenswürdige Fehlerkommunikation:** Nutzerinnen **nicht** mit Rohfehlern oder internen IDs alleinlassen; **keine** Schuldzuweisung; Hinweise, was als Nächstes sinnvoll ist (erneut versuchen, Support, Login).
- **Dokumente & Uploads:** sichere Übertragung, **Zweckbindung** in der UI klar (wofür das Dokument genutzt wird); keine Texte, die ein anderes Verhalten implizieren als implementiert (z. B. „wird sofort gelöscht“ nur wenn wirklich so umgesetzt).
- **Demo-, Test- und Produktivverhalten:** **strikt trennen** (Konfiguration, Feature-Flags, Copy); in Demo/Test **niemanden** glauben lassen, es sei Produktivrecht oder Produktiv-Billing; Demo-Zugänge klar kennzeichnen, keine Produktivdaten in Spiel-Modi.

**Bei rechtlichen oder datenschutzrelevanten Risiken** im Code oder in der Copy: Risiko **klar benennen** (Kommentar, Ticket, oder in der Review-Antwort); **minimal, sauber und enterprise-tauglich** entschärfen — keine großen Refactors „nebenbei“, aber auch kein Wegschauen.

### Geltungsbereiche (automatisch mitdenken)

| Bereich | Mindestanforderungen (Kurz) |
|--------|------------------------------|
| **Neue Features / Refactors** | Gleicher Standard wie bestehende kritische Pfade; keine Regression bei Loading/Error/Empty. |
| **UI-Polish** | Mobile zuerst mitdenken (Safe Area, Touch-Mindestgrößen, Scroll-Ketten vermeiden, `16px`-Inputs wo iOS-Zoom vermieden werden soll), ruhige Typo-Hierarchie. |
| **Uploads** | Fortschritt/Fehler, Wiederholung, keine Roh-Exceptions; Speicher-/Löschpfade bei Abbruch wo nötig; **Zweckbindung** und sichere Verarbeitung sensibler Nachweise. |
| **Auth / Register / Invite** | Sperren, Kanal-Kohärenz, Einladung vs. E-Mail konsistent; abgelaufene/ungültige Invites ruhig erklären; **Datenminimierung**, Vertrag/Einwilligung konsistent; Demo vs. Prod erkennbar. |
| **Dashboard / Create-Case** | Workspace-/Kontext-Fehler klar zu Login oder erklärender Meldung routen, nicht „leer hängen“. |
| **Inbox / Relay / Tasks** | Pending auf destruktive/Navigationsschritte; keine doppelten Submits. |
| **Billing / Settings** | Keine irreführenden Zahlungszustände; Stripe/Checkout-Fehler nutzerfreundlich; Vertrags-Checkboxen und Pflichttexte respektieren. |
| **E-Mail-Flows** | `check-email` ohne Enumeration (Option A); Resend/Confirm rate-limited; keine Rohstrings in der UI. |
| **Mobile** | `dvh`/`svh` bewusst einsetzen, Safe Areas, ein dominanter Scroll-Container wo möglich, keine abgeschnittenen CTAs. |
| **Error / Loading / Pending** | Immer bedienbare UI nach Fehler; keine leeren Fehlerboxen; keine übermäßig aggressive Spinner-Sprache. |
| **Security / Storage** | Admin-Client nur serverseitig; Pfade/RLS nicht umgehen; sensible Metadaten nicht leaken. |
| **Rechtliche Texte** | Mit verlinkten Dokumenten (AGB, Datenschutz, Widerruf) konsistent; keine widersprüchlichen UI-Zusagen. |

### Kritische UI-Aktionen (Schreibpfade)

Für **Schreibpfade** (Auth, Register, Invite, Uploads, Cases, Inbox/Tasks, Relay, Zahlung, E-Mail, Journal, Einstellungen) gilt zusätzlich:

1. **Während Server Actions / Mutationen:** relevante Eingaben und konkurrierende CTAs **sperren** (`useFormStatus`, `useTransition` + `isPending`, oder `fieldset disabled` — Hidden-Felder nur **außerhalb** eines `disabled`-Fieldsets, damit der Submit konsistent bleibt).
2. **Keine parallelen widersprüchlichen Submits:** Doppelklick und zweiter Kanal (z. B. Passwort-Login vs. OAuth) verhindern; nur der **auslösende** Button zeigt Pending/Spinner, andere **deaktiviert** ohne visuelles Chaos.
3. **Kein Zurück** während kritischer Schreiboperationen, wenn dadurch Races zur Server-Last entstehen (z. B. Wizard-Step mit gemeinsamem Formular wie Register Step 4).
4. **Fehler:** nutzerorientierte Meldungen (`userFacingAuthError` o. Ä.), **keine** rohen Stack-/DB-Strings in der UI. Nach Fehler **UI wieder entsperrt** (Redirect mit Query-Key oder Pending-Reset).
5. **Keine halben Success-Zustände** und keine stillen Teil-Erfolge; klare Erfolgs- oder Fehler-Fortsetzung.
6. **Stress:** langsame Verbindung, Mobile Safari, Back/Forward, Multi-Tab — Pending und Copy so wählen, dass nichts „hängend“ wirkt (`aria-busy`, ruhige Loading-Texte).

**Referenz in diesem Repo:** Register Step 4 (ein Formular, Intent-Submits, sperrendes Fieldset), Login (Kanal-Sperre + `authFlowResetKey`), Abmelden (`SignOutIconForm` / `SignOutReturnForm`), Inbox/My-Tasks Task-Formulare (`isPending` auf Steuerelemente).

Bei **neuen** kritischen Aktionen diesen Standard prüfen und analog umsetzen.

### Checkliste vor Merge (Selbstprüfung)

- [ ] **Premium UX / Trust / Recovery:** Für alle berührten **kritischen Oberflächen** die Kriterien im Abschnitt *„Premium UX, Trust & Recovery“* erfüllt (nicht nur „baut ohne Fehler“)?
- [ ] Leere / halbe / verwirrende Zustände vermieden (inkl. schlechte Query-Params, Back/Forward)?
- [ ] Fehler verständlich, recoverbar, ohne Schuldzuweisung am Nutzer?
- [ ] Mobile: Touch-Ziele, Scroll, Safe Area, keine doppelte Scroll-Hölle?
- [ ] Keine unbelegten Marketing-, Medical-, **Zertifizierungs- oder Compliance-Claims**?
- [ ] Server: AuthZ, keine Secrets im Client, sensible Logs nur serverseitig?
- [ ] **DSGVO:** Datenminimierung und Zweckbindung bei neuen Feldern/Uploads; keine unnötige Speicherung sensibler Daten?
- [ ] **Uploads / Dokumente:** sichere Verarbeitung; UI-Copy stimmt mit tatsächlichem Verhalten überein?
- [ ] **Einwilligung / Vertrag:** konsistent mit Server und gespeicherter Version?
- [ ] **Demo / Test / Prod** klar getrennt und für Nutzerinnen erkennbar, wo relevant?
- [ ] Rechtliche oder datenschutzrelevante **Risiken** erkannt und minimal entschärft oder dokumentiert?
