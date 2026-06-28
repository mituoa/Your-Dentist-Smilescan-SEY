/**
 * Medical Enterprise — klinische Token-Schicht.
 * Apple-ruhig · Healthcare-präzise · keine SaaS-Optik.
 */

export const CLINICAL_BRIEFING = {
  color: {
    /** Primärflächen */
    ice: "#F4F8FC",
    iceMid: "#EDF5FD",
    iceDeep: "#DCE8F5",
    /** Seiten & Canvas */
    page: "#F8FBFD",
    pageAlt: "#F5F8FB",
    surface: "#FFFFFF",
    surfaceRaised: "#F4F8FC",
    surfaceSunken: "#EDF5FD",
    /** Akzent — Navy Blue (einheitlich) */
    accent: "#1A4F9C",
    accentSoft: "#DCE8F5",
    accentSubtle: "rgba(26, 79, 156, 0.1)",
    /** Text — kein Schwarz */
    textPrimary: "#243446",
    textSecondary: "#516170",
    textMuted: "#7C8A98",
    textFaint: "#9AA6B2",
    /** Ränder — weich, selten hart */
    border: "rgba(36, 52, 70, 0.08)",
    borderSoft: "rgba(36, 52, 70, 0.05)",
    /** Status — zurückhaltend */
    danger: "#9B4A4A",
    dangerBg: "#F8EFEF",
    warning: "#7A6340",
    warningBg: "#F6F2EA",
    success: "#3D6B52",
    successBg: "#EDF4EF",
    pending: "#516170",
    pendingBg: "#EDF2F7",
    /** Legacy-Alias */
    ink: "#243446",
    graphite: "#243446",
    clinicalBlue: "#1A4F9C",
    mineralGray: "#7C8A98",
    offWhite: "#F8FBFD",
  },
  typography: {
    fontSans: 'var(--font-dm-sans), system-ui, sans-serif',
    weightTitle: 600,
    weightLabel: 500,
    weightBody: 400,
    lineHeightBody: 1.62,
    lineHeightTight: 1.38,
    letterLabel: "0.04em",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    card: "16px",
  },
  shadow: {
    /** Apple-artige weiche Tiefe — keine harten Borders */
    card:
      "0 1px 2px rgba(36, 52, 70, 0.03), 0 4px 14px rgba(36, 52, 70, 0.05), 0 12px 32px rgba(36, 52, 70, 0.04)",
    lift:
      "0 2px 6px rgba(36, 52, 70, 0.04), 0 10px 28px rgba(36, 52, 70, 0.07)",
    inset: "inset 0 1px 0 rgba(255, 255, 255, 0.85)",
    none: "none",
  },
  status: {
    submitted: { bg: "#EDF2F7", text: "#516170", dot: "#7C8A98" },
    review: { bg: "#EDF5FD", text: "#1A4F9C", dot: "#1A4F9C" },
    question: { bg: "#F6F2EA", text: "#7A6340", dot: "#9A8458" },
    progress: { bg: "#EDF5FD", text: "#1A4F9C", dot: "#4A7BB5" },
    approval: { bg: "#E8F0FA", text: "#243446", dot: "#1A4F9C" },
    done: { bg: "#EDF4EF", text: "#3D6B52", dot: "#4D8A66" },
    report: { bg: "#EDF2F7", text: "#516170", dot: "#7C8A98" },
  },
  motion: {
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    durationFast: "140ms",
    duration: "200ms",
  },
} as const;
