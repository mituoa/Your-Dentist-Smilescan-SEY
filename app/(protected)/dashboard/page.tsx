import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Dashboard · Phase 5
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
          Willkommen
        </h1>
        <p className="text-text-secondary max-w-xl">
          Hier entstehen drei ruhige Info-Blöcke: neue Einsendungen, offene
          Aufgaben, letzte Aktivität. Kommt in der nächsten Phase.
        </p>
      </div>

      <div className="bg-surface-card border border-border rounded-lg p-6 space-y-3">
        <h2 className="text-sm font-medium text-text-primary mb-4">
          Session aktiv
        </h2>
        <div className="text-sm space-y-2">
          <div>
            <span className="text-text-tertiary">Email: </span>
            <span className="text-text-primary">{user?.email}</span>
          </div>
          {workspace && (
            <>
              <div>
                <span className="text-text-tertiary">Workspace: </span>
                <span className="text-text-primary">
                  {/* @ts-expect-error - workspaces is joined */}
                  {workspace.workspaces?.name}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary">Rolle: </span>
                <span className="text-text-primary">
                  {workspace.role === "doctor" ? "Arzt" : "Team-Mitglied"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
