/**
 * 로그인 페이지
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import type { LoginRequest } from '@/types/auth.types';

export function LoginPage() {
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LoginRequest>({
    loginId: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setTokens(res.accessToken, res.refreshToken);
      showSuccess('로그인되었습니다.');
      navigate('/');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="loginId" className="mb-1 block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            id="loginId"
            type="text"
            value={form.loginId}
            onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="password"
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
        계정이 없으신가요?{' '}
        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          회원가입
        </Link>
      </p>
    </div>
  );
}
