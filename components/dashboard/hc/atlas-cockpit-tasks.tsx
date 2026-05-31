import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { TaskPreviewRow } from "@/lib/dashboard/command-center";

type AtlasCockpitTasksProps = {
  tasks: TaskPreviewRow[];
};

export function AtlasCockpitTasks({ tasks }: AtlasCockpitTasksProps) {
  return (
    <section className="yd-cockpit-tasks" aria-labelledby="yd-cockpit-tasks-title">
      <div className="yd-patient-cases-head">
        <h2 id="yd-cockpit-tasks-title" className="yd-cockpit-section-title">
          {COCKPIT_SECTIONS.tasks}
        </h2>
        <Link href="/my-tasks" className="yd-cockpit-link">
          Alle
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="yd-cockpit-quiet">Keine offenen Aufgaben</p>
      ) : (
        <ul className="yd-relay-activity-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={task.href} className="yd-relay-activity-row">
                <span className="yd-relay-activity-label">{task.title}</span>
                <span className="yd-relay-activity-meta">Offen</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
