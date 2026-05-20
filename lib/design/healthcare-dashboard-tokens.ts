/**
 * Design-Tokens — Referenz „Healthcare Dashboard UI“ (dunkler, Verlauf-Akzente).
 */
export const HC = {
  pageBg: "#A8B5C4",
  pageAmbient:
    "radial-gradient(ellipse 75% 55% at 88% 2%, rgba(30,91,189,0.14) 0%, transparent 52%), radial-gradient(ellipse 50% 40% at 12% 88%, rgba(47,128,237,0.06) 0%, transparent 45%)",

  canvasBg: "#E4ECF4",
  canvasGradient:
    "linear-gradient(165deg, #EDF3FA 0%, #E2EBF5 38%, #D9E5F1 100%)",
  canvasRadius: "44px",
  canvasBorder: "1px solid rgba(255, 255, 255, 0.55)",
  canvasInnerGlow:
    "radial-gradient(ellipse 90% 60% at 100% 0%, rgba(47,128,237,0.08) 0%, transparent 55%)",

  sidebarWidth: 96,
  sidebarRadius: "40px",
  sidebarGlass: "rgba(248, 252, 255, 0.5)",
  sidebarBorder: "rgba(255, 255, 255, 0.65)",
  sidebarFlowGradient:
    "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(232,243,252,0.88) 30%, rgba(210,228,245,0.96) 65%, rgba(188,214,236,1) 100%)",
  sidebarEdgeGlow:
    "linear-gradient(180deg, transparent 0%, rgba(30,91,189,0.15) 45%, rgba(47,128,237,0.28) 100%)",
  sidebarShadow:
    "0 12px 44px rgba(15, 23, 42, 0.14), 0 4px 16px rgba(30, 91, 189, 0.1)",

  surface: "#FFFFFF",
  cardGradient:
    "linear-gradient(180deg, #FFFFFF 0%, #F8FBFE 55%, #F2F7FC 100%)",
  surfaceMuted: "#E8EFF6",
  searchBg: "#DDE6F0",
  searchBorder: "rgba(180, 198, 218, 0.65)",

  primary: "#2F80ED",
  primaryDark: "#1E5BB8",
  primaryDeep: "#1A4F9C",
  primaryNavy: "#2563EB",
  primaryLight: "#6BA8F5",
  primarySoft: "#D6E8FA",
  primaryIconGradient: "linear-gradient(145deg, #5B9CF5 0%, #2F80ED 50%, #1E5BB8 100%)",
  iconMuted: "#6B849C",

  chartBar: "linear-gradient(180deg, #1E5BB8 0%, #2F80ED 45%, #5B9CF5 100%)",
  chartBarLight: "linear-gradient(180deg, #7EB8FF 0%, #A8D4FF 100%)",
  chartStripe:
    "repeating-linear-gradient(-45deg, #4A90E8, #4A90E8 3px, #7EB8FF 3px, #7EB8FF 6px)",
  chartDotGrid: "radial-gradient(circle, #B8C8D8 1px, transparent 1px)",
  chartAreaFade:
    "linear-gradient(180deg, rgba(228,238,248,0.4) 0%, rgba(228,238,248,0.95) 100%)",

  arcTrack: "#D0DCE8",
  arcGradientMain: ["#1E5BB8", "#2F80ED", "#5B9CF5"] as const,
  arcGradientLight: ["#93C5FD", "#BFDBFE"] as const,

  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  wordmark: "#1E293B",

  border: "#CBD5E1",
  borderSoft: "#E2E8F0",
  cardShadow:
    "0 2px 4px rgba(15, 23, 42, 0.05), 0 10px 32px rgba(30, 91, 189, 0.1)",
  cardShadowHover:
    "0 4px 10px rgba(15, 23, 42, 0.07), 0 16px 40px rgba(30, 91, 189, 0.14)",

  trendUp: "#16A34A",
  trendMuted: "#64748B",

  statusHospital: { bg: "#FEE2E2", text: "#B91C1C", dot: "#DC2626" },
  statusConsultation: { bg: "#DBEAFE", text: "#1D4ED8", dot: "#2563EB" },
  statusHealthy: { bg: "#D1FAE5", text: "#047857", dot: "#059669" },
  statusPending: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B" },

  contentMaxWidth: 1320,
  cardRadius: "22px",
  pillRadius: "9999px",
} as const;

export const HC_SIDEBAR_WIDTH_PX = HC.sidebarWidth;
