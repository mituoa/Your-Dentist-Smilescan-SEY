import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { RelayActivityLine } from "@/lib/dashboard/command-center";

type AtlasRelayActivityProps = {
  lines: RelayActivityLine[];
};

export function AtlasRelayActivity({ lines }: AtlasRelayActivityProps) {
  return (
    <section className="yd-relay-activity" aria-labelledby="yd-relay-activity-title">
      <div className="yd-relay-activity-head">
        <h2 id="yd-relay-activity-title" className="yd-cockpit-section-title">
          Relay
        </h2>
        <Link href="/relay" className="yd-cockpit-link">
          Öffnen
        </Link>
      </div>
      {lines.length === 0 ? (
        <p className="yd-cockpit-quiet">Keine offenen Übergaben</p>
      ) : (
        <ul className="yd-relay-activity-list">
          {lines.map((line) => (
            <li key={line.id}>
              <Link href={line.href} className="yd-relay-activity-row">
                <span className="yd-relay-activity-label">{line.label}</span>
                <span className="yd-relay-activity-meta">{line.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
