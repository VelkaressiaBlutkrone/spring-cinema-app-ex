/**
 * 로그인 — cinema theme
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
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
      setTokens(res.accessToken);
      showSuccess('로그인되었습니다.');
      navigate('/');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-3 text-cinema-text placeholder:text-cinema-muted-dark focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue';

  return (
    <div className="mx-auto max-w-md py-12">
      <GlassCard className="p-8">
        <h1 className="mb-6 font-display text-2xl tracking-widest text-cinema-text">로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginId" className="mb-1 block text-sm font-medium text-cinema-muted">
              아이디
            </label>
            <input
              id="loginId"
              type="text"
              value={form.loginId}
              onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-cinema-muted">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <NeonButton type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </NeonButton>
        </form>
        <p className="mt-4 text-center text-sm text-cinema-muted">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-cinema-neon-blue hover:underline">
            회원가입
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
