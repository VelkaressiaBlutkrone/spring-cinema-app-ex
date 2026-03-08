/**
 * 공통 Framer Motion 애니메이션 variants
 * 모든 컴포넌트에서 일관된 애니메이션을 위해 사용
 */
import type { Variants, Transition } from 'framer-motion';

// --- 기본 전환 설정 ---

export const defaultTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 24,
};

// --- 단일 요소 Variants ---

/** opacity 0→1 (300ms) */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/** y:20→0 + opacity (400ms) */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** x:-30→0 + opacity (400ms) */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** x:30→0 + opacity (400ms) */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** scale 0.95→1 + opacity (300ms) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// --- 컨테이너 (Stagger) Variants ---

/** 자식 요소 순차 진입 (50ms 간격) */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** 빠른 stagger (30ms 간격, 그리드용) */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// --- 호버·탭 효과 ---

/** 카드 호버: scale + shadow */
export const cardHover = {
  scale: 1.03,
  transition: { duration: 0.3, ease: 'easeOut' },
};

/** 카드 탭: scale down */
export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.15 },
};

/** 버튼 호버: 미세 y 이동 */
export const buttonHover = {
  y: -2,
  transition: { duration: 0.2, ease: 'easeOut' },
};

/** 버튼 탭: scale down */
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};
