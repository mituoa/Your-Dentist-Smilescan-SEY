/** Wochenzeile — kompakt auf Mobile, Mo–So der aktuellen Kalenderwoche. */
export function DashboardWeekStrip() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(today.getDate() + mondayOffset);

  const days: { label: string; num: number; active: boolean; key: string }[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", ""),
      num: d.getDate(),
      active: d.getTime() === today.getTime(),
    });
  }

  return (
    <div className="yd-dash-week-strip" role="group" aria-label="Aktuelle Woche">
      {days.map((day) => (
        <div
          key={day.key}
          className={
            day.active
              ? "yd-dash-week-strip__day yd-dash-week-strip__day--active"
              : "yd-dash-week-strip__day"
          }
          aria-current={day.active ? "date" : undefined}
        >
          <span className="yd-dash-week-strip__label">{day.label}</span>
          <span className="yd-dash-week-strip__num">{day.num}</span>
        </div>
      ))}
    </div>
  );
}
