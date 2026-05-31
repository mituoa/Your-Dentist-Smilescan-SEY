const ESSENCE_MOMENTS = [
  { id: "patient", text: "Patient sendet Fotos und Anliegen" },
  { id: "intake", text: "Praxis sieht strukturierten Eingang" },
  { id: "relay", text: "Relay: interne Rückfrage" },
  { id: "task", text: "Erinnerung / Aufgabe" },
  { id: "command", text: "Command AI: leiser Hinweis", quiet: true },
] as const;

/**
 * Hero-Produktvisual — fünf Momente, ohne UI-Collage oder Mini-Labels.
 */
export function YdPracticeWorld() {
  return (
    <div
      className="yd-practice-world yd-practice-world--essence"
      role="img"
      aria-label="Ablauf: Patienteneingang, strukturierte Sichtung, Relay, Aufgabe, leise Command AI"
    >
      <ol className="yd-practice-world-essence-flow">
        {ESSENCE_MOMENTS.map((moment) => (
          <li
            key={moment.id}
            className={`yd-practice-world-essence-step${"quiet" in moment && moment.quiet ? " yd-practice-world-essence-step--quiet" : ""}`}
          >
            <span className="yd-practice-world-essence-marker" aria-hidden />
            <span className="yd-practice-world-essence-text">{moment.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
