/**
 * 결제 페이지 — Noir Luxe theme
 * 경로: /payment/:screeningId — state로 heldSeats, screening 전달
 * 인증은 ProtectedRoute에서 보장됨
 */
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { NoirCard } from '@/components/common/NoirCard';
import { NoirButton } from '@/components/common/NoirButton';
import { PaymentSuccess } from '@/components/payment/PaymentSuccess';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { logReservationComplete } from '@/utils/logger';
import type { Screening } from '@/types/movie.types';
import type { PaymentMethod, PaymentResponse } from '@/types/reservation.types';

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
  const location = useLocation();
  const { showSuccess, showError } = useToast();

  const id = screeningId ? Number(screeningId) : null;
  const [screening, setScreening] = useState<Screening | null>(null);
  const [heldSeats, setHeldSeats] = useState<HeldSeatItem[]>([]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CARD');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    const state = location.state as
      | {
          screening?: Screening;
          heldSeats?: HeldSeatItem[];
        }
      | undefined;
    if (state?.screening) setScreening(state.screening);
    if (state?.heldSeats?.length) setHeldSeats(state.heldSeats);
  }, [location.state]);

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
        logReservationComplete(id, data.reservationNo, heldSeats.length);
      }
    } catch (e) {
      showError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (id == null) {
    return (
      <div className="py-12 text-center text-noir-text-muted">
        <p>상영 정보가 없습니다.</p>
        <Link to="/movies" className="mt-4 inline-block text-amber hover:underline">
          영화 목록으로
        </Link>
      </div>
    );
  }

  if (heldSeats.length === 0 && !result) {
    return (
      <div className="py-12 text-center text-noir-text-muted">
        <p>선택한 좌석 정보가 없습니다. 좌석 선택 후 결제해 주세요.</p>
        <NoirButton to={`/book/${id}`} className="mt-4">
          좌석 선택으로
        </NoirButton>
      </div>
    );
  }

  if (result) {
    return <PaymentSuccess result={result} />;
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-6 font-display text-2xl tracking-widest text-noir-text">결제</h1>

      <NoirCard className="mb-6">
        <h2 className="mb-3 font-medium text-noir-text">예매 정보</h2>
        {screening && (
          <div className="mb-3 space-y-1 text-sm text-noir-text-muted">
            <p className="font-medium text-noir-text">{screening.movieTitle}</p>
            <p>
              {screening.screenName} · {formatDate(screening.startTime, 'YYYY-MM-DD HH:mm')}
            </p>
          </div>
        )}
        <div>
          <p className="mb-1 text-sm font-medium text-noir-text-muted">좌석 ({heldSeats.length}석)</p>
          <p className="text-noir-text">
            {heldSeats.map((s) => `${s.rowLabel}-${s.seatNo}`).join(', ')}
          </p>
        </div>
        <p className="mt-3 text-xs text-noir-text-muted">
          총 결제 금액은 결제 완료 시 확정된 금액으로 표시됩니다.
        </p>
      </NoirCard>

      <NoirCard className="mb-6">
        <h2 className="mb-3 font-medium text-noir-text">결제 수단</h2>
        <div className="flex flex-wrap gap-2">
          {PAY_METHOD_OPTIONS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPayMethod(method)}
              className={`rounded-sm border px-4 py-2 text-sm font-medium transition ${
                payMethod === method
                  ? 'border-amber bg-amber text-noir-bg'
                  : 'border-noir-border bg-noir-surface text-noir-text-muted hover:bg-amber-subtle hover:text-noir-text'
              }`}
            >
              {PAY_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </NoirCard>

      <div className="flex flex-wrap items-center gap-4">
        <NoirButton onClick={handlePay} disabled={loading}>
          {loading ? '결제 처리 중...' : '결제하기'}
        </NoirButton>
        <NoirButton to={`/book/${id}`} variant="ghost">
          좌석 다시 고르기
        </NoirButton>
      </div>

      {loading && (
        <div className="mt-6 flex justify-center">
          <LoadingSpinner size="md" message="결제 처리 중..." />
        </div>
      )}
    </div>
  );
}
