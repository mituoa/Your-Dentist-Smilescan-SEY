import "server-only";

/**
 * Produktion: `true` = Nutzer ohne `workspaces.approved_at` werden von geschützten Routen auf
 * `/login?error=account_pending_approval` geleitet (Ausnahme: AUTH_RELAX_MODE, Admin-Allowlist).
 * Demo/MVP: `false` (Standard).
 */
export function requireWorkspaceApprovalBeforeApp(): boolean {
  const v = process.env.REQUIRE_WORKSPACE_APPROVAL_BEFORE_APP?.trim().toLowerCase();
  return v === "true" || v === "1";
}

/**
 * Produktion: `true` = nur bestätigte E-Mails (`email_confirmed_at`) dürfen geschützte Bereiche nutzen
 * (Ausnahme: AUTH_RELAX_MODE).
 * Demo: `false` (Standard).
 */
export function requireEmailConfirmationBeforeApp(): boolean {
  const v = process.env.REQUIRE_EMAIL_CONFIRMATION_BEFORE_APP?.trim().toLowerCase();
  return v === "true" || v === "1";
}
