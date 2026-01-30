export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return formatDate(d, 'YYYY-MM-DD');
};

export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

export const getWeekRange = (date: Date = new Date()): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // 일요일 시작
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getMonthRange = (date: Date = new Date()): { start: Date; end: Date } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getQuarterRange = (date: Date = new Date()): { start: Date; end: Date } => {
  const quarter = Math.floor(date.getMonth() / 3);
  const start = new Date(date.getFullYear(), quarter * 3, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getYearRange = (date: Date = new Date()): { start: Date; end: Date } => {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const toISOString = (date: Date = new Date()): string => {
  return date.toISOString();
};

/**
 * 상영 시간표 표시용 상태 (현재 시각 기준)
 * - BOOKABLE(예매하기): 상영 시작 전 → 좌석 선택 가능
 * - NOW_PLAYING(상영중): 상영 시작 ~ 종료 사이 → 좌석 선택 불가
 * - ENDED(상영종료): 상영 종료 후 → 좌석 선택 불가
 */
export type ScreeningDisplayStatus = 'BOOKABLE' | 'NOW_PLAYING' | 'ENDED';

export function getScreeningDisplayStatus(
  startTime: string,
  endTime: string,
  now: Date = new Date()
): ScreeningDisplayStatus {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const t = now.getTime();
  if (t < start) return 'BOOKABLE';
  if (t < end) return 'NOW_PLAYING';
  return 'ENDED';
}

export const SCREENING_DISPLAY_LABEL: Record<ScreeningDisplayStatus, string> = {
  BOOKABLE: '예매하기',
  NOW_PLAYING: '상영중',
  ENDED: '상영종료',
};
