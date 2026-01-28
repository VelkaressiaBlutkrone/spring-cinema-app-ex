/**
 * 결제 페이지 (Step 11)
 * 경로: /payment/:screeningId — state로 heldSeats, screening 전달
 * 가격은 서버에서만 계산·표시 (결제 요청 후 응답으로 표시)
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import type { Screening } from '@/types/movie.types';
import type { PaymentMethod, PaymentResponse } from '@/types/reservation.types';

/** 좌석 선택 페이지에서 전달하는 HOLD 좌석 항목 */
export interface HeldSeatItem {
  seatId: number;
  holdToken: string;
  rowLabel: string;
  seatNo: number;
}

const PAY_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: '신용카드',
  KAKAO_PAY: '카카오페이',
  NAVER_PAY: '네이버페이',
  TOSS: '토스',
  BANK_TRANSFER: '계좌이체',
};

const PAY_METHOD_OPTIONS: PaymentMethod[] = [
  'CARD',
  'KAKAO_PAY',
  'NAVER_PAY',
  'TOSS',
  'BANK_TRANSFER',
];

export function PaymentPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const id = screeningId ? Number(screeningId) : null;
  const [screening, setScreening] = useState<Screening | null>(null);
  const [heldSeats, setHeldSeats] = useState<HeldSeatItem[]>([]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CARD');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    const state = location.state as {
      screening?: Screening;
      heldSeats?: HeldSeatItem[];
    } | undefined;
    if (state?.screening) setScreening(state.screening);
    if (state?.heldSeats?.length) setHeldSeats(state.heldSeats);
  }, [location.state]);

  useEffect(() => {
    if (!isAuthenticated && id != null) {
      navigate('/login', { state: { from: `/payment/${id}` } });
    }
  }, [isAuthenticated, id, navigate]);

  const handlePay = async () => {
    if (id == null || heldSeats.length === 0) {
      showError('결제할 좌석 정보가 없습니다.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await reservationsApi.pay({
        screeningId: id,
        seatHoldItems: heldSeats.map((s) => ({ seatId: s.seatId, holdToken: s.holdToken })),
        payMethod,
      });
      const data = res.data;
      if (data) {
        setResult(data);
        showSuccess('예매가 완료되었습니다.');
      }
    } catch (e) {
      showError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (id == null) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">상영 정보가 없습니다.</p>
        <Link to="/movies" className="mt-4 inline-block text-indigo-600 hover:underline">
          영화 목록으로
        </Link>
      </div>
    );
  }

  if (heldSeats.length === 0 && !result) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">선택한 좌석 정보가 없습니다. 좌석 선택 후 결제해 주세요.</p>
        <Link
          to={`/book/${id}`}
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          좌석 선택으로
        </Link>
      </div>
    );
  }

  /** 결제 완료 화면 */
  if (result) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">예매 완료</h1>
          <div className="space-y-4 text-gray-700">
            <p className="rounded bg-green-50 px-4 py-2 text-green-800">
              예매가 완료되었습니다. 예매 번호를 확인해 주세요.
            </p>
            <dl className="grid gap-2 sm:grid-cols-[auto_1fr]">
              <dt className="font-medium text-gray-600">예매 번호</dt>
              <dd className="font-mono font-semibold text-gray-900">{result.reservationNo}</dd>
              <dt className="font-medium text-gray-600">좌석 수</dt>
              <dd>{result.totalSeats}석</dd>
              <dt className="font-medium text-gray-600">총 결제 금액</dt>
              <dd className="font-semibold text-gray-900">{formatPrice(result.totalAmount)}</dd>
            </dl>
          </div>
          <div className="mt-8 flex gap-3">
            <Link
              to="/reservations"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              예매 내역
            </Link>
            <Link
              to="/movies"
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              영화 목록
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /** 결제 입력 폼 */
  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">결제</h1>

      {/* 예매 정보 요약 */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-gray-800">예매 정보</h2>
        {screening && (
          <div className="mb-3 space-y-1 text-sm text-gray-700">
            <p className="font-medium text-gray-900">{screening.movieTitle}</p>
            <p>{screening.screenName} · {formatDate(screening.startTime, 'YYYY-MM-DD HH:mm')}</p>
          </div>
        )}
        <div>
          <p className="mb-1 text-sm font-medium text-gray-600">좌석 ({heldSeats.length}석)</p>
          <p className="text-gray-800">
            {heldSeats.map((s) => `${s.rowLabel}-${s.seatNo}`).join(', ')}
          </p>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          총 결제 금액은 결제 진행 후 서버에서 계산된 금액으로 표시됩니다.
        </p>
      </div>

      {/* 결제 수단 선택 */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-gray-800">결제 수단 (Mock)</h2>
        <div className="flex flex-wrap gap-2">
          {PAY_METHOD_OPTIONS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPayMethod(method)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                payMethod === method
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {PAY_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </div>

      {/* 결제하기 / 재시도 */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '결제 처리 중...' : '결제하기'}
        </button>
        <Link
          to={`/book/${id}`}
          className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          좌석 다시 고르기
        </Link>
      </div>

      {loading && (
        <div className="mt-6 flex justify-center">
          <LoadingSpinner size="md" message="결제 처리 중..." />
        </div>
      )}
    </div>
  );
}
