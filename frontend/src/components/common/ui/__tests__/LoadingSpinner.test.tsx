import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('role="status"가 존재한다', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('aria-label="로딩 중"이 있다', () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText('로딩 중')).toBeInTheDocument();
  });

  it('메시지 전달 시 표시한다', () => {
    render(<LoadingSpinner message="데이터 로딩 중..." />);
    expect(screen.getByText('데이터 로딩 중...')).toBeInTheDocument();
  });

  it('메시지가 없으면 표시하지 않는다', () => {
    const { container } = render(<LoadingSpinner />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });
});
