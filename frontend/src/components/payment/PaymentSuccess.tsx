/**
 * 결제 완료 화면 — PaymentPage에서 분리
 */
import { GlassCard } from '@/components/common/GlassCard';
import { NoirButton } from '@/components/common/NoirButton';
import { formatPrice } from '@/utils/formatters';
import type { PaymentResponse } from '@/types/reservation.types';

interface PaymentSuccessProps {
  readonly result: PaymentResponse;
}

export function PaymentSuccess({ result }: PaymentSuccessProps) {
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
          <NoirButton to="/reservations">예매 내역</NoirButton>
          <NoirButton to="/movies" variant="ghost">
            영화 목록
          </NoirButton>
        </div>
      </GlassCard>
    </div>
  );
}
