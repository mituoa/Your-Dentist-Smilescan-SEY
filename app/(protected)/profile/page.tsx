import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: ws } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();

  const publicUrl = ws ? `/doc/${ws.slug}` : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Profil · Phase 8 (Editor kommt)
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Öffentliches Profil
      </h1>
      <p className="text-text-secondary max-w-xl mb-8">
        Der Editor für Vita, Dienstleistungen und Praxis-Informationen wird in
        Phase 8 hinzugefügt. Aktuell kannst du deine öffentliche Seite bereits
        sehen.
      </p>

      {publicUrl && (
        <div className="bg-surface-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-medium text-text-primary mb-3">
            Deine öffentliche Profil-URL
          </h2>
          <div className="flex items-center gap-3">
            <code className="text-sm text-text-secondary font-mono flex-1 truncate">
              smilescan.io{publicUrl}
            </code>
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-glow transition-colors"
            >
              Ansehen
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>
          <p className="text-xs text-text-tertiary mt-3">
            Diese URL teilst du mit Patienten, um Unterlagen einzureichen.
          </p>
        </div>
      )}
    </div>
  );
}
