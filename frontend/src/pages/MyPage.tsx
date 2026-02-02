/**
 * 마이페이지 — cinema theme
 * 탭: 내 정보 / 장바구니 / 결제·예매 내역
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { membersApi } from '@/api/members';
import { reservationsApi } from '@/api/reservations';
import { seatsApi } from '@/api/seats';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/formatters';
import type { MemberProfileResponse, MemberUpdateRequest, MemberHoldSummaryResponse } from '@/types/member.types';
import type { ReservationDetailResponse } from '@/types/reservation.types';

type TabId = 'profile' | 'holds' | 'reservations';

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: '내 정보' },
  { id: 'holds', label: '장바구니' },
  { id: 'reservations', label: '결제/예매 내역' },
];

export function MyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [tab, setTab] = useState<TabId>('profile');

  // 내 정보
  const [profile, setProfile] = useState<MemberProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<MemberUpdateRequest>({});
  const [profileSaving, setProfileSaving] = useState(false);

  // 장바구니
  const [holds, setHolds] = useState<MemberHoldSummaryResponse[]>([]);
  const [holdsLoading, setHoldsLoading] = useState(false);
  const [releasing, setReleasing] = useState<{ key: string } | null>(null);

  // 예매 내역
  const [reservations, setReservations] = useState<ReservationDetailResponse[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/mypage' } });
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (tab === 'profile') {
      setProfileLoading(true);
      membersApi
        .getProfile()
        .then((p) => {
          setProfile(p);
          setProfileForm({ email: p.email ?? '', phone: p.phone ?? '' });
        })
        .catch((e) => showError(getErrorMessage(e)))
        .finally(() => setProfileLoading(false));
    } else if (tab === 'holds') {
      setHoldsLoading(true);
      membersApi
        .getMyHolds()
        .then(setHolds)
        .catch((e) => showError(getErrorMessage(e)))
        .finally(() => setHoldsLoading(false));
    } else if (tab === 'reservations') {
      setReservationsLoading(true);
      reservationsApi
        .getMyReservations()
        .then((res) => (res.data ? setReservations(res.data) : setReservations([])))
        .catch((e) => showError(getErrorMessage(e)))
        .finally(() => setReservationsLoading(false));
    }
  }, [isAuthenticated, tab, showError]);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const body: MemberUpdateRequest = {};
      if (profileForm.password?.trim()) body.password = profileForm.password.trim();
      if (profileForm.email !== undefined) body.email = profileForm.email.trim() || undefined;
      if (profileForm.phone !== undefined) body.phone = profileForm.phone.trim() || undefined;
      await membersApi.updateProfile(body);
      showSuccess('저장되었습니다.');
      const p = await membersApi.getProfile();
      setProfile(p);
      setProfileForm({ email: p.email ?? '', phone: p.phone ?? '' });
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleReleaseHold = async (screeningId: number, seatId: number, holdToken: string) => {
    const key = `${screeningId}-${seatId}`;
    setReleasing({ key });
    try {
      await seatsApi.releaseHold({ screeningId, seatId, holdToken });
      showSuccess('좌석이 해제되었습니다.');
      setHolds((prev) =>
        prev
          .map((h) =>
            h.screeningId === screeningId
              ? { ...h, seats: h.seats.filter((s) => s.seatId !== seatId) }
              : h
          )
          .filter((h) => h.seats.length > 0)
      );
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setReleasing(null);
    }
  };

  if (!isAuthenticated) return null;

  const inputClass =
    'w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-3 text-cinema-text placeholder:text-cinema-muted-dark focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue';

  return (
    <div className="py-6">
      <h1 className="mb-6 font-display text-2xl tracking-widest text-cinema-text">마이페이지</h1>

      <div className="mb-6 flex gap-1 border-b border-cinema-glass-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative px-4 py-3 text-sm font-medium transition ${
              tab === id ? 'text-cinema-neon-blue' : 'text-cinema-muted hover:text-cinema-text'
            }`}
          >
            {label}
            {tab === id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-neon-blue"
                style={{ boxShadow: '0 0 8px var(--color-cinema-neon-blue)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 내 정보 */}
      {tab === 'profile' && (
        <>
          {profileLoading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <LoadingSpinner size="lg" message="내 정보를 불러오는 중..." />
            </div>
          ) : profile ? (
            <GlassCard className="max-w-xl">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label htmlFor="profile-loginId" className="mb-1 block text-sm font-medium text-cinema-muted">
                    아이디
                  </label>
                  <input
                    id="profile-loginId"
                    type="text"
                    value={profile.loginId}
                    readOnly
                    className={inputClass + ' cursor-not-allowed opacity-80'}
                    aria-readonly
                  />
                </div>
                <div>
                  <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-cinema-muted">
                    이름
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profile.name}
                    readOnly
                    className={inputClass + ' cursor-not-allowed opacity-80'}
                    aria-readonly
                  />
                </div>
                <div>
                  <label htmlFor="profile-password" className="mb-1 block text-sm font-medium text-cinema-muted">
                    새 비밀번호 (변경 시에만 입력)
                  </label>
                  <input
                    id="profile-password"
                    type="password"
                    value={profileForm.password ?? ''}
                    onChange={(e) => setProfileForm((p) => ({ ...p, password: e.target.value }))}
                    className={inputClass}
                    placeholder="비워두면 변경하지 않습니다"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-cinema-muted">
                    이메일
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileForm.email ?? ''}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium text-cinema-muted">
                    연락처
                  </label>
                  <input
                    id="profile-phone"
                    type="text"
                    value={profileForm.phone ?? ''}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <NeonButton type="submit" disabled={profileSaving}>
                  {profileSaving ? '저장 중...' : '저장'}
                </NeonButton>
              </form>
            </GlassCard>
          ) : null}
        </>
      )}

      {/* 장바구니 */}
      {tab === 'holds' && (
        <>
          {holdsLoading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <LoadingSpinner size="lg" message="장바구니를 불러오는 중..." />
            </div>
          ) : holds.length === 0 ? (
            <GlassCard padding={false}>
              <EmptyState
                title="장바구니가 비어 있습니다"
                message="영화 목록에서 좌석을 선택하면 여기에 표시됩니다."
                icon={<span>🪑</span>}
                action={<NeonButton to="/movies">영화 목록</NeonButton>}
              />
            </GlassCard>
          ) : (
            <ul className="space-y-4">
              {holds.map((h) => (
                <li key={h.screeningId}>
                  <GlassCard>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-cinema-text">{h.movieTitle}</p>
                        <p className="text-sm text-cinema-muted">
                          {h.screenName} · {formatDate(h.startTime, 'YYYY-MM-DD HH:mm')}
                        </p>
                        <p className="mt-1 text-sm text-cinema-neon-amber">
                          {h.seats.length}석 · {h.seats.map((s) => s.displayName).join(', ')}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <NeonButton to={`/book/${h.screeningId}`}>결제하기</NeonButton>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1 border-t border-cinema-glass-border pt-3">
                      {h.seats.map((s) => (
                        <li key={s.seatId} className="flex items-center justify-between text-sm">
                          <span className="text-cinema-muted">
                            {s.displayName} (만료: {formatDate(s.holdExpireAt, 'HH:mm')})
                          </span>
                          <button
                            type="button"
                            disabled={releasing?.key === `${h.screeningId}-${s.seatId}`}
                            onClick={() => handleReleaseHold(h.screeningId, s.seatId, s.holdToken)}
                            className="rounded-lg border border-cinema-glass-border px-2 py-1 text-cinema-muted transition hover:bg-cinema-glass-border hover:text-cinema-text disabled:opacity-50"
                          >
                            {releasing?.key === `${h.screeningId}-${s.seatId}` ? '해제 중...' : '해제'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* 결제/예매 내역 */}
      {tab === 'reservations' && (
        <>
          {reservationsLoading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <LoadingSpinner size="lg" message="예매 내역을 불러오는 중..." />
            </div>
          ) : reservations.length === 0 ? (
            <GlassCard padding={false}>
              <EmptyState
                title="예매 내역이 없습니다"
                message="영화 목록에서 상영을 선택해 예매해 보세요."
                icon={<span>🎬</span>}
                action={<NeonButton to="/movies">영화 목록</NeonButton>}
              />
            </GlassCard>
          ) : (
            <ul className="space-y-4">
              {reservations.map((r) => (
                <li key={r.reservationId}>
                  <GlassCard>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-cinema-text">{r.movieTitle}</p>
                        <p className="text-sm text-cinema-muted">
                          {r.screenName} · {formatDate(r.startTime, 'YYYY-MM-DD HH:mm')}
                        </p>
                        <p className="mt-1 font-mono text-sm text-cinema-neon-blue">{r.reservationNo}</p>
                        <p className="mt-1 text-sm text-cinema-neon-amber">
                          {r.totalSeats}석 · {formatPrice(r.totalAmount)}
                        </p>
                        {r.payment && (
                          <p className="mt-1 text-xs text-cinema-muted">
                            결제 {r.payment.payStatus} · {formatPrice(r.payment.payAmount)}
                            {r.payment.paidAt && ` · ${formatDate(r.payment.paidAt, 'YYYY-MM-DD HH:mm')}`}
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/reservations/${r.reservationId}`}
                        className="rounded-lg border border-cinema-glass-border bg-cinema-glass px-3 py-1.5 text-sm font-medium text-cinema-muted transition hover:bg-cinema-glass-border hover:text-cinema-text"
                      >
                        상세
                      </Link>
                    </div>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
