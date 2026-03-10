import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/common/ui/Modal';

describe('Modal', () => {
  it('isOpen=false이면 렌더링하지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        내용
      </Modal>
    );
    expect(screen.queryByText('내용')).not.toBeInTheDocument();
  });

  it('isOpen=true이면 children을 표시한다', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        모달 내용
      </Modal>
    );
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('title 전달 시 표시한다', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="제목">
        내용
      </Modal>
    );
    expect(screen.getByText('제목')).toBeInTheDocument();
  });

  it('title이 없으면 제목 영역을 표시하지 않는다', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        내용
      </Modal>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose를 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="제목">
        내용
      </Modal>
    );

    await user.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('백드롭 클릭 시 onClose를 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        내용
      </Modal>
    );

    // 백드롭은 aria-hidden 속성을 가진 첫 번째 div
    const backdrop = document.querySelector('[aria-hidden]')!;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('모달 콘텐츠 클릭 시 onClose를 호출하지 않는다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <span>내용 클릭</span>
      </Modal>
    );

    await user.click(screen.getByText('내용 클릭'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('isOpen=true일 때 body overflow를 hidden으로 설정한다', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={() => {}}>
        내용
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
