# ========================================
# Cinema App - Mobile (Flutter Web) Dockerfile
# Dart 3.10+, Flutter 3.31+
# ========================================

# Stage 1: Build (Flutter SDK)
# Build context: 프로젝트 루트
FROM ghcr.io/cirruslabs/flutter:stable AS builder

WORKDIR /app

# pubspec 복사 및 의존성 설치
COPY mobile/pubspec.* ./
RUN flutter pub get

# 소스 복사
COPY mobile .

# Flutter Web 빌드
# WEB_API_BASE_URL 빈 문자열: 상대 경로 /api 사용 (nginx 프록시 활용)
RUN flutter build web --release --dart-define=WEB_API_BASE_URL=

# Stage 2: Serve (nginx)
FROM nginx:alpine

# nginx 설정 (context 기준 경로)
COPY infra/docker/mobile/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/build/web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
