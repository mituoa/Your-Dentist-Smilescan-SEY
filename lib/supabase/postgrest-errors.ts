/** Postgres undefined_column — or PostgREST hinting a missing relation column. */
export function isLikelyMissingDbColumnError(
  err: { code?: string; message?: string } | null | undefined
): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  return (
    err.code === "42703" ||
    (msg.includes("column") &&
      (msg.includes("does not exist") ||
        msg.includes("unknown") ||
        msg.includes("not found")))
  );
}
