/**
 * 관리자 - 상영관 관리 (목록/등록/수정/삭제)
 */
import { useState, useEffect, useCallback } from 'react';
import { adminScreensApi, adminTheatersApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { logAdminCreate, logAdminUpdate } from '@/utils/logger';
import { getPageIndex } from '@/types/api.types';
import type {
  AdminScreenResponse,
  AdminScreenCreateRequest,
  AdminScreenUpdateRequest,
  AdminScreenType,
  AdminScreenStatus,
  AdminTheaterResponse,
} from '@/types/admin.types';

const PAGE_SIZE = 10;
const SCREEN_TYPE_LABEL: Record<AdminScreenType, string> = {
  NORMAL_2D: '2D',
  NORMAL_3D: '3D',
  IMAX: 'IMAX',
  DX_4D: '4DX',
  SCREEN_X: 'SCREENX',
};
const STATUS_LABEL: Record<AdminScreenStatus, string> = {
  OPEN: '운영 중',
  CLOSED: '폐쇄',
  MAINTENANCE: '점검 중',
};

const emptyCreate: AdminScreenCreateRequest = {
  theaterId: 0,
  name: '',
  totalRows: 0,
  totalCols: 0,
  screenType: 'NORMAL_2D',
};

export function AdminScreensPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AdminScreenResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [theaters, setTheaters] = useState<AdminTheaterResponse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminScreenResponse | null>(null);
  const [form, setForm] = useState<AdminScreenCreateRequest>(emptyCreate);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminScreenResponse | null>(null);

  const fetchTheaters = useCallback(async () => {
    try {
      const res = await adminTheatersApi.getList({ page: 0, size: 200 });
      if (res.success && res.data?.content) {
        setTheaters(res.data.content);
      }
    } catch {
      // 무시
    }
  }, []);

  const fetchList = useCallback(
    async (pageNum: number = 0) => {
      setLoading(true);
      try {
        const res = await adminScreensApi.getList({ page: pageNum, size: PAGE_SIZE });
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
    fetchTheaters();
  }, [fetchTheaters]);

  useEffect(() => {
    fetchList(page);
  }, [page, fetchList]);

  const openCreate = () => {
    setEditing(null);
    const firstTheaterId = theaters[0]?.id ?? 0;
    setForm({
      ...emptyCreate,
      theaterId: firstTheaterId,
    });
    setModalOpen(true);
  };

  const openEdit = (row: AdminScreenResponse) => {
    setEditing(row);
    setForm({
      theaterId: row.theaterId,
      name: row.name ?? '',
      totalRows: row.totalRows ?? 0,
      totalCols: row.totalCols ?? 0,
      screenType: row.screenType ?? 'NORMAL_2D',
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
    if (!form.name.trim()) {
      showError('상영관 이름을 입력하세요.');
      return;
    }
    if (!editing && !form.theaterId) {
      showError('영화관을 선택하세요.');
      return;
    }
    if (!form.totalRows || form.totalRows < 1 || !form.totalCols || form.totalCols < 1) {
      showError('행 수와 열 수를 1 이상 입력하세요.');
      return;
    }
    setSubmitLoading(true);
    try {
      if (editing) {
        const body: AdminScreenUpdateRequest = {
          name: form.name.trim(),
          totalRows: form.totalRows,
          totalCols: form.totalCols,
          screenType: form.screenType,
        };
        await adminScreensApi.update(editing.id, body);
        showSuccess('상영관이 수정되었습니다.');
        logAdminUpdate('screen', editing.id);
      } else {
        const created = await adminScreensApi.create({
          theaterId: form.theaterId,
          name: form.name.trim(),
          totalRows: form.totalRows,
          totalCols: form.totalCols,
          screenType: form.screenType,
        });
        showSuccess('상영관이 등록되었습니다.');
        if (created.data != null) logAdminCreate('screen', created.data as number);
      }
      closeModal();
      fetchList(page);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminScreensApi.delete(deleteTarget.id);
      showSuccess('상영관이 삭제되었습니다.');
      setDeleteTarget(null);
      fetchList(content.length === 1 && page > 0 ? page - 1 : page);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  if (loading && content.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" message="목록을 불러오는 중..." />
      </div>
    );
  }

  const isEmpty = content.length === 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">상영관 관리</h1>
        <button
          type="button"
          onClick={openCreate}
          disabled={theaters.length === 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          상영관 등록
        </button>
      </div>

      {theaters.length === 0 && (
        <p className="mb-4 text-sm text-amber-600">
          영화관을 먼저 등록한 뒤 상영관을 등록할 수 있습니다.
        </p>
      )}

      {isEmpty ? (
        <EmptyState
          title="등록된 상영관이 없습니다"
          message="상영관 등록 버튼을 눌러 첫 상영관을 등록하세요."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    상영관명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    영화관
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    타입
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    좌석(행×열)
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
                {content.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.theaterName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.screenType ? SCREEN_TYPE_LABEL[row.screenType] : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.totalRows != null && row.totalCols != null
                        ? `${row.totalRows}×${row.totalCols} (${row.totalSeats ?? row.totalRows * row.totalCols}석)`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.status ? STATUS_LABEL[row.status] : '-'}
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
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? '상영관 수정' : '상영관 등록'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">영화관 *</label>
              <select
                value={form.theaterId || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, theaterId: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                required
              >
                <option value="">선택</option>
                {theaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">영화관</label>
              <p className="text-sm text-cinema-muted">{editing.theaterName}</p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">상영관 이름 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">총 행 수 *</label>
              <input
                type="number"
                min={1}
                value={form.totalRows || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalRows: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">행당 좌석 수 *</label>
              <input
                type="number"
                min={1}
                value={form.totalCols || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalCols: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">상영관 타입 *</label>
            <select
              value={form.screenType}
              onChange={(e) =>
                setForm((f) => ({ ...f, screenType: e.target.value as AdminScreenType }))
              }
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            >
              {(Object.keys(SCREEN_TYPE_LABEL) as AdminScreenType[]).map((k) => (
                <option key={k} value={k}>
                  {SCREEN_TYPE_LABEL[k]}
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
              {submitLoading ? '처리 중...' : editing ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="상영관 삭제"
        message={deleteTarget ? `"${deleteTarget.name}"을(를) 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
