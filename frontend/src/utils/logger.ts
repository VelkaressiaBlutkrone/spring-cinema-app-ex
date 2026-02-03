/**
 * 앱 로거: 화면 이동, 예매, 관리자 등록 등 비즈니스 이벤트 로깅
 * - 콘솔 출력 + 백엔드 전송 (파일 저장)
 * RULE: 개인정보, 결제 상세, JWT 값은 로그에 기록하지 않음
 */
import log from 'loglevel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogSource = 'frontend' | 'mobile';

interface LogPayload {
  source: LogSource;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

function formatPayload(category: string, message: string, data?: Record<string, unknown>): LogPayload {
  return {
    source: 'frontend',
    level: 'info',
    category,
    message,
    data: data ? { ...data } : undefined,
  };
}

function logToConsole(level: LogLevel, category: string, message: string, data?: Record<string, unknown>) {
  const prefix = `[${category}]`;
  const logFn = log[level] ?? log.info;
  if (data && Object.keys(data).length > 0) {
    logFn(prefix, message, data);
  } else {
    logFn(prefix, message);
  }
}

async function sendToBackend(payload: LogPayload): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      log.debug('[logger] Backend log send failed:', res.status);
    }
  } catch {
    // 네트워크 오류 등 - 무시 (콘솔 출력만으로 충분)
  }
}

function emit(category: string, message: string, data?: Record<string, unknown>) {
  const payload = formatPayload(category, message, data);
  logToConsole('info', category, message, data);
  sendToBackend(payload);
}

/** 화면 이동 로그 */
export function logNavigation(from: string, to: string, isAdmin: boolean = false) {
  emit('NAVIGATION', `화면 이동: ${from} → ${to}`, { from, to, isAdmin });
}

/** 좌석 HOLD (장바구니 등록) 로그 */
export function logSeatHold(screeningId: number, seatIds: number[], seatCount: number) {
  emit('RESERVATION', '좌석 HOLD (장바구니 등록)', {
    screeningId,
    seatCount,
    // seatIds는 디버그용으로만 (개인정보 아님)
  });
}

/** 좌석 HOLD 해제 로그 */
export function logSeatRelease(screeningId: number, seatIds: number[]) {
  emit('RESERVATION', '좌석 HOLD 해제', { screeningId, seatCount: seatIds.length });
}

/** 예매 완료(결제) 로그 */
export function logReservationComplete(screeningId: number, reservationNo: string, seatCount: number) {
  emit('RESERVATION', '예매 완료', {
    screeningId,
    reservationNo,
    seatCount,
  });
}

/** 관리자 등록 로그 */
export function logAdminCreate(
  resource: 'movie' | 'theater' | 'screen' | 'screening' | 'seat',
  idOrData: number | Record<string, unknown>
) {
  const resourceLabel = {
    movie: '영화',
    theater: '영화관',
    screen: '상영관',
    screening: '상영 스케줄',
    seat: '좌석',
  }[resource];
  const data = typeof idOrData === 'number' ? { id: idOrData } : idOrData;
  emit('ADMIN_CREATE', `관리자 등록: ${resourceLabel}`, { resource, ...data });
}

/** 관리자 수정 로그 */
export function logAdminUpdate(
  resource: 'movie' | 'theater' | 'screen' | 'screening' | 'seat',
  id: number
) {
  const resourceLabel = {
    movie: '영화',
    theater: '영화관',
    screen: '상영관',
    screening: '상영 스케줄',
    seat: '좌석',
  }[resource];
  emit('ADMIN_UPDATE', `관리자 수정: ${resourceLabel}`, { resource, id });
}
