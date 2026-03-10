/**
 * 404 페이지 — 존재하지 않는 경로
 */
import { Link } from 'react-router-dom';
import { NoirCard } from '@/components/common/NoirCard';
import { NoirButton } from '@/components/common/NoirButton';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <NoirCard className="max-w-md text-center">
        <p className="mb-2 text-6xl font-bold text-cinema-neon-red">404</p>
        <h1 className="mb-4 font-display text-2xl tracking-widest text-cinema-text">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mb-6 text-cinema-muted">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <NoirButton to="/">홈으로 돌아가기</NoirButton>
      </NoirCard>
    </div>
  );
}
