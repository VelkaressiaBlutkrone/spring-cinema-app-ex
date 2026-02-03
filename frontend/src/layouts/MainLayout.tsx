/**
 * 메인 레이아웃: 네비게이션 바 + 컨텐츠
 * 2026 Cinematic theme (dark, glassmorphism, neon accents)
 */
import { Outlet } from 'react-router-dom';
import { NavigationBar } from '@/components/common/NavigationBar';
import { NavigationLogger } from '@/components/common/NavigationLogger';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-text">
      <NavigationLogger />
      <NavigationBar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
