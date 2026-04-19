import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPublicProfileBySlug } from "@/lib/queries/public-profile";
import { getPublicJournalBySlug, getRelatedEntries } from "@/lib/queries/journal";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";
import { ShareButtons } from "@/components/journal/share-buttons";
import { getAppBaseUrl } from "@/lib/env";

interface ArticlePageProps {
  params: Promise<{ slug: string; articleSlug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug, articleSlug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) return {};
  const article = await getPublicJournalBySlug(profile.workspace_id, articleSlug);
  if (!article) return {};

  return {
    title: `${article.title} · ${profile.display_name || profile.workspace_name}`,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title || undefined,
      description: article.excerpt || undefined,
      images: article.cover_photo_url ? [{ url: article.cover_photo_url }] : [],
      type: "article",
      publishedTime: article.published_at || undefined,
      authors: [profile.display_name || profile.workspace_name],
    },
  };
}

export default async function PublicArticlePage({ params }: ArticlePageProps) {
  const { slug, articleSlug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) notFound();

  const article = await getPublicJournalBySlug(profile.workspace_id, articleSlug);
  if (!article || !article.content_markdown) notFound();

  const related = await getRelatedEntries(profile.workspace_id, article.id, 3);
  const name = profile.display_name || profile.workspace_name;
  const topic = getTopicLabel(article.topic);
  const contentHtml = marked.parse(article.content_markdown, {
    async: false,
  }) as string;
  const url = `${getAppBaseUrl()}/doc/${slug}/journal/${articleSlug}`;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[680px] mx-auto px-6 py-12 md:py-20">
        <Link
          href={`/doc/${slug}`}
          className="text-xs uppercase tracking-wider text-ink-faint hover:text-ink"
        >
          ← Zurück zu {name}
        </Link>

        <header className="mt-16 mb-12">
          {topic && (
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint mb-6 font-sans">
              {topic}
            </div>
          )}
          <h1 className="font-serif text-5xl md:text-6xl font-light leading-[1.05] tracking-tight mb-8">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="font-serif text-2xl italic text-ink-soft leading-relaxed mb-10">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-ink-faint font-sans border-t border-border pt-6">
            <span>{name}</span>
            {article.published_at && (
              <>
                <span>·</span>
                <span>
                  {new Date(article.published_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
            {article.reading_time_minutes != null && (
              <>
                <span>·</span>
                <span>{article.reading_time_minutes} min</span>
              </>
            )}
          </div>
        </header>

        {article.cover_photo_url && (
          <div className="mb-16 -mx-6 md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_photo_url}
              alt=""
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        <article className="prose-article">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>

        <div className="mt-20 pt-8 border-t border-border">
          <div className="text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-4 font-sans">
            Teilen
          </div>
          <ShareButtons url={url} title={article.title || ""} />
        </div>

        {related.length > 0 && (
          <aside className="mt-20 pt-12 border-t-2 border-ink">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint mb-8 font-sans text-center">
              Weitere Artikel
            </div>
            <div className="space-y-10">
              {related.map((r) => {
                const relTopic = getTopicLabel(r.topic);
                if (!r.slug) return null;
                return (
                  <Link
                    key={r.id}
                    href={`/doc/${slug}/journal/${r.slug}`}
                    className="block group"
                  >
                    {relTopic && (
                      <div className="text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-2 font-sans">
                        {relTopic}
                      </div>
                    )}
                    <h3 className="font-serif text-2xl font-light tracking-tight group-hover:text-ink-soft transition-colors">
                      {r.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      <style>{`
        .prose-article { font-family: Fraunces, serif; color: #1A1A1A; }
        .prose-article h2 { font-size: 2.25rem; font-weight: 300; margin: 3rem 0 1rem; letter-spacing: -0.02em; line-height: 1.1; }
        .prose-article h3 { font-size: 1.75rem; font-weight: 300; margin: 2.5rem 0 0.75rem; }
        .prose-article p { font-size: 1.25rem; line-height: 1.7; margin-bottom: 1.75rem; }
        .prose-article p:first-of-type::first-letter {
          font-size: 5rem; line-height: 0.9; float: left;
          padding-right: 0.75rem; padding-top: 0.5rem; font-weight: 300;
        }
        .prose-article blockquote {
          border-left: 2px solid #97958C;
          padding-left: 1.5rem; font-style: italic;
          color: #5F5E5A; margin: 2rem 0;
        }
        .prose-article a {
          color: #1A1A1A; border-bottom: 1px solid #D4D1C7;
          text-decoration: none;
        }
        .prose-article a:hover { border-bottom-color: #1A1A1A; }
        .prose-article ul, .prose-article ol { padding-left: 1.5rem; margin-bottom: 1.75rem; }
        .prose-article li { font-size: 1.25rem; line-height: 1.7; margin-bottom: 0.5rem; }
        .prose-article img { width: 100%; margin: 2rem 0; }
        .prose-article strong { font-weight: 500; }
      `}</style>
    </div>
  );
}
