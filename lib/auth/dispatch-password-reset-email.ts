import "server-only";

import { userFacingPasswordResetRequestError } from "@/lib/auth-user-facing-errors";
import { isSmtpConfigured } from "@/lib/env";
import { buildPasswordResetEmail } from "@/lib/mail/password-reset-email";
import { SmtpNotConfiguredError } from "@/lib/mail/mail-errors";
import { sendTransactionalMail } from "@/lib/mail/send-mail";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function hasSupabaseServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function isUnknownUserError(message: string): boolean {
  return /user not found|not registered|no user|user with this email not found/i.test(message);
}

/**
 * Passwort-Reset-Mail: mit SMTP + Service Role → Your-Dentist-Absender (`SMTP_FROM`);
 * sonst Fallback über Supabase Auth (`resetPasswordForEmail`).
 */
export async function dispatchPasswordResetEmail(params: {
  email: string;
  redirectTo: string;
}): Promise<{ error: string | null }> {
  const email = params.email.trim().toLowerCase();
  const { redirectTo } = params;

  if (isSmtpConfigured() && hasSupabaseServiceRole()) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });

      if (error) {
        if (isUnknownUserError(error.message)) {
          return { error: null };
        }
        console.error("[dispatchPasswordResetEmail] generateLink", error.message);
        return { error: userFacingPasswordResetRequestError(error.message) };
      }

      const resetUrl = data.properties?.action_link;
      if (!resetUrl) {
        console.error("[dispatchPasswordResetEmail] missing action_link");
        return { error: userFacingPasswordResetRequestError("missing action_link") };
      }

      const mail = buildPasswordResetEmail({ resetUrl, recipientEmail: email });
      await sendTransactionalMail({
        to: email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        mailContext: "password_reset",
      });

      return { error: null };
    } catch (e) {
      if (!(e instanceof SmtpNotConfiguredError)) {
        const raw = e instanceof Error ? e.message : String(e);
        console.error("[dispatchPasswordResetEmail] branded mail failed", raw);
        return { error: userFacingPasswordResetRequestError(raw) };
      }
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    console.error("[dispatchPasswordResetEmail] resetPasswordForEmail", error.message);
    return { error: userFacingPasswordResetRequestError(error.message) };
  }

  return { error: null };
}
