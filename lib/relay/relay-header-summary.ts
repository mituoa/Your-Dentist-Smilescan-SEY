import type { RelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayHeaderSummary = {
  lead: string;
  breakdown: string;
};

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many.replace("{n}", String(count));
}

/** Arbeitsübersicht für den integrierten Relay-Header (wie Tracker). */
export function buildRelayHeaderSummary(
  snapshot: Pick<
    RelayPracticeSnapshot,
    "attention" | "teamwork" | "handovers" | "practiceTasks" | "hasAnyWork"
  >
): RelayHeaderSummary {
  const attentionCount = snapshot.attention.length;
  const teamworkCount = snapshot.teamwork.length;
  const messageCount = snapshot.handovers.length;
  const practiceCount = snapshot.practiceTasks.length;

  if (!snapshot.hasAnyWork) {
    return {
      lead: "Heute liegen keine offenen Praxisvorgänge vor.",
      breakdown:
        "Freigaben, Teamaufgaben und interne Nachrichten erscheinen hier, sobald sie anstehen.",
    };
  }

  const leadParts: string[] = [];

  if (attentionCount > 0) {
    const hasJournal = snapshot.attention.some((r) => r.kind === "journal");
    const taskCount = attentionCount - (hasJournal ? 1 : 0);
    if (taskCount > 0 && hasJournal) {
      leadParts.push(
        plural(
          taskCount,
          "1 Aufgabe wartet auf Freigabe",
          "{n} Aufgaben warten auf Freigabe"
        )
      );
    } else if (attentionCount > 0) {
      leadParts.push(
        plural(
          attentionCount,
          "1 Vorgang wartet auf Freigabe",
          "{n} Vorgänge warten auf Freigabe"
        )
      );
    }
  } else if (teamworkCount > 0) {
    leadParts.push(
      plural(
        teamworkCount,
        "1 Teamrückmeldung steht aus",
        "{n} Teamrückmeldungen stehen aus"
      )
    );
  } else if (messageCount > 0) {
    leadParts.push(
      plural(
        messageCount,
        "1 interne Nachricht wartet",
        "{n} interne Nachrichten warten"
      )
    );
  } else if (practiceCount > 0) {
    leadParts.push(
      plural(
        practiceCount,
        "1 Praxisaufgabe ist offen",
        "{n} Praxisaufgaben sind offen"
      )
    );
  }

  const lead = leadParts[0] ? `${leadParts[0]}.` : "Offene Praxisvorgänge.";

  const breakdownParts: string[] = [];

  if (attentionCount > 0 && teamworkCount > 0) {
    breakdownParts.push(
      plural(
        teamworkCount,
        "1 Teamrückmeldung steht aus",
        "{n} Teamrückmeldungen stehen aus"
      )
    );
  }

  if (messageCount > 0 && attentionCount + teamworkCount > 0) {
    const unread = snapshot.handovers.filter((r) => r.isCritical).length;
    if (unread > 0) {
      breakdownParts.push(
        plural(unread, "1 ungelesene Nachricht", "{n} ungelesene Nachrichten")
      );
    } else {
      breakdownParts.push(
        plural(
          messageCount,
          "1 interne Nachricht",
          "{n} interne Nachrichten"
        )
      );
    }
  }

  if (practiceCount > 0 && attentionCount === 0 && teamworkCount === 0) {
    breakdownParts.push(
      plural(
        practiceCount,
        "1 Praxisaufgabe offen",
        "{n} Praxisaufgaben offen"
      )
    );
  }

  return {
    lead,
    breakdown:
      breakdownParts.length > 0
        ? `${breakdownParts.map((p) => (p.endsWith(".") ? p : `${p}.`)).join(" ")}`
        : "",
  };
}
