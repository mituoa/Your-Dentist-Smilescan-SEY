"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppBaseUrl } from "@/lib/env";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { acceptInvitation } from "@/app/(protected)/settings/actions";
import {
  matchesEmergencyLogin,
  syncEmergencyUserToSupabase,
} from "@/lib/emergency-password-login";
import {
  isRegistrationDemoMode,
  shouldEnforceStripeCheckoutAtSignup,
} from "@/lib/registration-demo";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import { resolveAuthenticatedEntryPath } from "@/lib/post-auth-entry";
import { getStripePriceIdForInterval, getStripeServer } from "@/lib/stripe/server";

function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  if (v.startsWith("/accept-invite") || v.startsWith("/login")) return v;
  return null;
}

export async function signInWithGoogle(formData: FormData) {
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  const origin = getAppBaseUrl().replace(/\/$/, "");
  const nextPath = inviteToken
    ? `/accept-invite?token=${encodeURIComponent(inviteToken)}`
    : "/auth/continue";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    const p = new URLSearchParams();
    p.set(
      "error",
      userFacingAuthError(error?.message || "Google-Anmeldung ist gerade nicht möglich.")
    );
    if (inviteToken) p.set("invite", inviteToken);
    redirect(`/login?${p.toString()}`);
  }

  redirect(data.url);
}

export async function signInWithGitHub(formData: FormData) {
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  const origin = getAppBaseUrl().replace(/\/$/, "");
  const nextPath = inviteToken
    ? `/accept-invite?token=${encodeURIComponent(inviteToken)}`
    : "/auth/continue";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });

  if (error || !data.url) {
    const p = new URLSearchParams();
    p.set(
      "error",
      userFacingAuthError(error?.message || "GitHub-Anmeldung ist gerade nicht möglich.")
    );
    if (inviteToken) p.set("invite", inviteToken);
    redirect(`/login?${p.toString()}`);
  }

  redirect(data.url);
}

export async function signIn(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  const loginQuery = (errorMsg: string) => {
    const p = new URLSearchParams();
    p.set("error", errorMsg);
    if (inviteToken) p.set("invite", inviteToken);
    if (email) p.set("email", email);
    return `/login?${p.toString()}`;
  };

  if (!email || !password) {
    redirect(loginQuery("E-Mail und Passwort erforderlich."));
  }

  const supabase = await createClient();

  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error && matchesEmergencyLogin(email, password)) {
    const sync = await syncEmergencyUserToSupabase(email, password);
    if (!sync.ok) {
      console.error("[signIn] emergency sync", sync.message);
      redirect(loginQuery(userFacingAuthError(sync.message)));
    }
    ({ error } = await supabase.auth.signInWithPassword({
      email,
      password,
    }));
  }

  if (error) {
    console.error("[signIn]", error.message);
    redirect(loginQuery(userFacingAuthError(error.message)));
  }

  revalidatePath("/", "layout");
  if (inviteToken) {
    redirect(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
  }
  const nextPath = await resolveAuthenticatedEntryPath();
  redirect(nextPath);
}

export async function resendSignupConfirmation(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() || "";
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  const params = new URLSearchParams();
  if (inviteToken) params.set("invite", inviteToken);
  if (email) params.set("email", email);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    params.set("error", "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    redirect(`/login?${params.toString()}`);
  }

  const supabase = await createClient();
  const origin = getAppBaseUrl();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    },
  });

  // Enumeration-safe: never reveal whether the email exists.
  if (error) {
    console.error("[resendSignupConfirmation]", error);
  }

  params.set("resent", "1");
  redirect(`/login?${params.toString()}`);
}

/** After password reset (client): same routing as post-login when no explicit invite in URL. */
export async function getAuthenticatedEntryPath(): Promise<string> {
  return resolveAuthenticatedEntryPath();
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const workspaceName = formData.get("workspace_name") as string;
  const displayName = formData.get("display_name") as string;
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  const billingInterval = (formData.get("billing_interval") as string | null)?.trim();
  const contractVersion = (formData.get("contract_version") as string | null)?.trim() || "v1";
  const acceptedAtRaw = (formData.get("accepted_at") as string | null)?.trim();
  const acceptedTos = (formData.get("accepted_tos") as string | null) === "1";
  const acceptedPrivacy = (formData.get("accepted_privacy") as string | null) === "1";
  const acceptedWithdrawal = (formData.get("accepted_withdrawal") as string | null) === "1";
  const dentistLicenseNumber = (formData.get("dentist_license_number") as string | null)?.trim() || null;
  const dentistLicenseStoragePath =
    (formData.get("dentist_license_storage_path") as string | null)?.trim() || null;
  const dentistLicenseStoragePathFront =
    (formData.get("dentist_license_storage_path_front") as string | null)?.trim() || null;
  const dentistLicenseStoragePathBack =
    (formData.get("dentist_license_storage_path_back") as string | null)?.trim() || null;
  const paymentMethod = (formData.get("payment_method") as string | null)?.trim() || null;
  const registrationDemoSkip =
    (formData.get("registration_demo_skip") as string | null)?.trim() === "1";

  if (!email || !password) {
    redirect(
      `/register?error=${encodeURIComponent("E-Mail und Passwort erforderlich.")}`
    );
  }

  if (password.length < 8) {
    redirect(
      `/register?error=${encodeURIComponent("Passwort muss mindestens 8 Zeichen haben.")}`
    );
  }

  const supabase = await createClient();
  const origin = getAppBaseUrl();
  const userMetadata: Record<string, string | null> = {
    display_name: displayName || email,
    invite_token: inviteToken || null,
  };
  if (!inviteToken) {
    userMetadata.workspace_name = workspaceName || "Meine Praxis";
  }

  const { data: signData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userMetadata,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    },
  });

  if (error) {
    console.error("[signUp]", error.message);
    const inviteQ = inviteToken
      ? `&invite=${encodeURIComponent(inviteToken)}`
      : "";
    redirect(
      `/register?error=${encodeURIComponent(userFacingAuthError(error.message))}${inviteQ}`
    );
  }

  if (inviteToken) {
    const inviteResult = await acceptInvitation(inviteToken, {
      mode: "post_signup",
      registeredEmail: email,
      registeredUserId: signData.user?.id ?? null,
    });
    if (!inviteResult.ok) {
      redirect(
        `/dashboard?invite_notice=${encodeURIComponent(inviteResult.error)}`
      );
    }
  }

  // Optional: Vertrag/Plan-Daten speichern (Service Role), damit es auch ohne Session klappt.
  const userId = signData.user?.id || null;
  if (userId && billingInterval) {
    const allowed = new Set(["monthly", "halfyearly", "yearly"]);
    if (!allowed.has(billingInterval)) {
      redirect(`/register?error=${encodeURIComponent("Ungültiges Zahlungsintervall.")}`);
    }
    if (!acceptedTos || !acceptedPrivacy || !acceptedWithdrawal) {
      redirect(`/register?error=${encodeURIComponent("Bitte alle Pflichtfelder im Vertrag bestätigen.")}`);
    }

    const acceptedAt = acceptedAtRaw ? new Date(acceptedAtRaw) : new Date();
    if (Number.isNaN(acceptedAt.getTime())) {
      redirect(`/register?error=${encodeURIComponent("Ungültiges Vertragsdatum.")}`);
    }

    const admin = createAdminClient();
    const { data: membership, error: memberErr } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (memberErr || !membership?.workspace_id) {
      console.error("[signUp] workspace lookup failed", memberErr);
    } else {
      // Ensure billing row exists (pending)
      await admin.from("workspace_billing").upsert(
        {
          workspace_id: membership.workspace_id,
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" }
      );

      const { error: contractErr } = await admin.from("workspace_contracts").upsert(
        {
          workspace_id: membership.workspace_id,
          user_id: userId,
          billing_interval: billingInterval,
          contract_version: contractVersion,
          accepted_at: acceptedAt.toISOString(),
          accepted_tos: acceptedTos,
          accepted_privacy: acceptedPrivacy,
          accepted_withdrawal: acceptedWithdrawal,
          dentist_license_number: dentistLicenseNumber,
          dentist_license_storage_path: dentistLicenseStoragePath,
          dentist_license_storage_path_front: dentistLicenseStoragePathFront,
          dentist_license_storage_path_back: dentistLicenseStoragePathBack,
          payment_method: paymentMethod,
        },
        { onConflict: "workspace_id" }
      );
      if (contractErr) {
        console.error("[signUp] contract save failed", contractErr);
      }

      // Start Stripe checkout for supported payment methods (optional)
      const interval = billingInterval as "monthly" | "halfyearly" | "yearly";
      const pm = paymentMethod || "sepa_debit";

      // Stripe Checkout nur wenn ENABLE_STRIPE_CHECKOUT_AT_SIGNUP + vollständige Stripe-Konfiguration (s. lib/registration-demo.ts).
      const skipStripeCheckout =
        !shouldEnforceStripeCheckoutAtSignup() ||
        (registrationDemoSkip && isRegistrationDemoMode());

      if (pm === "invoice") {
        // invoice flow handled manually later
      } else if (skipStripeCheckout) {
        // Registrierung ohne Checkout (Standard bis Stripe aktiv geschaltet ist).
      } else {
        try {
          const stripe = getStripeServer();
          const priceId = getStripePriceIdForInterval(interval);

          const paymentMethodTypes: Array<"card" | "sepa_debit" | "paypal"> = [];
          if (pm === "card") paymentMethodTypes.push("card");
          if (pm === "sepa_debit") paymentMethodTypes.push("sepa_debit");
          if (pm === "paypal") {
            paymentMethodTypes.push("card", "paypal");
          }
          if (paymentMethodTypes.length === 0) paymentMethodTypes.push("card");

          const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            payment_method_types: paymentMethodTypes,
            allow_promotion_codes: true,
            subscription_data: {
              trial_period_days: 14,
              metadata: {
                workspace_id: membership.workspace_id,
                user_id: userId,
              },
            },
            metadata: {
              workspace_id: membership.workspace_id,
              user_id: userId,
              billing_interval: interval,
              payment_method: pm,
            },
            success_url: `${origin}/register?success=1&email=${encodeURIComponent(email)}&checkout=success`,
            cancel_url: `${origin}/register?error=${encodeURIComponent("checkout_cancelled")}&email=${encodeURIComponent(email)}`,
          });

          await admin.from("workspace_billing").upsert(
            {
              workspace_id: membership.workspace_id,
              status: "pending",
              stripe_checkout_session_id: session.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "workspace_id" }
          );

          if (session.url) {
            redirect(session.url);
          }
        } catch (stripeErr) {
          const raw = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
          console.error("[signUp] Stripe checkout", raw);
          const inviteQ = inviteToken ? `&invite=${encodeURIComponent(inviteToken)}` : "";
          redirect(
            `/register?error=${encodeURIComponent(userFacingAuthError(raw))}&email=${encodeURIComponent(email)}${inviteQ}`
          );
        }
      }
    }
  }

  revalidatePath("/", "layout");
  if (signData.session) {
    redirect("/dashboard");
  }
  redirect(`/register?success=1&email=${encodeURIComponent(email)}`);
}

export async function signOut(formData?: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  const raw = formData?.get("return_to");
  const to = sanitizeReturnTo(typeof raw === "string" ? raw : null);
  // Always land on plain login after logout (top of page, no pricing hash). Accept-invite may opt back into its flow.
  if (to && to.startsWith("/accept-invite")) {
    redirect(to);
  }
  redirect("/login?signed_out=1");
}

export async function requestPasswordResetFromLogin(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() || "";
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const params = new URLSearchParams();
    params.set("error", "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    if (inviteToken) params.set("invite", inviteToken);
    if (email) params.set("email", email);
    redirect(
      `/forgot-password?${params.toString()}`
    );
  }

  const supabase = await createClient();
  const resetUrl = inviteToken
    ? `${getAppBaseUrl()}/reset-password?invite=${encodeURIComponent(inviteToken)}`
    : `${getAppBaseUrl()}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    console.error("[requestPasswordResetFromLogin]", error);
  }

  const params = new URLSearchParams();
  params.set("sent", "1");
  if (inviteToken) params.set("invite", inviteToken);
  params.set("email", email);
  redirect(`/forgot-password?${params.toString()}`);
}
