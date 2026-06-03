export function formatTaskCompletionLine(input: {
  doneAt: string | null;
  doneByEmail: string | null;
}): string | null {
  if (!input.doneAt) return null;
  const who = displayCompleter(input.doneByEmail);
  const when = formatCompletionWhen(input.doneAt);
  return `Erledigt von ${who} · ${when}`;
}

function displayCompleter(email: string | null): string {
  if (!email) return "Teammitglied";
  const local = email.split("@")[0] ?? email;
  const part = local.split(/[._-]/)[0];
  if (!part) return "Teammitglied";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

function formatCompletionWhen(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const sameDay =
      d.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
    if (sameDay) {
      return `heute ${new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d)}`;
    }
    return new Intl.DateTimeFormat("de-DE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "kürzlich";
  }
}
