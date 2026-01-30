/**
 * 회원가입 — cinema theme
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { GlassCard } from '@/components/common/GlassCard';
import { NeonButton } from '@/components/common/NeonButton';
import type { SignUpRequest } from '@/types/auth.types';

export function SignupPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SignUpRequest>({
    loginId: '',
    password: '',
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.signup(form);
      showSuccess('회원가입이 완료되었습니다. 로그인해 주세요.');
      navigate('/login');
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
        <h1 className="mb-6 font-display text-2xl tracking-widest text-cinema-text">회원가입</h1>
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
              autoComplete="username"
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
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-cinema-muted">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-cinema-muted">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={inputClass}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-cinema-muted">
              연락처 <span className="text-cinema-muted/70">(선택)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value || undefined }))}
              className={inputClass}
              autoComplete="tel"
            />
          </div>
          <NeonButton type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </NeonButton>
        </form>
        <p className="mt-4 text-center text-sm text-cinema-muted">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-cinema-neon-blue hover:underline">
            로그인
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
