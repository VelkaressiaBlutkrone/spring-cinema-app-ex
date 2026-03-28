/**
 * 회원가입 — Noir Luxe theme
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { NoirCard } from '@/components/common/NoirCard';
import { NoirButton } from '@/components/common/NoirButton';
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
    'w-full border border-noir-border bg-noir-elevated px-4 py-3.5 text-[13px] text-noir-text placeholder:text-noir-text-muted focus:border-amber/40 focus:shadow-[0_0_0_3px_rgba(232,168,73,0.08)] focus:outline-none transition-all duration-200';

  const labelClass =
    'mb-2 block text-[9px] uppercase tracking-[3px] text-noir-text-muted';

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="relative overflow-hidden border border-noir-border bg-noir-surface p-10">
        {/* Top amber line */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #e8a849, transparent)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72"
          style={{ background: 'radial-gradient(circle, rgba(232,168,73,0.04), transparent 70%)' }}
          aria-hidden
        />

        <div className="mb-6 flex h-12 w-12 items-center justify-center border border-noir-border bg-amber-subtle text-lg text-amber">
          ✦
        </div>
        <h1 className="mb-1 font-display text-2xl tracking-widest text-noir-text">회원가입</h1>
        <p className="mb-8 text-xs text-noir-text-muted">새 계정을 만들어 영화 예매를 시작하세요</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="loginId" className={labelClass}>아이디</label>
            <input
              id="loginId"
              type="text"
              value={form.loginId}
              onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value }))}
              className={inputClass}
              placeholder="아이디를 입력하세요"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>비밀번호</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className={inputClass}
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>이름</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              placeholder="이름을 입력하세요"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>이메일</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={inputClass}
              placeholder="이메일을 입력하세요"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              연락처 <span className="normal-case tracking-normal text-noir-text-muted/60">(선택)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value || undefined }))}
              className={inputClass}
              placeholder="연락처를 입력하세요"
              autoComplete="tel"
            />
          </div>
          <NoirButton type="submit" disabled={loading} className="w-full">
            {loading ? '가입 중...' : '회원가입'}
          </NoirButton>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-noir-border" />
          <span className="text-[10px] uppercase tracking-[2px] text-noir-text-muted">또는</span>
          <span className="h-px flex-1 bg-noir-border" />
        </div>

        <p className="text-center text-xs text-noir-text-muted">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-amber transition hover:opacity-80">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
