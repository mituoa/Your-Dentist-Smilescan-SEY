import { Check, Sparkles } from "lucide-react";

import type { TrackerAssistItem } from "@/lib/inbox/build-tracker-workspace";
import { trackerDraftApprovalLabel } from "@/lib/inbox/tracker-presentational";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";

const FRIENDLY_PREP_LINES = [
  "Anliegen zusammengefasst",
  "Dringlichkeit bewertet",
  "Antwort vorbereitet",
  "Empfehlung erstellt",
] as const;

type TrackerKiPrepPanelProps = {
  concernSummary: string | null;
  draftExcerpt: string | null;
  nextStep: string | null;
  messageDraftStatus: MessageDraftListStatus;
  assistItems: TrackerAssistItem[];
};

function excerpt(text: string, max = 320): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function TrackerKiPrepPanel({
  concernSummary,
  draftExcerpt,
  nextStep,
  messageDraftStatus,
  assistItems,
}: TrackerKiPrepPanelProps) {
  const approval = trackerDraftApprovalLabel(messageDraftStatus);
  const assistDone = assistItems.length > 0 && assistItems.every((a) => a.done);

  return (
    <section className="yd-tracker-v5-ki" aria-labelledby="tracker-ki-title">
      <header className="yd-tracker-v5-ki__head">
        <span className="yd-tracker-v5-ki__icon" aria-hidden>
          <Sparkles className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div>
          <h2 id="tracker-ki-title" className="yd-tracker-v5-ki__title">
            KI Assistenz
          </h2>
          <p className="yd-tracker-v5-ki__status">{approval}</p>
        </div>
      </header>

      <ul className="yd-tracker-v5-ki__checks">
        {FRIENDLY_PREP_LINES.map((line, i) => {
          const done =
            i === 0
              ? Boolean(concernSummary) || assistDone
              : i === 1
                ? messageDraftStatus !== "none" || assistDone
                : i === 2
                  ? messageDraftStatus !== "none"
                  : Boolean(nextStep) || assistDone;
          return (
            <li key={line} className={done ? "yd-tracker-v5-ki__check--done" : undefined}>
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              {line}
            </li>
          );
        })}
      </ul>

      {concernSummary ? (
        <p className="yd-tracker-v5-ki__summary">{concernSummary}</p>
      ) : null}

      {draftExcerpt ? (
        <blockquote className="yd-tracker-v5-ki__draft">{excerpt(draftExcerpt)}</blockquote>
      ) : null}
    </section>
  );
}
