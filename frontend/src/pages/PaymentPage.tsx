/**
 * 결제 페이지 — cinema theme
 * 경로: /payment/:screeningId — state로 heldSeats, screening 전달
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
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
    const state = location.state as
      | {
          screening?: Screening;
          heldSeats?: HeldSeatItem[];
        }
      | undefined;
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
      <div className="py-12 text-center text-cinema-muted">
        <p>상영 정보가 없습니다.</p>
        <Link to="/movies" className="mt-4 inline-block text-cinema-neon-blue hover:underline">
          영화 목록으로
        </Link>
      </div>
    );
  }

  if (heldSeats.length === 0 && !result) {
    return (
      <div className="py-12 text-center text-cinema-muted">
        <p>선택한 좌석 정보가 없습니다. 좌석 선택 후 결제해 주세요.</p>
        <NeonButton to={`/book/${id}`} className="mt-4">
          좌석 선택으로
        </NeonButton>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <GlassCard>
          <h1 className="mb-6 font-display text-2xl tracking-widest text-cinema-text">예매 완료</h1>
          <div className="space-y-4">
            <p className="rounded-xl border border-cinema-neon-blue/30 bg-cinema-neon-blue/10 px-4 py-3 text-cinema-neon-blue">
              예매가 완료되었습니다. 예매 번호를 확인해 주세요.
            </p>
            <dl className="grid gap-2 sm:grid-cols-[auto_1fr]">
              <dt className="font-medium text-cinema-muted">예매 번호</dt>
              <dd className="font-mono font-semibold text-cinema-neon-blue">
                {result.reservationNo}
              </dd>
              <dt className="font-medium text-cinema-muted">좌석 수</dt>
              <dd className="text-cinema-text">{result.totalSeats}석</dd>
              <dt className="font-medium text-cinema-muted">총 결제 금액</dt>
              <dd className="font-semibold text-cinema-neon-amber">
                {formatPrice(result.totalAmount)}
              </dd>
            </dl>
          </div>
          <div className="mt-8 flex gap-3">
            <NeonButton to="/reservations">예매 내역</NeonButton>
            <NeonButton to="/movies" variant="ghost">
              영화 목록
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-6 font-display text-2xl tracking-widest text-cinema-text">결제</h1>

      <GlassCard className="mb-6">
        <h2 className="mb-3 font-medium text-cinema-text">예매 정보</h2>
        {screening && (
          <div className="mb-3 space-y-1 text-sm text-cinema-muted">
            <p className="font-medium text-cinema-text">{screening.movieTitle}</p>
            <p>
              {screening.screenName} · {formatDate(screening.startTime, 'YYYY-MM-DD HH:mm')}
            </p>
          </div>
        )}
        <div>
          <p className="mb-1 text-sm font-medium text-cinema-muted">좌석 ({heldSeats.length}석)</p>
          <p className="text-cinema-text">
            {heldSeats.map((s) => `${s.rowLabel}-${s.seatNo}`).join(', ')}
          </p>
        </div>
        <p className="mt-3 text-xs text-cinema-muted-dark">
          총 결제 금액은 결제 완료 시 확정된 금액으로 표시됩니다.
        </p>
      </GlassCard>

      <GlassCard className="mb-6">
        <h2 className="mb-3 font-medium text-cinema-text">결제 수단</h2>
        <div className="flex flex-wrap gap-2">
          {PAY_METHOD_OPTIONS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPayMethod(method)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                payMethod === method
                  ? 'border-cinema-neon-blue bg-cinema-neon-blue text-cinema-bg'
                  : 'border-cinema-glass-border bg-cinema-surface text-cinema-muted hover:bg-cinema-glass hover:text-cinema-text'
              }`}
            >
              {PAY_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="flex flex-wrap items-center gap-4">
        <NeonButton onClick={handlePay} disabled={loading}>
          {loading ? '결제 처리 중...' : '결제하기'}
        </NeonButton>
        <NeonButton to={`/book/${id}`} variant="ghost">
          좌석 다시 고르기
        </NeonButton>
      </div>

      {loading && (
        <div className="mt-6 flex justify-center">
          <LoadingSpinner size="md" message="결제 처리 중..." />
        </div>
      )}
    </div>
  );
}
