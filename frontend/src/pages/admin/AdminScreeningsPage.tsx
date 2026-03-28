/**
 * 관리자 - 상영 스케줄 관리 (목록/등록/수정/삭제)
 * useCrudPage 훅으로 공통 CRUD 로직 추출
 */
import { useState, useEffect, useCallback } from 'react';
import { adminScreeningsApi, adminMoviesApi, adminScreensApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useCrudPage } from '@/hooks';
import { formatDate } from '@/utils/dateUtils';
import type {
  AdminScreeningResponse,
  AdminScreeningCreateRequest,
  AdminScreeningUpdateRequest,
  AdminScreeningStatus,
  AdminMovieResponse,
  AdminScreenResponse,
} from '@/types/admin.types';

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

interface ScreeningFormState {
  movieId: number;
  screenId: number;
  startTime: string;
}

const emptyForm: ScreeningFormState = {
  movieId: 0,
  screenId: 0,
  startTime: '',
};

const INPUT_CLASS =
  'block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue';

export function AdminScreeningsPage() {
  const [movies, setMovies] = useState<AdminMovieResponse[]>([]);
  const [screens, setScreens] = useState<AdminScreenResponse[]>([]);

  const fetchOptions = useCallback(async () => {
    try {
      const [moviesRes, screensRes] = await Promise.all([
        adminMoviesApi.getList({ page: 0, size: 500 }),
        adminScreensApi.getList({ page: 0, size: 500 }),
      ]);
      if (moviesRes.success && moviesRes.data?.content) setMovies(moviesRes.data.content);
      if (screensRes.success && screensRes.data?.content) setScreens(screensRes.data.content);
    } catch {
      // 무시
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const crud = useCrudPage<AdminScreeningResponse, ScreeningFormState, AdminScreeningUpdateRequest>({
    api: adminScreeningsApi as never,
    resourceName: 'screening',
    resourceLabel: '상영 스케줄',
    emptyForm,
  });

  const handleOpenCreate = () => {
    crud.openCreate();
    crud.setForm({
      movieId: movies[0]?.id ?? 0,
      screenId: screens[0]?.id ?? 0,
      startTime: '',
    });
  };

  if (crud.loading && crud.content.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" message="목록을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cinema-admin-text">상영 스케줄 관리</h1>
        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={movies.length === 0 || screens.length === 0}
          className="rounded-lg bg-cinema-admin-primary px-4 py-2 text-sm font-medium text-white hover:bg-cinema-admin-primary-hover disabled:opacity-50"
        >
          상영 등록
        </button>
      </div>

      {(movies.length === 0 || screens.length === 0) && (
        <p className="mb-4 text-sm text-cinema-admin-danger">
          영화와 상영관을 먼저 등록한 뒤 상영 스케줄을 등록할 수 있습니다.
        </p>
      )}

      {crud.isEmpty ? (
        <EmptyState
          title="등록된 상영 스케줄이 없습니다"
          message="상영 등록 버튼을 눌러 첫 상영을 등록하세요."
          variant="admin"
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-cinema-admin-border bg-cinema-admin-surface shadow">
            <table className="min-w-full divide-y divide-cinema-admin-border">
              <thead className="bg-cinema-admin-surface-alt">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">영화</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">상영관</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">시작</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">종료</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">상태</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-cinema-admin-muted">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-admin-border bg-cinema-admin-surface">
                {crud.content.map((row) => (
                  <tr key={row.id} className="hover:bg-cinema-admin-surface-alt">
                    <td className="px-4 py-3 text-sm font-medium text-cinema-admin-text">{row.movieTitle}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">{row.screenName}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.startTime ? formatDate(row.startTime, 'YYYY-MM-DD HH:mm') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.endTime ? formatDate(row.endTime, 'YYYY-MM-DD HH:mm') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.status ? STATUS_LABEL[row.status] : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          crud.openEdit(row, (r) => ({
                            movieId: r.movieId,
                            screenId: r.screenId,
                            startTime: fromStartTimeISO(r.startTime),
                          }))
                        }
                        className="text-cinema-admin-primary hover:underline"
                      >
                        수정
                      </button>
                      <span className="mx-2 text-cinema-admin-separator">|</span>
                      <button
                        type="button"
                        onClick={() => crud.setDeleteTarget(row)}
                        className="text-cinema-admin-danger hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {crud.totalPages > 1 && (
            <Pagination
              currentPage={crud.page}
              totalPages={crud.totalPages}
              totalElements={crud.totalElements}
              onPageChange={crud.setPage}
            />
          )}
        </>
      )}

      <Modal
        isOpen={crud.modalOpen}
        onClose={crud.closeModal}
        variant="admin"
        title={crud.editing ? '상영 스케줄 수정' : '상영 스케줄 등록'}
        size="md"
      >
        <form
          onSubmit={(e) =>
            crud.handleSubmit(e, {
              validate: () => {
                if (!crud.form.movieId || !crud.form.screenId) return '영화와 상영관을 선택하세요.';
                if (!crud.form.startTime.trim()) return '상영 시작 시간을 입력하세요.';
                return null;
              },
              buildCreateBody: (f) => ({
                movieId: f.movieId,
                screenId: f.screenId,
                startTime: toStartTimeISO(f.startTime),
              }),
              buildUpdateBody: (f) => ({
                movieId: f.movieId,
                screenId: f.screenId,
                startTime: toStartTimeISO(f.startTime),
              }),
            })
          }
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">영화 *</label>
            <select
              value={crud.form.movieId || ''}
              onChange={(e) =>
                crud.setForm((f) => ({ ...f, movieId: Number.parseInt(e.target.value, 10) || 0 }))
              }
              className={INPUT_CLASS}
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
              value={crud.form.screenId || ''}
              onChange={(e) =>
                crud.setForm((f) => ({ ...f, screenId: Number.parseInt(e.target.value, 10) || 0 }))
              }
              className={INPUT_CLASS}
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
              value={crud.form.startTime}
              onChange={(e) => crud.setForm((f) => ({ ...f, startTime: e.target.value }))}
              className={INPUT_CLASS}
              required
            />
            <p className="mt-1 text-xs text-cinema-muted">
              종료 시간은 영화 상영 시간에 따라 자동 계산됩니다.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={crud.closeModal}
              className="rounded-xl border border-cinema-glass-border bg-cinema-glass px-4 py-2 text-sm font-medium text-cinema-text transition hover:bg-cinema-glass-border"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={crud.submitLoading}
              className="rounded-xl bg-cinema-neon-blue px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {crud.submitLoading ? '처리 중...' : crud.editing ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!crud.deleteTarget}
        onClose={() => crud.setDeleteTarget(null)}
        theme="admin"
        onConfirm={() =>
          crud.handleDelete(
            (t) => t.id,
            (t) => t.movieTitle,
          )
        }
        title="상영 스케줄 삭제"
        message={
          crud.deleteTarget
            ? `"${crud.deleteTarget.movieTitle}" ${formatDate(crud.deleteTarget.startTime, 'YYYY-MM-DD HH:mm')} 상영을 삭제하시겠습니까?`
            : ''
        }
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
