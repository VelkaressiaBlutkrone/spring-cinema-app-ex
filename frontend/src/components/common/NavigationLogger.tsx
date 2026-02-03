/**
 * 화면 이동 시 로그 출력 (MainLayout / AdminLayout에서 사용)
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logNavigation } from '@/utils/logger';

export function NavigationLogger({ isAdmin = false }: { isAdmin?: boolean }) {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const to = location.pathname + location.search;
    const from = prevPathRef.current ?? '(최초)';
    if (prevPathRef.current !== null) {
      logNavigation(from, to, isAdmin);
    }
    prevPathRef.current = to;
  }, [location.pathname, location.search, isAdmin]);

  return null;
}
