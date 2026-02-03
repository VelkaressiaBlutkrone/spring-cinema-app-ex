/**
 * 관리자 - 영화 관리 (목록/등록/수정/삭제)
 */
import { useState, useEffect, useCallback } from 'react';
import { adminMoviesApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { getPageIndex } from '@/types/api.types';
import type {
  AdminMovieResponse,
  AdminMovieCreateRequest,
  AdminMovieUpdateRequest,
  AdminMovieStatus,
} from '@/types/admin.types';

const PAGE_SIZE = 10;
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

export function AdminMoviesPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AdminMovieResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMovieResponse | null>(null);
  const [form, setForm] = useState<AdminMovieCreateRequest>(emptyCreate);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminMovieResponse | null>(null);

  const fetchList = useCallback(
    async (pageNum: number = 0) => {
      setLoading(true);
      try {
        const res = await adminMoviesApi.getList({ page: pageNum, size: PAGE_SIZE });
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

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyCreate });
    setModalOpen(true);
  };

  const openEdit = (row: AdminMovieResponse) => {
    setEditing(row);
    setForm({
      title: row.title ?? '',
      description: row.description ?? '',
      runningTime: row.runningTime ?? 0,
      rating: row.rating ?? '',
      genre: row.genre ?? '',
      director: row.director ?? '',
      actors: row.actors ?? '',
      posterUrl: row.posterUrl ?? '',
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
    if (!form.title.trim()) {
      showError('영화 제목을 입력하세요.');
      return;
    }
    if (!form.runningTime || form.runningTime < 1) {
      showError('상영 시간(분)을 입력하세요.');
      return;
    }
    setSubmitLoading(true);
    try {
      if (editing) {
        const body: AdminMovieUpdateRequest = {
          title: form.title.trim(),
          description: form.description || undefined,
          runningTime: form.runningTime,
          rating: form.rating || undefined,
          genre: form.genre || undefined,
          director: form.director || undefined,
          actors: form.actors || undefined,
          posterUrl: form.posterUrl || undefined,
        };
        await adminMoviesApi.update(editing.id, body);
        showSuccess('영화가 수정되었습니다.');
      } else {
        const body: AdminMovieCreateRequest = {
          ...form,
          title: form.title.trim(),
          runningTime: form.runningTime,
          releaseDate: form.releaseDate || undefined,
        };
        await adminMoviesApi.create(body);
        showSuccess('영화가 등록되었습니다.');
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
      await adminMoviesApi.delete(deleteTarget.id);
      showSuccess('영화가 삭제되었습니다.');
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
        <h1 className="text-2xl font-bold text-gray-900">영화 관리</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          영화 등록
        </button>
      </div>

      {isEmpty ? (
        <EmptyState
          title="등록된 영화가 없습니다"
          message="영화 등록 버튼을 눌러 첫 영화를 등록하세요."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    상영시간
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    장르
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    개봉일
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {content.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.runningTime != null ? `${row.runningTime}분` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.genre || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.status ? STATUS_LABEL[row.status] : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.releaseDate ?? '-'}</td>
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
        title={editing ? '영화 수정' : '영화 등록'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">설명</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">상영 시간(분) *</label>
              <input
                type="number"
                min={1}
                value={form.runningTime || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, runningTime: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">개봉일</label>
              <input
                type="date"
                value={form.releaseDate ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, releaseDate: e.target.value || undefined }))
                }
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue disabled:opacity-60"
                disabled={!!editing}
              />
              {editing && (
                <p className="mt-1 text-xs text-cinema-muted">개봉일은 수정할 수 없습니다.</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">등급</label>
              <input
                type="text"
                value={form.rating ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                placeholder="예: 12세이상"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">장르</label>
              <input
                type="text"
                value={form.genre ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
                placeholder="예: 액션, 드라마"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">감독</label>
            <input
              type="text"
              value={form.director ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">출연</label>
            <input
              type="text"
              value={form.actors ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, actors: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">포스터 URL</label>
            <input
              type="url"
              value={form.posterUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            />
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
        title="영화 삭제"
        message={deleteTarget ? `"${deleteTarget.title}"을(를) 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
