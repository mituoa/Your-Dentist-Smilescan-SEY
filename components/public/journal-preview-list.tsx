import Link from "next/link";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";
import type { JournalEntry } from "@/lib/types/journal-entry";

interface JournalPreviewListProps {
  entries: JournalEntry[];
  slug: string;
}

export function JournalPreviewList({ entries, slug }: JournalPreviewListProps) {
  const withSlug = entries.filter((e) => e.slug);
  if (withSlug.length === 0) return null;

  return (
    <section className="py-20 md:py-36 border-t border-ink/[0.06]">
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20 mb-12">
        <div className="text-[10px] tracking-[0.35em] uppercase text-ink-faint pt-3">IV · Journal</div>
        <h2 className="font-serif font-extralight text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em]">
          Aus dem <span className="italic">Journal</span>.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20">
        <div />
        <div className="max-w-[620px]">
          {withSlug.slice(0, 3).map((entry, i) => {
            const topic = getTopicLabel(entry.topic);
            return (
              <Link
                key={entry.id}
                href={`/doc/${slug}/journal/${entry.slug}`}
                className={`block group py-7 ${i < Math.min(withSlug.length, 3) - 1 ? "border-b border-ink/[0.06]" : ""}`}
              >
                {topic && (
                  <div className="text-[9px] uppercase tracking-[0.3em] text-ink-faint mb-2.5">
                    {topic}
                  </div>
                )}
                <h3 className="font-serif text-[1.4rem] font-light tracking-tight mb-2 group-hover:text-ink-soft transition-colors">
                  {entry.title}
                </h3>
                {entry.excerpt && (
                  <p className="font-serif italic text-ink-soft text-[15px] leading-relaxed line-clamp-2">
                    {entry.excerpt}
                  </p>
                )}
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink-faint mt-3">
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
              className="inline-block text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:text-ink pt-6 mt-2"
            >
              Alle Artikel ansehen →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
