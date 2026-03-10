/**
 * 로딩 스피너 — Noir Luxe design system (amber)
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner = ({ size = 'md', message }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-amber/30 border-t-amber shrink-0 animate-spin rounded-full`}
        role="status"
        aria-label="로딩 중"
      />
      {message && <p className="text-sm text-noir-text-muted">{message}</p>}
    </div>
  );
};
