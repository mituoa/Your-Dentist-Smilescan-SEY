import { StatBlock } from "./stat-block";

interface NewSubmissionsBlockProps {
  newCount: number;
  totalUnseen: number;
}

export function NewSubmissionsBlock({
  newCount,
  totalUnseen,
}: NewSubmissionsBlockProps) {
  return (
    <StatBlock
      label="Neue Einsendungen"
      link={{ href: "/inbox", text: "Zur Inbox" }}
    >
      <div className="font-serif text-6xl font-light text-text-primary leading-none">
        {newCount}
      </div>
      <p className="text-sm text-text-secondary mt-3">
        {newCount === 0
          ? "Keine neuen seit gestern."
          : newCount === 1
            ? "neue Einsendung seit gestern."
            : "neue Einsendungen seit gestern."}
      </p>
      {totalUnseen > 0 && totalUnseen !== newCount && (
        <p className="text-xs text-text-tertiary mt-2">
          {totalUnseen} insgesamt ungesehen
        </p>
      )}
    </StatBlock>
  );
}
