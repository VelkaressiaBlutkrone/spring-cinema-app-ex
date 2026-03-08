/**
 * 라우팅 설정 (React Router)
 * - ProtectedRoute: 인증 필수 경로 (예매, 결제, 마이페이지 등)
 * - AdminRoute: 관리자 전용 경로
 * - Lazy Loading: 관리자 페이지 코드 스플리팅
 */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import {
  HomePage,
  LoginPage,
  SignupPage,
  MoviesPage,
  SeatSelectPage,
  PaymentPage,
  ReservationsPage,
  ReservationDetailPage,
  MyPage,
} from '@/pages';

// Lazy-loaded admin pages (코드 스플리팅)
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminMoviesPage = lazy(() => import('@/pages/admin/AdminMoviesPage').then((m) => ({ default: m.AdminMoviesPage })));
const AdminTheatersPage = lazy(() => import('@/pages/admin/AdminTheatersPage').then((m) => ({ default: m.AdminTheatersPage })));
const AdminScreensPage = lazy(() => import('@/pages/admin/AdminScreensPage').then((m) => ({ default: m.AdminScreensPage })));
const AdminScreeningsPage = lazy(() => import('@/pages/admin/AdminScreeningsPage').then((m) => ({ default: m.AdminScreeningsPage })));
const AdminSeatsPage = lazy(() => import('@/pages/admin/AdminSeatsPage').then((m) => ({ default: m.AdminSeatsPage })));
const AdminReservationsPage = lazy(() => import('@/pages/admin/AdminReservationsPage').then((m) => ({ default: m.AdminReservationsPage })));
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })));

// 404 페이지
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function LazyFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <LoadingSpinner size="lg" message="페이지를 불러오는 중..." />
    </div>
  );
}

function lazySuspense(element: React.ReactNode) {
  return <Suspense fallback={<LazyFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies', element: <MoviesPage /> },
      {
        path: 'book/:screeningId',
        element: (
          <ProtectedRoute>
            <SeatSelectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/:screeningId',
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reservations',
        element: (
          <ProtectedRoute>
            <ReservationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reservations/:reservationId',
        element: (
          <ProtectedRoute>
            <ReservationDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mypage',
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'login', element: lazySuspense(<AdminLoginPage />) },
      {
        index: true,
        element: lazySuspense(
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: 'movies',
        element: lazySuspense(
          <AdminRoute>
            <AdminMoviesPage />
          </AdminRoute>
        ),
      },
      {
        path: 'theaters',
        element: lazySuspense(
          <AdminRoute>
            <AdminTheatersPage />
          </AdminRoute>
        ),
      },
      {
        path: 'screens',
        element: lazySuspense(
          <AdminRoute>
            <AdminScreensPage />
          </AdminRoute>
        ),
      },
      {
        path: 'screenings',
        element: lazySuspense(
          <AdminRoute>
            <AdminScreeningsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'seats',
        element: lazySuspense(
          <AdminRoute>
            <AdminSeatsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'reservations',
        element: lazySuspense(
          <AdminRoute>
            <AdminReservationsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'payments',
        element: lazySuspense(
          <AdminRoute>
            <AdminPaymentsPage />
          </AdminRoute>
        ),
      },
    ],
  },
  { path: '*', element: lazySuspense(<NotFoundPage />) },
]);
