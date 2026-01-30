/**
 * 관리자 - 결제 내역 조회
 */
import { useState, useEffect, useCallback } from 'react';
import { adminPaymentsApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { getPageIndex } from '@/types/api.types';
import type { AdminPaymentListResponse, AdminPaymentStatus } from '@/types/admin.types';

const PAGE_SIZE = 10;
const STATUS_LABEL: Record<AdminPaymentStatus, string> = {
  PENDING: '대기',
  SUCCESS: '성공',
  FAILED: '실패',
  CANCELLED: '취소',
  REFUNDED: '환불',
};

const METHOD_LABEL: Record<string, string> = {
  CARD: '카드',
  KAKAO_PAY: '카카오페이',
  NAVER_PAY: '네이버페이',
  TOSS: '토스',
  BANK_TRANSFER: '계좌이체',
};

export function AdminPaymentsPage() {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AdminPaymentListResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentListResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 필터 상태
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [payStatus, setPayStatus] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');

  const fetchList = useCallback(
    async (pageNum: number = 0) => {
      setLoading(true);
      try {
        const params: {
          page: number;
          size: number;
          startDate?: string;
          endDate?: string;
          payStatus?: string;
          memberId?: number;
        } = {
          page: pageNum,
          size: PAGE_SIZE,
        };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (payStatus) params.payStatus = payStatus;
        if (memberId) params.memberId = parseInt(memberId, 10);

        const res = await adminPaymentsApi.getList(params);
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
    [startDate, endDate, payStatus, memberId, showError]
  );

  useEffect(() => {
    fetchList(page);
  }, [page, fetchList]);

  const handleViewDetail = async (paymentId: number) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await adminPaymentsApi.getOne(paymentId);
      if (res.success && res.data) {
        setSelectedPayment(res.data);
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
        <h1 className="text-2xl font-bold text-gray-900">결제 내역 조회</h1>
      </div>

      {/* 필터 */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">회원 ID</label>
            <input
              type="number"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="전체"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">결제 상태</label>
            <select
              value={payStatus}
              onChange={(e) => setPayStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            검색
          </button>
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <LoadingSpinner />
      ) : content.length === 0 ? (
        <EmptyState message="결제 내역이 없습니다." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    결제번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    예매번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    회원
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    영화
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    결제수단
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    결제일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {content.map((row) => (
                  <tr key={row.paymentId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {row.paymentNo}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {row.reservationNo}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {row.memberLoginId} ({row.memberId})
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{row.movieTitle}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {METHOD_LABEL[row.payMethod] || row.payMethod}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatAmount(row.payAmount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                          row.payStatus === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : row.payStatus === 'FAILED' ||
                                row.payStatus === 'CANCELLED' ||
                                row.payStatus === 'REFUNDED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {STATUS_LABEL[row.payStatus]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {row.paidAt ? formatDate(row.paidAt) : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(row.paymentId)}
                        className="text-indigo-600 hover:text-indigo-900"
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
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPayment(null);
        }}
        title="결제 상세 정보"
      >
        {detailLoading ? (
          <LoadingSpinner />
        ) : selectedPayment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cinema-muted">결제번호</label>
                <p className="mt-1 text-sm text-cinema-text">{selectedPayment.paymentNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-muted">예매번호</label>
                <p className="mt-1 text-sm text-cinema-text">{selectedPayment.reservationNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-muted">회원</label>
                <p className="mt-1 text-sm text-cinema-text">
                  {selectedPayment.memberLoginId} ({selectedPayment.memberId})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-muted">영화</label>
                <p className="mt-1 text-sm text-cinema-text">{selectedPayment.movieTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-muted">결제수단</label>
                <p className="mt-1 text-sm text-cinema-text">
                  {METHOD_LABEL[selectedPayment.payMethod] || selectedPayment.payMethod}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-muted">결제 금액</label>
                <p className="mt-1 text-sm text-cinema-text">
                  {formatAmount(selectedPayment.payAmount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-muted">결제 상태</label>
                <p className="mt-1 text-sm text-cinema-text">
                  {STATUS_LABEL[selectedPayment.payStatus]}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cinema-muted">결제일시</label>
                <p className="mt-1 text-sm text-cinema-text">
                  {selectedPayment.paidAt ? formatDate(selectedPayment.paidAt) : '-'}
                </p>
              </div>
              {selectedPayment.cancelledAt && (
                <div>
                  <label className="block text-sm font-medium text-cinema-muted">취소일시</label>
                  <p className="mt-1 text-sm text-cinema-text">
                    {formatDate(selectedPayment.cancelledAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
