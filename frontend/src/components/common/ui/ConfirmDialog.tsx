/**
 * 확인 다이얼로그 — Noir Luxe design system
 */
import { Modal } from '@/components/common/ui/Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  theme?: 'noir' | 'admin';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  theme = 'noir',
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const isAdmin = theme === 'admin';

  const confirmButtonClass =
    variant === 'danger'
      ? isAdmin
        ? 'bg-cinema-admin-danger text-white hover:opacity-90'
        : 'bg-transparent text-noir-danger border border-noir-danger/30 hover:border-noir-danger/60 hover:shadow-[0_0_16px_rgba(196,64,64,0.1)]'
      : isAdmin
        ? 'bg-cinema-admin-primary text-white hover:bg-cinema-admin-primary-hover'
        : 'bg-amber text-noir-bg hover:bg-amber-hover hover:shadow-[0_0_24px_rgba(232,168,73,0.3)]';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" variant={theme}>
      <div className="space-y-5">
        <p className={isAdmin ? 'text-cinema-admin-secondary' : 'text-noir-text-secondary'}>{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`min-h-[44px] touch-manipulation rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              isAdmin
                ? 'border border-cinema-admin-border bg-cinema-admin-surface-alt text-cinema-admin-secondary hover:bg-cinema-admin-border'
                : 'bg-noir-text/[0.04] px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[3px] text-noir-text-secondary hover:bg-noir-text/[0.08]'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`min-h-[44px] touch-manipulation rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
