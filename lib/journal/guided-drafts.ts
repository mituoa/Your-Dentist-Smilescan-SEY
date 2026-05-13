/** Vorgegebene Fragen (Figma „Erklärungen erstellen“). */
export const GUIDED_QUESTIONS = [
  "Was tun bei Zahnschmerzen?",
  "Was passiert bei einer Wurzelbehandlung?",
  "Wann ist ein Implantat sinnvoll?",
  "Wie läuft eine professionelle Zahnreinigung ab?",
  "Was sollte ich nach dem Eingriff beachten?",
  "Wie oft sollte ich zur Kontrolle kommen?",
] as const;

const GUIDED_BODIES: Record<string, string> = {
  "Was tun bei Zahnschmerzen?":
    "Bei plötzlichen Zahnschmerzen sollten Sie zunächst die betroffene Stelle vorsichtig reinigen. Spülen Sie Ihren Mund mit lauwarmem Wasser.\n\nKühlen Sie die Wange von außen – das lindert die Schwellung. Vermeiden Sie heiße oder sehr kalte Speisen.\n\nWenn der Schmerz stark ist oder länger als einen Tag anhält, vereinbaren Sie einen Termin. Wir finden gemeinsam heraus, was die Ursache ist.",
  "Was passiert bei einer Wurzelbehandlung?":
    "Eine Wurzelbehandlung klingt komplizierter, als sie ist. Wir entfernen das entzündete Gewebe aus dem Zahninneren und reinigen die Kanäle gründlich.\n\nDer Zahn wird dabei betäubt – Sie spüren nichts. Die Behandlung selbst dauert etwa 45 bis 60 Minuten.\n\nDanach verschließen wir den Zahn wieder. In den meisten Fällen bleibt der Zahn dadurch erhalten und funktioniert normal weiter.",
  "Wann ist ein Implantat sinnvoll?":
    "Ein Implantat macht Sinn, wenn ein Zahn fehlt und die Nachbarzähne gesund sind. Anders als bei einer Brücke müssen wir diese nicht beschleifen.\n\nDas Implantat sitzt fest im Kiefer – wie eine neue Zahnwurzel. Darauf setzen wir eine Krone, die aussieht und funktioniert wie Ihr eigener Zahn.\n\nWir besprechen vorher gemeinsam, ob ein Implantat in Ihrer Situation die beste Lösung ist.",
  "Wie läuft eine professionelle Zahnreinigung ab?":
    "Die professionelle Zahnreinigung entfernt Beläge, die Sie mit der Zahnbürste nicht erreichen. Wir reinigen zunächst alle Zahnflächen und Zwischenräume gründlich.\n\nDanach polieren wir die Zähne und versiegeln sie mit Fluorid. Das stärkt den Zahnschmelz.\n\nDie Behandlung dauert etwa 45 Minuten und ist in der Regel nicht schmerzhaft. Sie verlassen die Praxis mit einem spürbar sauberen Gefühl.",
  "Was sollte ich nach dem Eingriff beachten?":
    "In den ersten Stunden nach der Betäubung sollten Sie nichts essen – Sie könnten sich unbemerkt verletzen.\n\nTrinken Sie erst, wenn die Betäubung vollständig abgeklungen ist. Vermeiden Sie am ersten Tag heiße Getränke und körperliche Anstrengung.\n\nWenn Sie Schmerzen haben, nehmen Sie die empfohlenen Schmerzmittel. Bei ungewöhnlichen Beschwerden rufen Sie uns an – wir sind für Sie da.",
  "Wie oft sollte ich zur Kontrolle kommen?":
    "Die meisten Patienten kommen zweimal im Jahr zur Kontrolle. So können wir Probleme frühzeitig erkennen, bevor sie größer werden.\n\nBei erhöhtem Risiko – etwa bei Parodontitis – empfehlen wir kürzere Abstände. Das besprechen wir individuell.\n\nRegelmäßige Kontrollen sind der beste Schutz für Ihre Zähne. Die Termine sind kurz, und wir schauen nur, dass alles in Ordnung ist.",
};

/** Entwurfstext für Markdown-Inhalt basierend auf Guided Questions. */
export function generateGuidedDraftMarkdown(title: string): string {
  if (!title.trim()) return "";
  return GUIDED_BODIES[title] ?? "";
}
