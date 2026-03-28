/**
 * 관리자 - 예매 내역 조회
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { adminReservationsApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { getPageIndex } from '@/types/api.types';
import type { AdminReservationListResponse, AdminReservationStatus } from '@/types/admin.types';
import type { ReservationDetailResponse } from '@/types/reservation.types';

const PAGE_SIZE = 10;
const STATUS_LABEL: Record<AdminReservationStatus, string> = {
  PENDING: '대기',
  PAYMENT_PENDING: '결제 대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
  REFUNDED: '환불',
};

export function AdminReservationsPage() {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AdminReservationListResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetailResponse | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // 필터 상태 (UI 바인딩용)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [movieId, setMovieId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // ref로 필터값 참조 — fetchList의 deps에서 제거하여 필터 변경 시 자동 호출 방지
  const filtersRef = useRef({ startDate, endDate, movieId, memberId, status });
  filtersRef.current = { startDate, endDate, movieId, memberId, status };

  const fetchList = useCallback(
    async (pageNum: number = 0) => {
      setLoading(true);
      try {
        const f = filtersRef.current;
        const params: {
          page: number;
          size: number;
          startDate?: string;
          endDate?: string;
          movieId?: number;
          memberId?: number;
          status?: string;
        } = {
          page: pageNum,
          size: PAGE_SIZE,
        };
        if (f.startDate) params.startDate = f.startDate;
        if (f.endDate) params.endDate = f.endDate;
        if (f.movieId) params.movieId = parseInt(f.movieId, 10);
        if (f.memberId) params.memberId = parseInt(f.memberId, 10);
        if (f.status) params.status = f.status;

        const res = await adminReservationsApi.getList(params);
        if (res.success && res.data) {
          setContent(res.data.content ?? []);
          setTotalElements(res.data.totalElements ?? 0);
          setTotalPages(res.data.totalPages ?? 0);
          setPage(getPageIndex(res.data));
        }
      } catch (err) {
        showError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    fetchList(page);
  }, [page, fetchList]);

  const handleViewDetail = async (reservationId: number) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await adminReservationsApi.getOne(reservationId);
      if (res.success && res.data) {
        setSelectedReservation(res.data);
      }
    } catch (err) {
      showError(getErrorMessage(err));
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cinema-admin-text">예매 내역 조회</h1>
      </div>

      {/* 필터 */}
      <div className="rounded-lg border border-cinema-admin-border bg-cinema-admin-surface p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-cinema-admin-secondary">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-cinema-admin-border bg-cinema-admin-surface text-cinema-admin-text shadow-sm focus:border-cinema-admin-primary focus:ring-cinema-admin-primary sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cinema-admin-secondary">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-cinema-admin-border bg-cinema-admin-surface text-cinema-admin-text shadow-sm focus:border-cinema-admin-primary focus:ring-cinema-admin-primary sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cinema-admin-secondary">영화 ID</label>
            <input
              type="number"
              value={movieId}
              onChange={(e) => setMovieId(e.target.value)}
              placeholder="전체"
              className="mt-1 block w-full rounded-md border border-cinema-admin-border bg-cinema-admin-surface text-cinema-admin-text shadow-sm focus:border-cinema-admin-primary focus:ring-cinema-admin-primary sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cinema-admin-secondary">회원 ID</label>
            <input
              type="number"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="전체"
              className="mt-1 block w-full rounded-md border border-cinema-admin-border bg-cinema-admin-surface text-cinema-admin-text shadow-sm focus:border-cinema-admin-primary focus:ring-cinema-admin-primary sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cinema-admin-secondary">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border border-cinema-admin-border bg-cinema-admin-surface text-cinema-admin-text shadow-sm focus:border-cinema-admin-primary focus:ring-cinema-admin-primary sm:text-sm"
            >
              <option value="">전체</option>
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => fetchList(0)}
            className="rounded-md bg-cinema-admin-primary px-4 py-2 text-sm font-medium text-white hover:bg-cinema-admin-primary-hover"
          >
            검색
          </button>
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <LoadingSpinner />
      ) : content.length === 0 ? (
        <EmptyState message="예매 내역이 없습니다." variant="admin" />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-cinema-admin-border bg-cinema-admin-surface shadow">
            <table className="min-w-full divide-y divide-cinema-admin-border">
              <thead className="bg-cinema-admin-surface-alt">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    예매번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    회원
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    영화
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    상영관
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    상영시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    좌석수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    예매일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cinema-admin-muted">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-admin-border bg-cinema-admin-surface">
                {content.map((row) => (
                  <tr key={row.reservationId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-cinema-admin-text">
                      {row.reservationNo}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-cinema-admin-text">
                      {row.memberLoginId} ({row.memberId})
                    </td>
                    <td className="px-6 py-4 text-sm text-cinema-admin-text">{row.movieTitle}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-cinema-admin-text">
                      {row.screenName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-cinema-admin-text">
                      {formatDate(row.startTime)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-cinema-admin-text">
                      {row.totalSeats}석
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-cinema-admin-text">
                      {formatAmount(row.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                          row.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : row.status === 'CANCELLED' || row.status === 'REFUNDED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-cinema-admin-text">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(row.reservationId)}
                        className="text-cinema-admin-primary hover:text-cinema-admin-primary-hover"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setPage}
          />
        </>
      )}

      {/* 상세 모달 */}
      <Modal
        isOpen={detailModalOpen}
        variant="admin"
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReservation(null);
        }}
        title="예매 상세 정보"
      >
        {detailLoading ? (
          <LoadingSpinner />
        ) : selectedReservation ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cinema-admin-muted">예매번호</label>
                <p className="mt-1 text-sm text-cinema-admin-text">{selectedReservation.reservationNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-admin-muted">상태</label>
                <p className="mt-1 text-sm text-cinema-admin-text">
                  {STATUS_LABEL[selectedReservation.status as AdminReservationStatus]}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-admin-muted">영화</label>
                <p className="mt-1 text-sm text-cinema-admin-text">{selectedReservation.movieTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-admin-muted">상영관</label>
                <p className="mt-1 text-sm text-cinema-admin-text">{selectedReservation.screenName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-admin-muted">상영시간</label>
                <p className="mt-1 text-sm text-cinema-admin-text">
                  {formatDate(selectedReservation.startTime.toString())}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-admin-muted">총 금액</label>
                <p className="mt-1 text-sm text-cinema-admin-text">
                  {formatAmount(selectedReservation.totalAmount)}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cinema-admin-muted">좌석 정보</label>
              <div className="mt-2 space-y-2">
                {selectedReservation.seats.map((seat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border border-cinema-glass-border p-2"
                  >
                    <span className="text-sm text-cinema-admin-text">{seat.displayName}</span>
                    <span className="text-sm text-cinema-admin-muted">{formatAmount(seat.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
