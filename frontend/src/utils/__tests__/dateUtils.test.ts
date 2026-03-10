import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatDate,
  getRelativeTime,
  isToday,
  getWeekRange,
  getMonthRange,
  getQuarterRange,
  getYearRange,
  getScreeningDisplayStatus,
  SCREENING_DISPLAY_LABEL,
} from '@/utils/dateUtils';

describe('formatDate', () => {
  it('Date 객체를 YYYY-MM-DD 포맷으로 변환한다', () => {
    const date = new Date(2025, 0, 15); // 2025-01-15
    expect(formatDate(date)).toBe('2025-01-15');
  });

  it('문자열 입력을 파싱하여 포맷한다', () => {
    expect(formatDate('2025-06-01T00:00:00')).toBe('2025-06-01');
  });

  it('YYYY-MM-DD HH:mm:ss 포맷을 지원한다', () => {
    const date = new Date(2025, 5, 15, 14, 30, 45);
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2025-06-15 14:30:45');
  });

  it('HH:mm 포맷을 지원한다', () => {
    const date = new Date(2025, 0, 1, 9, 5, 0);
    expect(formatDate(date, 'HH:mm')).toBe('09:05');
  });
});

describe('getRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('60초 미만이면 "방금 전"을 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 1, 12, 0, 30));
    expect(getRelativeTime(new Date(2025, 0, 1, 12, 0, 0))).toBe('방금 전');
  });

  it('60분 미만이면 "N분 전"을 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 1, 12, 10, 0));
    expect(getRelativeTime(new Date(2025, 0, 1, 12, 0, 0))).toBe('10분 전');
  });

  it('24시간 미만이면 "N시간 전"을 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 1, 15, 0, 0));
    expect(getRelativeTime(new Date(2025, 0, 1, 12, 0, 0))).toBe('3시간 전');
  });

  it('7일 미만이면 "N일 전"을 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 4, 12, 0, 0));
    expect(getRelativeTime(new Date(2025, 0, 1, 12, 0, 0))).toBe('3일 전');
  });

  it('7일 이상이면 날짜를 표시한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0));
    expect(getRelativeTime(new Date(2025, 0, 1, 12, 0, 0))).toBe('2025-01-01');
  });
});

describe('isToday', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('오늘 날짜이면 true를 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0));
    expect(isToday(new Date(2025, 5, 15, 23, 59, 59))).toBe(true);
  });

  it('어제 날짜이면 false를 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0));
    expect(isToday(new Date(2025, 5, 14, 10, 0, 0))).toBe(false);
  });
});

describe('getWeekRange', () => {
  it('일요일 시작, 토요일 종료 범위를 반환한다', () => {
    // 2025-01-15 (수요일)
    const date = new Date(2025, 0, 15);
    const { start, end } = getWeekRange(date);

    expect(start.getDay()).toBe(0); // 일요일
    expect(start.getDate()).toBe(12);
    expect(end.getDate()).toBe(18);
    expect(end.getHours()).toBe(23);
  });
});

describe('getMonthRange', () => {
  it('월 시작일과 종료일을 반환한다', () => {
    const date = new Date(2025, 1, 15); // 2월
    const { start, end } = getMonthRange(date);

    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(1);
    expect(end.getDate()).toBe(28); // 2025년 2월
    expect(end.getHours()).toBe(23);
  });
});

describe('getQuarterRange', () => {
  it('분기 시작과 종료를 반환한다', () => {
    const date = new Date(2025, 4, 15); // 5월 → Q2
    const { start, end } = getQuarterRange(date);

    expect(start.getMonth()).toBe(3); // 4월
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(5); // 6월
    expect(end.getDate()).toBe(30);
  });
});

describe('getYearRange', () => {
  it('연도 시작과 종료를 반환한다', () => {
    const date = new Date(2025, 6, 15);
    const { start, end } = getYearRange(date);

    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });
});

describe('getScreeningDisplayStatus', () => {
  it('상영 시작 전이면 BOOKABLE을 반환한다', () => {
    const now = new Date('2025-01-01T09:00:00');
    expect(getScreeningDisplayStatus('2025-01-01T10:00:00', '2025-01-01T12:00:00', now)).toBe(
      'BOOKABLE'
    );
  });

  it('상영 중이면 NOW_PLAYING을 반환한다', () => {
    const now = new Date('2025-01-01T11:00:00');
    expect(getScreeningDisplayStatus('2025-01-01T10:00:00', '2025-01-01T12:00:00', now)).toBe(
      'NOW_PLAYING'
    );
  });

  it('상영 종료 후이면 ENDED를 반환한다', () => {
    const now = new Date('2025-01-01T13:00:00');
    expect(getScreeningDisplayStatus('2025-01-01T10:00:00', '2025-01-01T12:00:00', now)).toBe(
      'ENDED'
    );
  });
});

describe('SCREENING_DISPLAY_LABEL', () => {
  it('각 상태에 올바른 레이블이 매핑되어 있다', () => {
    expect(SCREENING_DISPLAY_LABEL.BOOKABLE).toBe('예매하기');
    expect(SCREENING_DISPLAY_LABEL.NOW_PLAYING).toBe('상영중');
    expect(SCREENING_DISPLAY_LABEL.ENDED).toBe('상영종료');
  });
});
