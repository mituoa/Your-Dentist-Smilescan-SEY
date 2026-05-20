/**
 * Your Dentist — Motion (premium clinical, calm).
 */
export const YD_MOTION = {
  duration: {
    instant: 120,
    fast: 200,
    normal: 320,
    slow: 480,
    ambient: 640,
  },
  ease: {
    soft: "cubic-bezier(0.22, 1, 0.36, 1)",
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 0.2, 1)",
    glow: "cubic-bezier(0.33, 0, 0.2, 1)",
  },
} as const;

export function ydTransition(
  props = "opacity, transform, box-shadow, background-color, border-color",
  durationMs: number = YD_MOTION.duration.normal
): string {
  return `${props} ${durationMs}ms ${YD_MOTION.ease.soft}`;
}
