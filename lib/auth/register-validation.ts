/** Client-side registration validation — calm, medical-enterprise copy. */

export type PasswordStrengthTier = "weak" | "solid" | "strong";

export type PasswordRequirement = {
  id: string;
  label: string;
  met: boolean;
};

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { id: "len", label: "Mindestens 8 Zeichen", met: password.length >= 8 },
    {
      id: "case",
      label: "Groß- und Kleinbuchstaben",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      id: "num",
      label: "Zahl oder Sonderzeichen",
      met: /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password),
    },
  ];
}

export function allPasswordRequirementsMet(password: string): boolean {
  return getPasswordRequirements(password).every((r) => r.met);
}

export function getPasswordStrengthDisplay(password: string): {
  tier: PasswordStrengthTier;
  label: string;
  barPct: number;
} | null {
  if (!password) return null;
  const reqs = getPasswordRequirements(password);
  const metCount = reqs.filter((r) => r.met).length;
  if (!reqs[0]?.met) return { tier: "weak", label: "Schwach", barPct: 33 };
  if (metCount < 3) return { tier: "solid", label: "Solide", barPct: 66 };
  return { tier: "strong", label: "Stark", barPct: 100 };
}

export const PASSWORD_STRENGTH_COLOR: Record<PasswordStrengthTier, string> = {
  weak: "#8ba3b8",
  solid: "#5a6f84",
  strong: "#3d5266",
};

export function normalizeRegisterEmail(v: string): string {
  return v.trim().toLowerCase();
}

export function isRegisterEmailFormatValid(v: string): boolean {
  const e = normalizeRegisterEmail(v);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function emailLooksCompleteForTypoHint(raw: string): boolean {
  const t = raw.trim();
  const at = t.lastIndexOf("@");
  if (at <= 0 || at >= t.length - 1) return false;
  const domain = t.slice(at + 1);
  if (!domain.includes(".")) return false;
  const lastDot = domain.lastIndexOf(".");
  return lastDot >= 1 && lastDot < domain.length - 2;
}

const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.de": "gmail.com",
  "gmai.com": "gmail.com",
  "gmai.de": "gmail.com",
  "gmial.de": "gmail.com",
  "gmal.de": "gmail.com",
  "mgail.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotnail.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "icloud.con": "icloud.com",
  "icoud.com": "icloud.com",
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "gmx.con": "gmx.com",
  "web.dee": "web.de",
  "t-online.dee": "t-online.de",
};

const COMMON_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "yahoo.com",
  "gmx.com",
  "web.de",
  "t-online.de",
] as const;

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n]!;
}

/** Suggests a corrected e-mail when domain looks like a common typo. */
export function suggestRegisterEmailFix(raw: string): { original: string; suggested: string } | null {
  const original = raw.trim();
  const value = normalizeRegisterEmail(original);
  const at = value.lastIndexOf("@");
  if (at <= 0) return null;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!local || !domain || !domain.includes(".")) return null;

  const fixedDirect = DOMAIN_TYPOS[domain];
  if (fixedDirect) {
    const suggested = `${local}@${fixedDirect}`;
    if (suggested === value) return null;
    return { original, suggested };
  }

  let best: { domain: string; dist: number } | null = null;
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(domain, d);
    if (dist === 0) return null;
    if (dist <= 2 && (!best || dist < best.dist)) best = { domain: d, dist };
  }
  if (!best) return null;
  const suggested = `${local}@${best.domain}`;
  return suggested === value ? null : { original, suggested };
}
