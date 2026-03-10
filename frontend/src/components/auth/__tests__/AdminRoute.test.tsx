import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AdminRoute } from '@/components/auth/AdminRoute';

function createTestJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.test-sig`;
}

function renderAdminRoute(opts: { isAuthenticated: boolean; role?: string }) {
  const token = opts.role ? createTestJwt({ role: opts.role }) : null;
  useAuthStore.setState({
    accessToken: token,
    isAuthenticated: opts.isAuthenticated,
  });

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>관리자 콘텐츠</div>
            </AdminRoute>
          }
        />
        <Route path="/admin/login" element={<div>관리자 로그인</div>} />
        <Route path="/" element={<div>홈 페이지</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: false });
  });

  it('관리자 인증됨 → children을 렌더링한다', () => {
    renderAdminRoute({ isAuthenticated: true, role: 'ADMIN' });
    expect(screen.getByText('관리자 콘텐츠')).toBeInTheDocument();
  });

  it('미인증 → /admin/login으로 리디렉트한다', () => {
    renderAdminRoute({ isAuthenticated: false });
    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
  });

  it('인증됨 + 비관리자 → /로 리디렉트한다', () => {
    renderAdminRoute({ isAuthenticated: true, role: 'USER' });
    expect(screen.getByText('홈 페이지')).toBeInTheDocument();
  });

  it('관리자가 아닌 경우 관리자 콘텐츠가 보이지 않는다', () => {
    renderAdminRoute({ isAuthenticated: true, role: 'USER' });
    expect(screen.queryByText('관리자 콘텐츠')).not.toBeInTheDocument();
  });
});
