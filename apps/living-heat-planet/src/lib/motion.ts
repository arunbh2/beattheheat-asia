/** Motion tokens (documented in docs/DESIGN.md). Starting values chosen for this build, not measured from any reference. */
export const MOTION = {
  idleSpinRadS: 0.025,      // gentle idle rotation, within 0.015–0.04 rad/s
  inertiaLambda: 3.2,       // velocity *= exp(-λ·dt): a fling settles in about a second
  maxFlingRadS: 4.5,        // caps an accidental hard flick
  focusMinS: 0.9, focusMaxS: 1.8, focusReducedS: 0.2,
  uiMs: 280,                // panels and drawers
  uiReducedMs: 0,
} as const;
