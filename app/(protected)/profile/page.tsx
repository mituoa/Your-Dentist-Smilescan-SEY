import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Edit3 } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const supabase = await createClient();
  const { data: ws } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();

  const publicUrl = ws?.slug ? `/doc/${ws.slug}` : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Profil
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight mb-4">
          Öffentliches Profil
        </h1>
        <p className="text-text-secondary max-w-xl">
          Verwalten Sie Ihre öffentliche Präsenz. Änderungen sind sofort live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/profile/editor"
          className="block bg-surface-card border border-border rounded-lg p-6 hover:border-brand/50 transition-colors"
        >
          <Edit3 className="w-5 h-5 text-brand mb-3" strokeWidth={1.75} />
          <h2 className="font-serif text-xl mb-1">Profil bearbeiten</h2>
          <p className="text-xs text-text-tertiary">
            Name, Vita, Leistungen, Praxis-Info
          </p>
        </Link>

        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            className="block bg-surface-card border border-border rounded-lg p-6 hover:border-brand/50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-brand mb-3" strokeWidth={1.75} />
            <h2 className="font-serif text-xl mb-1">Ansehen</h2>
            <p className="text-xs text-text-tertiary">smilescan.io{publicUrl}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
