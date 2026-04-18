# PHASE 3 — Auth-Flow (Login, Register, Session)

> **Für Cursor Agent:** Arbeite diesen Plan Schritt für Schritt ab. Arbeite autonom. Nur bei Fehlern oder wenn menschliche Entscheidung nötig ist, stoppe und frage.

> **Für den Menschen:** Diese Phase baut die Login- und Register-Flows. Am Ende kannst du dich real registrieren, einloggen und ausloggen. Die Session wird per Cookie verwaltet (Supabase SSR).

---

## Überblick der Struktur

Wir bauen:

| Datei | Zweck |
|---|---|
| `app/(auth)/layout.tsx` | Zentrierter, ruhiger Layout für Auth-Seiten |
| `app/(auth)/login/page.tsx` | Login-Formular |
| `app/(auth)/register/page.tsx` | Register-Formular mit Workspace-Name |
| `app/(auth)/actions.ts` | Server Actions für Login, Register, Logout |
| `app/(auth)/auth/callback/route.ts` | Supabase-Callback-Route (für Magic Link später) |
| `components/ui/button.tsx` | Wiederverwendbarer Button |
| `components/ui/input.tsx` | Wiederverwendbares Input |
| `components/ui/label.tsx` | Wiederverwendbares Label |
| `lib/auth-helpers.ts` | Helper zum Prüfen wer eingeloggt ist |
| `proxy.ts` (UPDATE) | Redirect wenn nicht eingeloggt aber geschützte Route |

Plus: eine erste geschützte Route `app/(protected)/dashboard/page.tsx` als Proof-of-Concept.

---

## Schritt 1 — UI-Komponenten erstellen

### Datei: `components/ui/button.tsx`

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" &&
            "bg-brand text-white hover:bg-brand-glow",
          variant === "secondary" &&
            "bg-surface-card text-text-primary border border-border hover:bg-surface-sunken",
          variant === "ghost" &&
            "text-text-secondary hover:text-text-primary hover:bg-surface-sunken",
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

### Datei: `components/ui/input.tsx`

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded border border-border bg-surface-card px-3 py-2 text-sm",
        "text-text-primary placeholder:text-text-tertiary",
        "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
```

### Datei: `components/ui/label.tsx`

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-text-secondary mb-1.5 block",
        className
      )}
      {...props}
    />
  );
});

Label.displayName = "Label";
```

---

## Schritt 2 — Auth-Helper

### Datei: `lib/auth-helpers.ts`

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, slug)")
    .eq("user_id", user.id)
    .single();

  return data;
}
```

---

## Schritt 3 — Auth-Layout

### Datei: `app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-page flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary">
            SmileScan
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
```

---

## Schritt 4 — Server Actions für Auth

### Datei: `app/(auth)/actions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-Mail und Passwort erforderlich." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const workspaceName = formData.get("workspace_name") as string;
  const displayName = formData.get("display_name") as string;

  if (!email || !password) {
    return { error: "E-Mail und Passwort erforderlich." };
  }

  if (password.length < 8) {
    return { error: "Passwort muss mindestens 8 Zeichen haben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        workspace_name: workspaceName || "Meine Praxis",
        display_name: displayName || email,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Falls Email Confirmation eingeschaltet ist, landet User jetzt auf
  // einer "Check your email"-Seite. Sonst direkt ins Dashboard.
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
```

---

## Schritt 5 — Login-Seite

### Datei: `app/(auth)/login/page.tsx`

```typescript
import Link from "next/link";
import { signIn } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-8">
      <h2 className="font-serif text-2xl font-light mb-2 text-text-primary">
        Anmelden
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Willkommen zurück.
      </p>

      <form action={signIn} className="space-y-4">
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="doc@praxis.de"
          />
        </div>

        <div>
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full">
          Anmelden
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-secondary text-center">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-brand hover:underline">
          Registrieren
        </Link>
      </p>
    </div>
  );
}
```

---

## Schritt 6 — Register-Seite

### Datei: `app/(auth)/register/page.tsx`

```typescript
import Link from "next/link";
import { signUp } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-8">
      <h2 className="font-serif text-2xl font-light mb-2 text-text-primary">
        Konto anlegen
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Für Zahnärzte in geschlossener Beta.
      </p>

      <form action={signUp} className="space-y-4">
        <div>
          <Label htmlFor="display_name">Vollständiger Name</Label>
          <Input
            id="display_name"
            name="display_name"
            type="text"
            required
            placeholder="Dr. med. dent. Jane Doe"
          />
        </div>

        <div>
          <Label htmlFor="workspace_name">Praxis-Name</Label>
          <Input
            id="workspace_name"
            name="workspace_name"
            type="text"
            required
            placeholder="Zahnarztpraxis am Rathausplatz"
          />
        </div>

        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="doc@praxis.de"
          />
        </div>

        <div>
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <p className="text-xs text-text-tertiary mt-1">
            Mindestens 8 Zeichen.
          </p>
        </div>

        <Button type="submit" className="w-full">
          Konto anlegen
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-secondary text-center">
        Schon ein Konto?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
```

---

## Schritt 7 — Proof-of-Concept Dashboard-Seite

Eine geschützte Route, um zu testen dass der Auth-Flow funktioniert.

### Datei: `app/(protected)/layout.tsx`

```typescript
import { requireUser } from "@/lib/auth-helpers";
import { signOut } from "../(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="border-b border-border bg-surface-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-serif text-xl font-light text-text-primary">
            SmileScan
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Abmelden
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### Datei: `app/(protected)/dashboard/page.tsx`

```typescript
import { getCurrentWorkspace, getCurrentUser } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl font-light text-text-primary mb-2">
        Willkommen
      </h1>
      <p className="text-text-secondary mb-8">
        Phase 3 funktioniert. Auth ist live.
      </p>

      <div className="bg-surface-card border border-border rounded-lg p-6 space-y-3">
        <div className="text-sm">
          <span className="text-text-tertiary">User ID: </span>
          <span className="font-mono text-xs text-text-primary">{user?.id}</span>
        </div>
        <div className="text-sm">
          <span className="text-text-tertiary">Email: </span>
          <span className="text-text-primary">{user?.email}</span>
        </div>
        {workspace && (
          <>
            <div className="text-sm">
              <span className="text-text-tertiary">Workspace: </span>
              <span className="text-text-primary">
                {/* @ts-expect-error - workspaces is joined */}
                {workspace.workspaces?.name || "unbekannt"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-text-tertiary">Rolle: </span>
              <span className="text-text-primary">{workspace.role}</span>
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-text-tertiary">
        Nächste Phase: App-Shell mit 5-Punkte-Navigation.
      </p>
    </div>
  );
}
```

---

## Schritt 8 — Auth-Callback-Route

Für zukünftige Erweiterungen (Magic Link, Password Reset).

### Datei: `app/auth/callback/route.ts`

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
```

---

## Schritt 9 — Proxy/Middleware erweitern für geschützte Routen

Der vorhandene `proxy.ts` wird erweitert, damit nicht-authentifizierte User auf geschützte Routen zu `/login` redirected werden.

### Datei `proxy.ts` (komplett ersetzen):

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routen, die einen Login erfordern
const PROTECTED_PATHS = ["/dashboard", "/inbox", "/profile", "/journal", "/settings", "/my-tasks"];

// Routen, die NICHT für eingeloggte User sichtbar sind (redirect zu dashboard)
const AUTH_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("https://")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Wenn nicht eingeloggt und auf geschützter Route → /login
    if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Wenn eingeloggt und auf Auth-Route → /dashboard
    if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("[proxy] Auth check failed:", error);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Schritt 10 — Homepage anpassen (Call to Action zu Login/Register)

### Datei `app/page.tsx` (ersetzen):

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-page text-text-primary flex items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <h1 className="font-serif text-6xl font-light tracking-tight mb-4">
          SmileScan
        </h1>
        <p className="text-text-secondary mb-8">
          Die diskrete Brücke zwischen Beobachtung und klinischer Versorgung.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login">
            <Button variant="secondary">Anmelden</Button>
          </Link>
          <Link href="/register">
            <Button>Konto anlegen</Button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-text-tertiary">
          In geschlossener Beta für Zahnärzte.
        </p>
      </div>
    </main>
  );
}
```

---

## Schritt 11 — Dev-Server testen

```bash
npm run dev
```

Warte auf `✓ Ready`.

Prüfe:
1. `http://localhost:3000` → sollte Homepage mit zwei Buttons zeigen
2. Klick auf "Anmelden" → `/login` Seite
3. Klick auf "Konto anlegen" → `/register` Seite
4. `http://localhost:3000/dashboard` manuell aufrufen → sollte zu `/login` redirecten (weil nicht eingeloggt)

Wenn das alles passt, ist der Code korrekt. **Echtes Testen kommt im manuellen Schritt nach dem Commit.**

---

## Schritt 12 — Commit

```bash
git add .
git commit -m "feat: phase 3 — auth flow with login, register, protected routes"
```

---

## Schritt 13 — STOP und Übergabe

Halte hier an und melde dem Menschen:

"Phase 3 — Auth-Flow ist im Code. Der Server sollte laufen. Bitte teste manuell:

1. Öffne http://localhost:3000/register
2. Erstelle ein Test-Konto (z.B. test@example.com, Passwort: test1234, Praxis: Test Praxis)
3. Nach dem Submit solltest du auf /dashboard landen
4. Du siehst deine User-ID, E-Mail, Workspace-Name und Rolle 'doctor'
5. Klick oben rechts auf 'Abmelden'
6. Versuche /dashboard nochmal aufzurufen — sollte zu /login redirecten
7. Melde dich mit dem Test-Konto wieder an

Falls irgendwas nicht funktioniert, sende Fehler-Screenshot."

---

## Bei Fehlern — typische Ursachen

### "Cannot find module '@/lib/utils'" oder ähnliches
Cursor hat vergessen, eine Datei anzulegen. In Cursor prüfen: existiert `lib/utils.ts`? Falls nein, neu anlegen.

### "Invalid login credentials"
Supabase hat möglicherweise Email Confirmation an. In Supabase: Authentication → Settings → "Confirm email" → AUS schalten für die Entwicklung.

### Trigger-Fehler beim Signup (RLS-Blockage)
Falls bei Signup ein Fehler kommt wie "new row violates RLS", dann hat der `handle_new_user` Trigger ein Problem. Das sollten wir dann per SQL debuggen.

### "Cookies can only be modified in a Server Action or Route Handler"
Das ist ein harmloser Warning, keine Error. Der Server läuft trotzdem.

---

*Ende Phase 3*
