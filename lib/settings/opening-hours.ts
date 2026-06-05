export type WeekdayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type TimeSlot = {
  start: string;
  end: string;
};

export type WeekdaySchedule = {
  closed: boolean;
  slots: TimeSlot[];
};

export type SpecialPeriodKind = "holiday" | "vacation" | "special";

export type SpecialPeriod = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  kind: SpecialPeriodKind;
  closed: boolean;
  note?: string;
  slots: TimeSlot[];
};

export type OpeningHoursConfig = {
  version: 1;
  onlineBookingEnabled: boolean;
  weekly: Record<WeekdayId, WeekdaySchedule>;
  specialPeriods: SpecialPeriod[];
};

export const WEEKDAY_ORDER: WeekdayId[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WEEKDAY_LABELS: Record<WeekdayId, string> = {
  mon: "Montag",
  tue: "Dienstag",
  wed: "Mittwoch",
  thu: "Donnerstag",
  fri: "Freitag",
  sat: "Samstag",
  sun: "Sonntag",
};

export const SPECIAL_PERIOD_KIND_LABELS: Record<SpecialPeriodKind, string> = {
  holiday: "Feiertag",
  vacation: "Urlaub",
  special: "Sonderöffnungszeit",
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function defaultOpeningHoursConfig(): OpeningHoursConfig {
  const weekday = (closed: boolean, slots: TimeSlot[]): WeekdaySchedule => ({
    closed,
    slots,
  });

  return {
    version: 1,
    onlineBookingEnabled: Boolean(false),
    weekly: {
      mon: weekday(false, [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "18:00" },
      ]),
      tue: weekday(false, [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "18:00" },
      ]),
      wed: weekday(false, [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "18:00" },
      ]),
      thu: weekday(false, [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "18:00" },
      ]),
      fri: weekday(false, [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "16:00" },
      ]),
      sat: weekday(true, []),
      sun: weekday(true, []),
    },
    specialPeriods: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTimeSlot(raw: unknown): TimeSlot | null {
  if (!isRecord(raw)) return null;
  const start = typeof raw.start === "string" ? raw.start.trim() : "";
  const end = typeof raw.end === "string" ? raw.end.trim() : "";
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) return null;
  if (start >= end) return null;
  return { start, end };
}

function parseWeekdaySchedule(raw: unknown, fallback: WeekdaySchedule): WeekdaySchedule {
  if (!isRecord(raw)) return fallback;
  const closed = Boolean(raw.closed);
  const slotsRaw = Array.isArray(raw.slots) ? raw.slots : [];
  const slots = slotsRaw
    .map(parseTimeSlot)
    .filter((s): s is TimeSlot => Boolean(s));
  if (closed) return { closed: true, slots: [] };
  return { closed: false, slots: slots.length > 0 ? slots : fallback.slots };
}

function parseSpecialPeriod(raw: unknown): SpecialPeriod | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const label = typeof raw.label === "string" ? raw.label.trim() : "";
  const startDate = typeof raw.startDate === "string" ? raw.startDate.trim() : "";
  const endDate = typeof raw.endDate === "string" ? raw.endDate.trim() : "";
  const kind = raw.kind;
  if (!id || !label || !startDate || !endDate) return null;
  if (kind !== "holiday" && kind !== "vacation" && kind !== "special") return null;

  const closed = Boolean(raw.closed);
  const slotsRaw = Array.isArray(raw.slots) ? raw.slots : [];
  const slots = slotsRaw
    .map(parseTimeSlot)
    .filter((s): s is TimeSlot => Boolean(s));
  const note = typeof raw.note === "string" ? raw.note.trim() : undefined;

  return {
    id,
    label,
    startDate,
    endDate,
    kind,
    closed,
    note: note || undefined,
    slots: closed ? [] : slots,
  };
}

export function parseOpeningHoursConfig(raw: unknown): OpeningHoursConfig {
  const defaults = defaultOpeningHoursConfig();
  if (!isRecord(raw)) return defaults;

  const weekly = { ...defaults.weekly };
  if (isRecord(raw.weekly)) {
    for (const day of WEEKDAY_ORDER) {
      weekly[day] = parseWeekdaySchedule(raw.weekly[day], defaults.weekly[day]);
    }
  }

  const specialPeriods = Array.isArray(raw.specialPeriods)
    ? raw.specialPeriods
        .map(parseSpecialPeriod)
        .filter((p): p is SpecialPeriod => Boolean(p))
    : [];

  return {
    version: 1,
    onlineBookingEnabled: Boolean(raw.onlineBookingEnabled),
    weekly,
    specialPeriods,
  };
}

export function validateOpeningHoursConfig(config: OpeningHoursConfig): string | null {
  for (const day of WEEKDAY_ORDER) {
    const schedule = config.weekly[day];
    if (schedule.closed) continue;
    if (schedule.slots.length === 0) {
      return `${WEEKDAY_LABELS[day]}: Bitte mindestens ein Zeitfenster angeben oder als geschlossen markieren.`;
    }
    for (const slot of schedule.slots) {
      if (!TIME_RE.test(slot.start) || !TIME_RE.test(slot.end)) {
        return `${WEEKDAY_LABELS[day]}: Ungültiges Zeitformat.`;
      }
      if (slot.start >= slot.end) {
        return `${WEEKDAY_LABELS[day]}: Endzeit muss nach Startzeit liegen.`;
      }
    }
  }

  for (const period of config.specialPeriods) {
    if (!period.label.trim()) return "Sonderzeitraum: Bitte eine Bezeichnung angeben.";
    if (period.startDate > period.endDate) {
      return `"${period.label}": Enddatum muss nach Startdatum liegen.`;
    }
    if (!period.closed) {
      for (const slot of period.slots) {
        if (!TIME_RE.test(slot.start) || !TIME_RE.test(slot.end) || slot.start >= slot.end) {
          return `"${period.label}": Ungültige Sonderzeiten.`;
        }
      }
    }
  }

  return null;
}

function formatSlot(slot: TimeSlot): string {
  return `${slot.start}–${slot.end}`;
}

function formatDayLine(day: WeekdayId, schedule: WeekdaySchedule): string {
  const label = WEEKDAY_LABELS[day].slice(0, 2);
  if (schedule.closed) return `${label} geschlossen`;
  if (schedule.slots.length === 0) return `${label} —`;
  return `${label} ${schedule.slots.map(formatSlot).join(", ")}`;
}

/** Kurztext für öffentliches Profil (`practice_hours`). */
export function formatOpeningHoursForProfile(config: OpeningHoursConfig): string {
  const openDays = WEEKDAY_ORDER.filter((d) => !config.weekly[d].closed);
  if (openDays.length === 0) return "Nach Vereinbarung";

  const lines: string[] = openDays.map((day) => {
    const schedule = config.weekly[day];
    const slots = schedule.slots.map(formatSlot).join(", ");
    return `${WEEKDAY_LABELS[day]}: ${slots}`;
  });

  const closedDays = WEEKDAY_ORDER.filter((d) => config.weekly[d].closed);
  if (closedDays.length > 0) {
    lines.push(
      `${closedDays.map((d) => WEEKDAY_LABELS[d]).join(", ")}: geschlossen`
    );
  }

  const upcoming = [...config.specialPeriods]
    .filter((p) => p.endDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  for (const period of upcoming) {
    const range =
      period.startDate === period.endDate
        ? formatGermanDate(period.startDate)
        : `${formatGermanDate(period.startDate)} – ${formatGermanDate(period.endDate)}`;
    if (period.closed) {
      lines.push(`${period.label} (${range}): geschlossen`);
    } else if (period.slots.length > 0) {
      lines.push(
        `${period.label} (${range}): ${period.slots.map(formatSlot).join(", ")}`
      );
    } else {
      lines.push(`${period.label} (${range})`);
    }
  }

  if (config.onlineBookingEnabled) {
    lines.push("Online-Terminbuchung verfügbar");
  }

  return lines.join("\n");
}

function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function newSpecialPeriodId(): string {
  return `sp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function compactWeekSummary(config: OpeningHoursConfig): string {
  const parts = WEEKDAY_ORDER.map((day) => formatDayLine(day, config.weekly[day]));
  return parts.join(" · ");
}
