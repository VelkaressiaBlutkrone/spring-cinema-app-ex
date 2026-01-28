/**
 * 라우팅 설정 (React Router)
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import {
  HomePage,
  LoginPage,
  MoviesPage,
  SeatSelectPage,
  PaymentPage,
  ReservationsPage,
  ReservationDetailPage,
  AdminLoginPage,
  AdminDashboardPage,
  AdminPlaceholderPage,
} from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies', element: <MoviesPage /> },
      { path: 'book/:screeningId', element: <SeatSelectPage /> },
      { path: 'payment/:screeningId', element: <PaymentPage /> },
      { path: 'reservations', element: <ReservationsPage /> },
      { path: 'reservations/:reservationId', element: <ReservationDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <Navigate to="/login" replace /> }, // TODO: 회원가입 페이지
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'login', element: <AdminLoginPage /> },
      { path: 'movies', element: <AdminPlaceholderPage /> },
      { path: 'theaters', element: <AdminPlaceholderPage /> },
      { path: 'screens', element: <AdminPlaceholderPage /> },
      { path: 'screenings', element: <AdminPlaceholderPage /> },
      { path: 'seats', element: <AdminPlaceholderPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
