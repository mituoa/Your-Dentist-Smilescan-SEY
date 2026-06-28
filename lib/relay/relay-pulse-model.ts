import type { RelayAufgabenTab, RelayBereich } from "@/lib/relay/relay-bereich-model";

export type RelayPulseId = "freigaben" | "patienten" | "team" | "journal";

export type RelayPulseCard = {
  id: RelayPulseId;
  label: string;
  count: number;
  hint: string;
  bereich: RelayBereich;
  aufgabenTab?: RelayAufgabenTab;
};

export function buildRelayPulseCards(input: {
  journalCount: number;
  patientenCount: number;
  teamUnread: number;
  teamConversations: number;
  aufgabenHeute: number;
}): RelayPulseCard[] {
  const freigabenCount = input.journalCount + input.aufgabenHeute;

  return [
    {
      id: "freigaben",
      label: "Freigaben",
      count: freigabenCount,
      hint:
        freigabenCount === 0
          ? "Alles freigegeben"
          : freigabenCount === 1
            ? "Entscheidung offen"
            : "Entscheidungen offen",
      bereich: input.journalCount > 0 ? "journal" : "aufgaben",
      aufgabenTab: "heute",
    },
    {
      id: "patienten",
      label: "Patienten",
      count: input.patientenCount,
      hint:
        input.patientenCount === 0
          ? "Keine Anfragen"
          : input.patientenCount === 1
            ? "Anfrage wartet"
            : "Anfragen warten",
      bereich: "patienten",
    },
    {
      id: "team",
      label: "Team",
      count: input.teamUnread > 0 ? input.teamUnread : input.teamConversations,
      hint:
        input.teamUnread > 0
          ? input.teamUnread === 1
            ? "ungelesen"
            : "ungelesen"
          : input.teamConversations === 0
            ? "Keine Nachrichten"
            : "Konversationen",
      bereich: "team",
    },
    {
      id: "journal",
      label: "Journal",
      count: input.journalCount,
      hint:
        input.journalCount === 0
          ? "Keine Entwürfe"
          : input.journalCount === 1
            ? "in Freigabe"
            : "in Freigabe",
      bereich: "journal",
    },
  ];
}
