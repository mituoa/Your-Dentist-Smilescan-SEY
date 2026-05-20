/**
 * Your Dentist — Spatial OS motion (ambient computing, not web microinteractions).
 */
export const YD_MOTION = {
  duration: {
    /** Barely perceptible state change */
    breath: 180,
    /** Spatial hover / lighting */
    spatial: 720,
    /** Preview emergence */
    reveal: 880,
    /** Layer materialization */
    materialize: 1100,
    /** Full workspace awakening */
    awaken: 4200,
  },
  ease: {
    /** Default spatial — soft deceleration */
    spatial: "cubic-bezier(0.19, 1, 0.32, 1)",
    /** Illumination / glow */
    luminous: "cubic-bezier(0.25, 0.9, 0.35, 1)",
    /** Opacity diffusion */
    diffuse: "cubic-bezier(0.33, 0, 0.15, 1)",
  },
} as const;

export function ydSpatialTransition(
  props = "opacity, box-shadow, filter, background",
  durationMs: number = YD_MOTION.duration.spatial
): string {
  return `${props} ${durationMs}ms ${YD_MOTION.ease.spatial}`;
}

/** @deprecated Use ydSpatialTransition for cards */
export function ydTransition(
  props = "opacity, box-shadow, filter, background",
  durationMs: number = YD_MOTION.duration.spatial
): string {
  return ydSpatialTransition(props, durationMs);
}
