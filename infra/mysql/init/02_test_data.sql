-- ========================================
-- Cinema App - 테스트 데이터
-- ========================================
-- 개발 및 테스트용 초기 데이터

SET NAMES utf8mb4;
SET time_zone = '+09:00';

-- ========================================
-- 1. 회원 데이터
-- ========================================
-- 비밀번호: password123 (BCrypt 해시)
INSERT INTO member (login_id, password_hash, name, phone, email, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '관리자', '010-0000-0000', 'admin@cinema.com', 'ADMIN', 'ACTIVE'),
('user1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '테스트유저1', '010-1111-1111', 'user1@test.com', 'USER', 'ACTIVE'),
('user2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '테스트유저2', '010-2222-2222', 'user2@test.com', 'USER', 'ACTIVE'),
('user3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '테스트유저3', '010-3333-3333', 'user3@test.com', 'USER', 'ACTIVE');

-- ========================================
-- 2. 영화 데이터
-- ========================================
INSERT INTO movie (title, description, running_time, rating, genre, director, actors, release_date, status) VALUES
('어벤져스: 엔드게임', '마블 시네마틱 유니버스의 대서사시', 181, '12세 이상', 'ACTION', '안소니 루소, 조 루소', '로버트 다우니 주니어, 크리스 에반스', '2019-04-24', 'SHOWING'),
('기생충', '봉준호 감독의 아카데미 수상작', 132, '15세 이상', 'DRAMA', '봉준호', '송강호, 이선균, 조여정', '2019-05-30', 'SHOWING'),
('인터스텔라', '크리스토퍼 놀란의 우주 대서사시', 169, '12세 이상', 'SF', '크리스토퍼 놀란', '매튜 맥커너히, 앤 해서웨이', '2014-11-06', 'SHOWING'),
('듄: 파트 2', '전설적인 SF 대작의 두 번째 챕터', 166, '12세 이상', 'SF', '드니 빌뇌브', '티모시 샬라메, 젠데이아', '2024-02-28', 'SHOWING'),
('범죄도시 4', '마동석 주연의 액션 블록버스터', 109, '15세 이상', 'ACTION', '허명행', '마동석, 김무열', '2024-04-24', 'COMING_SOON');

-- ========================================
-- 3. 영화관 / 상영관 데이터
-- ========================================
INSERT INTO theater (name, location, address, phone, status) VALUES
('CGV 강남', '강남', '서울시 강남구 역삼동 123-45', '02-1234-5678', 'OPEN'),
('CGV 용산', '용산', '서울시 용산구 한강로 456-78', '02-2345-6789', 'OPEN');

-- 상영관 (CGV 강남)
INSERT INTO screen (theater_id, name, total_rows, total_cols, total_seats, screen_type, status) VALUES
(1, '1관', 10, 15, 150, '2D', 'OPEN'),
(1, '2관', 8, 12, 96, '3D', 'OPEN'),
(1, 'IMAX관', 12, 20, 240, 'IMAX', 'OPEN');

-- 상영관 (CGV 용산)
INSERT INTO screen (theater_id, name, total_rows, total_cols, total_seats, screen_type, status) VALUES
(2, '1관', 10, 14, 140, '2D', 'OPEN'),
(2, '4DX관', 6, 10, 60, '4DX', 'OPEN');

-- ========================================
-- 4. 좌석 데이터 생성 (1관: 10행 x 15열 = 150석)
-- ========================================
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS generate_seats()
BEGIN
    DECLARE screen_id INT;
    DECLARE total_rows INT;
    DECLARE total_cols INT;
    DECLARE row_idx INT;
    DECLARE col_idx INT;
    DECLARE row_label VARCHAR(5);
    DECLARE seat_type VARCHAR(20);
    
    DECLARE screen_cursor CURSOR FOR 
        SELECT s.screen_id, s.total_rows, s.total_cols FROM screen s;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET @done = TRUE;
    
    SET @done = FALSE;
    OPEN screen_cursor;
    
    screen_loop: LOOP
        FETCH screen_cursor INTO screen_id, total_rows, total_cols;
        IF @done THEN
            LEAVE screen_loop;
        END IF;
        
        SET row_idx = 1;
        WHILE row_idx <= total_rows DO
            SET row_label = CHAR(64 + row_idx);  -- A, B, C...
            SET col_idx = 1;
            
            WHILE col_idx <= total_cols DO
                -- 좌석 타입 결정 (맨 뒷줄은 PREMIUM, 가운데 일부는 VIP)
                IF row_idx = total_rows THEN
                    SET seat_type = 'PREMIUM';
                ELSEIF row_idx >= (total_rows / 2) AND col_idx > 2 AND col_idx <= (total_cols - 2) THEN
                    SET seat_type = 'VIP';
                ELSE
                    SET seat_type = 'NORMAL';
                END IF;
                
                INSERT IGNORE INTO seat (screen_id, row_label, seat_no, seat_type, base_status)
                VALUES (screen_id, row_label, col_idx, seat_type, 'AVAILABLE');
                
                SET col_idx = col_idx + 1;
            END WHILE;
            
            SET row_idx = row_idx + 1;
        END WHILE;
    END LOOP;
    
    CLOSE screen_cursor;
END //
DELIMITER ;

-- 좌석 생성 실행
CALL generate_seats();
DROP PROCEDURE IF EXISTS generate_seats;

-- 일부 좌석 BLOCKED/DISABLED 처리 (테스트용)
UPDATE seat SET base_status = 'DISABLED' WHERE screen_id = 1 AND row_label = 'A' AND seat_no IN (1, 15);
UPDATE seat SET base_status = 'BLOCKED' WHERE screen_id = 1 AND row_label = 'J' AND seat_no IN (1, 2);

-- ========================================
-- 5. 가격 정책 데이터
-- ========================================
-- 1관 (2D) 가격 정책
INSERT INTO price_policy (screen_id, seat_type, day_type, time_type, price) VALUES
-- 평일
(1, 'NORMAL', 'WEEKDAY', 'EARLY_MORNING', 7000),
(1, 'NORMAL', 'WEEKDAY', 'MORNING', 9000),
(1, 'NORMAL', 'WEEKDAY', 'AFTERNOON', 12000),
(1, 'NORMAL', 'WEEKDAY', 'EVENING', 13000),
(1, 'NORMAL', 'WEEKDAY', 'LATE_NIGHT', 10000),
(1, 'PREMIUM', 'WEEKDAY', 'AFTERNOON', 15000),
(1, 'PREMIUM', 'WEEKDAY', 'EVENING', 16000),
(1, 'VIP', 'WEEKDAY', 'AFTERNOON', 18000),
(1, 'VIP', 'WEEKDAY', 'EVENING', 20000),
-- 주말
(1, 'NORMAL', 'WEEKEND', 'MORNING', 11000),
(1, 'NORMAL', 'WEEKEND', 'AFTERNOON', 14000),
(1, 'NORMAL', 'WEEKEND', 'EVENING', 15000),
(1, 'PREMIUM', 'WEEKEND', 'AFTERNOON', 18000),
(1, 'PREMIUM', 'WEEKEND', 'EVENING', 19000),
(1, 'VIP', 'WEEKEND', 'AFTERNOON', 22000),
(1, 'VIP', 'WEEKEND', 'EVENING', 25000);

-- IMAX관 가격 정책
INSERT INTO price_policy (screen_id, seat_type, day_type, time_type, price) VALUES
(3, 'NORMAL', 'WEEKDAY', 'AFTERNOON', 16000),
(3, 'NORMAL', 'WEEKDAY', 'EVENING', 18000),
(3, 'NORMAL', 'WEEKEND', 'AFTERNOON', 19000),
(3, 'NORMAL', 'WEEKEND', 'EVENING', 21000),
(3, 'PREMIUM', 'WEEKEND', 'EVENING', 25000);

-- ========================================
-- 6. 상영 스케줄 데이터
-- ========================================
-- 오늘/내일/모레 상영 스케줄 생성
INSERT INTO screening (movie_id, screen_id, start_time, end_time, status) VALUES
-- 1관 - 어벤져스
(1, 1, DATE_ADD(CURDATE(), INTERVAL '10:00' HOUR_MINUTE), DATE_ADD(CURDATE(), INTERVAL '13:01' HOUR_MINUTE), 'SCHEDULED'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL '14:00' HOUR_MINUTE), DATE_ADD(CURDATE(), INTERVAL '17:01' HOUR_MINUTE), 'SCHEDULED'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL '18:00' HOUR_MINUTE), DATE_ADD(CURDATE(), INTERVAL '21:01' HOUR_MINUTE), 'SCHEDULED'),
-- 1관 - 기생충 (내일)
(2, 1, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '10:00' HOUR_MINUTE), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '12:12' HOUR_MINUTE), 'SCHEDULED'),
(2, 1, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '14:00' HOUR_MINUTE), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '16:12' HOUR_MINUTE), 'SCHEDULED'),
-- IMAX관 - 인터스텔라
(3, 3, DATE_ADD(CURDATE(), INTERVAL '11:00' HOUR_MINUTE), DATE_ADD(CURDATE(), INTERVAL '13:49' HOUR_MINUTE), 'SCHEDULED'),
(3, 3, DATE_ADD(CURDATE(), INTERVAL '15:00' HOUR_MINUTE), DATE_ADD(CURDATE(), INTERVAL '17:49' HOUR_MINUTE), 'SCHEDULED'),
(3, 3, DATE_ADD(CURDATE(), INTERVAL '19:00' HOUR_MINUTE), DATE_ADD(CURDATE(), INTERVAL '21:49' HOUR_MINUTE), 'SCHEDULED'),
-- IMAX관 - 듄: 파트 2 (내일)
(4, 3, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '13:00' HOUR_MINUTE), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '15:46' HOUR_MINUTE), 'SCHEDULED'),
(4, 3, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '17:00' HOUR_MINUTE), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '19:46' HOUR_MINUTE), 'SCHEDULED');

-- ========================================
-- 7. 상영별 좌석 상태 초기화
-- ========================================
-- 각 상영에 대해 좌석 상태 생성
INSERT INTO screening_seat (screening_id, seat_id, status)
SELECT sc.screening_id, s.seat_id,
    CASE 
        WHEN s.base_status = 'BLOCKED' THEN 'BLOCKED'
        WHEN s.base_status = 'DISABLED' THEN 'DISABLED'
        ELSE 'AVAILABLE'
    END as status
FROM screening sc
CROSS JOIN seat s
WHERE s.screen_id = sc.screen_id;

-- ========================================
-- 완료 메시지
-- ========================================
SELECT 'Test data inserted successfully!' as message;
