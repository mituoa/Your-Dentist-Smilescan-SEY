/**
 * Your Dentist — Premium Medical OS Design System (YD)
 * Atmospheric, icy, luminous — NOT generic enterprise SaaS.
 */
export const YD = {
  /* —— Atmosphere —— */
  atmosphere: {
    page: "#9AABB9",
    pageGradient:
      "radial-gradient(ellipse 90% 70% at 82% 0%, rgba(47,128,237,0.18) 0%, transparent 55%), radial-gradient(ellipse 55% 50% at 8% 92%, rgba(125,211,252,0.08) 0%, transparent 50%), linear-gradient(165deg, #A3B3C2 0%, #8E9EAE 100%)",
    canvas:
      "linear-gradient(168deg, #F2F7FC 0%, #E6EFF8 42%, #DAE8F4 100%)",
    canvasGlow:
      "radial-gradient(ellipse 85% 55% at 92% 8%, rgba(91,156,245,0.12) 0%, transparent 58%)",
    vignette:
      "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(30,58,95,0.06) 0%, transparent 55%)",
  },

  /* —— Surfaces (never pure #FFF page bg) —— */
  surface: {
    island: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,252,255,0.88) 100%)",
    card:
      "linear-gradient(165deg, #FFFFFF 0%, #F6FAFE 48%, #EDF4FA 100%)",
    cardPrimary:
      "linear-gradient(168deg, #FFFFFF 0%, #F9FCFF 38%, #E8F3FC 100%)",
    cardQuiet:
      "linear-gradient(165deg, #F9FBFD 0%, #F0F6FB 52%, #E8F0F8 100%)",
    cardHover:
      "linear-gradient(165deg, #FFFFFF 0%, #F8FBFE 55%, #F0F7FD 100%)",
    elevated:
      "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(241,248,255,0.94) 100%)",
    sunken: "#D8E4EF",
    search: "linear-gradient(180deg, #E2EBF4 0%, #D6E3EF 100%)",
    tableHead: "linear-gradient(180deg, #EEF4FA 0%, #E6EEF6 100%)",
  },

  /* —— Luminous blue (not corporate #2563eb flat) —— */
  accent: {
    core: "#2F80ED",
    deep: "#1A4F9C",
    mid: "#2563EB",
    light: "#7EB8FF",
    ice: "#B8DCFF",
    glow: "rgba(47, 128, 237, 0.35)",
    glowSoft: "rgba(125, 211, 252, 0.22)",
    iconGradient: "linear-gradient(145deg, #6BA8F5 0%, #2F80ED 42%, #1A4F9C 100%)",
    navActive: "linear-gradient(180deg, #4A9AF0 0%, #2F80ED 48%, #1E5BB8 100%)",
    chartBar: "linear-gradient(180deg, #1A4F9C 0%, #2F80ED 38%, #6BA8F5 100%)",
    chartBarSoft: "linear-gradient(180deg, #7EB8FF 0%, #B8DCFF 100%)",
    chartStripe:
      "repeating-linear-gradient(-45deg, #4A90E8, #4A90E8 3px, #8EC0FA 3px, #8EC0FA 6px)",
    arc: ["#1A4F9C", "#2F80ED", "#6BA8F5"] as const,
    arcSoft: ["#93C5FD", "#C7E2FF"] as const,
  },

  /* —— Typography colors —— */
  text: {
    primary: "#0C1929",
    secondary: "#3D5266",
    muted: "#5E7389",
    faint: "#8BA3B8",
    brand: "#0F172A",
  },

  /* —— Borders (soft, rarely harsh) —— */
  border: {
    whisper: "rgba(255, 255, 255, 0.72)",
    soft: "rgba(180, 198, 218, 0.55)",
    focus: "rgba(47, 128, 237, 0.45)",
  },

  /* —— Depth —— */
  shadow: {
    island:
      "0 16px 48px rgba(15, 35, 58, 0.14), 0 4px 16px rgba(47, 128, 237, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
    card:
      "0 2px 4px rgba(15, 35, 58, 0.04), 0 12px 36px rgba(30, 91, 189, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
    cardLift:
      "0 8px 28px rgba(30, 91, 189, 0.14), 0 2px 8px rgba(15, 35, 58, 0.06)",
    sidebar:
      "0 14px 48px rgba(15, 35, 58, 0.16), 0 6px 20px rgba(47, 128, 237, 0.1), inset 0 1px 0 rgba(255,255,255,0.65)",
    glowFocus: "0 0 0 1px rgba(255,255,255,0.5), 0 0 28px rgba(47,128,237,0.2)",
    cardPrimary:
      "0 4px 6px rgba(15,35,58,0.03), 0 16px 44px rgba(47,128,237,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
    cardQuiet:
      "0 2px 4px rgba(15,35,58,0.03), 0 8px 24px rgba(30,91,189,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
  },

  /* —— Sidebar rail —— */
  sidebar: {
    width: 108,
    radius: "44px",
    glass: "rgba(252, 254, 255, 0.48)",
    flow:
      "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(228,240,252,0.9) 38%, rgba(200,220,240,0.98) 100%)",
    edgeGlow:
      "linear-gradient(180deg, transparent 0%, rgba(47,128,237,0.14) 50%, rgba(30,91,189,0.28) 100%)",
    iconIdle: "#6B849C",
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

  /* —— Status (medical, soft pills) —— */
  status: {
    urgent: { bg: "#FEE8E8", text: "#B91C1C", dot: "#EF4444" },
    active: { bg: "#E0EDFE", text: "#1D4ED8", dot: "#3B82F6" },
    calm: { bg: "#E0F2F5", text: "#0E7490", dot: "#06B6D4" },
    done: { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
    pending: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B" },
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
