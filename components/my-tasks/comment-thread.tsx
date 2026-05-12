import type { TaskComment } from "@/lib/queries/task-detail";

/**
 * Kommentarliste — **Punkt 1:** sachlicher Verlauf; **Punkt 5 (Tot/Fake):** kein Activity-/Chat-Feed, keine
 * Live-Zeitachse — nur geladener Stand; s. `my-tasks/[id]/page.tsx`.
 *
 * **Punkt 7 (Empty):** Leerer Thread = **eine** ruhige Zeile, Begriff **Notizen** (kein „Verlauf“/Ticket-Log),
 * **kein** CTA, **keine** dashed Box oder Motivationscopy — s. `page.tsx` (Punkt 7).
 *
 * **Punkt 9 (Mobile):** `min-w-0`/`break-words` bei E-Mails und langen Inhalten — kein horizontales Scrollen im
 * Thread; s. `page.tsx` (Punkt 9).
 */

interface CommentThreadProps {
  comments: TaskComment[];
  currentUserId: string;
}

export function CommentThread({ comments, currentUserId }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm leading-6 text-[#94A3B8]">
        Noch keine Notizen hinterlegt.
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
              className="flex min-w-0 items-start gap-3 rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] px-3 py-2"
            >
              <div className="min-w-0 break-words text-sm leading-6 text-[#475569]">
                {c.content}
                <span className="ml-2 text-xs tabular-nums text-[#94A3B8]">
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
          <div key={c.id} className="flex min-w-0 items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(43,111,232,0.15)] bg-[#EEF6FF] text-xs font-medium text-[#1E40AF]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="break-words text-sm font-semibold leading-6 text-[#0F172A]">
                  {c.author_email || "Unbekannt"} {isCurrent && "(Sie)"}
                </span>
                <span className="text-xs tabular-nums text-[#94A3B8]">
                  {new Date(c.created_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#334155]">
                {c.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
