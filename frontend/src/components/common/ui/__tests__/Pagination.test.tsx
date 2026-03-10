import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/components/common/ui/Pagination';

describe('Pagination', () => {
  it('페이지 번호를 1-based로 표시한다', () => {
    render(
      <Pagination currentPage={0} totalPages={3} totalElements={30} onPageChange={() => {}} />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('현재 페이지에 aria-current="page"가 있다', () => {
    render(
      <Pagination currentPage={1} totalPages={5} totalElements={50} onPageChange={() => {}} />
    );
    expect(screen.getByLabelText('2페이지')).toHaveAttribute('aria-current', 'page');
  });

  it('이전 버튼 클릭 시 onPageChange를 호출한다', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} totalElements={50} onPageChange={onPageChange} />
    );

    await user.click(screen.getByLabelText('이전 페이지'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('다음 버튼 클릭 시 onPageChange를 호출한다', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} totalElements={50} onPageChange={onPageChange} />
    );

    await user.click(screen.getByLabelText('다음 페이지'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('첫 페이지에서 이전 버튼이 disabled이다', () => {
    render(
      <Pagination currentPage={0} totalPages={5} totalElements={50} onPageChange={() => {}} />
    );
    expect(screen.getByLabelText('이전 페이지')).toBeDisabled();
  });

  it('마지막 페이지에서 다음 버튼이 disabled이다', () => {
    render(
      <Pagination currentPage={4} totalPages={5} totalElements={50} onPageChange={() => {}} />
    );
    expect(screen.getByLabelText('다음 페이지')).toBeDisabled();
  });

  it('전체 N개를 표시한다', () => {
    render(
      <Pagination currentPage={0} totalPages={5} totalElements={128} onPageChange={() => {}} />
    );
    expect(screen.getByText('전체 128개')).toBeInTheDocument();
  });

  it('중간 페이지에서 앞뒤 일부만 표시한다 (visiblePages)', () => {
    render(
      <Pagination currentPage={5} totalPages={10} totalElements={100} onPageChange={() => {}} />
    );
    // currentPage=5 → visiblePages = slice(3, 8) → pages 3,4,5,6,7 → display 4,5,6,7,8
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
