-- ========================================
-- Cinema App - 테스트 데이터 (H2 호환)
-- ========================================
-- 개발 환경 (dev 프로파일) 전용 초기 데이터
-- Entity 구조에 맞게 작성됨

-- ========================================
-- 1. 회원 데이터 (Member)
-- ========================================
-- 컬럼: member_id(auto), login_id, password_hash, name, phone, email, role, status, created_at, updated_at
-- role: USER, ADMIN
-- status: ACTIVE, INACTIVE
-- 비밀번호: password123 (BCrypt 해시)
INSERT INTO member (login_id, password_hash, name, phone, email, role, status, created_at, updated_at) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '관리자', '010-0000-0000', 'admin@cinema.com', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '테스트유저1', '010-1111-1111', 'user1@test.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '테스트유저2', '010-2222-2222', 'user2@test.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.TgvJLxJH7JpK3K8W7K', '테스트유저3', '010-3333-3333', 'user3@test.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2. 영화 데이터 (Movie)
-- ========================================
-- 컬럼: movie_id(auto), title, description, running_time, rating, genre, director, actors, poster_url, release_date, status, created_at, updated_at
-- status: SHOWING, COMING_SOON, ENDED
INSERT INTO movie (title, description, running_time, rating, genre, director, actors, poster_url, release_date, status, created_at, updated_at) VALUES
('어벤져스: 엔드게임', '마블 시네마틱 유니버스의 대서사시', 181, '12세 이상', 'ACTION', '안소니 루소, 조 루소', '로버트 다우니 주니어, 크리스 에반스', NULL, '2019-04-24', 'SHOWING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('기생충', '봉준호 감독의 아카데미 수상작', 132, '15세 이상', 'DRAMA', '봉준호', '송강호, 이선균, 조여정', NULL, '2019-05-30', 'SHOWING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('인터스텔라', '크리스토퍼 놀란의 우주 대서사시', 169, '12세 이상', 'SF', '크리스토퍼 놀란', '매튜 맥커너히, 앤 해서웨이', NULL, '2014-11-06', 'SHOWING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('듄: 파트 2', '전설적인 SF 대작의 두 번째 챕터', 166, '12세 이상', 'SF', '드니 빌뇌브', '티모시 샬라메, 젠데이아', NULL, '2024-02-28', 'SHOWING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('범죄도시 4', '마동석 주연의 액션 블록버스터', 109, '15세 이상', 'ACTION', '허명행', '마동석, 김무열', NULL, '2024-04-24', 'COMING_SOON', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 3. 영화관 데이터 (Theater)
-- ========================================
-- 컬럼: theater_id(auto), name, location, address, phone, status, created_at, updated_at
-- status: OPEN, CLOSED, MAINTENANCE
INSERT INTO theater (name, location, address, phone, status, created_at, updated_at) VALUES
('CGV 강남', '강남', '서울시 강남구 역삼동 123-45', '02-1234-5678', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CGV 용산', '용산', '서울시 용산구 한강로 456-78', '02-2345-6789', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 4. 상영관 데이터 (Screen)
-- ========================================
-- 컬럼: screen_id(auto), theater_id, name, total_rows, total_cols, total_seats, screen_type, status, created_at, updated_at
-- screen_type: NORMAL_2D, NORMAL_3D, IMAX, DX_4D, SCREEN_X
-- status: OPEN, CLOSED, MAINTENANCE
-- CGV 강남 (theater_id = 1)
INSERT INTO screen (theater_id, name, total_rows, total_cols, total_seats, screen_type, status, created_at, updated_at) VALUES
(1, '1관', 10, 15, 150, 'NORMAL_2D', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2관', 8, 12, 96, 'NORMAL_3D', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'IMAX관', 12, 20, 240, 'IMAX', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CGV 용산 (theater_id = 2)
INSERT INTO screen (theater_id, name, total_rows, total_cols, total_seats, screen_type, status, created_at, updated_at) VALUES
(2, '1관', 10, 14, 140, 'NORMAL_2D', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '4DX관', 6, 10, 60, 'DX_4D', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 5. 좌석 데이터 (Seat) - 1관만 생성
-- ========================================
-- 컬럼: seat_id(auto), screen_id, row_label, seat_no, seat_type, base_status, created_at, updated_at
-- seat_type: NORMAL, PREMIUM, VIP, COUPLE, WHEELCHAIR
-- base_status: AVAILABLE, BLOCKED, DISABLED
-- 1관 좌석 (screen_id = 1): A~J행 x 15열 중 일부만 생성
INSERT INTO seat (screen_id, row_label, seat_no, seat_type, base_status, created_at, updated_at) VALUES
-- A행 (1,15번은 휠체어석으로 DISABLED)
(1, 'A', 1, 'WHEELCHAIR', 'DISABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 2, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 3, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 4, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 5, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 6, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 7, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 8, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 9, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 10, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 11, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 12, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 13, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 14, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'A', 15, 'WHEELCHAIR', 'DISABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- B행 (NORMAL)
(1, 'B', 1, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 2, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 3, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 4, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 5, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 6, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 7, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 8, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 9, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 10, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 11, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 12, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 13, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 14, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'B', 15, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- F행 (가운데 VIP)
(1, 'F', 1, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 2, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 3, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 4, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 5, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 6, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 7, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 8, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 9, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 10, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 11, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 12, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 13, 'VIP', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 14, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'F', 15, 'NORMAL', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- J행 (맨 뒷줄 PREMIUM, 1-2번은 BLOCKED)
(1, 'J', 1, 'PREMIUM', 'BLOCKED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 2, 'PREMIUM', 'BLOCKED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 3, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 4, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 5, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 6, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 7, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 8, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 9, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 10, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 11, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 12, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 13, 'COUPLE', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 14, 'COUPLE', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'J', 15, 'PREMIUM', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 6. 상영 스케줄 데이터 (Screening)
-- ========================================
-- 컬럼: screening_id(auto), movie_id, screen_id, start_time, end_time, status, created_at, updated_at
-- status: SCHEDULED, NOW_SHOWING, ENDED, CANCELLED
INSERT INTO screening (movie_id, screen_id, start_time, end_time, status, created_at, updated_at) VALUES
-- 1관(screen_id=1) - 어벤져스(movie_id=1) 오늘
(1, 1, DATEADD('HOUR', 10, CURRENT_DATE), DATEADD('MINUTE', 181, DATEADD('HOUR', 10, CURRENT_DATE)), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, DATEADD('HOUR', 14, CURRENT_DATE), DATEADD('MINUTE', 181, DATEADD('HOUR', 14, CURRENT_DATE)), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, DATEADD('HOUR', 18, CURRENT_DATE), DATEADD('MINUTE', 181, DATEADD('HOUR', 18, CURRENT_DATE)), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 1관 - 기생충(movie_id=2) 내일
(2, 1, DATEADD('HOUR', 10, DATEADD('DAY', 1, CURRENT_DATE)), DATEADD('MINUTE', 132, DATEADD('HOUR', 10, DATEADD('DAY', 1, CURRENT_DATE))), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, DATEADD('HOUR', 14, DATEADD('DAY', 1, CURRENT_DATE)), DATEADD('MINUTE', 132, DATEADD('HOUR', 14, DATEADD('DAY', 1, CURRENT_DATE))), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- IMAX관(screen_id=3) - 인터스텔라(movie_id=3) 오늘
(3, 3, DATEADD('HOUR', 11, CURRENT_DATE), DATEADD('MINUTE', 169, DATEADD('HOUR', 11, CURRENT_DATE)), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, DATEADD('HOUR', 15, CURRENT_DATE), DATEADD('MINUTE', 169, DATEADD('HOUR', 15, CURRENT_DATE)), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, DATEADD('HOUR', 19, CURRENT_DATE), DATEADD('MINUTE', 169, DATEADD('HOUR', 19, CURRENT_DATE)), 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
