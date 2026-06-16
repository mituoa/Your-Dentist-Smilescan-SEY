import { getContentTypeLabel, inferContentType } from "@/lib/journal/content-categories";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { RelayPracticeSection, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { inferTrackerRecommendation } from "@/lib/relay/relay-ops-status";
import { resolveRelayWorkObjectType } from "@/lib/relay/relay-work-object";
import { relayCategoryLabel } from "@/lib/relay/relay-task-category";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type RelayContextFact = {
  label: string;
  value: string;
  statusDot?: boolean;
};

export type RelayWorkNarrativeBlock = {
  heading: string;
  body: string;
};

export type RelayWorkContextModel = {
  kindLabel: string;
  narrative: RelayWorkNarrativeBlock[];
  facts: RelayContextFact[];
};

function sectionWhyLabel(section: RelayPracticeSection): string {
  switch (section) {
    case "attention":
      return "Wartet auf mich";
    case "practice":
      return "Zu erledigen";
    case "teamwork":
      return "Team wartet";
    case "patient_waiting":
      return "Patient wartet";
    case "routines":
      return "Routinen";
  }
}

function countJournalSections(markdown: string | null): number | null {
  if (!markdown?.trim()) return null;
  const sections = markdown.trim().split(/\n#{1,3}\s+/);
  return sections.length > 1 ? sections.length - 1 : null;
}

/** V8 — Narrativ zuerst, Metadaten sekundär. */
export function buildRelayWorkContextModel(
  row: RelayWorkRow,
  section: RelayPracticeSection,
  options: {
    task?: MyTask;
    journal?: JournalEntry;
    conversation?: RelayConversationRow;
    isDoctor: boolean;
    messageDraftStatus?: MessageDraftListStatus;
  }
): RelayWorkContextModel {
  const { task, journal, conversation, isDoctor, messageDraftStatus } = options;
  const area = sectionWhyLabel(section);
  const objectType = resolveRelayWorkObjectType(row, { task, journal, messageDraftStatus });

  const facts: RelayContextFact[] = [
    { label: "Von", value: row.fromLabel },
    { label: "An", value: row.toLabel },
    { label: "Gruppe", value: row.groupLabel || "Praxis" },
    { label: "Status", value: row.statusLabel, statusDot: true },
    { label: row.dueLabel ? "Fällig" : "Datum", value: row.dueLabel ?? row.timeLabel },
  ];

  if (task?.submission_patient_name?.trim()) {
    facts.push({ label: "Patient", value: task.submission_patient_name.trim() });
  }

  if (row.kind === "journal" && journal) {
    const contentType = inferContentType(journal);
    const typeLabel = getContentTypeLabel(contentType);
    const title = journal.title?.trim() || "Ohne Titel";
    const sectionCount = countJournalSections(journal.content_markdown);
    const topicLine = sectionCount
      ? `${sectionCount} Abschnitte wurden ergänzt.`
      : journal.excerpt?.trim() || `Thema: ${title}.`;

    return {
      kindLabel: "Journalfreigabe",
      narrative: [
        {
          heading: "Was liegt vor?",
          body: `${row.fromLabel} möchte den Artikel „${title}“ veröffentlichen.`,
        },
        {
          heading: "Wer benötigt was?",
          body: `${row.fromLabel} benötigt Ihre Freigabe, bevor der Inhalt im Journal erscheint.`,
        },
        {
          heading: "Warum bin ich hier?",
          body: `Der Vorgang liegt unter „${area}“, weil ein Journal-Entwurf (${typeLabel}) auf Ihre Prüfung wartet.`,
        },
        {
          heading: "Was passiert danach?",
          body: `Thema: ${title}.\n\n${topicLine}\n\nNach Freigabe erscheint der Artikel automatisch im Journal.`,
        },
      ],
      facts,
    };
  }

  if (task?.submission_id) {
    const patient = task.submission_patient_name?.trim() || "Patient";
    const concern =
      inferTrackerRecommendation(task.title, task.description) ??
      task.description?.trim().split("\n")[0]?.trim() ??
      task.title;
    const draftHint =
      messageDraftStatus === "draft"
        ? "Eine Patientenantwort wartet auf Ihre Freigabe."
        : messageDraftStatus === "approved"
          ? "Die Antwort ist freigegeben und kann versendet werden."
          : "Foto oder Nachricht wurde hochgeladen.";

    return {
      kindLabel: objectType === "patientenantwort" ? "Patientenantwort" : "Patientenfall",
      narrative: [
        {
          heading: "Was liegt vor?",
          body: `${patient} meldet: ${concern}. ${draftHint}`,
        },
        {
          heading: "Wer benötigt was?",
          body:
            objectType === "patientenantwort" && messageDraftStatus === "draft"
              ? `Das Team benötigt Ihre Freigabe für die Patientenantwort.`
              : `${patient} wartet auf die nächste Schritte der Praxis.`,
        },
        {
          heading: "Warum bin ich hier?",
          body: `Der Fall liegt unter „${area}“, weil ${isDoctor ? "Ihre Entscheidung oder Freigabe" : "Praxishandlung"} für den Patientenfall ansteht.`,
        },
        {
          heading: "Was passiert danach?",
          body: concern.includes("Kontrolle") || /schwellung|foto|bild/i.test(concern)
            ? `Command AI empfiehlt: ${concern.includes("Kontrolle") ? concern : "Kontrolle innerhalb von 48 Stunden prüfen."}\n\nNach Ihrer Entscheidung kann das Team ohne Rückfrage handeln.`
            : "Nach Ihrer Entscheidung geht der Fall zurück ans Team — der Verlauf bleibt im Tracker nachvollziehbar.",
        },
      ],
      facts,
    };
  }

  if (task) {
    const patient = task.submission_patient_name?.trim();
    const desc = task.description?.trim() || task.title;
    const isReview = task.status === "pending_review" && isDoctor;
    const isDecision = task.recipient_type === "doctor_only" && isDoctor;

    if (isReview || isDecision || objectType === "entscheidung") {
      return {
        kindLabel: isReview ? "Freigabe" : "Entscheidung",
        narrative: [
          {
            heading: "Was liegt vor?",
            body: isReview
              ? `${row.fromLabel} hat „${task.title}“ zur Freigabe eingereicht.${patient ? `\n\nPatient: ${patient}.` : ""}`
              : `${desc}${patient ? `\n\nPatient: ${patient}.` : ""}`,
          },
          {
            heading: "Wer benötigt was?",
            body: `${row.fromLabel} benötigt Ihre ${isReview ? "Freigabe" : "ärztliche Entscheidung"}.`,
          },
          {
            heading: "Warum bin ich hier?",
            body: `Liegt unter „${area}“, weil nur Sie diese ${isReview ? "Freigabe" : "Entscheidung"} treffen können.`,
          },
          {
            heading: "Was passiert danach?",
            body: isReview
              ? "Nach Freigabe geht die Aufgabe ans Team zurück zur Umsetzung."
              : "Nach Ihrer Entscheidung kann das Team den nächsten Schritt ohne Rückfrage umsetzen.",
          },
        ],
        facts,
      };
    }

    if (objectType === "routine") {
      return {
        kindLabel: "Routine",
        narrative: [
          { heading: "Was liegt vor?", body: desc },
          {
            heading: "Wer benötigt was?",
            body: `${row.toLabel} ist für die regelmäßige Umsetzung vorgesehen.`,
          },
          {
            heading: "Warum bin ich hier?",
            body: `Liegt unter „${area}“, weil eine wiederkehrende Praxisaufgabe ansteht.`,
          },
          {
            heading: "Was passiert danach?",
            body: "Nach Erledigung startet der nächste Zyklus gemäß Routine.",
          },
        ],
        facts,
      };
    }

    return {
      kindLabel: "Teamaufgabe",
      narrative: [
        {
          heading: "Was liegt vor?",
          body: `${row.fromLabel} hat übergeben: ${desc}`,
        },
        {
          heading: "Wer benötigt was?",
          body: `${row.toLabel} soll ${task.title.toLowerCase()}.${patient ? `\n\nPatient: ${patient}.` : ""}`,
        },
        {
          heading: "Warum bin ich hier?",
          body: `Liegt unter „${area}“, weil ${row.statusLabel.toLowerCase()}.`,
        },
        {
          heading: "Was passiert danach?",
          body: "Nach Erledigung ist die Aufgabe für alle Beteiligten im Verlauf nachvollziehbar.",
        },
      ],
      facts,
    };
  }

  if (row.kind === "message" && conversation) {
    const preview = conversation.last_message_preview?.trim() || "Interne Übergabe";
    return {
      kindLabel: "Übergabe",
      narrative: [
        { heading: "Was liegt vor?", body: preview },
        {
          heading: "Wer benötigt was?",
          body: `${row.fromLabel} wartet auf Rückmeldung von ${row.toLabel}.`,
        },
        {
          heading: "Warum bin ich hier?",
          body: `Liegt unter „${area}“, weil interne Koordination Ihre Aufmerksamkeit braucht.`,
        },
        {
          heading: "Was passiert danach?",
          body: "Nach Ihrer Antwort ist der Vorgang für das Team dokumentiert — ohne separaten Messenger-Kanal.",
        },
      ],
      facts,
    };
  }

  return {
    kindLabel: row.typeLabel || "Vorgang",
    narrative: [
      { heading: "Was liegt vor?", body: row.concernLine || row.primaryLabel },
      {
        heading: "Wer benötigt was?",
        body: `${row.fromLabel} → ${row.toLabel}.`,
      },
      {
        heading: "Warum bin ich hier?",
        body: `Liegt unter „${area}“.`,
      },
      {
        heading: "Was passiert danach?",
        body: row.actionLabel
          ? `Nach „${row.actionLabel}“ ist der nächste Schritt für das Team klar.`
          : "Nach Bearbeitung ist der Vorgang abgeschlossen.",
      },
    ],
    facts,
  };
}
