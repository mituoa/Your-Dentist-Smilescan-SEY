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
    <section className="yd-carree-profile__journal" aria-labelledby="carree-journal">
      <p className="yd-carree-profile__section-label">Journal</p>
      <h2 id="carree-journal" className="yd-carree-profile__section-title">
        Aus dem <em>Journal</em>.
      </h2>
      <div className="max-w-[40rem]">
        {withSlug.slice(0, 3).map((entry) => {
          const topic = getTopicLabel(entry.topic);
          return (
            <Link
              key={entry.id}
              href={`/doc/${slug}/journal/${entry.slug}`}
              className="yd-carree-profile__journal-entry"
            >
              {topic ? <p className="yd-carree-profile__journal-topic">{topic}</p> : null}
              <h3 className="yd-carree-profile__journal-title">{entry.title}</h3>
              {entry.excerpt ? (
                <p className="yd-carree-profile__journal-excerpt">{entry.excerpt}</p>
              ) : null}
              <p className="yd-carree-profile__journal-meta">
                {entry.published_at &&
                  new Date(entry.published_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                {entry.reading_time_minutes != null && ` · ${entry.reading_time_minutes} min`}
              </p>
            </Link>
          );
        })}

        {withSlug.length > 3 ? (
          <Link
            href={`/doc/${slug}/journal`}
            className="yd-carree-hero__cta-link mt-6 inline-block"
          >
            Alle Artikel
          </Link>
        ) : null}
      </div>
    </section>
  );
}
