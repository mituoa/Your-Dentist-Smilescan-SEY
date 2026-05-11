import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ sent?: string; error?: string; invite?: string; email?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const errorRaw = params.error?.trim() || "";
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";

  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div className={`flex min-h-[100dvh] flex-col ${AUTH_NARROW_COLUMN_CLASS}`}>
        <div className="mb-7 flex shrink-0 justify-center sm:mb-8">
          <YourDentistBrandLockup size="md" centered priority />
        </div>

        <ForgotPasswordCard
          sent={sent}
          errorRaw={errorRaw}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
        />
      </div>
    </div>
  );
}
