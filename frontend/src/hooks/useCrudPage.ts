/**
 * 관리자 CRUD 페이지 공통 훅
 * - 목록 조회 (페이지네이션), 등록/수정 모달, 삭제 확인 로직 통합
 * - 각 페이지는 이 훅의 반환값으로 UI만 구성
 */
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/errorHandler';
import { logAdminCreate, logAdminUpdate } from '@/utils/logger';
import { getPageIndex } from '@/types/api.types';

const DEFAULT_PAGE_SIZE = 10;

/** API 계층이 반환하는 공통 응답 구조 */
interface PagedResponse<T> {
  success: boolean;
  data?: {
    content?: T[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    page?: number;
  };
}

interface CrudApi<TResponse, TCreate, TUpdate> {
  getList: (params: { page: number; size: number }) => Promise<PagedResponse<TResponse>>;
  create: (body: TCreate) => Promise<{ data?: unknown }>;
  update: (id: number, body: TUpdate) => Promise<unknown>;
  delete: (id: number) => Promise<unknown>;
}

interface UseCrudPageConfig<TResponse, TCreate, TUpdate> {
  api: CrudApi<TResponse, TCreate, TUpdate>;
  resourceName: string;
  resourceLabel: string;
  emptyForm: TCreate;
  pageSize?: number;
}

export interface CrudPageState<TResponse, TCreate> {
  // 목록
  loading: boolean;
  content: TResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  setPage: (p: number) => void;
  // 모달
  modalOpen: boolean;
  editing: TResponse | null;
  form: TCreate;
  setForm: React.Dispatch<React.SetStateAction<TCreate>>;
  submitLoading: boolean;
  // 삭제
  deleteTarget: TResponse | null;
  setDeleteTarget: (t: TResponse | null) => void;
  // 액션
  openCreate: () => void;
  openEdit: (row: TResponse, formMapper: (row: TResponse) => TCreate) => void;
  closeModal: () => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    options?: {
      validate?: () => string | null;
      buildCreateBody?: (form: TCreate) => TCreate;
      buildUpdateBody?: (form: TCreate, editing: TResponse) => unknown;
    },
  ) => Promise<void>;
  handleDelete: (getId: (t: TResponse) => number, getLabel: (t: TResponse) => string) => Promise<void>;
  fetchList: (pageNum?: number) => Promise<void>;
  isEmpty: boolean;
}

export function useCrudPage<
  TResponse extends { id: number },
  TCreate,
  TUpdate = Partial<TCreate>,
>(config: UseCrudPageConfig<TResponse, TCreate, TUpdate>): CrudPageState<TResponse, TCreate> {
  const { api, resourceName, resourceLabel, emptyForm, pageSize = DEFAULT_PAGE_SIZE } = config;
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<TResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TResponse | null>(null);
  const [form, setForm] = useState<TCreate>(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TResponse | null>(null);

  const fetchList = useCallback(
    async (pageNum: number = 0) => {
      setLoading(true);
      try {
        const res = await api.getList({ page: pageNum, size: pageSize });
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
    [api, pageSize, showError],
  );

  useEffect(() => {
    fetchList(page);
  }, [page, fetchList]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (row: TResponse, formMapper: (row: TResponse) => TCreate) => {
    setEditing(row);
    setForm(formMapper(row));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    options?: {
      validate?: () => string | null;
      buildCreateBody?: (form: TCreate) => TCreate;
      buildUpdateBody?: (form: TCreate, editing: TResponse) => unknown;
    },
  ) => {
    e.preventDefault();
    const validationError = options?.validate?.();
    if (validationError) {
      showError(validationError);
      return;
    }
    setSubmitLoading(true);
    try {
      if (editing) {
        const body = options?.buildUpdateBody
          ? options.buildUpdateBody(form, editing)
          : form;
        await api.update(editing.id, body as TUpdate);
        showSuccess(`${resourceLabel}이(가) 수정되었습니다.`);
        logAdminUpdate(resourceName, editing.id);
      } else {
        const body = options?.buildCreateBody ? options.buildCreateBody(form) : form;
        const created = await api.create(body);
        showSuccess(`${resourceLabel}이(가) 등록되었습니다.`);
        if (created.data != null) logAdminCreate(resourceName, created.data as number);
      }
      closeModal();
      fetchList(page);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (
    getId: (t: TResponse) => number,
    _getLabel: (t: TResponse) => string,
  ) => {
    if (!deleteTarget) return;
    try {
      await api.delete(getId(deleteTarget));
      showSuccess(`${resourceLabel}이(가) 삭제되었습니다.`);
      setDeleteTarget(null);
      fetchList(content.length === 1 && page > 0 ? page - 1 : page);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  return {
    loading,
    content,
    totalElements,
    totalPages,
    page,
    setPage,
    modalOpen,
    editing,
    form,
    setForm,
    submitLoading,
    deleteTarget,
    setDeleteTarget,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleDelete,
    fetchList,
    isEmpty: content.length === 0,
  };
}
