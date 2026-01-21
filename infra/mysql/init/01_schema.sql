-- 01_schema.sql
SET NAMES utf8mb4;
SET time_zone='+09:00';

-- 1. 회원 도메인
CREATE TABLE member (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    login_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_member_login (login_id)
) ENGINE=InnoDB;

-- 2. 영화 / 상영 도메인
CREATE TABLE movie (
    movie_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    running_time INT NOT NULL,
    rating VARCHAR(20),
    release_date DATE,
    status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN'
) ENGINE=InnoDB;

CREATE TABLE theater (
    theater_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN'
) ENGINE=InnoDB;

CREATE TABLE screen (
    screen_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    theater_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    total_seat INT NOT NULL,
    CONSTRAINT fk_screen_theater FOREIGN KEY (theater_id) REFERENCES theater(theater_id)
) ENGINE=InnoDB;

CREATE TABLE seat (
    seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screen_id BIGINT NOT NULL,
    row_label VARCHAR(5) NOT NULL,
    seat_no INT NOT NULL,
    seat_type ENUM('NORMAL','PREMIUM','VIP') NOT NULL,
    CONSTRAINT fk_seat_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id),
    UNIQUE KEY uk_seat_position (screen_id, row_label, seat_no)
) ENGINE=InnoDB;

CREATE TABLE screening (
    screening_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    screen_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
    CONSTRAINT fk_screening_movie FOREIGN KEY (movie_id) REFERENCES movie(movie_id),
    CONSTRAINT fk_screening_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id),
    INDEX idx_screening_time (start_time, end_time)
) ENGINE=InnoDB;

-- 3. 가격 정책
CREATE TABLE price_policy (
    price_policy_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screen_id BIGINT NOT NULL,
    seat_type ENUM('NORMAL','PREMIUM','VIP') NOT NULL,
    day_type ENUM('WEEKDAY','WEEKEND') NOT NULL,
    time_type ENUM('EARLY','NORMAL','LATE') NOT NULL,
    price INT NOT NULL,
    CONSTRAINT fk_price_policy_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id),
    UNIQUE KEY uk_price_policy (screen_id, seat_type, day_type, time_type)
) ENGINE=InnoDB;

-- 4. 좌석 선점 (HOLD)
CREATE TABLE seat_hold (
    hold_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    hold_status ENUM('HOLD','CONFIRMED','EXPIRED') NOT NULL,
    hold_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expire_at DATETIME NOT NULL,
    CONSTRAINT fk_hold_screening FOREIGN KEY (screening_id) REFERENCES screening(screening_id),
    CONSTRAINT fk_hold_seat FOREIGN KEY (seat_id) REFERENCES seat(seat_id),
    CONSTRAINT fk_hold_member FOREIGN KEY (member_id) REFERENCES member(member_id),
    UNIQUE KEY uk_hold_seat (screening_id, seat_id),
    INDEX idx_hold_expire (expire_at)
) ENGINE=InnoDB;

-- 5. 예매 도메인
CREATE TABLE reservation (
    reservation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    screening_id BIGINT NOT NULL,
    reserve_no VARCHAR(50) NOT NULL,
    status ENUM('CREATED','PAID','CANCELED') NOT NULL,
    total_amount INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation_member FOREIGN KEY (member_id) REFERENCES member(member_id),
    CONSTRAINT fk_reservation_screening FOREIGN KEY (screening_id) REFERENCES screening(screening_id),
    UNIQUE KEY uk_reserve_no (reserve_no)
) ENGINE=InnoDB;

CREATE TABLE reservation_seat (
    reservation_seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    price INT NOT NULL,
    CONSTRAINT fk_res_seat_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id),
    CONSTRAINT fk_res_seat_seat FOREIGN KEY (seat_id) REFERENCES seat(seat_id),
    UNIQUE KEY uk_reservation_seat (reservation_id, seat_id)
) ENGINE=InnoDB;

-- 6. 결제
CREATE TABLE payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    pay_method ENUM('CARD','KAKAO','NAVER','PAYCO') NOT NULL,
    pay_amount INT NOT NULL,
    pay_status ENUM('SUCCESS','FAIL','CANCEL') NOT NULL,
    paid_at DATETIME,
    CONSTRAINT fk_payment_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id),
    INDEX idx_payment_status (pay_status)
) ENGINE=InnoDB;

-- 7. 예매 취소 이력
CREATE TABLE reservation_cancel_history (
    cancel_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    reason VARCHAR(255),
    canceled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cancel_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id)
) ENGINE=InnoDB;

-- 8. 관리자
CREATE TABLE admin (
    admin_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    login_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SUPER','OPERATOR') NOT NULL,
    UNIQUE KEY uk_admin_login (login_id)
) ENGINE=InnoDB;