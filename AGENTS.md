<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Kritische UI-Aktionen (Enterprise / Medical SaaS)

Für **Schreibpfade** (Auth, Register, Invite, Uploads, Cases, Inbox/Tasks, Relay, Zahlung, E-Mail, Journal, Einstellungen) gilt:

1. **Während Server Actions / Mutationen:** relevante Eingaben und konkurrierende CTAs **sperren** (`useFormStatus`, `useTransition` + `isPending`, oder `fieldset disabled` — Hidden-Felder nur **außerhalb** eines `disabled`-Fieldsets, damit der Submit konsistent bleibt).
2. **Keine parallelen widersprüchlichen Submits:** Doppelklick und zweiter Kanal (z. B. Passwort-Login vs. OAuth) verhindern; nur der **auslösende** Button zeigt Pending/Spinner, andere **deaktiviert** ohne visuelles Chaos.
3. **Kein Zurück** während kritischer Schreiboperationen, wenn dadurch Races zur Server-Last entstehen (z. B. Wizard-Step mit gemeinsamem Formular wie Register Step 4).
4. **Fehler:** nutzerorientierte Meldungen (`userFacingAuthError` o. Ä.), **keine** rohen Stack-/DB-Strings. Nach Fehler **UI wieder entsperrt** (Redirect mit Query-Key oder Pending-Reset).
5. **Keine halben Success-Zustände** und keine stillen Teil-Erfolge; klare Erfolgs- oder Fehler-Fortsetzung.
6. **Stress:** langsame Verbindung, Mobile Safari, Back/Forward, Multi-Tab — Pending und Copy so wählen, dass nichts „hängend“ wirkt (`aria-busy`, ruhige Loading-Texte).

**Referenz in diesem Repo:** Register Step 4 (ein Formular, Intent-Submits, sperrendes Fieldset), Login (Kanal-Sperre + `authFlowResetKey`), Abmelden (`SignOutIconForm` / `SignOutReturnForm`), Inbox/My-Tasks Task-Formulare (`isPending` auf Steuerelemente).

Bei **neuen** kritischen Aktionen diesen Standard prüfen und analog umsetzen.
