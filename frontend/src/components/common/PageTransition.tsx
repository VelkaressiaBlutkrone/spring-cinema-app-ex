/**
 * 페이지 전환 애니메이션 래퍼
 * Outlet 내부 페이지에 fade + slideUp 진입 애니메이션 적용
 */
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/transitions';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
