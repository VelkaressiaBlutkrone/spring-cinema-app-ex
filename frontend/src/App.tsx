import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from '@/components/common/ui/ToastContainer';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer>
        <RouterProvider router={router} />
      </ToastContainer>
    </QueryClientProvider>
  );
}
