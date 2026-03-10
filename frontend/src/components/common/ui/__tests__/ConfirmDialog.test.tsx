import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/components/common/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('isOpen=false이면 렌더링하지 않는다', () => {
    render(
      <ConfirmDialog isOpen={false} onClose={() => {}} onConfirm={() => {}} message="삭제하시겠습니까?" />
    );
    expect(screen.queryByText('삭제하시겠습니까?')).not.toBeInTheDocument();
  });

  it('메시지를 표시한다', () => {
    render(
      <ConfirmDialog isOpen={true} onClose={() => {}} onConfirm={() => {}} message="정말 삭제하시겠습니까?" />
    );
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 클릭 시 onConfirm과 onClose를 호출한다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="삭제"
        message="이 항목을 삭제하시겠습니까?"
        confirmText="네"
        cancelText="아니오"
      />
    );

    await user.click(screen.getByText('네'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('취소 클릭 시 onClose를 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="삭제"
        message="이 항목을 삭제하시겠습니까?"
        confirmText="네"
        cancelText="아니오"
      />
    );

    await user.click(screen.getByText('아니오'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('기본 텍스트는 확인/취소이다', () => {
    render(
      <ConfirmDialog isOpen={true} onClose={() => {}} onConfirm={() => {}} message="진행하시겠습니까?" />
    );
    // title 기본값이 "확인"이므로 getAllByText 사용 후 button 확인
    const confirmButtons = screen.getAllByText('확인');
    // 하나는 title(h2), 하나는 button
    expect(confirmButtons.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('커스텀 confirmText/cancelText를 표시한다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        message="이 항목을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="돌아가기"
      />
    );
    expect(screen.getByText('삭제')).toBeInTheDocument();
    expect(screen.getByText('돌아가기')).toBeInTheDocument();
  });
});
