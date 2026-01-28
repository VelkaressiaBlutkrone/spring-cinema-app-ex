/**
 * 관리자 서브 메뉴 placeholder (Step 13에서 구현)
 */
import { useLocation, Link } from 'react-router-dom';

const LABELS: Record<string, string> = {
  movies: '영화 관리',
  theaters: '영화관 관리',
  screens: '상영관 관리',
  screenings: '상영 스케줄',
  seats: '좌석 관리',
};

export function AdminPlaceholderPage() {
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean)[1] ?? '';
  const label = LABELS[segment] ?? '해당 메뉴';

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">{label}</h1>
      <p className="mb-6 text-gray-600">해당 기능은 Step 13에서 구현됩니다.</p>
      <Link to="/admin" className="text-indigo-600 hover:underline">
        ← 대시보드
      </Link>
    </div>
  );
}
