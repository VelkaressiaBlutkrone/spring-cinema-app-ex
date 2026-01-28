/**
 * 토스트 컨텍스트 정의
 */
import { createContext } from 'react';
import type { ToastType } from '@/components/common/ui/Toast';

export interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
