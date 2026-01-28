/**
 * 결제 페이지 (Step 11에서 전체 구현)
 * 경로: /payment/:screeningId — state로 heldSeats, screening 전달
 */
import { useParams, Link } from 'react-router-dom';

export function PaymentPage() {
  const { screeningId } = useParams<{ screeningId: string }>();

  return (
    <div className="py-12 text-center">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">결제</h1>
      <p className="mb-6 text-gray-600">
        결제 기능은 Step 11에서 구현됩니다. (상영 ID: {screeningId})
      </p>
      <Link
        to={screeningId ? `/book/${screeningId}` : '/movies'}
        className="text-indigo-600 hover:underline"
      >
        ← 좌석 선택으로 돌아가기
      </Link>
    </div>
  );
}
