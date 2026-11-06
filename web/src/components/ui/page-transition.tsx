import { useReducedMotion } from "motion/react";
/** Small vertical slide and perspective tilt; never animate document height. */
export function useSurfaceMotion() {
  const reduced = useReducedMotion();
  return {
    initial: reduced ? (false as const) : { opacity: 0, y: 16, rotateX: 1 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    exit: reduced ? { opacity: 1 } : { opacity: 0, y: -8, rotateX: -0.5 },
    transition: {
      duration: reduced ? 0 : 0.24,
      ease: [0.22, 1, 0.36, 1] as const,
    },
    style: { transformOrigin: "50% 10%" },
  };
}
