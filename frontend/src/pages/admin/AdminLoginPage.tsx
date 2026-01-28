/**
 * 관리자 로그인 페이지
 * /admin/login — 로그인 성공 시 role이 ADMIN이면 /admin, 아니면 권한 없음 메시지
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores';
import { useToast } from '@/hooks';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { getErrorMessage } from '@/utils/errorHandler';
import { getRoleFromToken } from '@/utils/jwt';
import type { LoginRequest } from '@/types/auth.types';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, clearAuth, isAuthenticated } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LoginRequest>({ loginId: '', password: '' });

  const from = (location.state as { from?: string })?.from ?? '/admin';

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, from, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setTokens(res.accessToken, res.refreshToken);
      const role = getRoleFromToken(res.accessToken);
      if (role === 'ADMIN') {
        showSuccess('로그인되었습니다.');
        navigate(from, { replace: true });
      } else {
        showError('관리자 계정으로 로그인해 주세요.');
        clearAuth();
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-gray-900">관리자 로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-loginId" className="mb-1 block text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              id="admin-loginId"
              type="text"
              value={form.loginId}
              onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/" className="text-indigo-600 hover:underline">
            사용자 사이트로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
