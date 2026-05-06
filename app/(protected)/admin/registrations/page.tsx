import Link from "next/link";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth-helpers";
import { getAdminEmailsAllowlist } from "@/lib/env";

import { approveWorkspace, openSignedLicenseUrl } from "./actions";

function isAllowedAdminEmail(email: string | null | undefined) {
  const allow = getAdminEmailsAllowlist();
  if (allow.length === 0) return true; // dev default: allow if unset
  const e = (email || "").trim().toLowerCase();
  return Boolean(e && allow.includes(e));
}

export default async function AdminRegistrationsPage() {
  const user = await requireUser();
  if (!isAllowedAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("workspace_members")
    .select(
      "workspace_id, user_id, created_at, role, workspaces(id, name, slug, created_at, approved_at, approved_by), workspace_contracts(billing_interval, payment_method, accepted_at, dentist_license_number, dentist_license_storage_path, dentist_license_storage_path_front, dentist_license_storage_path_back)"
    )
    .eq("role", "doctor")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/registrations]", error);
  }

  const rows =
    data?.filter((r: any) => !r?.workspaces?.approved_at) ?? [];

  return (
    <main className="min-h-screen bg-surface-page px-6 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Registrierungen</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Pending Zahnarzt-Accounts zur Freischaltung.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-[#0284C7] hover:underline">
            Zurück zum Dashboard
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-secondary">
            Keine offenen Registrierungen.
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((r: any) => (
              <div key={r.workspace_id} className="rounded-2xl border border-border bg-white p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{r.workspaces?.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Workspace: <span className="font-mono">{r.workspaces?.id}</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Registriert am:{" "}
                      <span className="font-medium text-gray-700">
                        {new Date(r.workspaces?.created_at || r.created_at).toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <form
                    action={async () => {
                      "use server";
                      await approveWorkspace(r.workspaces?.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="h-10 rounded-xl px-4 text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)" }}
                    >
                      Freischalten
                    </button>
                  </form>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Zahlungsintervall
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {r.workspace_contracts?.billing_interval ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Zahlungsmethode:{" "}
                      <span className="font-medium text-gray-700">
                        {r.workspace_contracts?.payment_method ?? "—"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Akzeptiert am:{" "}
                      {r.workspace_contracts?.accepted_at
                        ? new Date(r.workspace_contracts.accepted_at).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Zahnarzt-ID
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {r.workspace_contracts?.dentist_license_number ?? "—"}
                    </p>
                    <div className="mt-2 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Ausweis
                      </p>
                      {r.workspace_contracts?.dentist_license_storage_path_front ? (
                        <form
                          action={async () => {
                            "use server";
                            await openSignedLicenseUrl(r.workspace_contracts.dentist_license_storage_path_front);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-semibold text-[#0284C7] hover:underline"
                          >
                            Vorderseite ansehen
                          </button>
                        </form>
                      ) : null}
                      {r.workspace_contracts?.dentist_license_storage_path_back ? (
                        <form
                          action={async () => {
                            "use server";
                            await openSignedLicenseUrl(r.workspace_contracts.dentist_license_storage_path_back);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-semibold text-[#0284C7] hover:underline"
                          >
                            Rückseite ansehen
                          </button>
                        </form>
                      ) : null}
                      {!r.workspace_contracts?.dentist_license_storage_path_front &&
                      !r.workspace_contracts?.dentist_license_storage_path_back ? (
                        <p className="break-all text-xs text-gray-500">
                          {r.workspace_contracts?.dentist_license_storage_path ?? "—"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">Pending</p>
                    <p className="mt-0.5 text-xs text-gray-500">Nach Freischaltung: Login möglich</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

