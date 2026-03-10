import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/common/ui/EmptyState';

describe('EmptyState', () => {
  it('기본 제목과 메시지를 표시한다', () => {
    render(<EmptyState />);
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('표시할 데이터가 없습니다.')).toBeInTheDocument();
  });

  it('커스텀 title과 message를 표시한다', () => {
    render(<EmptyState title="검색 결과 없음" message="다른 키워드로 검색해보세요." />);
    expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
    expect(screen.getByText('다른 키워드로 검색해보세요.')).toBeInTheDocument();
  });

  it('icon을 렌더링한다', () => {
    render(<EmptyState icon={<span data-testid="icon">🎬</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('action을 렌더링한다', () => {
    render(<EmptyState action={<button>새로 만들기</button>} />);
    expect(screen.getByText('새로 만들기')).toBeInTheDocument();
  });
});
