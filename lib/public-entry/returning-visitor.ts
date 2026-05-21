import "server-only";

import { cookies } from "next/headers";

/** Set when someone visits login or completes sign-in — skips marketing landing on return. */
export const RETURNING_PRACTICE_COOKIE = "yd_returning_practice";

const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

export async function isReturningPracticeVisitor(): Promise<boolean> {
  const store = await cookies();
  return store.get(RETURNING_PRACTICE_COOKIE)?.value === "1";
}

export async function markReturningPracticeVisitor(): Promise<void> {
  const store = await cookies();
  store.set(RETURNING_PRACTICE_COOKIE, "1", {
    maxAge: ONE_YEAR_SEC,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}
