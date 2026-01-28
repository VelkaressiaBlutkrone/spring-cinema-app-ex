/**
 * 라우팅 설정 (React Router)
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage, LoginPage, MoviesPage } from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies', element: <MoviesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <Navigate to="/login" replace /> }, // TODO: 회원가입 페이지
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
