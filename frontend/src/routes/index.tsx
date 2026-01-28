/**
 * 라우팅 설정 (React Router)
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage, LoginPage, MoviesPage, SeatSelectPage, PaymentPage } from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies', element: <MoviesPage /> },
      { path: 'book/:screeningId', element: <SeatSelectPage /> },
      { path: 'payment/:screeningId', element: <PaymentPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <Navigate to="/login" replace /> }, // TODO: 회원가입 페이지
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
