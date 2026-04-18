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
