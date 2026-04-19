import Link from "next/link";

interface JournalEntry {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
}

interface ProfileJournalPreviewsProps {
  entries: JournalEntry[];
}

export function ProfileJournalPreviews({ entries }: ProfileJournalPreviewsProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Journal
        </h2>
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/journal/${entry.slug}`}
                className="block hover:text-brand transition-colors"
              >
                <h3 className="text-lg text-text-primary">{entry.title}</h3>
                {entry.published_at && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(entry.published_at).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
