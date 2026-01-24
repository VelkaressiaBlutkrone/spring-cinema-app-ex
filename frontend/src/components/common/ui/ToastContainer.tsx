/**
 * 토스트 메시지 컨테이너 컴포넌트
 */
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Toast } from './Toast';
import type { ToastType } from './Toast';
import { ToastContext } from './ToastContext';

interface ToastContainerProps {
  children: ReactNode;
}

export const ToastContainer = ({ children }: ToastContainerProps) => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
    duration?: number;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
    duration: 3000,
  });

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    setToast({ message, type, isVisible: true, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error', 5000); // 에러는 5초간 표시
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={toast.duration}
      />
    </ToastContext.Provider>
  );
};
