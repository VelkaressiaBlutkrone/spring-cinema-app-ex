/**
 * 메인(홈) 페이지
 */
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="py-8">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          영화관 예매 시스템
        </h1>
        <p className="text-gray-600">
          상영 중인 영화를 확인하고 편리하게 예매하세요.
        </p>
      </section>
      <section className="flex flex-wrap justify-center gap-6">
        <Link
          to="/movies"
          className="flex w-64 flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <span className="text-2xl">🎬</span>
          <span className="mt-2 font-semibold text-gray-800">영화 목록</span>
          <span className="mt-1 text-sm text-gray-500">
            상영 중인 영화와 상영 시간표 확인
          </span>
        </Link>
      </section>
    </div>
  );
}
