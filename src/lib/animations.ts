/**
 * Animation System for Studio Boss
 * 
 * Provides consistent animation variants for Framer Motion
 * and CSS transitions. Use these instead of ad-hoc animation values.
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Duration tokens (in seconds)
 */
export const durations = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  page: 0.35,
} as const;

/**
 * Easing curves
 */
export const easings = {
  default: [0.25, 0.1, 0.25, 1],      // ease
  in: [0.42, 0, 1, 1],                // ease-in
  out: [0, 0, 0.58, 1],               // ease-out
  inOut: [0.42, 0, 0.58, 1],          // ease-in-out
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
} as const;

/**
 * Standard transition presets
 */
export const transitions = {
  fast: {
    duration: durations.fast,
    ease: easings.default,
  },
  normal: {
    duration: durations.normal,
    ease: easings.default,
  },
  slow: {
    duration: durations.slow,
    ease: easings.out,
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  bounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
  },
};

/**
 * Page transition variants
 * Use for hub-to-hub navigation
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.page,
      ease: easings.out,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: durations.fast,
      ease: easings.in,
    },
  },
};

/**
 * Sub-tab transition variants
 * Use for switching between sub-tabs within a hub
 */
export const subTabTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.out,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: durations.fast,
      ease: easings.in,
    },
  },
};

/**
 * Fade transition (simple opacity)
 */
export const fadeTransition: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.default,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Scale fade transition (for modals, popovers)
 */
export const scaleFadeTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      ...transitions.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * List item transition (for individual list items)
 */
export const listItemTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.out,
    },
  },
};

/**
 * Stagger container for lists
 * Use with list items for cascading animations
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger item (for use within staggerContainer)
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.out,
    },
  },
};

/**
 * Card hover animation (for interactive cards)
 */
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: durations.fast,
      ease: easings.default,
    },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

/**
 * Button tap animation
 */
export const buttonTap = {
  scale: 0.95,
  transition: {
    duration: durations.fast,
  },
};

/**
 * Slide in from specific direction
 */
export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'right'): Variants => {
  const directions = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
  };

  return {
    initial: {
      opacity: 0,
      ...directions[direction],
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: durations.normal,
        ease: easings.out,
      },
    },
  };
};

/**
 * Pulse animation for loading/skeleton states
 */
export const pulseAnimation = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Layout animation for reordering lists
 */
export const layoutAnimation = {
  layout: true,
  transition: {
    duration: durations.normal,
    ease: easings.spring,
  },
};

/**
 * Animate number count-up configuration
 */
export const countUpTransition = {
  duration: durations.slow,
  ease: easings.out,
};

/**
 * CSS class strings for quick Tailwind transitions
 * Use when Framer Motion is overkill
 */
export const cssTransitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-250 ease-in-out',
  slow: 'transition-all duration-400 ease-out',
  colors: 'transition-colors duration-150',
  transform: 'transition-transform duration-200',
  opacity: 'transition-opacity duration-200',
};

/**
 * Animation presets by use case
 */
export const presets = {
  page: pageTransition,
  subTab: subTabTransition,
  fade: fadeTransition,
  scaleFade: scaleFadeTransition,
  listItem: listItemTransition,
  stagger: {
    container: staggerContainer,
    item: staggerItem,
  },
  card: cardHover,
  button: buttonTap,
  slide: slideIn,
  pulse: pulseAnimation,
  layout: layoutAnimation,
};
