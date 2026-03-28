/**
 * 로그인 — Noir Luxe theme
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { NoirCard } from '@/components/common/NoirCard';
import { NoirButton } from '@/components/common/NoirButton';
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
    'w-full border border-noir-border bg-noir-elevated px-4 py-3.5 text-[13px] text-noir-text placeholder:text-noir-text-muted focus:border-amber/40 focus:shadow-[0_0_0_3px_rgba(232,168,73,0.08)] focus:outline-none transition-all duration-200';

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="relative overflow-hidden border border-noir-border bg-noir-surface p-10">
        {/* Top amber line */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #e8a849, transparent)' }}
          aria-hidden
        />
        {/* Corner glow */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72"
          style={{ background: 'radial-gradient(circle, rgba(232,168,73,0.04), transparent 70%)' }}
          aria-hidden
        />

        <div className="mb-6 flex h-12 w-12 items-center justify-center border border-noir-border bg-amber-subtle text-lg text-amber">
          ✦
        </div>
        <h1 className="mb-1 font-display text-2xl tracking-widest text-noir-text">로그인</h1>
        <p className="mb-8 text-xs text-noir-text-muted">영화관 예매 시스템에 로그인합니다</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="loginId"
              className="mb-2 block text-[9px] uppercase tracking-[3px] text-noir-text-muted"
            >
              아이디
            </label>
            <input
              id="loginId"
              type="text"
              value={form.loginId}
              onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value }))}
              className={inputClass}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[9px] uppercase tracking-[3px] text-noir-text-muted"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className={inputClass}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <NoirButton type="submit" disabled={loading} className="w-full">
            {loading ? '로그인 중...' : '로그인'}
          </NoirButton>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-noir-border" />
          <span className="text-[10px] uppercase tracking-[2px] text-noir-text-muted">또는</span>
          <span className="h-px flex-1 bg-noir-border" />
        </div>

        <p className="text-center text-xs text-noir-text-muted">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-amber transition hover:opacity-80">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
