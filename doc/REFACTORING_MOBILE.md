# Flutter 모바일 리팩토링 계획

## 개요

- **프레임워크**: Flutter (Dart)
- **상태관리**: Riverpod (선언적)
- **네트워크**: http 패키지 + 커스텀 ApiClient
- **보안**: flutter_secure_storage, Hybrid Encryption (RSA + AES-GCM)
- **테마**: 시네마 다크 테마 (Google Fonts)
- **소스 파일 수**: 53개 (lib/)

## 전체 평가

| 카테고리 | 상태 | 비고 |
|---------|------|------|
| 프로젝트 구조 | ✅ 양호 | 기능별 폴더 분리 잘 되어 있음 |
| 위젯 설계 | ⚠️ 보통 | 대형 위젯 분리 필요 (500줄 초과 3건) |
| 상태 관리 | ⚠️ 보통 | Riverpod 선언되었으나 setState 혼용 |
| 네트워크 계층 | ⚠️ 보통 | 에러 분류 미흡, 재시도 없음, 타임아웃 없음 |
| 테마 일관성 | ✅ 양호 | CinemaColors 중앙 정의, 일부 하드코딩 잔존 |
| 코드 중복 | ⚠️ 보통 | 날짜 포맷팅 5곳+, 빈 상태 UI 3곳+ 중복 |
| 성능 | ⚠️ 보통 | 이미지 캐싱 없음, 페이지네이션 미구현 |
| 테스트 | ❌ 없음 | 테스트 파일 미발견 |

---

## Phase 1: 높은 우선순위 (버그/크리티컬) ✅

### 1.1 ✅ TextEditingController 메모리 누수 수정

**심각도**: Critical — 버그

**파일**: [my_page_screen.dart](mobile/lib/screens/mypage/my_page_screen.dart):319-342

**문제**: `_profileField()` 메서드에서 매 빌드마다 새로운 `TextEditingController` 생성
```dart
// 현재 코드 (버그)
TextField(
  controller: TextEditingController(text: value),  // 매 프레임 새 인스턴스!
)
```

**영향**: 텍스트 필드 포커스 손실, 선택 상태 초기화, 메모리 누수

**수정**:
```dart
class _MyPageScreenState extends ConsumerState<MyPageScreen> {
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: _form.email);
    // ...
  }

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
```

### 1.2 ✅ NeonButton 로딩/비활성 상태 지원

**파일**: [neon_button.dart](mobile/lib/widgets/neon_button.dart):20-26

**문제**: `GestureDetector`의 `onTap`이 항상 활성 → 비동기 작업 중 중복 탭 가능

**수정**: `isLoading` 파라미터 추가, 로딩 중 탭 비활성화 + 인디케이터 표시

### 1.3 ✅ 대형 위젯 분리

| 파일 | 줄 수 | 분리 대상 |
|------|-------|----------|
| [my_page_screen.dart](mobile/lib/screens/mypage/my_page_screen.dart) | 668줄 | `ProfileTab`, `HoldsTab`, `ReservationsTab` 별도 위젯 |
| [cinema_home_screen.dart](mobile/lib/screens/home/cinema_home_screen.dart) | 509줄 | `CinemaHomeHero`, `CinemaHomeStats`, `CinemaHomeUpcoming`, `CinemaHomeRecent` |
| [seat_select_screen.dart](mobile/lib/screens/seat/seat_select_screen.dart) | 503줄 | 좌석 선택 로직 → Provider 분리, 그리드 렌더링 → 별도 위젯 |

**권장 파일 구조**:
```
screens/home/
├── cinema_home_screen.dart
└── widgets/
    ├── cinema_home_hero.dart
    ├── cinema_home_stats.dart
    ├── cinema_home_upcoming.dart
    └── cinema_home_recent.dart

screens/mypage/
├── my_page_screen.dart
└── widgets/
    ├── profile_tab.dart
    ├── holds_tab.dart
    └── reservations_tab.dart
```

---

## Phase 2: 중간 우선순위 (아키텍처 개선) ✅

### 2.1 ✅ setState → Riverpod 마이그레이션

**문제**: 대부분의 화면이 `ConsumerStatefulWidget` + `setState()` 사용, Riverpod의 장점 미활용

**대상 파일 및 수정 방향**:

| 파일 | 현재 | 리팩토링 |
|------|------|----------|
| [cinema_home_screen.dart](mobile/lib/screens/home/cinema_home_screen.dart):27-67 | `setState`로 `_loading`, `_stats`, `_upcoming` 관리 | `FutureProvider`로 전환 |
| [seat_select_screen.dart](mobile/lib/screens/seat/seat_select_screen.dart):39-167 | 좌석 hold/release 로직이 UI에 혼재 | `SeatHoldNotifier` Provider 생성 |
| [reservations_screen.dart](mobile/lib/screens/reservations/reservations_screen.dart) | 전체 예매 목록 조회 | `FutureProvider` + 페이지네이션 |

**예시** (cinema_home_screen):
```dart
// provider/home_providers.dart - 생성
final homeStatsProvider = FutureProvider((ref) async {
  return ref.watch(homeApiServiceProvider).getStats();
});

final upcomingMoviesProvider = FutureProvider((ref) async {
  return ref.watch(homeApiServiceProvider).getUpcomingMovies(days: 3);
});

// 위젯에서 사용
class CinemaHomeScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(homeStatsProvider);
    return statsAsync.when(
      data: (stats) => _buildContent(stats),
      loading: () => LoadingWidget(),
      error: (e, st) => ErrorWidget(error: e),
    );
  }
}
```

### 2.2 ✅ API 서비스 베이스 클래스 추출

**문제**: 모든 API 서비스 메서드에서 동일한 응답 파싱/에러 처리 반복

```dart
// 현재 반복 코드 (movie_api_service, screening_api_service 등)
final json = jsonDecode(response.body) as Map<String, dynamic>;
final api = ApiResponse.fromJson(json, (d) => /* conversion */);
if (!api.success || api.data == null) throw Exception(api.message ?? 'fallback');
return api.data!;
```

**수정**: `ApiServiceBase` 클래스 생성
```dart
// services/api_service_base.dart - 생성
class ApiServiceBase {
  final ApiClient client;

  T parseResponse<T>(http.Response response, T Function(dynamic) converter, String errorMsg) {
    client.throwIfNotOk('parseResponse', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, converter);
    if (!api.success || api.data == null) throw Exception(api.message ?? errorMsg);
    return api.data!;
  }
}
```

### 2.3 ✅ 에러 타입 세분화

**파일**: [api_client.dart](mobile/lib/services/api_client.dart):42-62

**문제**: 모든 에러가 `ApiException` 또는 `AuthException`으로만 구분됨

**수정**: HTTP 상태 코드별 구체적 예외 타입 추가
```dart
// exception/app_exception.dart 확장
class ValidationException extends ApiException { ... }  // 4xx
class ServerException extends ApiException { ... }       // 5xx
class NetworkException extends ApiException { ... }      // 연결 실패
```

### 2.4 ✅ API 클라이언트 개선

| 항목 | 현재 | 수정 |
|------|------|------|
| 타임아웃 | 없음 (무한 대기 가능) | `Duration(seconds: 30)` 추가 |
| 401 자동 갱신 | 없음 (수동 refresh 필요) | 자동 토큰 갱신 + 요청 재시도 |
| 재시도 로직 | 없음 | 일시적 네트워크 장애 시 지수 백오프 재시도 |

### 2.5 ✅ 이미지 캐싱 도입

**파일**: [cinema_home_screen.dart](mobile/lib/screens/home/cinema_home_screen.dart):406

**문제**: `Image.network()` 사용 — 매 빌드마다 이미지 재다운로드

**수정**: `cached_network_image` 패키지 도입
```yaml
# pubspec.yaml
dependencies:
  cached_network_image: ^3.3.0
```

```dart
CachedNetworkImage(
  imageUrl: movie.posterUrl!,
  fit: BoxFit.cover,
  placeholder: (context, url) => _posterPlaceholder(),
  errorWidget: (context, url, error) => _posterPlaceholder(),
)
```

### 2.6 ✅ 페이지네이션 구현

**파일**: [reservations_screen.dart](mobile/lib/screens/reservations/reservations_screen.dart):32

**문제**: 전체 예매 목록을 한 번에 로드 → 대량 데이터 시 메모리/UI 문제

**수정**: 페이지네이션 Provider 도입
```dart
final paginatedReservationsProvider = StateNotifierProvider<
  PaginationNotifier<ReservationDetailModel>,
  AsyncValue<Page<ReservationDetailModel>>
>((ref) {
  return PaginationNotifier(
    fetch: (page) => ref.read(reservationApiServiceProvider)
        .getMyReservations(page: page, size: 20),
  );
});
```

---

## Phase 3: 낮은 우선순위 (코드 품질) ✅

### 3.1 ✅ 공통 유틸리티 추출

#### 날짜/시간 포맷팅 (5곳+ 중복)

**중복 위치**:
- [cinema_home_screen.dart](mobile/lib/screens/home/cinema_home_screen.dart):445-456
- [movie_detail_screen.dart](mobile/lib/screens/movie/movie_detail_screen.dart):57-80
- [seat_select_screen.dart](mobile/lib/screens/seat/seat_select_screen.dart):169-176
- [my_page_screen.dart](mobile/lib/screens/mypage/my_page_screen.dart):153-170
- [reservations_screen.dart](mobile/lib/screens/reservations/reservations_screen.dart):39-46

**수정**: `utils/date_time_formatter.dart` 생성
```dart
class DateTimeFormatter {
  static String formatDateTime(String? iso) { ... }
  static String formatTime(String? iso) { ... }
  static String formatPrice(int amount) => NumberFormat('#,###원').format(amount);
}
```

#### 빈 상태 위젯 (3곳+ 중복)

**중복 위치**:
- [my_page_screen.dart](mobile/lib/screens/mypage/my_page_screen.dart):603-642
- [reservations_screen.dart](mobile/lib/screens/reservations/reservations_screen.dart):67-83
- [cinema_home_screen.dart](mobile/lib/screens/home/cinema_home_screen.dart):346-384

**수정**: `widgets/empty_state.dart` 재사용 가능 위젯 생성

### 3.2 ✅ 하드코딩 색상 → CinemaColors 통합

**파일**: [custom_button.dart](mobile/lib/widgets/custom_button.dart):11-15

```dart
// 현재
case CustomButtonStyle.primary: return Colors.blue;     // 하드코딩
case CustomButtonStyle.danger:  return Colors.red;      // 하드코딩

// 수정
case CustomButtonStyle.primary: return CinemaColors.neonBlue;
case CustomButtonStyle.danger:  return CinemaColors.neonRed;
```

### 3.3 ✅ 스페이싱 상수 정의

**문제**: `EdgeInsets.symmetric(horizontal: 16, vertical: 8)`, `EdgeInsets.all(20)` 등 매직 넘버 산재

**수정**: `theme/cinema_spacing.dart` 생성
```dart
class CinemaSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
}
```

### 3.4 ✅ 네비게이션 통합 (go_router)

**문제**: named routes (인증 화면) + imperative push (나머지) 혼용

**수정**: `go_router` 패키지 도입으로 타입 안전한 라우팅 통합
```yaml
# pubspec.yaml
dependencies:
  go_router: ^14.0.0
```

### 3.5 ✅ Model 직렬화 자동화

**현재**: 수동 `fromJson()` 팩토리 (toJson 없음, 단방향)

**수정**: `json_serializable` + `build_runner` 도입
```yaml
dependencies:
  json_annotation: ^4.8.0

dev_dependencies:
  json_serializable: ^6.7.0
  build_runner: ^2.4.0
```

### 3.6 ✅ const 생성자 추가

**대상 파일**:
- [main_tab_screen.dart](mobile/lib/screens/main_tab_screen.dart):15,133 — `_NavItem` 위젯
- [my_page_screen.dart](mobile/lib/screens/mypage/my_page_screen.dart):22 — `MyPageScreen`

---

## 레이스 컨디션 방지

| 파일 | 위치 | 문제 | 수정 |
|------|------|------|------|
| [seat_select_screen.dart](mobile/lib/screens/seat/seat_select_screen.dart):102-108 | `_onSeatTap` | 로딩 중 다중 탭 가능 | `onTap: _isLoading ? null : () => _onSeatTap(seat)` |

---

## 테스트 전략 (신규)

| 단계 | 범위 | 도구 |
|------|------|------|
| 1단계 | Provider/Notifier 단위 테스트 | flutter_test + mockito |
| 2단계 | API 서비스 단위 테스트 | flutter_test + http mock |
| 3단계 | 위젯 렌더링 테스트 | flutter_test |
| 4단계 | 통합 테스트 | integration_test |

---

## 의존성 추가 권장

```yaml
# pubspec.yaml 추가 권장
dependencies:
  cached_network_image: ^3.3.0    # 이미지 캐싱
  go_router: ^14.0.0              # 타입 안전한 라우팅
  json_annotation: ^4.8.0        # JSON 직렬화

dev_dependencies:
  json_serializable: ^6.7.0      # JSON 코드 생성
  build_runner: ^2.4.0           # 코드 생성 실행기
  mockito: ^5.4.0                # 테스트 목 생성
```
