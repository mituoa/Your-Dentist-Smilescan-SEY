import Link from "next/link";
import { getPublicDocProfileOrRedirect } from "@/lib/doc/resolve-public-doc-profile";
import { listPublishedForWorkspace } from "@/lib/queries/journal";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";

interface JournalIndexProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicJournalIndex({ params }: JournalIndexProps) {
  const { slug: urlSlug } = await params;
  const profile = await getPublicDocProfileOrRedirect(urlSlug, "/journal");

  const articles = await listPublishedForWorkspace(profile.workspace_id);
  const name = profile.display_name || profile.workspace_name;
  const canonicalSlug = profile.slug;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href={`/doc/${canonicalSlug}`}
          className="text-xs uppercase tracking-wider text-ink-faint hover:text-ink"
        >
          ← Zurück zu {name}
        </Link>

        <header className="mt-16 mb-20 pb-10 border-b-2 border-ink text-center">
          <div className="text-[10px] uppercase tracking-[0.48em] mb-3">Journal</div>
          <p className="text-sm text-ink-soft italic">Artikel von {name}</p>
        </header>

        {articles.length === 0 ? (
          <p className="text-center text-ink-soft italic">Noch keine veröffentlichten Artikel.</p>
        ) : (
          <div className="space-y-16">
            {articles.map((a) => {
              if (!a.slug) return null;
              const topic = getTopicLabel(a.topic);
              return (
                <article key={a.id}>
                  <Link
                    href={`/doc/${canonicalSlug}/journal/${a.slug}`}
                    className="block group"
                  >
                    {topic && (
                      <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint mb-4">
                        {topic}
                      </div>
                    )}
                    <h2 className="font-serif text-4xl md:text-5xl font-light tracking-tight leading-tight mb-4 group-hover:text-ink-soft transition-colors">
                      {a.title}
                    </h2>
                    {a.excerpt && (
                      <p className="font-serif text-xl italic text-ink-soft leading-relaxed mb-4 max-w-[60ch]">
                        {a.excerpt}
                      </p>
                    )}
                    <div className="text-xs text-ink-faint uppercase tracking-wider flex gap-4">
                      <span>
                        {a.published_at &&
                          new Date(a.published_at).toLocaleDateString("de-DE", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                      </span>
                      {a.reading_time_minutes != null && (
                        <span>{a.reading_time_minutes} min Lesezeit</span>
                      )}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
