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
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-transparent text-noir-danger border border-noir-danger/30 hover:border-noir-danger/60 hover:shadow-[0_0_16px_rgba(196,64,64,0.1)]'
      : 'bg-amber text-noir-bg hover:bg-amber-hover hover:shadow-[0_0_24px_rgba(232,168,73,0.3)]';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        <p className="text-noir-text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="min-h-[44px] touch-manipulation bg-noir-text/[0.04] px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[3px] text-noir-text-secondary transition-all duration-200 hover:bg-noir-text/[0.08]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`min-h-[44px] touch-manipulation px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[3px] transition-all duration-200 active:scale-95 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
