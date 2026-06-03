/** Fälligkeit aus natürlicher Sprache (de) — ohne LLM. */

export type TaskDueResolution = {
  dueDateIso: string | null;
  label: string | null;
};

function atNoonUtc(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d, 12, 0, 0)).toISOString();
}

function nextWeekday(from: Date, weekday: number): Date {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

export function resolveTaskDueDateFromText(rawText: string): TaskDueResolution {
  const t = rawText.toLowerCase();

  const now = new Date();

  if (/\bmorgen\b/.test(t)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return {
      dueDateIso: atNoonUtc(d.getFullYear(), d.getMonth(), d.getDate()),
      label: "Morgen",
    };
  }

  if (/\bheute\b/.test(t) && /(fällig|bis|spätestens|erledigen|prüfen)/.test(t)) {
    return {
      dueDateIso: atNoonUtc(now.getFullYear(), now.getMonth(), now.getDate()),
      label: "Heute",
    };
  }

  if (/\bfreitag\b/.test(t)) {
    const friday = nextWeekday(now, 5);
    return {
      dueDateIso: atNoonUtc(friday.getFullYear(), friday.getMonth(), friday.getDate()),
      label: "Freitag",
    };
  }

  if (/\bnächste woche\b|\bnachste woche\b/.test(t)) {
    const monday = nextWeekday(now, 1);
    return {
      dueDateIso: atNoonUtc(monday.getFullYear(), monday.getMonth(), monday.getDate()),
      label: "Nächste Woche",
    };
  }

  if (/\bdiese woche\b/.test(t)) {
    const friday = nextWeekday(now, 5);
    if (friday.getTime() <= now.getTime() + 86400000) {
      return { dueDateIso: null, label: "Diese Woche (bitte Fälligkeit prüfen)" };
    }
    return {
      dueDateIso: atNoonUtc(friday.getFullYear(), friday.getMonth(), friday.getDate()),
      label: "Diese Woche",
    };
  }

  return { dueDateIso: null, label: null };
}

export function isImportantTaskPriority(rawText: string): boolean {
  const t = rawText.toLowerCase();
  return /(dringend|sofort|wichtig|eilig|unverzüglich|unverzuglich)/.test(t) || /\bheute\b/.test(t);
}
