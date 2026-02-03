/**
 * 관리자 - 영화관 관리 (목록/등록/수정/삭제)
 */
import { useState, useEffect, useCallback } from 'react';
import { adminTheatersApi } from '@/api/admin';
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
  AdminTheaterResponse,
  AdminTheaterCreateRequest,
  AdminTheaterUpdateRequest,
  AdminTheaterStatus,
} from '@/types/admin.types';

const PAGE_SIZE = 10;
const STATUS_LABEL: Record<AdminTheaterStatus, string> = {
  OPEN: '운영 중',
  CLOSED: '폐관',
  MAINTENANCE: '점검 중',
};

const emptyCreate: AdminTheaterCreateRequest = {
  name: '',
  location: '',
  address: '',
  phone: '',
};

export function AdminTheatersPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AdminTheaterResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTheaterResponse | null>(null);
  const [form, setForm] = useState<AdminTheaterCreateRequest>(emptyCreate);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminTheaterResponse | null>(null);

  const fetchList = useCallback(
    async (pageNum: number = 0) => {
      setLoading(true);
      try {
        const res = await adminTheatersApi.getList({ page: pageNum, size: PAGE_SIZE });
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

  const openEdit = (row: AdminTheaterResponse) => {
    setEditing(row);
    setForm({
      name: row.name ?? '',
      location: row.location ?? '',
      address: row.address ?? '',
      phone: row.phone ?? '',
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
      showError('영화관 이름을 입력하세요.');
      return;
    }
    setSubmitLoading(true);
    try {
      if (editing) {
        const body: AdminTheaterUpdateRequest = {
          name: form.name.trim(),
          location: form.location || undefined,
          address: form.address || undefined,
          phone: form.phone || undefined,
        };
        await adminTheatersApi.update(editing.id, body);
        showSuccess('영화관이 수정되었습니다.');
        logAdminUpdate('theater', editing.id);
      } else {
        const created = await adminTheatersApi.create({
          name: form.name.trim(),
          location: form.location || undefined,
          address: form.address || undefined,
          phone: form.phone || undefined,
        });
        showSuccess('영화관이 등록되었습니다.');
        if (created.data != null) logAdminCreate('theater', created.data as number);
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
      await adminTheatersApi.delete(deleteTarget.id);
      showSuccess('영화관이 삭제되었습니다.');
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
        <h1 className="text-2xl font-bold text-gray-900">영화관 관리</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          영화관 등록
        </button>
      </div>

      {isEmpty ? (
        <EmptyState
          title="등록된 영화관이 없습니다"
          message="영화관 등록 버튼을 눌러 첫 영화관을 등록하세요."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    위치
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    주소
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    전화
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
                    <td className="px-4 py-3 text-sm text-gray-600">{row.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.address || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.phone || '-'}</td>
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
        title={editing ? '영화관 수정' : '영화관 등록'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">이름 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">위치</label>
            <input
              type="text"
              value={form.location ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
              placeholder="예: 강남구"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">주소</label>
            <input
              type="text"
              value={form.address ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">전화</label>
            <input
              type="text"
              value={form.phone ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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
        title="영화관 삭제"
        message={deleteTarget ? `"${deleteTarget.name}"을(를) 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
