import Link from "next/link";
import { StatBlock } from "./stat-block";

interface ActivityEvent {
  type: "submission_received" | "task_created" | "task_done";
  id: string;
  text: string;
  timestamp: string;
  link?: string;
}

interface RecentActivityBlockProps {
  events: ActivityEvent[];
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

const TYPE_COLORS: Record<ActivityEvent["type"], string> = {
  submission_received: "bg-brand",
  task_created: "bg-text-tertiary",
  task_done: "bg-text-tertiary/50",
};

export function RecentActivityBlock({ events }: RecentActivityBlockProps) {
  return (
    <StatBlock label="Letzte Aktivität">
      {events.length === 0 ? (
        <div className="flex items-center h-full">
          <p className="text-sm text-text-tertiary">Noch keine Aktivität.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const content = (
              <>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${TYPE_COLORS[event.type]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-snug truncate">
                    {event.text}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {formatRelativeTime(event.timestamp)}
                  </p>
                </div>
              </>
            );

            return (
              <li key={event.id} className="flex items-start gap-2.5">
                {event.link ? (
                  <Link
                    href={event.link}
                    className="flex items-start gap-2.5 w-full hover:bg-surface-sunken/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </StatBlock>
  );
}
