import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from '@/components/common/ui/ToastContainer';
import { router } from '@/routes';

export default function App() {
  return (
    <ToastContainer>
      <RouterProvider router={router} />
    </ToastContainer>
  );
}
