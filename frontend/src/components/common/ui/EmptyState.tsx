/**
 * 빈 상태 — Noir Luxe / Admin 양쪽 대응
 * variant="noir" (기본): 다크 테마, variant="admin": 라이트 테마
 */
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'noir' | 'admin';
}

export const EmptyState = ({
  title = '데이터가 없습니다',
  message = '표시할 데이터가 없습니다.',
  icon,
  action,
  variant = 'noir',
}: EmptyStateProps) => {
  const isAdmin = variant === 'admin';

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden border border-dashed px-4 py-14 ${
        isAdmin ? 'border-cinema-admin-border' : 'border-noir-border'
      }`}
    >
      {/* Radial glow (noir only) */}
      {!isAdmin && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 30%, rgba(232,168,73,0.03), transparent 60%)' }}
          aria-hidden
        />
      )}
      <div
        className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${
          isAdmin
            ? 'border-cinema-admin-border bg-cinema-admin-surface-alt'
            : 'border-noir-border bg-amber-subtle'
        }`}
      >
        {icon ? (
          <span className={`text-2xl ${isAdmin ? 'text-cinema-admin-muted' : 'text-amber/50'}`}>{icon}</span>
        ) : (
          <span className={`text-2xl ${isAdmin ? 'text-cinema-admin-muted' : 'text-amber/50'}`}>▶</span>
        )}
      </div>
      <h3
        className={`mb-2 text-center text-lg font-medium ${
          isAdmin ? 'text-cinema-admin-text' : 'font-display tracking-widest text-noir-text'
        }`}
      >
        {title}
      </h3>
      <p
        className={`mb-6 max-w-xs text-center text-sm leading-relaxed ${
          isAdmin ? 'text-cinema-admin-muted' : 'text-noir-text-secondary'
        }`}
      >
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
