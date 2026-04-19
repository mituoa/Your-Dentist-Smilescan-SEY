import Link from "next/link";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";
import type { JournalEntry } from "@/lib/queries/journal";

interface JournalPreviewListProps {
  entries: JournalEntry[];
  slug: string;
}

export function JournalPreviewList({ entries, slug }: JournalPreviewListProps) {
  const withSlug = entries.filter((e) => e.slug);
  if (withSlug.length === 0) return null;

  return (
    <section className="py-20 md:py-32 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">IV · Journal</div>
        <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
          Aus dem <span className="italic">Journal</span>.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
        <div />
        <div className="max-w-[640px] space-y-10">
          {withSlug.slice(0, 3).map((entry) => {
            const topic = getTopicLabel(entry.topic);
            return (
              <Link
                key={entry.id}
                href={`/doc/${slug}/journal/${entry.slug}`}
                className="block group"
              >
                {topic && (
                  <div className="text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-2">
                    {topic}
                  </div>
                )}
                <h3 className="font-serif text-2xl font-light tracking-tight mb-2 group-hover:text-ink-soft transition-colors">
                  {entry.title}
                </h3>
                {entry.excerpt && (
                  <p className="font-serif italic text-ink-soft leading-relaxed line-clamp-2">
                    {entry.excerpt}
                  </p>
                )}
                <div className="text-[11px] uppercase tracking-wider text-ink-faint mt-3">
                  {entry.published_at &&
                    new Date(entry.published_at).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  {entry.reading_time_minutes != null &&
                    ` · ${entry.reading_time_minutes} min`}
                </div>
              </Link>
            );
          })}

          {withSlug.length > 3 && (
            <Link
              href={`/doc/${slug}/journal`}
              className="inline-block text-xs uppercase tracking-[0.2em] text-ink-soft hover:text-ink pt-2 border-t border-border"
            >
              Alle Artikel ansehen →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
