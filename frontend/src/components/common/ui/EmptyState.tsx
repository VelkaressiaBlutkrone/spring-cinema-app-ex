/**
 * 빈 상태 — cinema theme
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
    <div className="flex flex-col items-center justify-center px-4 py-12">
      {icon && <div className="mb-4 text-5xl text-cinema-muted-dark/60">{icon}</div>}
      <h3
        className="mb-2 text-center font-display text-lg tracking-widest text-cinema-text"
      >
        {title}
      </h3>
      <p className="mb-6 max-w-md text-center text-sm leading-relaxed text-cinema-muted">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
