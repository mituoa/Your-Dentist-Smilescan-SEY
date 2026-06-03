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

/** Missing table/relation (migration not applied) — PostgREST / Postgres. */
export function isLikelyMissingDbRelationError(
  err: { code?: string; message?: string } | null | undefined
): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    (msg.includes("relation") && msg.includes("does not exist")) ||
    (msg.includes("could not find the table") && msg.includes("schema cache"))
  );
}
