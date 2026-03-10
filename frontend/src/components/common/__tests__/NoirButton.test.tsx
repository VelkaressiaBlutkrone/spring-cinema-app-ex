import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NoirButton } from '@/components/common/NoirButton';

describe('NoirButton', () => {
  it('children 텍스트를 렌더링한다', () => {
    render(<NoirButton>클릭</NoirButton>);
    expect(screen.getByText('클릭')).toBeInTheDocument();
  });

  it('기본 variant는 primary이다', () => {
    render(<NoirButton>버튼</NoirButton>);
    const button = screen.getByText('버튼');
    expect(button.className).toContain('bg-amber');
  });

  it('ghost variant 클래스를 적용한다', () => {
    render(<NoirButton variant="ghost">Ghost</NoirButton>);
    expect(screen.getByText('Ghost').className).toContain('border-amber/30');
  });

  it('danger variant 클래스를 적용한다', () => {
    render(<NoirButton variant="danger">Danger</NoirButton>);
    expect(screen.getByText('Danger').className).toContain('text-noir-danger');
  });

  it('subtle variant 클래스를 적용한다', () => {
    render(<NoirButton variant="subtle">Subtle</NoirButton>);
    expect(screen.getByText('Subtle').className).toContain('text-noir-text-secondary');
  });

  it('onClick 콜백을 호출한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NoirButton onClick={onClick}>클릭</NoirButton>);

    await user.click(screen.getByText('클릭'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 시 클릭이 불가하다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <NoirButton onClick={onClick} disabled>
        비활성
      </NoirButton>
    );

    await user.click(screen.getByText('비활성'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('to prop이 있으면 Link를 렌더링한다', () => {
    render(
      <MemoryRouter>
        <NoirButton to="/test">링크 버튼</NoirButton>
      </MemoryRouter>
    );
    const link = screen.getByText('링크 버튼');
    expect(link.closest('a')).toHaveAttribute('href', '/test');
  });

  it('type="submit"을 전달한다', () => {
    render(<NoirButton type="submit">제출</NoirButton>);
    expect(screen.getByText('제출').closest('button')).toHaveAttribute('type', 'submit');
  });

  it('className을 병합한다', () => {
    render(<NoirButton className="custom-class">버튼</NoirButton>);
    expect(screen.getByText('버튼').className).toContain('custom-class');
  });
});
