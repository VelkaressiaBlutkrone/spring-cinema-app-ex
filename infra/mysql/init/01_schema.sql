-- ========================================
-- Cinema App - Database Schema
-- ========================================
-- 영화관 예매 시스템 스키마 정의
-- RULE.md 4.1 좌석 상태 정의에 따른 7단계 상태 적용

SET NAMES utf8mb4;
SET time_zone = '+09:00';

-- ========================================
-- 1. 회원 도메인
-- ========================================
CREATE TABLE IF NOT EXISTS member (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    login_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_member_login (login_id),
    UNIQUE KEY uk_member_email (email),
    INDEX idx_member_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. 영화 도메인
-- ========================================
CREATE TABLE IF NOT EXISTS movie (
    movie_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    running_time INT NOT NULL COMMENT '상영 시간 (분)',
    rating VARCHAR(20) COMMENT '관람 등급',
    genre VARCHAR(50),
    director VARCHAR(100),
    actors TEXT,
    poster_url VARCHAR(500),
    release_date DATE,
    status ENUM('SHOWING', 'COMING_SOON', 'ENDED') NOT NULL DEFAULT 'SHOWING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_movie_status (status),
    INDEX idx_movie_release (release_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. 영화관 / 상영관 도메인
-- ========================================
CREATE TABLE IF NOT EXISTS theater (
    theater_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    address VARCHAR(300),
    phone VARCHAR(20),
    status ENUM('OPEN', 'CLOSED', 'MAINTENANCE') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_theater_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS screen (
    screen_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    theater_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    total_rows INT NOT NULL COMMENT '총 행 수',
    total_cols INT NOT NULL COMMENT '행당 좌석 수',
    total_seats INT NOT NULL COMMENT '총 좌석 수',
    screen_type ENUM('2D', '3D', 'IMAX', '4DX', 'SCREENX') NOT NULL DEFAULT '2D',
    status ENUM('OPEN', 'CLOSED', 'MAINTENANCE') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_screen_theater FOREIGN KEY (theater_id) REFERENCES theater(theater_id) ON DELETE CASCADE,
    INDEX idx_screen_theater (theater_id),
    INDEX idx_screen_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. 좌석 도메인
-- ========================================
-- RULE.md 4.1: 7단계 좌석 상태 정의
-- AVAILABLE: 예매 가능
-- HOLD: 임시 점유
-- PAYMENT_PENDING: PG 요청 중
-- RESERVED: 결제 완료
-- CANCELLED: 예매 취소
-- BLOCKED: 운영 차단
-- DISABLED: 물리적 사용 불가
CREATE TABLE IF NOT EXISTS seat (
    seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screen_id BIGINT NOT NULL,
    row_label VARCHAR(5) NOT NULL COMMENT '행 라벨 (A, B, C...)',
    seat_no INT NOT NULL COMMENT '열 번호',
    seat_type ENUM('NORMAL', 'PREMIUM', 'VIP', 'COUPLE', 'WHEELCHAIR') NOT NULL DEFAULT 'NORMAL',
    base_status ENUM('AVAILABLE', 'BLOCKED', 'DISABLED') NOT NULL DEFAULT 'AVAILABLE' COMMENT '기본 상태 (관리자 설정)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_seat_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id) ON DELETE CASCADE,
    UNIQUE KEY uk_seat_position (screen_id, row_label, seat_no),
    INDEX idx_seat_screen (screen_id),
    INDEX idx_seat_type (seat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. 상영 스케줄 도메인 (Aggregate Root)
-- ========================================
CREATE TABLE IF NOT EXISTS screening (
    screening_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    screen_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('SCHEDULED', 'NOW_SHOWING', 'ENDED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_screening_movie FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_screening_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id) ON DELETE CASCADE,
    INDEX idx_screening_movie (movie_id),
    INDEX idx_screening_screen (screen_id),
    INDEX idx_screening_time (start_time, end_time),
    INDEX idx_screening_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 상영별 좌석 상태 (각 상영 스케줄에 대한 좌석 상태)
CREATE TABLE IF NOT EXISTS screening_seat (
    screening_seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    status ENUM('AVAILABLE', 'HOLD', 'PAYMENT_PENDING', 'RESERVED', 'CANCELLED', 'BLOCKED', 'DISABLED') NOT NULL DEFAULT 'AVAILABLE',
    hold_token VARCHAR(100) COMMENT 'HOLD 토큰 (UUID)',
    hold_member_id BIGINT COMMENT 'HOLD 회원 ID',
    hold_expire_at DATETIME COMMENT 'HOLD 만료 시간',
    reserved_member_id BIGINT COMMENT '예매 완료 회원 ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_screening_seat_screening FOREIGN KEY (screening_id) REFERENCES screening(screening_id) ON DELETE CASCADE,
    CONSTRAINT fk_screening_seat_seat FOREIGN KEY (seat_id) REFERENCES seat(seat_id) ON DELETE CASCADE,
    UNIQUE KEY uk_screening_seat (screening_id, seat_id),
    INDEX idx_screening_seat_status (status),
    INDEX idx_screening_seat_hold_expire (hold_expire_at),
    INDEX idx_screening_seat_hold_member (hold_member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 6. 가격 정책 도메인
-- ========================================
CREATE TABLE IF NOT EXISTS price_policy (
    price_policy_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screen_id BIGINT NOT NULL,
    seat_type ENUM('NORMAL', 'PREMIUM', 'VIP', 'COUPLE', 'WHEELCHAIR') NOT NULL,
    day_type ENUM('WEEKDAY', 'WEEKEND', 'HOLIDAY') NOT NULL,
    time_type ENUM('EARLY_MORNING', 'MORNING', 'AFTERNOON', 'EVENING', 'LATE_NIGHT') NOT NULL,
    price INT NOT NULL COMMENT '가격 (원)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_price_policy_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id) ON DELETE CASCADE,
    UNIQUE KEY uk_price_policy (screen_id, seat_type, day_type, time_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 7. 예매 도메인
-- ========================================
CREATE TABLE IF NOT EXISTS reservation (
    reservation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_no VARCHAR(50) NOT NULL COMMENT '예매 번호',
    member_id BIGINT NOT NULL,
    screening_id BIGINT NOT NULL,
    status ENUM('PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    total_seats INT NOT NULL COMMENT '총 좌석 수',
    total_amount INT NOT NULL COMMENT '총 결제 금액',
    hold_token VARCHAR(100) COMMENT 'HOLD 토큰',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation_member FOREIGN KEY (member_id) REFERENCES member(member_id),
    CONSTRAINT fk_reservation_screening FOREIGN KEY (screening_id) REFERENCES screening(screening_id),
    UNIQUE KEY uk_reservation_no (reservation_no),
    INDEX idx_reservation_member (member_id),
    INDEX idx_reservation_screening (screening_id),
    INDEX idx_reservation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 예매 좌석
CREATE TABLE IF NOT EXISTS reservation_seat (
    reservation_seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    screening_seat_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    price INT NOT NULL COMMENT '좌석 가격',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_res_seat_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id) ON DELETE CASCADE,
    CONSTRAINT fk_res_seat_screening_seat FOREIGN KEY (screening_seat_id) REFERENCES screening_seat(screening_seat_id),
    CONSTRAINT fk_res_seat_seat FOREIGN KEY (seat_id) REFERENCES seat(seat_id),
    UNIQUE KEY uk_reservation_seat (reservation_id, seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 8. 결제 도메인
-- ========================================
CREATE TABLE IF NOT EXISTS payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_no VARCHAR(50) NOT NULL COMMENT '결제 번호',
    reservation_id BIGINT NOT NULL,
    pay_method ENUM('CARD', 'KAKAO_PAY', 'NAVER_PAY', 'TOSS', 'BANK_TRANSFER') NOT NULL,
    pay_amount INT NOT NULL COMMENT '결제 금액',
    pay_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    pg_transaction_id VARCHAR(100) COMMENT 'PG 거래 ID',
    paid_at DATETIME COMMENT '결제 완료 시간',
    cancelled_at DATETIME COMMENT '취소 시간',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id),
    UNIQUE KEY uk_payment_no (payment_no),
    INDEX idx_payment_reservation (reservation_id),
    INDEX idx_payment_status (pay_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 9. 예매/결제 이력 도메인
-- ========================================
CREATE TABLE IF NOT EXISTS reservation_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    action ENUM('CREATED', 'HOLD', 'PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED') NOT NULL,
    description VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id),
    INDEX idx_history_reservation (reservation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 10. Refresh Token 저장 (Redis 대안)
-- ========================================
CREATE TABLE IF NOT EXISTS refresh_token (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_token_member FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
    INDEX idx_refresh_token_member (member_id),
    INDEX idx_refresh_token_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
