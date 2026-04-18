# PHASE 1 — SmileScan MVP Setup

> **Für Cursor Agent:** Arbeite diesen Plan Schritt für Schritt ab. Führe jeden Schritt vollständig aus, bevor du zum nächsten gehst. Wenn ein Schritt fehlschlägt, halte an und melde den Fehler — gehe NICHT zum nächsten Schritt weiter. Wenn du eine menschliche Entscheidung brauchst (z.B. einen Supabase-Key), halte an und frage.

> **Für den Menschen (User):** Lass Cursor diesen Plan abarbeiten. Stelle sicher, dass du deine Supabase-Zugangsdaten bereit hast (du brauchst sie in Schritt 4).

---

## Schritt 0 — Ausgangscheck

**Befehle:**
```bash
pwd
ls -la
```

**Erwartet:** Der Ordner sollte entweder leer sein oder nur `.git`, `.DS_Store` oder ähnliche Meta-Files enthalten.

**Halt-Bedingung:** Wenn der Ordner alte `node_modules`, `package.json` oder Code-Dateien enthält, STOPPE und melde dem Menschen: "Ordner ist nicht leer. Bitte alten Inhalt entfernen oder in leeren Ordner wechseln."

---

## Schritt 1 — Next.js 14 App installieren

**Befehl:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*" --use-npm --no-turbopack
```

**Falls Prompt "directory is not empty":** Mit `yes` bestätigen.

**Erwartet:** Installation dauert 1–3 Minuten. Am Ende eine Ordnerstruktur mit `app/`, `public/`, `node_modules/`, `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`.

**Verifiziere:**
```bash
ls -la
cat package.json
```

**Halt-Bedingung:** Wenn `package.json` fehlt oder die Installation abgebrochen ist, STOPPE und melde den Fehler.

---

## Schritt 2 — Initialen Commit erstellen

**Falls Git noch nicht initialisiert:**
```bash
git init
git branch -M main
```

**Falls Git existiert:** Überspringen.

**Commit:**
```bash
git add .
git commit -m "chore: initial Next.js 14 setup"
```

---

## Schritt 3 — Kern-Dependencies installieren

Wir installieren auf einmal alles, was wir für das MVP brauchen. Keine experimentellen Libraries — nur bewährter Stack.

**Befehl:**
```bash
npm install @supabase/supabase-js @supabase/ssr zod lucide-react clsx tailwind-merge class-variance-authority
```

**Dev-Dependencies:**
```bash
npm install -D @types/node
```

**Was diese Libraries tun:**
- `@supabase/supabase-js` + `@supabase/ssr` — Supabase-Client für Server und Client Components
- `zod` — Typsichere Validierung von Formulareingaben
- `lucide-react` — Icon-Bibliothek
- `clsx` + `tailwind-merge` — Utility für conditional Tailwind Classes
- `class-variance-authority` — Für wiederverwendbare Component-Varianten

**Verifiziere:**
```bash
cat package.json
```

Die `dependencies` sollten jetzt alle 7 Einträge enthalten.

---

## Schritt 4 — Supabase-Zugangsdaten konfigurieren

**HALT — Menschliche Entscheidung nötig.**

Bevor du fortfährst, brauchst du vom Menschen die folgenden Werte aus seinem bestehenden Supabase-Projekt:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Der Mensch findet diese unter:
→ supabase.com → sein Projekt → Settings → API

**Frage den Menschen:** "Bitte kopiere die drei Werte aus Supabase → Settings → API hierher. Oder sage mir 'überspringen', dann lege ich Platzhalter an und du trägst später selbst ein."

**Nachdem der Mensch geantwortet hat, erstelle die Datei `.env.local`:**

```
NEXT_PUBLIC_SUPABASE_URL=<URL oder Platzhalter>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<KEY oder Platzhalter>
SUPABASE_SERVICE_ROLE_KEY=<KEY oder Platzhalter>
```

**Dann erstelle `.env.example` (für Git, ohne echte Werte):**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Prüfe, dass `.env.local` in `.gitignore` steht** (ist bei Next.js standardmäßig der Fall). Falls nicht, füge hinzu.

---

## Schritt 5 — Supabase-Client-Setup erstellen

Wir brauchen drei Supabase-Clients: Browser-Client, Server-Client (für Server Components) und Service-Role-Client (für API-Routes mit Admin-Rechten).

**Erstelle Ordner:**
```bash
mkdir -p lib/supabase
```

**Erstelle `lib/supabase/client.ts`:**
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Erstelle `lib/supabase/server.ts`:**
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components können keine Cookies setzen, das ist ok
          }
        },
      },
    }
  );
}
```

**Erstelle `lib/supabase/admin.ts`:**
```typescript
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

**Erstelle `middleware.ts` im Root (nicht in `app/`):**
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // WICHTIG: Diese Zeile aktualisiert die Session bei jedem Request
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Schritt 6 — Utility-Funktion für Tailwind-Classes

**Erstelle `lib/utils.ts`:**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Schritt 7 — Design-Tokens einpflegen

Wir übernehmen die Design-Tokens aus unserem Design-System (dunkles Editorial Theme für Marketing, helles Cream Theme für die App).

**Ersetze `app/globals.css` komplett mit:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode (App-Dashboard, Cream Theme) */
    --surface-page: 250 250 248;
    --surface-card: 255 255 255;
    --surface-sunken: 242 241 236;
    --border-default: 229 227 219;
    --text-primary: 26 26 26;
    --text-secondary: 95 94 90;
    --text-tertiary: 151 149 140;
    --brand-primary: 15 110 86;
    --brand-glow: 29 158 117;
    --signal-danger: 226 75 74;
  }

  .dark {
    /* Dark mode (Marketing, Editorial Theme) */
    --surface-page: 10 10 10;
    --surface-card: 26 26 26;
    --surface-sunken: 20 20 20;
    --border-default: 38 38 38;
    --text-primary: 250 250 248;
    --text-secondary: 180 180 175;
    --text-tertiary: 115 115 110;
    --brand-primary: 29 158 117;
    --brand-glow: 62 207 160;
    --signal-danger: 239 94 94;
  }

  html {
    background: rgb(var(--surface-page));
    color: rgb(var(--text-primary));
  }

  body {
    font-feature-settings: "ss01", "cv11";
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    letter-spacing: -0.01em;
  }
}
```

**Ersetze `tailwind.config.ts` komplett mit:**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: "rgb(var(--surface-page) / <alpha-value>)",
          card: "rgb(var(--surface-card) / <alpha-value>)",
          sunken: "rgb(var(--surface-sunken) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border-default) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--text-tertiary) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--brand-primary) / <alpha-value>)",
          glow: "rgb(var(--brand-glow) / <alpha-value>)",
        },
        danger: "rgb(var(--signal-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Schritt 8 — Fonts einrichten

**Ersetze `app/layout.tsx` komplett mit:**

```typescript
import type { Metadata } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SmileScan — Die fehlende Schicht",
  description:
    "SmileScan ist die diskrete Brücke zwischen Beobachtung und klinischer Versorgung.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

---

## Schritt 9 — Platzhalter-Startseite löschen und Basis-Homepage anlegen

**Ersetze `app/page.tsx` komplett mit:**

```typescript
export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-page text-text-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-light tracking-tight">
          SmileScan
        </h1>
        <p className="mt-4 text-text-secondary">
          Setup läuft. Nächste Phase: Datenmodell und Auth-Flow.
        </p>
      </div>
    </main>
  );
}
```

---

## Schritt 10 — Dev-Server starten und verifizieren

**Befehl:**
```bash
npm run dev
```

**Erwartet:** Server startet auf `http://localhost:3000`. Keine Fehler im Terminal.

**Visuelle Verifikation für den Menschen:** Öffne im Browser `http://localhost:3000`. Erwartet: Ein helles (cream) Hintergrund-Screen mit "SmileScan" in großer Serif-Schrift und darunter kleinem Hinweis-Text.

**Wichtig:** Lass den Server laufen. Stoppe nicht.

**Halt-Bedingung:** Wenn Fehler kommen (roter Text im Terminal, Kompilierfehler, "Module not found"), STOPPE und melde den Fehler an den Menschen.

---

## Schritt 11 — Git-Commit für Phase-1-Abschluss

In einem neuen Terminal (Dev-Server weiter laufen lassen):

```bash
git add .
git commit -m "feat: phase 1 — Next.js + Supabase + design tokens setup"
```

---

## Schritt 12 — Optional: Auf GitHub pushen

**HALT — Menschliche Entscheidung nötig.**

Frage den Menschen: "Möchtest du jetzt einen neuen GitHub-Repo für dieses Projekt erstellen und pushen? Ja / Später / Überspringen"

**Wenn "Ja":**
1. Frage nach dem gewünschten Repo-Namen (Vorschlag: `smilescan-mvp`)
2. Nutze GitHub CLI wenn verfügbar: `gh repo create smilescan-mvp --private --source=. --remote=origin --push`
3. Falls `gh` nicht verfügbar, gib dem Menschen die manuellen Befehle zurück

**Wenn "Später" oder "Überspringen":** Weiter zu Schritt 13.

---

## Schritt 13 — Abschluss-Report

Erstelle eine Datei `PHASE-1-REPORT.md` mit:

```markdown
# Phase 1 — Abschluss-Report

## Status: ✅ Erfolgreich / ❌ Mit Fehlern

## Was wurde aufgesetzt:
- [ ] Next.js 14 mit App Router + TypeScript + Tailwind
- [ ] Supabase-Clients (Browser, Server, Admin)
- [ ] Middleware für Session-Refresh
- [ ] Design-Tokens (Light + Dark Mode)
- [ ] Fonts (DM Sans, Fraunces, JetBrains Mono)
- [ ] Dev-Server läuft auf localhost:3000
- [ ] Erster Git-Commit
- [ ] GitHub-Repo (falls gewünscht): <Repo-URL oder "nicht erstellt">

## Environment-Variablen in .env.local:
- [ ] Echte Supabase-Werte eingetragen
- [ ] Oder Platzhalter — Mensch muss später nachtragen

## Nächste Phase:
Phase 2 — Datenmodell in Supabase anlegen (submissions, tasks, profile_data, journal_entries).

## Bekannte offene Punkte:
<Liste eventuelle Warnungen oder Fehler hier>
```

---

## Zusammenfassung für den Agenten

Dieser Plan baut die **Grundlage** — nicht mehr, nicht weniger. Am Ende hat der Mensch:

1. Einen laufenden Next.js-Server auf localhost:3000
2. Supabase-Clients ready
3. Design-Tokens installiert
4. Einen Commit als Sicherheitspunkt

Was **nicht** in Phase 1 ist (und bewusst später kommt):
- Auth-Flow (Login/Register-Seiten)
- Datenbank-Tabellen
- Die eigentlichen Screens (Dashboard, Inbox etc.)
- API-Routes

Wenn du einen Schritt nicht verstehst oder eine Datei bereits existiert, die du überschreiben sollst, halte an und frage den Menschen. Überspringe nichts still.

---

*Ende Phase 1*
