# 모바일(Flutter) 공용 모듈 가이드

본 문서는 모바일 프로젝트(`mobile/lib`)의 공용·재사용 모듈을 정리한 문서입니다.

## 목차

1. [디렉터리 구조](#디렉터리-구조)
2. [설정 (config)](#설정-config)
3. [예외 처리 (exception)](#예외-처리-exception)
4. [데이터 모델 (models)](#데이터-모델-models)
5. [상태 관리 (provider)](#상태-관리-provider)
6. [API 서비스 (services)](#api-서비스-services)
7. [공통 위젯 (widgets)](#공통-위젯-widgets)
8. [테마 (theme)](#테마-theme)
9. [유틸리티 (utils)](#유틸리티-utils)

---

## 디렉터리 구조

```
mobile/lib/
├── config/           # API 경로, 환경 설정
├── exception/        # 예외 클래스, 에러 코드
├── models/           # API 응답 DTO 모델
├── provider/         # Riverpod 상태 관리
├── screens/          # 화면 위젯 (auth, home, movies, mypage, payment, reservations, seat)
├── services/         # API 호출 서비스
├── theme/            # Cinema 테마·색상
├── utils/            # 유틸리티 (로깅, 암호화, JWT 등)
└── widgets/          # 공통 위젯 (버튼, 카드, 다이얼로그 등)
```

---

## 설정 (config)

### 위치: `lib/config/`

### api_config.dart

API 기본 URL 및 경로 상수 정의

| 항목 | 설명 |
|------|------|
| `apiBaseUrl` | 플랫폼별 API 기본 URL (Web/Native) |
| `apiPathPublicKey` | 공개키 조회 (하이브리드 암호화용) |
| `apiPathLogin`, `apiPathSignup` | 인증 API |
| `apiPathMovies`, `apiPathScreenings` | 영화·상영 API |
| `apiPathHold`, `apiPathHoldRelease` | 좌석 HOLD API |
| `apiPathReservations`, `apiPathReservationPay` | 예매·결제 API |
| `apiPathMembersMe`, `apiPathMembersMeHolds` | 마이페이지 API |
| `apiPathHome`, `apiPathHomeStats` | 홈 API |
| `apiPathLogs` | 클라이언트 로그 전송 |

**환경 변수 (dart-define):**

- `API_BASE_URL`: Native(Android/iOS) API URL
- `WEB_API_BASE_URL`: Web 빌드 시 API URL (빈 문자열이면 상대 경로)

---

## 예외 처리 (exception)

### 위치: `lib/exception/`

### app_exception.dart

- **AppException**: 기본 예외 (message, originalException, stackTrace)
- **AuthException**: 인증 API 전용 예외 (statusCode 포함)

### api_exception.dart

- **ApiException**: 서버 ErrorResponse 기반 예외
  - `statusCode`, `code` (AUTH_001, MEMBER_002 등)
  - `errorCode`: `AppErrorCode` 매핑

### api_error_response.dart

- 서버 ErrorResponse JSON 파싱
- `displayMessage` 등

### error_code.dart

- **AppErrorCode**: 클라이언트 에러 코드 enum
- 서버 에러 코드와 매핑

---

## 데이터 모델 (models)

### 위치: `lib/models/`

| 파일 | 주요 클래스 | 용도 |
|------|-------------|------|
| `api_response.dart` | ApiResponse, ApiPageResponse | API 공통 래퍼 파싱 |
| `home.dart` | HomeStatsModel, UpcomingMovieModel | 홈 화면 |
| `member.dart` | MemberProfileModel, MemberHoldSummaryModel | 마이페이지 |
| `movie.dart` | MovieModel | 영화 목록·상세 |
| `payment.dart` | PaymentRequestModel, PaymentResponseModel, SeatHoldItemModel | 결제 요청/응답 |
| `reservation.dart` | ReservationSummaryModel, ReservationDetailModel, PaymentSummaryModel | 예매·결제 내역 |
| `screening.dart` | ScreeningModel | 상영 스케줄 |
| `seat.dart` | SeatLayoutModel, SeatStatusItemModel, SeatHoldModel | 좌석 배치·HOLD |

---

## 상태 관리 (provider)

### 위치: `lib/provider/`

### api_providers.dart

| Provider | 반환 타입 | 설명 |
|----------|-----------|------|
| `apiClientProvider` | ApiClient | Bearer 토큰 주입 공통 클라이언트 |
| `homeApiServiceProvider` | HomeApiService | 홈 API |
| `movieApiServiceProvider` | MovieApiService | 영화 API |
| `screeningApiServiceProvider` | ScreeningApiService | 상영·좌석 API |
| `reservationApiServiceProvider` | ReservationApiService | 예매·결제 API |
| `memberApiServiceProvider` | MemberApiService | 회원·마이페이지 API |

### auth_provider.dart

| Provider | 반환 타입 | 설명 |
|----------|-----------|------|
| `authApiServiceProvider` | AuthApiService | 로그인/회원가입/토큰 관리 |
| `authStateProvider` | AsyncValue&lt;bool&gt; | 로그인 여부 |

### main_tab_provider.dart

| Provider | 설명 |
|----------|------|
| `mainTabIndexProvider` | 하단 탭 인덱스 (0: 홈, 1: 영화, 2: 예매내역, 3: 마이페이지) |

---

## API 서비스 (services)

### 위치: `lib/services/`

### api_client.dart

공통 HTTP 클라이언트

- `get(path)`, `post(path, body)`, `put`, `patch`, `delete`
- Bearer 토큰 자동 주입 (`getAccessToken` 콜백)
- `throwIfNotOk()`: 2xx가 아니면 ApiException/AuthException throw

### auth_api_service.dart

- 로그인, 회원가입 (하이브리드 암호화)
- Access/Refresh 토큰 저장·조회 (flutter_secure_storage)
- 로그아웃, 토큰 갱신

### home_api_service.dart

- 홈 통계, 상영 예정 영화

### movie_api_service.dart

- 영화 목록, 영화 상세

### screening_api_service.dart

- 상영 목록(영화별), 좌석 배치, HOLD, HOLD 해제

### seat_sse_client.dart

- 좌석 상태 실시간 구독 (SSE)

### reservation_api_service.dart

- 예매 결제, 예매 목록·상세, 예매 취소

### member_api_service.dart

- 회원 프로필 조회/수정
- 내 HOLD(장바구니) 목록

---

## 공통 위젯 (widgets)

### 위치: `lib/widgets/`

### GlassCard

글래스모피즘 카드 (blur, 반투명 테두리)

```dart
GlassCard(
  padding: EdgeInsets.all(16),
  borderRadius: 20,
  blur: 20,
  child: ...,
)
```

### NeonButton

CTA 버튼 (그라데이션, 글로우)

```dart
NeonButton(
  label: '확인',
  onPressed: () {},
  isPrimary: true,  // true: 네온 블루, false: 글래스
)
```

### CustomButton, CustomTextField, CustomDropDown, CustomRadios

폼 입력 위젯

### LoadingOverlay

전체 화면 로딩 오버레이

```dart
LoadingOverlay(
  isLoading: isSubmitting,
  message: '처리 중...',
  child: ...,
)
```

### dialog/ErrorDialog

에러 메시지 다이얼로그

```dart
showDialog(
  context: context,
  builder: (ctx) => ErrorDialog(exception: e, title: '오류'),
);
```

### dialog/ConfirmDialog

확인/취소 다이얼로그

```dart
ConfirmDialog(
  title: '확인',
  message: '정말 삭제하시겠습니까?',
  onConfirm: () => ...,
  onCancel: () => ...,
)
```

---

## 테마 (theme)

### 위치: `lib/theme/`

### cinema_theme.dart

- **CinemaColors**: 배경, 표면, 네온(red/blue/amber/purple), 글래스, 좌석 상태 색상
- **CinemaTheme.dark**: 다크 테마 (Bebas Neue, Roboto)

---

## 유틸리티 (utils)

### 위치: `lib/utils/`

### app_logger.dart

- `appLogger`: 전역 Logger (logger 패키지)
- `logNavigation()`, `logSeatHold()`, `logSeatRelease()`, `logReservationComplete()`: 비즈니스 이벤트 로깅

### app_navigator_observer.dart

- **AppNavigatorObserver**: 화면 이동 시 로그 출력

### file_log_service.dart

- 모바일 로그 파일 저장 (7일 보관, path_provider)

### hybrid_encryption.dart

- RSA-OAEP + AES-256-GCM 하이브리드 암호화
- `EncryptedPayload`, `encryptWithPublicKey()`: 비밀번호 등 암호화

### jwt_utils.dart

- `getLoginIdFromToken(token)`: JWT payload에서 sub(loginId) 추출

---

## 화면 구조 (screens)

| 경로 | 화면 | 설명 |
|------|------|------|
| `auth/` | AuthGate, LoginScreen, SignupScreen | 인증 분기·로그인·회원가입 |
| `home/` | CinemaHomeScreen | 메인 홈 |
| `movies/` | MoviesScreen, MovieDetailScreen | 영화 목록·상세 |
| `seat/` | SeatSelectScreen | 좌석 선택·HOLD |
| `payment/` | PaymentScreen, PaymentCompleteScreen | 결제·완료 |
| `reservations/` | ReservationsScreen, ReservationDetailScreen | 예매 목록·상세 |
| `mypage/` | MyPageScreen | 마이페이지 (내 정보, 장바구니, 결제내역) |
| `main_tab_screen.dart` | MainTabScreen | 하단 탭 네비게이션 |

---

## 의존성 (pubspec.yaml)

| 패키지 | 용도 |
|--------|------|
| flutter_riverpod | 상태 관리 |
| riverpod_annotation, riverpod_generator | Provider 코드 생성 |
| http | HTTP 클라이언트 |
| encrypt, pointycastle, asn1lib | 하이브리드 암호화 |
| flutter_secure_storage | 토큰 저장 |
| google_fonts | Bebas Neue, Roboto |
| logger | 로깅 |
| path_provider | 로그 파일 경로 |
| intl | 날짜 포맷팅 |

---

## 모듈 사용 예시

### API 호출

```dart
final screening = ref.read(screeningApiServiceProvider);
final layout = await screening.getSeatLayout(screeningId);
```

### 인증 상태 확인

```dart
final authState = ref.watch(authStateProvider);
authState.when(
  data: (isLoggedIn) => isLoggedIn ? MainTabScreen() : LoginScreen(),
  loading: () => LoadingOverlay(isLoading: true),
  error: (e, _) => LoginScreen(),
);
```

### 에러 다이얼로그

```dart
on AppException catch (e) {
  showDialog(
    context: context,
    builder: (ctx) => ErrorDialog(exception: e, title: '오류'),
  );
}
```
