# ========================================
# Cinema App - Backend (Spring Boot) Dockerfile
# Java 21, Spring Boot 4.0.2
# ========================================

# Stage 1: Build
# Build context: 프로젝트 루트
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Gradle wrapper 및 의존성 파일 복사
COPY gradlew .
COPY gradlew.bat .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY gradle.properties .

# 의존성 다운로드 (캐시 활용)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# 소스 복사 및 빌드
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 타임존 및 healthcheck용 wget
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata wget

# JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 한글 인코딩
ENV LANG=C.UTF-8
ENV JAVA_OPTS="-Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
