/**
 * 메인 레이아웃: 네비게이션 바 + 컨텐츠
 */
import { Outlet } from 'react-router-dom';
import { NavigationBar } from '@/components/common/NavigationBar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
