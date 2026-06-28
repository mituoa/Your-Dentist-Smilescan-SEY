# Checkliste: `/login` (als Nächstes)

**Route:** `/login`  
Login funktioniert laut dir bereits — hier **verifizieren** (F+S).

---

## Kern

- [ ] **F** E-Mail + Passwort → erfolgreicher Login
- [ ] **F** Arzt → `/dashboard` (+ optional `?yd_enter=1`)
- [ ] **F** Team → `/my-tasks`
- [ ] **F** Falsches Passwort → ruhige Meldung
- [ ] **F** `?invite=TOKEN` → nach Login `/accept-invite`
- [ ] **S** Submit pending/disabled, kein Doppel-Login

## Fehlerpfade (wenn Guards aktiv)

- [ ] **F** `?error=email_not_confirmed` + Resend
- [ ] **F** `?error=account_pending_approval`
- [ ] **F** `?error=workspace_missing`
- [ ] **S** Unknown error → nutzerfreundlich, nicht technisch

## Optional

- [ ] **F** Google OAuth (`NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN`)
- [ ] **F** Links: Register, Forgot Password
- [ ] **F** Abmelden → `?signed_out=1` ruhig
- [ ] **S** Mobile Safari, Keyboard, Autofill

## APIs

- [ ] **F** `POST /api/auth/sign-out` (Sidebar + Settings)

**Blocker Login:** _______________________________________________
