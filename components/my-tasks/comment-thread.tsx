import type { TaskComment } from "@/lib/queries/task-detail";

interface CommentThreadProps {
  comments: TaskComment[];
  currentUserId: string;
}

export function CommentThread({ comments, currentUserId }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm italic leading-6 text-text-tertiary">
        Noch keine Kommentare.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {comments.map((c) => {
        const isCurrent = c.author_id === currentUserId;
        const initial = (c.author_email || "?")[0].toUpperCase();

        if (c.is_system) {
          return (
            <div
              key={c.id}
              className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2"
            >
              <div className="text-sm italic leading-6 text-text-secondary">
                {c.content}
                <span className="ml-2 text-xs not-italic tabular-nums text-text-tertiary">
                  ·{" "}
                  {new Date(c.created_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div key={c.id} className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface-sunken text-xs font-medium text-text-secondary">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold leading-6 text-text-primary">
                  {c.author_email || "Unbekannt"} {isCurrent && "(Sie)"}
                </span>
                <span className="text-xs tabular-nums text-text-tertiary">
                  {new Date(c.created_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-text-primary">
                {c.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
