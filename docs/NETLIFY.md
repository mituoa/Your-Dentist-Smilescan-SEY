# Netlify + Supabase (SmileScan)

## Environment variables (Site → Site configuration → Environment variables)

Set **exact key names** (case-sensitive):

| Key | Source |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API / Connect → Project URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API Keys → **Publishable** (`sb_publishable_…`) **or** Legacy tab → **anon** (`eyJ…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → **Secret** (`sb_secret_…`) **or** Legacy → **service_role** (`eyJ…`) |
| `NEXT_PUBLIC_APP_URL` | Your live site, e.g. `https://<site>.netlify.app` (no trailing slash optional) |

Use **either** the new `sb_*` pair **or** the legacy `eyJ…` pair for anon + service_role — do not mix publishable with a mismatched secret.

After any change: **Deploys → Trigger deploy → Clear cache and deploy site**.

## Google OAuth (Supabase Auth)

1. Supabase → Authentication → Providers → **Google** enabled; Client ID/Secret from Google Cloud.
2. Supabase → Authentication → URL configuration → add redirect URL:  
   `https://<site>.netlify.app/auth/callback`
3. `NEXT_PUBLIC_APP_URL` must match that host so server actions build the same `redirectTo`.

## Stripe / mail webhooks

- Stripe webhook calls `getStripeServer()` — if `STRIPE_SECRET_KEY` is missing, the route returns **503** (does not crash the app).
- Mail webhook needs `MAIL_WEBHOOK_SIGNING_SECRET` and a valid Supabase admin env for DB updates.

## Runtime errors after login

If the homepage works but **after login** you see a Netlify error overlay:

1. Netlify → **Deploys** → latest → **Functions** / runtime logs.
2. Common causes: wrong/missing env vars; DB table missing (run `supabase/migrations` on your project); RLS blocking reads (check Supabase logs).
