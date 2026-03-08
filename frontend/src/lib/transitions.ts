/**
 * 페이지·모달 전환 Framer Motion variants
 */
import type { Variants } from 'framer-motion';

/** 일반 페이지 전환: fade + slideUp */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** 모달 전환: scale + backdrop */
export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/** 모달 백드롭(오버레이) */
export const backdropTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** 슬라이드 업 (바텀 시트 등) */
export const slideUpTransition: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};
