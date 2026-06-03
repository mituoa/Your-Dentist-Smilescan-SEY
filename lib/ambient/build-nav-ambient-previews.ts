import type { SubmissionListItem } from "@/lib/queries/inbox";
import type { OpenTaskRow } from "@/lib/queries/dashboard";
import type { JournalEntry } from "@/lib/types/journal-entry";
import type { YdNavAmbientMap } from "@/lib/ambient/nav-preview-types";

function trimLine(text: string, max = 42): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function formatRelativeShort(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 60) return `vor ${Math.max(1, diffMin)} Min.`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  return d === 1 ? "gestern" : `vor ${d} Tagen`;
}

export function buildNavAmbientPreviews(input: {
  inboxItems: SubmissionListItem[];
  inboxUnseen?: number;
  openTasks: OpenTaskRow[];
  tasksOverdue: number;
  journalEntries: JournalEntry[];
  role: "doctor" | "team";
}): YdNavAmbientMap {
  const { inboxItems, inboxUnseen, openTasks, tasksOverdue, journalEntries, role } = input;
  const map: YdNavAmbientMap = {};

  const openCases = inboxItems.filter((s) => !s.is_draft);
  const unread = inboxUnseen ?? openCases.filter((s) => !s.seen_at).length;

  map.inbox = {
    title: "Tracker",
    lines: [
      { label: "Offen", value: String(openCases.length) },
      { label: "Ungelesen", value: String(unread), tone: unread > 0 ? "urgent" : "default" },
      ...openCases.slice(0, 2).map((s) => ({
        value: trimLine(s.patient_name || "Unbenannter Fall"),
        label: s.seen_at ? "Gelesen" : "Neu",
        tone: (s.seen_at ? "muted" : "urgent") as "muted" | "urgent",
      })),
      ...(openCases[0]
        ? [
            {
              label: "Zuletzt",
              value: formatRelativeShort(openCases[0].created_at),
              tone: "muted" as const,
            },
          ]
        : [{ value: "Keine offenen Eingänge", tone: "muted" as const }]),
    ],
  };

  map.relay = {
    title: "Relay · Aufgaben",
    lines: [
      {
        label: "Offen",
        value: String(openTasks.length),
        tone: openTasks.length > 0 ? "default" : "muted",
      },
      ...(tasksOverdue > 0
        ? [{ label: "Überfällig", value: String(tasksOverdue), tone: "urgent" as const }]
        : []),
      ...openTasks.slice(0, 2).map((t) => ({
        value: trimLine(t.content || "Aufgabe"),
        label: "Workflow",
      })),
      ...(openTasks[0]
        ? [
            {
              label: "Aktualisiert",
              value: formatRelativeShort(openTasks[0].created_at),
              tone: "muted" as const,
            },
          ]
        : [{ value: "Keine offenen Aufgaben", tone: "muted" as const }]),
    ],
  };

  if (role === "doctor") {
    const drafts = journalEntries.filter((e) => e.status === "draft");
    const published = journalEntries.filter((e) => e.status === "published");

    map.journal = {
      title: "Journals",
      lines: [
        { label: "Veröffentlicht", value: String(published.length) },
        { label: "Entwürfe", value: String(drafts.length), tone: drafts.length > 0 ? "default" : "muted" },
        ...(journalEntries[0]
          ? [
              {
                value: trimLine(journalEntries[0].title || "Ohne Titel"),
                label: journalEntries[0].status === "draft" ? "Entwurf" : "Artikel",
              },
            ]
          : [{ value: "Noch keine Beiträge", tone: "muted" as const }]),
      ],
    };

    map.dashboard = {
      title: "Atlas",
      lines: [
        { value: "Atlas · Kennzahlen" },
        { label: "Fokus", value: "Einsendungen & Relay", tone: "muted" },
      ],
    };
  }

  return map;
}
