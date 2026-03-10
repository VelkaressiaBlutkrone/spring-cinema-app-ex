import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '@/components/common/ui/Toast';

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('isVisible=false이면 렌더링하지 않는다', () => {
    render(<Toast message="test" type="info" isVisible={false} onClose={() => {}} />);
    expect(screen.queryByText('test')).not.toBeInTheDocument();
  });

  it('isVisible=true이면 메시지를 표시한다', () => {
    render(<Toast message="알림 메시지" type="info" isVisible={true} onClose={() => {}} />);
    expect(screen.getByText('알림 메시지')).toBeInTheDocument();
  });

  it('role="alert" 속성이 있다', () => {
    render(<Toast message="경고" type="warning" isVisible={true} onClose={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose를 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast message="닫기 테스트" type="info" isVisible={true} onClose={onClose} />);

    await user.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('duration 후 자동으로 onClose를 호출한다', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <Toast message="자동 닫힘" type="success" isVisible={true} onClose={onClose} duration={2000} />
    );

    vi.advanceTimersByTime(1999);
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('duration=0이면 자동 닫힘이 없다', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <Toast message="수동 닫힘" type="info" isVisible={true} onClose={onClose} duration={0} />
    );

    vi.advanceTimersByTime(10000);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('4가지 type별로 렌더링된다', () => {
    const types = ['success', 'error', 'info', 'warning'] as const;
    for (const type of types) {
      const { unmount } = render(
        <Toast message={`${type} msg`} type={type} isVisible={true} onClose={() => {}} />
      );
      expect(screen.getByText(`${type} msg`)).toBeInTheDocument();
      unmount();
    }
  });
});
