/** Dezente Wochenzeile — Referenz: Schedule-Panel oben */
export function DashboardWeekStrip() {
  const today = new Date();
  const days: { label: string; num: number; active: boolean }[] = [];

  for (let i = -2; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      label: d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", ""),
      num: d.getDate(),
      active: i === 0,
    });
  }

  return (
    <div className="yd-dash-week-strip" aria-hidden>
      {days.map((day) => (
        <div
          key={`${day.label}-${day.num}`}
          className={day.active ? "yd-dash-week-strip__day yd-dash-week-strip__day--active" : "yd-dash-week-strip__day"}
        >
          <span className="yd-dash-week-strip__label">{day.label}</span>
          <span className="yd-dash-week-strip__num">{day.num}</span>
        </div>
      ))}
    </div>
  );
}
