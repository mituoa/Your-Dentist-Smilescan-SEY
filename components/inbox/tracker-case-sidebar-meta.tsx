import {
  getIntakeChannelLabel,
  type IntakeChannel,
} from "@/lib/submissions/intake-channel";

type TrackerCaseSidebarMetaProps = {
  intakeChannel: IntakeChannel;
  photoCount: number;
  urgency: string | null;
  isDraft?: boolean;
  seenAt?: string | null;
};

function urgencyShort(u: string | null): string {
  switch (u) {
    case "today":
      return "Heute";
    case "this_week":
      return "Diese Woche";
    case "not_urgent":
      return "Nicht dringend";
    default:
      return "Noch nicht gewählt";
  }
}

/** Nur Zusatzinfos, die nicht im Hauptüberblick stehen — keine Kontakt-Doppelung. */
export function TrackerCaseSidebarMeta({
  intakeChannel,
  photoCount,
  urgency,
  isDraft,
  seenAt,
}: TrackerCaseSidebarMetaProps) {
  const rows = [
    { label: "Eingang", value: getIntakeChannelLabel(intakeChannel) },
    { label: "Fotos", value: String(photoCount) },
    { label: "Zeitraum", value: urgencyShort(urgency) },
    {
      label: "Geöffnet",
      value: isDraft ? "Entwurf" : seenAt ? "Ja" : "Neu",
    },
  ];

  return (
    <dl className="yd-tracker-sidebar-meta">
      {rows.map((row) => (
        <div key={row.label} className="yd-tracker-sidebar-meta__row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
