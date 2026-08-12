import { Variants } from "framer-motion";

/**
 * Standard transition configurations for consistent physics-based animation.
 */
export const transitions = {
  default: { type: "spring", stiffness: 300, damping: 30 },
  slow: { type: "spring", stiffness: 180, damping: 26 },
  smooth: { type: "tween", ease: [0.25, 0.1, 0.25, 1.0], duration: 0.3 },
  fast: { type: "spring", stiffness: 450, damping: 35 },
};

/**
 * Fade In animation variants
 */
export const fadeIn = (duration = 0.2): Variants => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration, ease: "easeIn" } },
});

/**
 * Fade Up animation variants with slight translation
 */
export const fadeUp = (distance = 12, duration = 0.3): Variants => ({
  initial: { opacity: 0, y: distance },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 260, damping: 26 } 
  },
  exit: { opacity: 0, y: distance, transition: { duration, ease: "easeIn" } },
});

/**
 * Scale In animation variants
 */
export const scaleIn = (scale = 0.96, duration = 0.2): Variants => ({
  initial: { opacity: 0, scale },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 300, damping: 28 } 
  },
  exit: { opacity: 0, scale, transition: { duration, ease: "easeIn" } },
});

/**
 * Slide In animation variants
 */
export const slideIn = (
  direction: "left" | "right" | "top" | "bottom" = "left", 
  distance = 24
): Variants => {
  const x = direction === "left" ? -distance : direction === "right" ? distance : 0;
  const y = direction === "top" ? -distance : direction === "bottom" ? distance : 0;
  
  return {
    initial: { opacity: 0, x, y },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      transition: { type: "spring", stiffness: 280, damping: 28 } 
    },
    exit: { 
      opacity: 0, 
      x, 
      y, 
      transition: { duration: 0.2, ease: "easeIn" } 
    },
  };
};

/**
 * Page level transition variants
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 280, damping: 30 } 
  },
  exit: { 
    opacity: 0, 
    y: -6, 
    transition: { duration: 0.15, ease: "easeInOut" } 
  },
};
