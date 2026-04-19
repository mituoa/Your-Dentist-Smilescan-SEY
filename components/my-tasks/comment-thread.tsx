import type { TaskComment } from "@/lib/queries/task-detail";

interface CommentThreadProps {
  comments: TaskComment[];
  currentUserId: string;
}

export function CommentThread({ comments, currentUserId }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">Noch keine Kommentare.</p>
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
              className="flex items-start gap-3 py-2 px-3 bg-warning/10 border border-warning/20 rounded"
            >
              <div className="text-xs text-text-secondary italic">
                {c.content}
                <span className="ml-2 text-text-tertiary">
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
            <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-xs font-medium flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium">
                  {c.author_email || "Unbekannt"} {isCurrent && "(Sie)"}
                </span>
                <span className="text-xs text-text-tertiary">
                  {new Date(c.created_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                {c.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
