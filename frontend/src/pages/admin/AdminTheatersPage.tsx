/**
 * 관리자 - 영화관 관리 (목록/등록/수정/삭제)
 * useCrudPage 훅으로 공통 CRUD 로직 추출
 */
import { adminTheatersApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useCrudPage } from '@/hooks';
import type {
  AdminTheaterResponse,
  AdminTheaterCreateRequest,
  AdminTheaterUpdateRequest,
  AdminTheaterStatus,
} from '@/types/admin.types';

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

const INPUT_CLASS =
  'block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue';

export function AdminTheatersPage() {
  const crud = useCrudPage<AdminTheaterResponse, AdminTheaterCreateRequest, AdminTheaterUpdateRequest>({
    api: adminTheatersApi,
    resourceName: 'theater',
    resourceLabel: '영화관',
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
        <h1 className="text-2xl font-bold text-cinema-admin-text">영화관 관리</h1>
        <button
          type="button"
          onClick={crud.openCreate}
          className="rounded-lg bg-cinema-admin-primary px-4 py-2 text-sm font-medium text-white hover:bg-cinema-admin-primary-hover"
        >
          영화관 등록
        </button>
      </div>

      {crud.isEmpty ? (
        <EmptyState
          title="등록된 영화관이 없습니다"
          message="영화관 등록 버튼을 눌러 첫 영화관을 등록하세요."
          variant="admin"
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-cinema-admin-border bg-cinema-admin-surface shadow">
            <table className="min-w-full divide-y divide-cinema-admin-border">
              <thead className="bg-cinema-admin-surface-alt">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">이름</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">위치</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">주소</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">전화</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">상태</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-cinema-admin-muted">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-admin-border bg-cinema-admin-surface">
                {crud.content.map((row) => (
                  <tr key={row.id} className="hover:bg-cinema-admin-surface-alt">
                    <td className="px-4 py-3 text-sm font-medium text-cinema-admin-text">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">{row.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">{row.address || '-'}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">{row.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.status ? STATUS_LABEL[row.status] : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          crud.openEdit(row, (r) => ({
                            name: r.name ?? '',
                            location: r.location ?? '',
                            address: r.address ?? '',
                            phone: r.phone ?? '',
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
        title={crud.editing ? '영화관 수정' : '영화관 등록'}
        size="md"
      >
        <form
          onSubmit={(e) =>
            crud.handleSubmit(e, {
              validate: () => (!crud.form.name.trim() ? '영화관 이름을 입력하세요.' : null),
              buildUpdateBody: (f) => ({
                name: f.name.trim(),
                location: f.location || undefined,
                address: f.address || undefined,
                phone: f.phone || undefined,
              }),
              buildCreateBody: (f) => ({
                name: f.name.trim(),
                location: f.location || undefined,
                address: f.address || undefined,
                phone: f.phone || undefined,
              }),
            })
          }
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">이름 *</label>
            <input
              type="text"
              value={crud.form.name}
              onChange={(e) => crud.setForm((f) => ({ ...f, name: e.target.value }))}
              className={INPUT_CLASS}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">위치</label>
            <input
              type="text"
              value={crud.form.location ?? ''}
              onChange={(e) => crud.setForm((f) => ({ ...f, location: e.target.value }))}
              className={INPUT_CLASS}
              placeholder="예: 강남구"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">주소</label>
            <input
              type="text"
              value={crud.form.address ?? ''}
              onChange={(e) => crud.setForm((f) => ({ ...f, address: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">전화</label>
            <input
              type="text"
              value={crud.form.phone ?? ''}
              onChange={(e) => crud.setForm((f) => ({ ...f, phone: e.target.value }))}
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
            (t) => t.name,
          )
        }
        title="영화관 삭제"
        message={crud.deleteTarget ? `"${crud.deleteTarget.name}"을(를) 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
