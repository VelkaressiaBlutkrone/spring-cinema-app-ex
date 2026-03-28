/**
 * 모달 — Noir Luxe / Admin 양쪽 대응
 * variant="noir" (기본): 다크 테마, variant="admin": 라이트 테마
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'noir' | 'admin';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md', variant = 'noir' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const isAdmin = variant === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 backdrop-blur-lg ${
          isAdmin ? 'bg-black/30' : 'bg-noir-bg/80'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-h-[90vh] overflow-y-auto rounded-sm border shadow-lg ${sizeClasses[size]} ${
          isAdmin
            ? 'border-cinema-admin-border bg-cinema-admin-surface'
            : 'border-noir-border bg-noir-surface grain-overlay shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_1px_rgba(232,168,73,0.2)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className={`flex items-center justify-between border-b p-5 sm:p-6 ${
              isAdmin ? 'border-cinema-admin-border' : 'border-noir-border'
            }`}
          >
            <h2
              className={
                isAdmin
                  ? 'text-lg font-semibold text-cinema-admin-text'
                  : 'font-display text-xl tracking-widest text-noir-text'
              }
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`flex h-8 w-8 items-center justify-center text-2xl leading-none transition ${
                isAdmin
                  ? 'text-cinema-admin-muted hover:bg-cinema-admin-surface-alt hover:text-cinema-admin-text'
                  : 'text-noir-text-muted hover:bg-noir-hover hover:text-noir-text'
              }`}
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        )}
        <div
          className={`p-5 sm:p-6 ${
            isAdmin ? 'text-cinema-admin-text' : 'text-noir-text'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
