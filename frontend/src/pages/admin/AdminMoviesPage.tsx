/**
 * 관리자 - 영화 관리 (목록/등록/수정/삭제)
 * useCrudPage 훅으로 공통 CRUD 로직 추출
 */
import { adminMoviesApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useCrudPage } from '@/hooks';
import type {
  AdminMovieResponse,
  AdminMovieCreateRequest,
  AdminMovieUpdateRequest,
  AdminMovieStatus,
} from '@/types/admin.types';

const STATUS_LABEL: Record<AdminMovieStatus, string> = {
  SHOWING: '상영 중',
  COMING_SOON: '상영 예정',
  ENDED: '상영 종료',
};

const emptyCreate: AdminMovieCreateRequest = {
  title: '',
  description: '',
  runningTime: 0,
  rating: '',
  genre: '',
  director: '',
  actors: '',
  posterUrl: '',
  releaseDate: '',
};

const INPUT_CLASS =
  'block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue';

export function AdminMoviesPage() {
  const crud = useCrudPage<AdminMovieResponse, AdminMovieCreateRequest, AdminMovieUpdateRequest>({
    api: adminMoviesApi,
    resourceName: 'movie',
    resourceLabel: '영화',
    emptyForm: emptyCreate,
  });

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
        <h1 className="text-2xl font-bold text-cinema-admin-text">영화 관리</h1>
        <button
          type="button"
          onClick={crud.openCreate}
          className="rounded-lg bg-cinema-admin-primary px-4 py-2 text-sm font-medium text-white hover:bg-cinema-admin-primary-hover"
        >
          영화 등록
        </button>
      </div>

      {crud.isEmpty ? (
        <EmptyState
          title="등록된 영화가 없습니다"
          message="영화 등록 버튼을 눌러 첫 영화를 등록하세요."
          variant="admin"
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-cinema-admin-border bg-cinema-admin-surface shadow">
            <table className="min-w-full divide-y divide-cinema-admin-border">
              <thead className="bg-cinema-admin-surface-alt">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">제목</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">상영시간</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">장르</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">개봉일</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-cinema-admin-muted">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-admin-border bg-cinema-admin-surface">
                {crud.content.map((row) => (
                  <tr key={row.id} className="hover:bg-cinema-admin-surface-alt">
                    <td className="px-4 py-3 text-sm font-medium text-cinema-admin-text">{row.title}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.runningTime != null ? `${row.runningTime}분` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">{row.genre || '-'}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.status ? STATUS_LABEL[row.status] : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">{row.releaseDate ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          crud.openEdit(row, (r) => ({
                            title: r.title ?? '',
                            description: r.description ?? '',
                            runningTime: r.runningTime ?? 0,
                            rating: r.rating ?? '',
                            genre: r.genre ?? '',
                            director: r.director ?? '',
                            actors: r.actors ?? '',
                            posterUrl: r.posterUrl ?? '',
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
        title={crud.editing ? '영화 수정' : '영화 등록'}
        size="lg"
      >
        <form
          onSubmit={(e) =>
            crud.handleSubmit(e, {
              validate: () => {
                if (!crud.form.title.trim()) return '영화 제목을 입력하세요.';
                if (!crud.form.runningTime || crud.form.runningTime < 1) return '상영 시간(분)을 입력하세요.';
                return null;
              },
              buildUpdateBody: (f) => ({
                title: f.title.trim(),
                description: f.description || undefined,
                runningTime: f.runningTime,
                rating: f.rating || undefined,
                genre: f.genre || undefined,
                director: f.director || undefined,
                actors: f.actors || undefined,
                posterUrl: f.posterUrl || undefined,
              }),
              buildCreateBody: (f) => ({
                ...f,
                title: f.title.trim(),
                runningTime: f.runningTime,
                releaseDate: f.releaseDate || undefined,
              }),
            })
          }
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">제목 *</label>
            <input
              type="text"
              value={crud.form.title}
              onChange={(e) => crud.setForm((f) => ({ ...f, title: e.target.value }))}
              className={INPUT_CLASS}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">설명</label>
            <textarea
              value={crud.form.description ?? ''}
              onChange={(e) => crud.setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">상영 시간(분) *</label>
              <input
                type="number"
                min={1}
                value={crud.form.runningTime || ''}
                onChange={(e) =>
                  crud.setForm((f) => ({ ...f, runningTime: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className={INPUT_CLASS}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">개봉일</label>
              <input
                type="date"
                value={crud.form.releaseDate ?? ''}
                onChange={(e) => crud.setForm((f) => ({ ...f, releaseDate: e.target.value || undefined }))}
                className={INPUT_CLASS + ' disabled:opacity-60'}
                disabled={!!crud.editing}
              />
              {crud.editing && (
                <p className="mt-1 text-xs text-cinema-muted">개봉일은 수정할 수 없습니다.</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">등급</label>
              <input
                type="text"
                value={crud.form.rating ?? ''}
                onChange={(e) => crud.setForm((f) => ({ ...f, rating: e.target.value }))}
                className={INPUT_CLASS}
                placeholder="예: 12세이상"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">장르</label>
              <input
                type="text"
                value={crud.form.genre ?? ''}
                onChange={(e) => crud.setForm((f) => ({ ...f, genre: e.target.value }))}
                className={INPUT_CLASS}
                placeholder="예: 액션, 드라마"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">감독</label>
            <input
              type="text"
              value={crud.form.director ?? ''}
              onChange={(e) => crud.setForm((f) => ({ ...f, director: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">출연</label>
            <input
              type="text"
              value={crud.form.actors ?? ''}
              onChange={(e) => crud.setForm((f) => ({ ...f, actors: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">포스터 URL</label>
            <input
              type="url"
              value={crud.form.posterUrl ?? ''}
              onChange={(e) => crud.setForm((f) => ({ ...f, posterUrl: e.target.value }))}
              className={INPUT_CLASS}
            />
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
            (t) => t.title,
          )
        }
        title="영화 삭제"
        message={crud.deleteTarget ? `"${crud.deleteTarget.title}"을(를) 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
