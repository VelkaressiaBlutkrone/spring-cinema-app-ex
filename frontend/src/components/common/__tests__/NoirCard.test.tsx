import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoirCard } from '@/components/common/NoirCard';

describe('NoirCard', () => {
  it('children을 렌더링한다', () => {
    render(<NoirCard>카드 내용</NoirCard>);
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('기본 padding이면 p-6 클래스가 있다', () => {
    const { container } = render(<NoirCard>내용</NoirCard>);
    expect(container.firstElementChild?.className).toContain('p-6');
  });

  it('padding=false이면 p-6 클래스가 없다', () => {
    const { container } = render(<NoirCard padding={false}>내용</NoirCard>);
    expect(container.firstElementChild?.className).not.toContain('p-6');
  });

  it('className을 병합한다', () => {
    const { container } = render(<NoirCard className="my-class">내용</NoirCard>);
    expect(container.firstElementChild?.className).toContain('my-class');
  });

  it('grain-overlay 클래스가 존재한다', () => {
    const { container } = render(<NoirCard>내용</NoirCard>);
    expect(container.firstElementChild?.className).toContain('grain-overlay');
  });
});
