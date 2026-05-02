import Link from "next/link";

import { requestPasswordResetFromLogin } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ sent?: string; error?: string; invite?: string; email?: string }>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const error = params.error?.trim();
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8">
      <div
        className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(148, 163, 184, 0.7) 0%, rgba(59, 130, 246, 0.55) 100%)",
          filter: "blur(150px)",
          transform: "translate(-25%, -25%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(99, 102, 241, 0.45) 100%)",
          filter: "blur(150px)",
          transform: "translate(25%, 25%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[500px]">
        <div
          className="relative flex flex-col gap-6 rounded-[18px] border border-white/30 bg-white/80 p-8 backdrop-blur-xl"
          style={{
            boxShadow: "0px 24px 64px rgba(15, 23, 42, 0.12)",
          }}
        >
          <h2 className="text-center text-[22px] font-semibold text-[#111111]">
            Passwort zurücksetzen
          </h2>
          <p className="text-sm text-slate-600">
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen.
          </p>

      {sent && (
        <p className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen versendet.
        </p>
      )}
      {error && (
        <p className="rounded-[10px] bg-[#fff2f2] px-3 py-2 text-sm text-danger">
          {decodeURIComponent(error)}
        </p>
      )}

      <form action={requestPasswordResetFromLogin} className="space-y-4">
        {inviteToken ? (
          <input type="hidden" name="invite_token" value={inviteToken} />
        ) : null}
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="doc@praxis.de"
            defaultValue={prefilledEmail}
            className="h-[44px] rounded-[10px] border border-slate-200 bg-white/70 text-[14px] text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:ring-2 focus:ring-slate-700/20"
          />
        </div>
        <Button
          type="submit"
          className="h-[46px] w-full rounded-[10px] bg-slate-700 text-[15px] font-medium text-white shadow-[0px_8px_22px_rgba(51,65,85,0.25)] transition-all duration-200 hover:bg-slate-800"
        >
          Link senden
        </Button>
      </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
                  : "/login"
              }
              className="text-slate-700 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
            >
              Zurück zum Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
