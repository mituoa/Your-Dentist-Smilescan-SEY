export interface JournalEntry {
  id: string;
  workspace_id: string;
  author_id: string | null;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content_markdown: string | null;
  cover_photo_url: string | null;
  topic: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  word_count: number;
  reading_time_minutes: number | null;
}
