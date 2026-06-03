export type RelayReadReceiptRow = {
  user_id: string;
  email: string | null;
  read_at: string | null;
};

export function formatRelayReadReceiptSummary(
  receipts: RelayReadReceiptRow[],
  isGroup: boolean
): string {
  const readers = receipts.filter((r) => r.read_at);
  if (readers.length === 0) {
    return isGroup ? "Noch nicht gelesen" : "Zugestellt";
  }
  if (!isGroup && readers.length === 1) {
    const name = displayName(readers[0]!.email);
    return `Gelesen von ${name} · ${formatTimeShort(readers[0]!.read_at!)}`;
  }
  if (isGroup) {
    return `Gelesen von ${readers.length}/${receipts.length}`;
  }
  const name = displayName(readers[0]!.email);
  return `Gelesen von ${name} · ${formatTimeShort(readers[0]!.read_at!)}`;
}

function displayName(email: string | null): string {
  if (!email) return "Teammitglied";
  const local = email.split("@")[0] ?? email;
  const part = local.split(/[._-]/)[0];
  if (!part) return "Teammitglied";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

function formatTimeShort(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatRelayReadReceiptBlock(
  receipts: RelayReadReceiptRow[],
  isGroup: boolean
): { summary: string; lines: { name: string; read: boolean }[] } {
  const lines = receipts.map((r) => ({
    name: displayName(r.email),
    read: Boolean(r.read_at),
  }));
  const readers = receipts.filter((r) => r.read_at);
  const unread = receipts.filter((r) => !r.read_at);

  let summary: string;
  if (readers.length === 0) {
    summary = isGroup
      ? `Noch ungelesen (${receipts.length} im Team)`
      : unread.length === 1
        ? `Noch ungelesen von ${displayName(unread[0]!.email)}`
        : "Zugestellt";
  } else if (isGroup && readers.length < receipts.length) {
    summary = `Gelesen von ${readers.length} von ${receipts.length}`;
  } else if (!isGroup && readers.length === 1) {
    summary = `Gelesen von ${displayName(readers[0]!.email)}`;
  } else {
    summary = `Gelesen von ${readers.length} von ${receipts.length}`;
  }

  return { summary, lines };
}

export function formatRelayMessageTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatRelayReadReceiptDetail(receipt: RelayReadReceiptRow): string {
  const name = displayName(receipt.email);
  if (receipt.read_at) {
    return `${name} · gelesen ${formatTimeShort(receipt.read_at)}`;
  }
  return `${name} · noch nicht gelesen`;
}
