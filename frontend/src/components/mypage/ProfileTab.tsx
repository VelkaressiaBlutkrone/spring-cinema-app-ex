/**
 * 마이페이지 - 내 정보 탭
 */
import { useState, useEffect } from 'react';
import { membersApi } from '@/api/members';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { NoirCard } from '@/components/common/NoirCard';
import { NoirButton } from '@/components/common/NoirButton';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import type { MemberProfileResponse, MemberUpdateRequest } from '@/types/member.types';

const inputClass =
  'w-full rounded-xl border border-cinema-glass-border bg-cinema-surface px-4 py-3 text-cinema-text placeholder:text-cinema-muted-dark focus:border-cinema-neon-blue focus:outline-none focus:ring-1 focus:ring-cinema-neon-blue';

export function ProfileTab() {
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState<MemberProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MemberUpdateRequest>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    membersApi
      .getProfile()
      .then((p) => {
        setProfile(p);
        setForm({ email: p.email ?? '', phone: p.phone ?? '' });
      })
      .catch((e) => showError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [showError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: MemberUpdateRequest = {};
      if (form.password?.trim()) body.password = form.password.trim();
      if (form.email !== undefined) body.email = form.email.trim() || undefined;
      if (form.phone !== undefined) body.phone = form.phone.trim() || undefined;
      await membersApi.updateProfile(body);
      showSuccess('저장되었습니다.');
      const p = await membersApi.getProfile();
      setProfile(p);
      setForm({ email: p.email ?? '', phone: p.phone ?? '' });
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingSpinner size="lg" message="내 정보를 불러오는 중..." />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <NoirCard className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="profile-loginId" className="mb-1 block text-sm font-medium text-cinema-muted">
            아이디
          </label>
          <input
            id="profile-loginId"
            type="text"
            value={profile.loginId}
            readOnly
            className={inputClass + ' cursor-not-allowed opacity-80'}
            aria-readonly
          />
        </div>
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-cinema-muted">
            이름
          </label>
          <input
            id="profile-name"
            type="text"
            value={profile.name}
            readOnly
            className={inputClass + ' cursor-not-allowed opacity-80'}
            aria-readonly
          />
        </div>
        <div>
          <label htmlFor="profile-password" className="mb-1 block text-sm font-medium text-cinema-muted">
            새 비밀번호 (변경 시에만 입력)
          </label>
          <input
            id="profile-password"
            type="password"
            value={form.password ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className={inputClass}
            placeholder="비워두면 변경하지 않습니다"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-cinema-muted">
            이메일
          </label>
          <input
            id="profile-email"
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium text-cinema-muted">
            연락처
          </label>
          <input
            id="profile-phone"
            type="text"
            value={form.phone ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className={inputClass}
          />
        </div>
        <NoirButton type="submit" disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </NoirButton>
      </form>
    </NoirCard>
  );
}
