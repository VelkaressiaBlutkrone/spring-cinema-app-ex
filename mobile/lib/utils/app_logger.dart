import 'package:logger/logger.dart';

/// 앱 전역 단일 Logger
///
/// Spring 서버와 마찬가지로 통합 로깅: 레벨, 타임스탬프, 스택 트레이스.
/// RULE: 개인정보, 결제 상세, JWT 전체 값은 로그에 기록하지 않음.
final appLogger = Logger(
  printer: PrettyPrinter(
    methodCount: 2,
    errorMethodCount: 6,
    lineLength: 80,
    colors: true,
    printEmojis: false,
    dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
  ),
  level: Level.debug,
);

/// 로그 레벨 래퍼 (필요 시 환경별로 변경)
void setAppLogLevel(Level level) {
  // Logger는 인스턴스별 level이 없으므로, 출력 필터는 printer에서 처리하거나
  // 별도 Logger 인스턴스를 만들 수 있음. 현재는 기본 사용.
}
