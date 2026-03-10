/**
 * 모달 — Noir Luxe design system
 * Dark surface, grain overlay, amber border glow
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-noir-bg/80 backdrop-blur-lg"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-h-[90vh] overflow-y-auto rounded-sm border border-noir-border bg-noir-surface grain-overlay shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_1px_rgba(232,168,73,0.2)] ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-noir-border p-5 sm:p-6">
            <h2 className="font-display text-xl tracking-widest text-noir-text">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center text-2xl leading-none text-noir-text-muted transition hover:bg-noir-hover hover:text-noir-text"
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-5 text-noir-text sm:p-6">{children}</div>
      </div>
    </div>
  );
};
