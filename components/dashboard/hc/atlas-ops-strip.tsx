import Link from "next/link";

type AtlasOpsStripProps = {
  unseenCount: number | null;
  openTaskCount: number;
  relayUnread: number;
  routineCount: number;
  reminderCount: number;
};

/** Kompakte Kennzahlen — sekundär zum Prioritäts-Feed. */
export function AtlasOpsStrip({
  unseenCount,
  openTaskCount,
  relayUnread,
  routineCount,
  reminderCount,
}: AtlasOpsStripProps) {
  const chips = [
    {
      label: "Eingänge",
      value: unseenCount === null ? "—" : String(unseenCount),
      href: "/inbox",
    },
    {
      label: "Aufgaben",
      value: String(openTaskCount),
      href: "/my-tasks",
    },
    {
      label: "Relay",
      value: relayUnread > 0 ? String(relayUnread) : "0",
      href: "/relay",
    },
    {
      label: "Routinen",
      value: String(routineCount),
      href: "/relay",
    },
    {
      label: "Erinnerungen",
      value: String(reminderCount),
      href: "/my-tasks",
    },
  ];

  return (
    <nav className="yd-ops-strip" aria-label="Status">
      {chips.map((chip) => (
        <Link key={chip.label} href={chip.href} className="yd-ops-chip">
          <span className="yd-ops-chip-label">{chip.label}</span>
          <span className="yd-ops-chip-value">{chip.value}</span>
        </Link>
      ))}
    </nav>
  );
}
