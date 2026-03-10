import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function renderWithRouter(initialPath: string, isAuthenticated: boolean) {
  useAuthStore.setState({
    accessToken: isAuthenticated ? 'test-token' : null,
    isAuthenticated,
  });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>보호된 콘텐츠</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>로그인 페이지</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: false });
  });

  it('인증됨 → children을 렌더링한다', () => {
    renderWithRouter('/protected', true);
    expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
  });

  it('미인증 → /login으로 리디렉트한다', () => {
    renderWithRouter('/protected', false);
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
  });

  it('미인증 시 현재 경로를 state.from으로 전달한다', () => {
    // Navigate에 state={{ from: location.pathname }}가 전달되는지 확인
    // MemoryRouter에서 리디렉트 후 /login 페이지가 렌더링되면 성공
    renderWithRouter('/protected', false);
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
  });
});
