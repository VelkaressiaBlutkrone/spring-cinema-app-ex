/**
 * 관리자 - 상영관 관리 (목록/등록/수정/삭제)
 * useCrudPage 훅으로 공통 CRUD 로직 추출
 */
import { useState, useEffect, useCallback } from 'react';
import { adminScreensApi, adminTheatersApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { Pagination } from '@/components/common/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';
import { useCrudPage } from '@/hooks';
import type {
  AdminScreenResponse,
  AdminScreenCreateRequest,
  AdminScreenUpdateRequest,
  AdminScreenType,
  AdminScreenStatus,
  AdminTheaterResponse,
} from '@/types/admin.types';

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

const INPUT_CLASS =
  'block w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-2.5 text-cinema-text placeholder:text-cinema-muted focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue';

export function AdminScreensPage() {
  const [theaters, setTheaters] = useState<AdminTheaterResponse[]>([]);

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

  useEffect(() => {
    fetchTheaters();
  }, [fetchTheaters]);

  const crud = useCrudPage<AdminScreenResponse, AdminScreenCreateRequest, AdminScreenUpdateRequest>({
    api: adminScreensApi,
    resourceName: 'screen',
    resourceLabel: '상영관',
    emptyForm: emptyCreate,
  });

  const handleOpenCreate = () => {
    crud.openCreate();
    const firstTheaterId = theaters[0]?.id ?? 0;
    crud.setForm((f) => ({ ...f, theaterId: firstTheaterId }));
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
        <h1 className="text-2xl font-bold text-cinema-admin-text">상영관 관리</h1>
        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={theaters.length === 0}
          className="rounded-lg bg-cinema-admin-primary px-4 py-2 text-sm font-medium text-white hover:bg-cinema-admin-primary-hover disabled:opacity-50"
        >
          상영관 등록
        </button>
      </div>

      {theaters.length === 0 && (
        <p className="mb-4 text-sm text-cinema-admin-danger">
          영화관을 먼저 등록한 뒤 상영관을 등록할 수 있습니다.
        </p>
      )}

      {crud.isEmpty ? (
        <EmptyState
          title="등록된 상영관이 없습니다"
          message="상영관 등록 버튼을 눌러 첫 상영관을 등록하세요."
          variant="admin"
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-cinema-admin-border bg-cinema-admin-surface shadow">
            <table className="min-w-full divide-y divide-cinema-admin-border">
              <thead className="bg-cinema-admin-surface-alt">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">상영관명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">영화관</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">타입</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">좌석(행×열)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-cinema-admin-muted">상태</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-cinema-admin-muted">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-admin-border bg-cinema-admin-surface">
                {crud.content.map((row) => (
                  <tr key={row.id} className="hover:bg-cinema-admin-surface-alt">
                    <td className="px-4 py-3 text-sm font-medium text-cinema-admin-text">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">{row.theaterName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.screenType ? SCREEN_TYPE_LABEL[row.screenType] : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.totalRows != null && row.totalCols != null
                        ? `${row.totalRows}×${row.totalCols} (${row.totalSeats ?? row.totalRows * row.totalCols}석)`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-cinema-admin-secondary">
                      {row.status ? STATUS_LABEL[row.status] : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          crud.openEdit(row, (r) => ({
                            theaterId: r.theaterId,
                            name: r.name ?? '',
                            totalRows: r.totalRows ?? 0,
                            totalCols: r.totalCols ?? 0,
                            screenType: r.screenType ?? 'NORMAL_2D',
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
        title={crud.editing ? '상영관 수정' : '상영관 등록'}
        size="md"
      >
        <form
          onSubmit={(e) =>
            crud.handleSubmit(e, {
              validate: () => {
                if (!crud.form.name.trim()) return '상영관 이름을 입력하세요.';
                if (!crud.editing && !crud.form.theaterId) return '영화관을 선택하세요.';
                if (!crud.form.totalRows || crud.form.totalRows < 1 || !crud.form.totalCols || crud.form.totalCols < 1)
                  return '행 수와 열 수를 1 이상 입력하세요.';
                return null;
              },
              buildUpdateBody: (f) => ({
                name: f.name.trim(),
                totalRows: f.totalRows,
                totalCols: f.totalCols,
                screenType: f.screenType,
              }),
              buildCreateBody: (f) => ({
                theaterId: f.theaterId,
                name: f.name.trim(),
                totalRows: f.totalRows,
                totalCols: f.totalCols,
                screenType: f.screenType,
              }),
            })
          }
          className="space-y-4"
        >
          {!crud.editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">영화관 *</label>
              <select
                value={crud.form.theaterId || ''}
                onChange={(e) =>
                  crud.setForm((f) => ({ ...f, theaterId: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className={INPUT_CLASS}
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
          {crud.editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">영화관</label>
              <p className="text-sm text-cinema-muted">{crud.editing.theaterName}</p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">상영관 이름 *</label>
            <input
              type="text"
              value={crud.form.name}
              onChange={(e) => crud.setForm((f) => ({ ...f, name: e.target.value }))}
              className={INPUT_CLASS}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">총 행 수 *</label>
              <input
                type="number"
                min={1}
                value={crud.form.totalRows || ''}
                onChange={(e) =>
                  crud.setForm((f) => ({ ...f, totalRows: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className={INPUT_CLASS}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-cinema-text">행당 좌석 수 *</label>
              <input
                type="number"
                min={1}
                value={crud.form.totalCols || ''}
                onChange={(e) =>
                  crud.setForm((f) => ({ ...f, totalCols: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className={INPUT_CLASS}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cinema-text">상영관 타입 *</label>
            <select
              value={crud.form.screenType}
              onChange={(e) =>
                crud.setForm((f) => ({ ...f, screenType: e.target.value as AdminScreenType }))
              }
              className={INPUT_CLASS}
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
        title="상영관 삭제"
        message={crud.deleteTarget ? `"${crud.deleteTarget.name}"을(를) 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
