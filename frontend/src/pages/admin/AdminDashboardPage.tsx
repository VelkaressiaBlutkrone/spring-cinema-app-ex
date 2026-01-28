/**
 * 관리자 대시보드
 */
import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">관리자 대시보드</h1>
      <p className="mb-6 text-gray-600">
        아래 메뉴에서 영화, 영화관, 상영관, 상영 스케줄, 좌석을 관리할 수 있습니다.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          to="/admin/movies"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          영화 관리
        </Link>
        <Link
          to="/admin/theaters"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          영화관 관리
        </Link>
        <Link
          to="/admin/screens"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          상영관 관리
        </Link>
        <Link
          to="/admin/screenings"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          상영 스케줄
        </Link>
        <Link
          to="/admin/seats"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          좌석 관리
        </Link>
      </div>
    </div>
  );
}
