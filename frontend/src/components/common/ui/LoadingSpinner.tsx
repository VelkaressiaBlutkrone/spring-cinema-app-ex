/**
 * 로딩 스피너 — cinema theme (neon blue)
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner = ({ size = 'md', message }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-cinema-neon-blue/30 border-t-cinema-neon-blue shrink-0 animate-spin rounded-full`}
        role="status"
        aria-label="로딩 중"
      />
      {message && <p className="text-sm text-cinema-muted">{message}</p>}
    </div>
  );
};
