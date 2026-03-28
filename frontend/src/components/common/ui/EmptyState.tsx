/**
 * 빈 상태 — Noir Luxe design system
 * 점선 테두리, 원형 아이콘, radial 글로우
 */
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = ({
  title = '데이터가 없습니다',
  message = '표시할 데이터가 없습니다.',
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden border border-dashed border-noir-border px-4 py-14">
      {/* Radial glow */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(232,168,73,0.03), transparent 60%)' }}
        aria-hidden
      />
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-noir-border bg-amber-subtle">
        {icon ? (
          <span className="text-2xl text-amber/50">{icon}</span>
        ) : (
          <span className="text-2xl text-amber/50">▶</span>
        )}
      </div>
      <h3 className="mb-2 text-center font-display text-lg tracking-widest text-noir-text">
        {title}
      </h3>
      <p className="mb-6 max-w-xs text-center text-sm leading-relaxed text-noir-text-secondary">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
