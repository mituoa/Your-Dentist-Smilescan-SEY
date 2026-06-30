import type { ClinicalAreaId } from "@/lib/journal/clinical-areas";
import type { JournalContentType } from "@/lib/journal/content-categories";
import { generateGuidedDraftMarkdown, GUIDED_QUESTIONS } from "@/lib/journal/guided-drafts";

export type RecommendedTopic = {
  title: string;
  clinicalArea: ClinicalAreaId;
  contentType: JournalContentType;
  hint: string;
  content: string;
  /** 1 = am häufigsten gestellt (Anzeige im Care Center). */
  frequencyRank: number;
};

function bodyFor(title: string): string {
  return generateGuidedDraftMarkdown(title);
}

export const RECOMMENDED_TOPICS: RecommendedTopic[] = [
  {
    title: "Verhalten nach Implantation",
    clinicalArea: "implantologie",
    contentType: "nachsorge",
    hint: "Nachsorge — häufigste Rückfrage",
    frequencyRank: 1,
    content: bodyFor("Was sollte ich nach dem Eingriff beachten?"),
  },
  {
    title: "Schmerzen nach OP",
    clinicalArea: "oralchirurgie",
    contentType: "faq",
    hint: "Was normal ist — und wann anrufen",
    frequencyRank: 2,
    content: bodyFor("Was sollte ich nach dem Eingriff beachten?"),
  },
  {
    title: GUIDED_QUESTIONS[0]!,
    clinicalArea: "vorsorge",
    contentType: "faq",
    hint: "Häufigste Frage in der Praxis",
    frequencyRank: 3,
    content: bodyFor(GUIDED_QUESTIONS[0]!),
  },
  {
    title: "Schwellung normal?",
    clinicalArea: "oralchirurgie",
    contentType: "faq",
    hint: "Häufige Sorge nach Eingriff",
    frequencyRank: 4,
    content:
      "Eine leichte Schwellung in den ersten ein bis zwei Tagen nach einem Eingriff ist häufig und meist harmlos.\n\nKühlen von außen kann lindern. Nimmt die Schwellung nicht ab, wird sie stärker oder begleitet von Fieber, kontaktieren Sie unsere Praxis.\n\nIm Zweifel lieber kurz nachfragen — wir nehmen uns Zeit.",
  },
  {
    title: "Warum blutet Zahnfleisch?",
    clinicalArea: "parodontologie",
    contentType: "faq",
    hint: "Typische Frage im Alltag",
    frequencyRank: 5,
    content:
      "Blutendes Zahnfleisch ist häufig ein Zeichen für Entzündung — meist durch Plaque an den Zahnhalsrändern.\n\nPutzen Sie zweimal täglich gründlich und nutzen Sie Zahnseide oder Zwischenraumbürsten. Ein leichtes Bluten in den ersten Tagen nach verbesserter Pflege kann normal sein.\n\nBleibt es länger bestehen oder schmerzt es, vereinbaren Sie einen Termin. Gemeinsam schauen wir, was die Ursache ist.",
  },
  {
    title: "Sport nach Eingriff",
    clinicalArea: "implantologie",
    contentType: "nachsorge",
    hint: "Typische Frage in der ersten Woche",
    frequencyRank: 6,
    content:
      "In den ersten Tagen nach einem chirurgischen Eingriff sollten Sie körperliche Belastung vermeiden.\n\nLeichtes Gehen ist in der Regel unproblematisch. Sport, Heben schwerer Lasten und Sauna empfehlen wir erst nach Freigabe.\n\nBei Schmerzen, Schwellung oder Blutungen kontaktieren Sie bitte unsere Praxis.",
  },
  {
    title: "Kaffee nach Implantat",
    clinicalArea: "implantologie",
    contentType: "faq",
    hint: "Alltagsfrage nach Implantation",
    frequencyRank: 7,
    content:
      "Direkt nach dem Eingriff sollten Sie auf sehr heiße Getränke verzichten.\n\nKoffeinhaltige Getränke sind in Maßen meist unproblematisch, sobald die erste Heilungsphase gut verläuft — wir besprechen das individuell mit Ihnen.\n\nBei Unsicherheit oder Beschwerden melden Sie sich bei uns.",
  },
  {
    title: "Invisalign Pflege",
    clinicalArea: "aesthetik",
    contentType: "nachsorge",
    hint: "Schienenhygiene im Alltag",
    frequencyRank: 8,
    content:
      "Reinigen Sie Ihre Aligner morgens und abends mit lauwarmem Wasser und einer weichen Zahnbürste.\n\nEntfernen Sie die Schienen zum Essen und vor dem Zähneputzen. Bewahren Sie sie trocken im Etui auf.\n\nBei Rissen, Verfärbungen oder Passungsproblemen vereinbaren Sie einen Termin.",
  },
  {
    title: "Bleaching Hinweise",
    clinicalArea: "aesthetik",
    contentType: "nachsorge",
    hint: "Vor und nach der Aufhellung",
    frequencyRank: 9,
    content:
      "Vor dem Bleaching besprechen wir Empfindlichkeiten und Erwartungen offen mit Ihnen.\n\nIn den ersten Tagen vermeiden Sie stark färbende Speisen und Getränke wie Kaffee, Rotwein oder Beeren.\n\nBei anhaltender Empfindlichkeit melden Sie sich — wir finden eine passende Lösung.",
  },
  {
    title: GUIDED_QUESTIONS[1]!,
    clinicalArea: "oralchirurgie",
    contentType: "erklaerung",
    hint: "Behandlung verständlich machen",
    frequencyRank: 10,
    content: bodyFor(GUIDED_QUESTIONS[1]!),
  },
  {
    title: GUIDED_QUESTIONS[2]!,
    clinicalArea: "implantologie",
    contentType: "faq",
    hint: "Häufige Entscheidungsfrage",
    frequencyRank: 11,
    content: bodyFor(GUIDED_QUESTIONS[2]!),
  },
  {
    title: "Kinder beim ersten Zahnarztbesuch",
    clinicalArea: "kinderzahnheilkunde",
    contentType: "praxiswissen",
    hint: "Vertrauen von Anfang an",
    frequencyRank: 12,
    content:
      "Der erste Zahnarztbesuch sollte positiv sein — ohne Druck und ohne Überraschungen.\n\nWir nehmen uns Zeit, Ihr Kind spielerisch kennenzulernen und nur das zu tun, womit es sich wohlfühlt. Eltern bleiben in der Regel dabei.\n\nSo entsteht von Anfang an Vertrauen — die beste Grundlage für lebenslange Zahngesundheit.",
  },
  {
    title: "Parodontitis verstehen",
    clinicalArea: "parodontologie",
    contentType: "erklaerung",
    hint: "Komplexes Thema einfach erklären",
    frequencyRank: 13,
    content:
      "Parodontitis ist eine chronische Entzündung des Zahnhalteapparats. Sie entsteht, wenn Bakterien unter dem Zahnfleisch Entzündungen auslösen.\n\nFrüh erkannt lässt sie sich gut behandeln. Wir reinigen die betroffenen Stellen gründlich und besprechen mit Ihnen, wie Sie zu Hause unterstützen können.\n\nUnbehandelt kann sie zu Zahnverlust führen — deshalb sind regelmäßige Kontrollen so wichtig.",
  },
  {
    title: GUIDED_QUESTIONS[3]!,
    clinicalArea: "vorsorge",
    contentType: "erklaerung",
    hint: "Vorsorge verständlich erklären",
    frequencyRank: 14,
    content: bodyFor(GUIDED_QUESTIONS[3]!),
  },
];

export function getRecommendedTopicsMissing(
  entries: { title: string | null; status: string }[],
  limit = 6
): RecommendedTopic[] {
  const titles = new Set(
    entries.map((e) => (e.title ?? "").trim().toLowerCase()).filter(Boolean)
  );

  return RECOMMENDED_TOPICS.filter((t) => !titles.has(t.title.toLowerCase()))
    .sort((a, b) => a.frequencyRank - b.frequencyRank)
    .slice(0, limit);
}
