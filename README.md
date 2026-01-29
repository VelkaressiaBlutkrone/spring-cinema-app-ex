# Spring Cinema App Ex (영화관 예매 시스템)

## 프로젝트 설명

이 프로젝트는 멀티플렉스 영화관을 위한 고성능 실시간 좌석 예매 시스템입니다. Spring Boot 백엔드와 React 웹 프론트엔드, Flutter 모바일 앱으로 구성되어 있으며, 대규모 트래픽(최대 1000 TPS)을 처리할 수 있도록 설계되었습니다. Redis 분산 락을 활용하여 중복 예매를 방지하고, 실시간으로 좌석 상태를 동기화합니다.

## 프로젝트 아키텍처 구조

시스템은 도메인 주도 설계(DDD) 원칙을 따르며, 다음과 같은 구조로 구성되어 있습니다.

* **Backend:** Spring Boot (Layered Architecture: Controller → Service → Domain → Infrastructure)
* **Frontend (Web):** React, TypeScript, Vite (SPA)
* **Frontend (Mobile):** Flutter, Riverpod (MVVM)
* **Database:** MySQL (Production), H2 (Development)
* **Cache & Lock:** Redis (Caching, Distributed Locks, Session)
* **Infrastructure:** Docker, Nginx

## 프로젝트 기술구성

### Backend

* **Language:** Java 21
* **Framework:** Spring Boot 4.0.2
* **Data:** Spring Data JPA, QueryDSL
* **Security:** Spring Security, JWT
* **Build Tool:** Gradle

### Frontend (Web)

* **Language:** TypeScript
* **Framework:** React 18
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Package Manager:** npm

### Infrastructure & DB

* MySQL 8.0, H2 Database
* Redis (Redisson Client)

## 프로젝트 주요설정 파일

* `build.gradle`: 백엔드 프로젝트 의존성 및 빌드 설정 (Java 21, Spring Boot 4.0.2)
* `settings.gradle`: Gradle 프로젝트 구조 설정
* `front_end/vite.config.ts`: 프론트엔드 Vite 빌드 및 Alias 설정
* `front_end/package.json`: 프론트엔드 라이브러리 의존성 관리
* `front_end/tailwind.config.js`: Tailwind CSS 설정
* `src/main/resources/application.yml`: DB 연결, Redis 설정, 로깅 등 백엔드 환경 설정

## 주요기능

1. **실시간 좌석 예매:**
    * 좌석 선택 시 Redis를 이용한 임시 점유 (HOLD)
    * 분산 락을 통한 중복 예매 방지
    * WebSocket/SSE를 이용한 실시간 좌석 상태 반영
2. **영화 및 상영 일정 조회:**
    * 영화 목록 및 상세 정보 조회
    * 날짜별 상영 시간표 조회
3. **결제 시스템 (Mock):**
    * 결제 대기, 완료, 취소 상태 관리
    * 결제 실패 시 좌석 자동 반환
4. **관리자 기능:**
    * 영화 및 상영 스케줄 등록/수정
    * 상영관 좌석 배치도 설정
    * 가격 정책 관리

## 프로젝트 실행방법

### 1. 사전 요구사항 (Prerequisites)

* Java 21 Development Kit (JDK 21)
* Node.js 18 이상
* Redis Server (기본 포트 6379)

### 2. 백엔드 실행 (Backend)

프로젝트 루트 디렉토리에서 실행합니다.

```bash
# Gradle 빌드 및 실행
./gradlew clean build
./gradlew bootRun
```

### 3. 프론트엔드 실행 (Frontend)

`front_end` 디렉토리로 이동하여 실행합니다.

```bash
cd front_end

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 프로젝트 문서링크

프로젝트에 대한 상세 문서는 `doc/` 디렉토리에 위치합니다.

* 📚 문서 목차 (Documentation Index)
* 기획 및 요구사항 (PRD)
* 전체 아키텍처
* 백엔드 아키텍처
* 개발 규칙 (Rules)
* 문제 해결 가이드 (Troubleshooting)

## 참고 문서링크

* Spring Boot Reference Guide
* React Documentation
* Vite Documentation
* Redis Documentation

## 라이센스

MIT License

## 기타 주의점

* **Java 버전:** 본 프로젝트는 Java 21 기능을 사용하므로 반드시 JDK 21이 설치되어 있어야 합니다.
* **Spring Boot Repository:** Spring Boot 4.0.2 버전 사용을 위해 `build.gradle`에 Spring Milestone Repository(`https://repo.spring.io/milestone`) 설정이 포함되어 있습니다.
* **Redis 의존성:** 로컬 개발 시에도 Redis 서버가 실행 중이어야 좌석 예매 및 락 기능이 정상 작동합니다.
* **프론트엔드 빌드:** 프론트엔드 빌드 관련 오류 발생 시 `doc/trouble/05-build.md`를 참고하여 캐시 정리 및 의존성 재설치를 진행하세요.
