/**
 * 메인 레이아웃: 네비게이션 바 + 컨텐츠
 * Noir Luxe theme — projector ambience, amber accents
 */
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { NavigationBar } from '@/components/common/NavigationBar';
import { NavigationLogger } from '@/components/common/NavigationLogger';
import { Footer } from '@/components/common/Footer';
import { pageTransition } from '@/lib/transitions';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="projector-ambience flex min-h-screen flex-col bg-noir-bg text-noir-text">
      <NavigationLogger />
      <NavigationBar />
      <main className="container mx-auto flex-1 px-4 py-6">
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
      <Footer />
    </div>
  );
}
