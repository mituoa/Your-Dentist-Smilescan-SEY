import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { NewTaskModalTrigger } from "@/components/my-tasks/new-task-modal";
import { openTasksHintLabel } from "@/lib/inbox/tracker-inbox-logic";

type TrackerWorkspaceTasksProps = {
  openTaskCount: number;
};

export function TrackerWorkspaceTasks({ openTaskCount }: TrackerWorkspaceTasksProps) {
  const hint = openTasksHintLabel(openTaskCount);

  return (
    <section className="yd-tracker-v7-section yd-tracker-v7-tasks" aria-labelledby="tracker-team-title">
      <h2 id="tracker-team-title" className="yd-tracker-v7-section__title">
        Aufgaben
      </h2>
      <div className="yd-tracker-team__card">
        <div className="yd-tracker-team__main">
          <span className="yd-tracker-team__icon" aria-hidden>
            <ClipboardList className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <div>
            <p className="yd-tracker-team__status">{hint ?? "Keine offenen Aufgaben"}</p>
            <p className="yd-tracker-team__meta">Zuständigkeit und Fälligkeit in Relay</p>
          </div>
        </div>
        <div className="yd-tracker-team__actions">
          <NewTaskModalTrigger
            className="yd-tracker-team__btn yd-tracker-team__btn--quiet"
            label="Aufgabe"
            showIcon
          />
          <Link href="/relay" className="yd-tracker-team__btn yd-tracker-team__btn--primary">
            Relay
          </Link>
        </div>
      </div>
    </section>
  );
}
