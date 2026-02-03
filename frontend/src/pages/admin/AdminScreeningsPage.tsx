/**
 * 관리자 - 상영 스케줄 관리 (목록/등록/수정/삭제)
 */
import { useState, useEffect, useCallback } from 'react';
import { adminScreeningsApi, adminMoviesApi, adminScreensApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import { getPageIndex } from '@/types/api.types';
import type {
  AdminScreeningResponse,
  AdminScreeningCreateRequest,
  AdminScreeningUpdateRequest,
  AdminScreeningStatus,
  AdminMovieResponse,
  AdminScreenResponse,
} from '@/types/admin.types';

const PAGE_SIZE = 10;
const STATUS_LABEL: Record<AdminScreeningStatus, string> = {
  SCHEDULED: '상영 예정',
  NOW_SHOWING: '상영 중',
  ENDED: '상영 종료',
  CANCELLED: '상영 취소',
};

/** datetime-local value (YYYY-MM-DDTHH:mm) → API ISO string (YYYY-MM-DDTHH:mm:00) */
function toStartTimeISO(value: string): string {
  if (!value) return '';
  return value.length === 16 ? `${value}:00` : value;
}

/** API ISO string → datetime-local value */
function fromStartTimeISO(iso: string | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  } catch {
    return '';
  }
}

const emptyForm = {
  movieId: 0,
  screenId: 0,
  startTime: '',
};

export function AdminScreeningsPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AdminScreeningResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [movies, setMovies] = useState<AdminMovieResponse[]>([]);
  const [screens, setScreens] = useState<AdminScreenResponse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminScreeningResponse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminScreeningResponse | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      const [moviesRes, screensRes] = await Promise.all([
        adminMoviesApi.getList({ page: 0, size: 500 }),
        adminScreensApi.getList({ page: 0, size: 500 }),
      ]);
      if (moviesRes.success && moviesRes.data?.content) {
        setMovies(moviesRes.data.content);
      }
      if (screensRes.success && screensRes.data?.content) {
        setScreens(screensRes.data.content);
      }
    } catch {
      // 무시
    }
  }, []);

  const fetchList = useCallback(
    async (pageNum: number = 0) => {
      setLoading(true);
      try {
        const res = await adminScreeningsApi.getList({ page: pageNum, size: PAGE_SIZE });
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
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    fetchList(page);
  }, [page, fetchList]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      movieId: movies[0]?.id ?? 0,
      screenId: screens[0]?.id ?? 0,
      startTime: '',
    });
    setModalOpen(true);
  };

  const openEdit = (row: AdminScreeningResponse) => {
    setEditing(row);
    setForm({
      movieId: row.movieId,
      screenId: row.screenId,
      startTime: fromStartTimeISO(row.startTime),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.movieId || !form.screenId) {
      showError('영화와 상영관을 선택하세요.');
      return;
    }
    if (!form.startTime.trim()) {
      showError('상영 시작 시간을 입력하세요.');
      return;
    }
    const startTimeISO = toStartTimeISO(form.startTime);
    setSubmitLoading(true);
    try {
      if (editing) {
        const body: AdminScreeningUpdateRequest = {
          movieId: form.movieId,
          screenId: form.screenId,
          startTime: startTimeISO,
        };
        await adminScreeningsApi.update(editing.id, body);
        showSuccess('상영 스케줄이 수정되었습니다.');
      } else {
        const body: AdminScreeningCreateRequest = {
          movieId: form.movieId,
          screenId: form.screenId,
          startTime: startTimeISO,
        };
        await adminScreeningsApi.create(body);
        showSuccess('상영 스케줄이 등록되었습니다.');
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
      await adminScreeningsApi.delete(deleteTarget.id);
      showSuccess('상영 스케줄이 삭제되었습니다.');
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
        <h1 className="text-2xl font-bold text-gray-900">상영 스케줄 관리</h1>
        <button
          type="button"
          onClick={openCreate}
          disabled={movies.length === 0 || screens.length === 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          상영 등록
        </button>
      </div>

      {(movies.length === 0 || screens.length === 0) && (
        <p className="mb-4 text-sm text-amber-600">
          영화와 상영관을 먼저 등록한 뒤 상영 스케줄을 등록할 수 있습니다.
        </p>
      )}

      {isEmpty ? (
        <EmptyState
          title="등록된 상영 스케줄이 없습니다"
          message="상영 등록 버튼을 눌러 첫 상영을 등록하세요."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    영화
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    상영관
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    시작
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    종료
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {row.movieTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.screenName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.startTime ? formatDate(row.startTime, 'YYYY-MM-DD HH:mm') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.endTime ? formatDate(row.endTime, 'YYYY-MM-DD HH:mm') : '-'}
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
        title={editing ? '상영 스케줄 수정' : '상영 스케줄 등록'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">영화 *</label>
            <select
              value={form.movieId || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, movieId: Number.parseInt(e.target.value, 10) || 0 }))
              }
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
              required
            >
              <option value="">선택</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">상영관 *</label>
            <select
              value={form.screenId || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, screenId: Number.parseInt(e.target.value, 10) || 0 }))
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
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">상영 시작 시간 *</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
              required
            />
            <p className="mt-1 text-xs text-cinema-muted">
              종료 시간은 영화 상영 시간에 따라 자동 계산됩니다.
            </p>
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
        title="상영 스케줄 삭제"
        message={
          deleteTarget
            ? `"${deleteTarget.movieTitle}" ${formatDate(deleteTarget.startTime, 'YYYY-MM-DD HH:mm')} 상영을 삭제하시겠습니까?`
            : ''
        }
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
