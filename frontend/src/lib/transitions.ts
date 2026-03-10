import type { Variants } from 'framer-motion';
import { filmEnter, filmExit } from './animations';

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: filmExit },
  },
};

export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: filmEnter },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2, ease: filmExit },
  },
};

export const backdropTransition: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const slideUpTransition: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: filmEnter },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.2, ease: filmExit },
  },
};
