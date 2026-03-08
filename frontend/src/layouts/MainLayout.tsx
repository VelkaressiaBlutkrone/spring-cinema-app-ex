/**
 * 메인 레이아웃: 네비게이션 바 + 컨텐츠
 * 2026 Cinematic theme (dark, glassmorphism, neon accents)
 * Lightning Dark: 커서 위치에 미세 글로우 효과
 */
import { useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { NavigationBar } from '@/components/common/NavigationBar';
import { NavigationLogger } from '@/components/common/NavigationLogger';
import { pageTransition } from '@/lib/transitions';

export function MainLayout() {
  const location = useLocation();
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (glowRef.current) {
        glowRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        glowRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
      rafRef.current = 0;
    });
  }, []);

  return (
    <div
      ref={glowRef}
      className="lightning-dark min-h-screen bg-cinema-bg text-cinema-text"
      onMouseMove={handleMouseMove}
    >
      <NavigationLogger />
      <NavigationBar />
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
