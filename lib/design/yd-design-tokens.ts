/**
 * Your Dentist — Clinical OS Design System (YD)
 * Medical Enterprise: ruhige Flächen, kontrolliertes Medical Blue.
 */
import { CLINICAL_BRIEFING } from "@/lib/design/clinical-briefing-tokens";

export const YD = {
  atmosphere: {
    page: "#E8EFF6",
    pageGradient: "linear-gradient(180deg, #EDF3F9 0%, #E2EBF4 100%)",
    canvas: "linear-gradient(180deg, #F8FBFD 0%, #F5F8FB 50%, #EDF5FD 100%)",
    canvasGlow: "none",
    vignette: "none",
  },

  surface: {
    island: CLINICAL_BRIEFING.color.page,
    card: CLINICAL_BRIEFING.color.surface,
    cardPrimary: CLINICAL_BRIEFING.color.ice,
    cardQuiet: CLINICAL_BRIEFING.color.iceMid,
    cardHover: CLINICAL_BRIEFING.color.ice,
    elevated: CLINICAL_BRIEFING.color.surface,
    sunken: CLINICAL_BRIEFING.color.surfaceSunken,
    search: CLINICAL_BRIEFING.color.iceDeep,
    tableHead: CLINICAL_BRIEFING.color.iceMid,
  },

  accent: {
    core: CLINICAL_BRIEFING.color.accent,
    deep: "#254E94",
    mid: "#3A6FA8",
    light: "#6A94C4",
    ice: CLINICAL_BRIEFING.color.iceDeep,
    glow: "rgba(47, 99, 183, 0.12)",
    glowSoft: "rgba(47, 99, 183, 0.06)",
    iconGradient: "linear-gradient(145deg, #4A7BB5 0%, #2F63B7 100%)",
    navActive: CLINICAL_BRIEFING.color.accent,
    chartBar: "linear-gradient(180deg, #254E94 0%, #2F63B7 100%)",
    chartBarSoft: "linear-gradient(180deg, #A8BFD4 0%, #DCE8F5 100%)",
    chartStripe:
      "repeating-linear-gradient(-45deg, #4A7BB5, #4A7BB5 3px, #B8CDE0 3px, #B8CDE0 6px)",
    arc: ["#254E94", "#2F63B7", "#6A94C4"] as const,
    arcSoft: ["#B8CDE0", "#DCE8F5"] as const,
  },

  text: {
    primary: CLINICAL_BRIEFING.color.textPrimary,
    secondary: CLINICAL_BRIEFING.color.textSecondary,
    muted: CLINICAL_BRIEFING.color.textMuted,
    faint: CLINICAL_BRIEFING.color.textFaint,
    brand: CLINICAL_BRIEFING.color.textPrimary,
  },

  border: {
    whisper: "rgba(255, 255, 255, 0.9)",
    soft: CLINICAL_BRIEFING.color.borderSoft,
    focus: "rgba(47, 99, 183, 0.35)",
  },

  /* —— Depth —— */
  shadow: {
    island: CLINICAL_BRIEFING.shadow.card,
    card: CLINICAL_BRIEFING.shadow.card,
    cardLift: CLINICAL_BRIEFING.shadow.lift,
    sidebar: "0 4px 20px rgba(10, 16, 24, 0.06)",
    glowFocus: "0 0 0 3px rgba(61, 109, 153, 0.12)",
    cardPrimary: CLINICAL_BRIEFING.shadow.card,
    cardQuiet: CLINICAL_BRIEFING.shadow.card,
  },

  /* —— Sidebar rail —— */
  sidebar: {
    width: 108,
    radius: "44px",
    glass: "rgba(250, 251, 252, 0.94)",
    flow: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(240,242,245,0.95) 100%)",
    edgeGlow: "none",
    iconIdle: "#8A96A3",
    iconActive: CLINICAL_BRIEFING.color.accent,
    navActiveSolid: CLINICAL_BRIEFING.color.clinicalBlue,
    navActiveGlass: "rgba(255, 255, 255, 0.35)",
    navActiveGlow: "0 0 0 1px rgba(19, 35, 55, 0.08)",
  },

  /* —— Radius —— */
  radius: {
    sm: "12px",
    md: "18px",
    lg: "24px",
    xl: "32px",
    island: "48px",
    pill: "9999px",
  },

  /* —— Spacing rhythm —— */
  space: {
    breath: "32px",
    section: "28px",
    cardPad: "24px",
    contentMax: 1340,
  },

  status: {
    urgent: { bg: CLINICAL_BRIEFING.color.dangerBg, text: "#7A3535", dot: CLINICAL_BRIEFING.color.danger },
    active: { bg: CLINICAL_BRIEFING.status.review.bg, text: CLINICAL_BRIEFING.status.review.text, dot: CLINICAL_BRIEFING.status.review.dot },
    calm: { bg: "#EEF2F5", text: "#3D5A6A", dot: "#5A7A8A" },
    done: { bg: CLINICAL_BRIEFING.status.done.bg, text: CLINICAL_BRIEFING.status.done.text, dot: CLINICAL_BRIEFING.status.done.dot },
    pending: { bg: CLINICAL_BRIEFING.status.submitted.bg, text: CLINICAL_BRIEFING.status.submitted.text, dot: CLINICAL_BRIEFING.status.submitted.dot },
  },

  trend: {
    up: "#16A34A",
    neutral: "#5E7389",
  },

  chart: {
    grid: "radial-gradient(circle, #B0C4D6 1px, transparent 1px)",
    areaFade:
      "linear-gradient(180deg, rgba(230,240,250,0.25) 0%, rgba(220,234,246,0.92) 100%)",
    track: "#C5D5E3",
  },
} as const;

/** Legacy HC alias — workspace routes */
export const HC = {
  pageBg: YD.atmosphere.page,
  pageAmbient: YD.atmosphere.pageGradient,
  canvasBg: "#E6EFF8",
  canvasGradient: YD.atmosphere.canvas,
  canvasRadius: YD.radius.island,
  canvasBorder: `1px solid ${YD.border.whisper}`,
  canvasInnerGlow: YD.atmosphere.canvasGlow,

  sidebarWidth: YD.sidebar.width,
  sidebarRadius: YD.sidebar.radius,
  sidebarGlass: YD.sidebar.glass,
  sidebarBorder: YD.border.whisper,
  sidebarFlowGradient: YD.sidebar.flow,
  sidebarEdgeGlow: YD.sidebar.edgeGlow,
  sidebarShadow: YD.shadow.sidebar,

  surface: "#FFFFFF",
  cardGradient: YD.surface.card,
  surfaceMuted: YD.surface.sunken,
  searchBg: "#D6E3EF",
  searchBorder: YD.border.soft,

  primary: YD.accent.core,
  primaryDark: YD.accent.deep,
  primaryDeep: YD.accent.deep,
  primaryNavy: YD.accent.mid,
  primaryLight: YD.accent.light,
  primarySoft: "#D6E8FA",
  primaryIconGradient: YD.accent.iconGradient,
  iconMuted: YD.sidebar.iconIdle,

  chartBar: YD.accent.chartBar,
  chartBarLight: YD.accent.chartBarSoft,
  chartStripe: YD.accent.chartStripe,
  chartDotGrid: YD.chart.grid,
  chartAreaFade: YD.chart.areaFade,

  arcTrack: YD.chart.track,
  arcGradientMain: YD.accent.arc,
  arcGradientLight: YD.accent.arcSoft,

  text: YD.text.primary,
  textSecondary: YD.text.secondary,
  textMuted: YD.text.muted,
  wordmark: YD.text.brand,

  border: "#CBD5E1",
  borderSoft: YD.border.soft,
  cardShadow: YD.shadow.card,
  cardShadowHover: YD.shadow.cardLift,

  trendUp: YD.trend.up,
  trendMuted: YD.trend.neutral,

  statusHospital: YD.status.urgent,
  statusConsultation: YD.status.active,
  statusHealthy: YD.status.done,
  statusPending: YD.status.pending,

  contentMaxWidth: YD.space.contentMax,
  cardRadius: YD.radius.lg,
  pillRadius: YD.radius.pill,
  inputRadius: YD.radius.pill,
} as const;

export const HC_SIDEBAR_WIDTH_PX = HC.sidebarWidth;
