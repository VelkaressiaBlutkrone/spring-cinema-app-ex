/// 서버 ErrorCode와 매핑되는 클라이언트 에러 코드
///
/// Spring GlobalExceptionHandler / ErrorCode.java와 동기화하여
/// API 에러 응답(code) 파싱 시 사용합니다.
enum AppErrorCode {
  // 인증/인가
  unauthorized('AUTH_001', '인증이 필요합니다.'),
  invalidToken('AUTH_002', '유효하지 않은 토큰입니다.'),
  expiredToken('AUTH_003', '만료된 토큰입니다.'),
  accessDenied('AUTH_004', '접근 권한이 없습니다.'),
  invalidRefreshToken('AUTH_005', '유효하지 않은 Refresh Token입니다.'),

  // 회원
  memberNotFound('MEMBER_001', '회원을 찾을 수 없습니다.'),
  duplicateLoginId('MEMBER_002', '이미 존재하는 아이디입니다.'),
  duplicateEmail('MEMBER_003', '이미 존재하는 이메일입니다.'),
  invalidPassword('MEMBER_004', '비밀번호가 일치하지 않습니다.'),
  memberDisabled('MEMBER_005', '비활성화된 회원입니다.'),

  // 영화
  movieNotFound('MOVIE_001', '영화를 찾을 수 없습니다.'),
  movieNotShowing('MOVIE_002', '현재 상영 중인 영화가 아닙니다.'),

  // 상영
  screeningNotFound('SCREENING_001', '상영 스케줄을 찾을 수 없습니다.'),
  screeningEnded('SCREENING_002', '이미 종료된 상영입니다.'),
  screeningCancelled('SCREENING_003', '취소된 상영입니다.'),
  seatNotAvailable('SEAT_002', '예매 가능한 좌석이 아닙니다.'),
  seatAlreadyHold('SEAT_003', '이미 선점된 좌석입니다.'),
  seatHoldExpired('SEAT_005', '좌석 선점 시간이 만료되었습니다.'),
  invalidHoldToken('SEAT_008', '유효하지 않은 HOLD Token입니다.'),
  seatLockFailed('SEAT_009', '좌석 락 획득에 실패했습니다. 잠시 후 다시 시도해주세요.'),

  // 예매/결제
  reservationNotFound('RESERVATION_001', '예매 정보를 찾을 수 없습니다.'),
  paymentFailed('PAYMENT_002', '결제에 실패했습니다.'),
  paymentTimeout('PAYMENT_005', '결제 시간이 초과되었습니다.'),

  // Rate Limit
  tooManyRequests('RATE_001', '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'),

  // 서버/유효성
  internalServerError('SERVER_001', '서버 내부 오류가 발생했습니다.'),
  invalidInput('VALIDATION_001', '입력값이 올바르지 않습니다.'),
  missingRequiredField('VALIDATION_002', '필수 입력값이 누락되었습니다.'),

  /// 서버에서 알 수 없는 code가 오거나 매핑 실패 시
  unknown('UNKNOWN', '오류가 발생했습니다.');

  const AppErrorCode(this.code, this.message);
  final String code;
  final String message;

  static AppErrorCode fromCode(String? code) {
    if (code == null || code.isEmpty) return AppErrorCode.unknown;
    for (final e in AppErrorCode.values) {
      if (e.code == code) return e;
    }
    return AppErrorCode.unknown;
  }
}
