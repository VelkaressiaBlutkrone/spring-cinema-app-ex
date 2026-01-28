/**
 * 토스트 메시지 훅
 */
import { useContext } from 'react';
import { ToastContext } from '@/components/common/ui/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastContainer');
  }
  return context;
};
