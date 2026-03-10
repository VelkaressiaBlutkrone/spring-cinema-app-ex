import type { Variants, Transition } from 'framer-motion';

// --- Film Easing Curves ---

export const filmEnter: number[] = [0.0, 0.0, 0.2, 1.0];
export const filmExit: number[] = [0.4, 0.0, 1.0, 1.0];
export const filmAccent: number[] = [0.16, 1.0, 0.3, 1.0];
export const filmDramatic: number[] = [0.0, 0.0, 0.0, 1.0];

export const defaultTransition: Transition = {
  duration: 0.4,
  ease: filmEnter,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: filmEnter },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: filmEnter },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const openingCredits: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export const openingCreditsChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: filmDramatic },
  },
};

export const cardHover = {
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const cardTap = {
  scale: 0.99,
  transition: { duration: 0.15 },
};

export const buttonHover = {
  y: -1,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const dividerExpand: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: filmEnter },
  },
};
