/**
 * 관리자 - 좌석 관리 (상영관별 좌석 목록/등록/수정/삭제)
 */
import { useState, useEffect, useCallback } from 'react';
import { adminSeatsApi, adminScreensApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { logAdminCreate, logAdminUpdate } from '@/utils/logger';
import type {
  AdminSeatResponse,
  AdminSeatCreateRequest,
  AdminSeatUpdateRequest,
  AdminSeatType,
  AdminSeatBaseStatus,
  AdminScreenResponse,
} from '@/types/admin.types';

const SEAT_TYPE_LABEL: Record<AdminSeatType, string> = {
  NORMAL: '일반',
  PREMIUM: '프리미엄',
  VIP: 'VIP',
  COUPLE: '커플',
  WHEELCHAIR: '휠체어',
};
const BASE_STATUS_LABEL: Record<AdminSeatBaseStatus, string> = {
  AVAILABLE: '예매 가능',
  BLOCKED: '운영 차단',
  DISABLED: '사용 불가',
};

const emptyCreate: AdminSeatCreateRequest = {
  screenId: 0,
  rowLabel: '',
  seatNo: 0,
  seatType: 'NORMAL',
};

export function AdminSeatsPage() {
  const { showSuccess, showError } = useToast();
  const [screens, setScreens] = useState<AdminScreenResponse[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<number | null>(null);
  const [seats, setSeats] = useState<AdminSeatResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSeatResponse | null>(null);
  const [form, setForm] = useState<AdminSeatCreateRequest>(emptyCreate);
  const [updateForm, setUpdateForm] = useState<AdminSeatUpdateRequest>({
    seatType: 'NORMAL',
    baseStatus: 'AVAILABLE',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminSeatResponse | null>(null);

  const fetchScreens = useCallback(async () => {
    try {
      const res = await adminScreensApi.getList({ page: 0, size: 500 });
      if (res.success && res.data?.content) {
        setScreens(res.data.content);
      }
    } catch {
      // 무시
    }
  }, []);

  const fetchSeatsByScreen = useCallback(
    async (screenId: number) => {
      setLoading(true);
      try {
        const res = await adminSeatsApi.getByScreen(screenId);
        if (res.success && res.data) {
          setSeats(res.data);
        } else {
          setSeats([]);
        }
      } catch (err) {
        showError(getErrorMessage(err));
        setSeats([]);
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    fetchScreens();
  }, [fetchScreens]);

  useEffect(() => {
    if (selectedScreenId != null) {
      fetchSeatsByScreen(selectedScreenId);
    } else {
      setSeats([]);
    }
  }, [selectedScreenId, fetchSeatsByScreen]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      screenId: selectedScreenId ?? screens[0]?.id ?? 0,
      rowLabel: '',
      seatNo: 0,
      seatType: 'NORMAL',
    });
    setModalOpen(true);
  };

  const openEdit = (row: AdminSeatResponse) => {
    setEditing(row);
    setUpdateForm({
      seatType: row.seatType ?? 'NORMAL',
      baseStatus: row.baseStatus ?? 'AVAILABLE',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyCreate);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.screenId) {
      showError('상영관을 선택하세요.');
      return;
    }
    if (!form.rowLabel.trim()) {
      showError('행 라벨을 입력하세요.');
      return;
    }
    if (!form.seatNo || form.seatNo < 1) {
      showError('좌석 번호를 입력하세요.');
      return;
    }
    setSubmitLoading(true);
    try {
      const created = await adminSeatsApi.create({
        screenId: form.screenId,
        rowLabel: form.rowLabel.trim(),
        seatNo: form.seatNo,
        seatType: form.seatType,
      });
      showSuccess('좌석이 등록되었습니다.');
      if (created.data != null) logAdminCreate('seat', created.data as number);
      closeModal();
      if (selectedScreenId === form.screenId) {
        fetchSeatsByScreen(form.screenId);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitLoading(true);
    try {
      await adminSeatsApi.update(editing.id, {
        seatType: updateForm.seatType,
        baseStatus: updateForm.baseStatus,
      });
      showSuccess('좌석이 수정되었습니다.');
      logAdminUpdate('seat', editing.id);
      closeModal();
      if (selectedScreenId != null) {
        fetchSeatsByScreen(selectedScreenId);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminSeatsApi.delete(deleteTarget.id);
      showSuccess('좌석이 삭제되었습니다.');
      setDeleteTarget(null);
      if (selectedScreenId != null) {
        fetchSeatsByScreen(selectedScreenId);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const isEmpty = seats.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">좌석 관리</h1>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">상영관</label>
          <select
            value={selectedScreenId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedScreenId(v === '' ? null : Number.parseInt(v, 10));
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">선택</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.theaterName} - {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            disabled={screens.length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            좌석 등록
          </button>
        </div>
      </div>

      {screens.length === 0 && (
        <p className="mb-4 text-sm text-amber-600">
          상영관을 먼저 등록한 뒤 좌석을 관리할 수 있습니다.
        </p>
      )}

      {selectedScreenId == null ? (
        <EmptyState
          title="상영관을 선택하세요"
          message="위에서 상영관을 선택하면 해당 상영관의 좌석 목록이 표시됩니다."
        />
      ) : loading && seats.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <LoadingSpinner size="lg" message="좌석 목록을 불러오는 중..." />
        </div>
      ) : isEmpty ? (
        <EmptyState
          title="등록된 좌석이 없습니다"
          message="좌석 등록 버튼을 눌러 첫 좌석을 등록하세요."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  행
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  번호
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  표시명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  타입
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  상태
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {seats.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.rowLabel}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.seatNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.displayName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.seatType ? SEAT_TYPE_LABEL[row.seatType] : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.baseStatus ? BASE_STATUS_LABEL[row.baseStatus] : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-indigo-600 hover:underline"
                    >
                      수정
                    </button>
                    <span className="mx-2 text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      className="text-red-600 hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 등록 모달 */}
      <Modal isOpen={modalOpen && !editing} onClose={closeModal} title="좌석 등록" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="seat-screen" className="mb-1 block text-sm font-medium text-cinema-text">
              상영관 *
            </label>
            <select
              id="seat-screen"
              value={form.screenId || ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  screenId: Number.parseInt(e.target.value, 10) || 0,
                }))
              }
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
              required
            >
              <option value="">선택</option>
              {screens.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.theaterName} - {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="seat-row" className="mb-1 block text-sm font-medium text-cinema-text">
                행 라벨 *
              </label>
              <input
                id="seat-row"
                type="text"
                value={form.rowLabel}
                onChange={(e) => setForm((f) => ({ ...f, rowLabel: e.target.value }))}
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                placeholder="예: A"
                required
              />
            </div>
            <div>
              <label htmlFor="seat-no" className="mb-1 block text-sm font-medium text-cinema-text">
                좌석 번호 *
              </label>
              <input
                id="seat-no"
                type="number"
                min={1}
                value={form.seatNo || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    seatNo: Number.parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="seat-type" className="mb-1 block text-sm font-medium text-cinema-text">
              좌석 타입 *
            </label>
            <select
              id="seat-type"
              value={form.seatType}
              onChange={(e) =>
                setForm((f) => ({ ...f, seatType: e.target.value as AdminSeatType }))
              }
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            >
              {(Object.keys(SEAT_TYPE_LABEL) as AdminSeatType[]).map((k) => (
                <option key={k} value={k}>
                  {SEAT_TYPE_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-cinema-glass-border bg-cinema-glass px-4 py-2 text-sm font-medium text-cinema-text transition hover:bg-cinema-glass-border"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-xl bg-cinema-neon-blue px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {submitLoading ? '처리 중...' : '등록'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 수정 모달 */}
      <Modal isOpen={modalOpen && !!editing} onClose={closeModal} title="좌석 수정" size="sm">
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {editing && (
            <p className="text-sm text-cinema-muted">
              {editing.screenName} - {editing.displayName}
            </p>
          )}
          <div>
            <label htmlFor="edit-seat-type" className="mb-1 block text-sm font-medium text-cinema-text">
              좌석 타입
            </label>
            <select
              id="edit-seat-type"
              value={updateForm.seatType ?? 'NORMAL'}
              onChange={(e) =>
                setUpdateForm((f) => ({
                  ...f,
                  seatType: e.target.value as AdminSeatType,
                }))
              }
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            >
              {(Object.keys(SEAT_TYPE_LABEL) as AdminSeatType[]).map((k) => (
                <option key={k} value={k}>
                  {SEAT_TYPE_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-base-status" className="mb-1 block text-sm font-medium text-cinema-text">
              기본 상태 *
            </label>
            <select
              id="edit-base-status"
              value={updateForm.baseStatus}
              onChange={(e) =>
                setUpdateForm((f) => ({
                  ...f,
                  baseStatus: e.target.value as AdminSeatBaseStatus,
                }))
              }
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            >
              {(Object.keys(BASE_STATUS_LABEL) as AdminSeatBaseStatus[]).map((k) => (
                <option key={k} value={k}>
                  {BASE_STATUS_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-cinema-glass-border bg-cinema-glass px-4 py-2 text-sm font-medium text-cinema-text transition hover:bg-cinema-glass-border"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-xl bg-cinema-neon-blue px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {submitLoading ? '처리 중...' : '수정'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="좌석 삭제"
        message={deleteTarget ? `"${deleteTarget.displayName}" 좌석을 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
