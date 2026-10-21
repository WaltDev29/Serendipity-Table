-- ========================================================
-- 우연한 식탁 (Serendipity Table) Complete PostgreSQL Schema
-- 기준: PRD v1.1.0, 08_백엔드_개발_계획서.md
-- ========================================================

SET timezone = 'Asia/Seoul';
ALTER DATABASE serendipity_db SET timezone TO 'Asia/Seoul';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- 1. 사용자 테이블 (users)
-- 회원가입(/signup), 로그인(/login), 3단계 정보 입력(/information-input), 관리자 회원관리(A-07)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    nickname VARCHAR(50),
    birth_year INT NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F')),
    job VARCHAR(100) NOT NULL,
    instagram_id VARCHAR(100),
    mbti VARCHAR(4),
    avatar_url TEXT,
    interests TEXT[] NOT NULL DEFAULT '{}',
    my_tendencies TEXT[] NOT NULL DEFAULT '{}',
    preferred_tendencies TEXT[] NOT NULL DEFAULT '{}',
    budget_ranges TEXT[] NOT NULL DEFAULT '{}',
    food_restrictions TEXT,
    manner_temp NUMERIC(4,1) NOT NULL DEFAULT 36.5,
    strike_count INT NOT NULL DEFAULT 0,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_interests_gin ON users USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_users_my_tendencies_gin ON users USING GIN (my_tendencies);
CREATE INDEX IF NOT EXISTS idx_users_preferred_tendencies_gin ON users USING GIN (preferred_tendencies);

-- --------------------------------------------------------
-- 2. 참가권 테이블 (user_tickets)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_type VARCHAR(20) NOT NULL DEFAULT '1_TICKET',
    total_count INT NOT NULL DEFAULT 1,
    remaining_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_tickets_user ON user_tickets(user_id);

-- --------------------------------------------------------
-- 3. 정기 목요일 회차 정보 테이블 (event_slots)
-- 관리자 회차/스롯 관리(A-02)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_slots (
    id BIGSERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL DEFAULT '19:30:00',
    match_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 4. 권역별 슬롯 및 조기마감 제어 테이블 (region_slots)
-- 4대 권역(홍대/합정, 강남/신논현, 을지로/종로, 잠실)별 정원 및 조기 마감 토글
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS region_slots (
    id BIGSERIAL PRIMARY KEY,
    event_slot_id BIGINT NOT NULL REFERENCES event_slots(id) ON DELETE CASCADE,
    region VARCHAR(50) NOT NULL,
    target_capacity INT NOT NULL DEFAULT 48,
    current_count INT NOT NULL DEFAULT 0,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    closed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_slot_region UNIQUE (event_slot_id, region)
);

CREATE INDEX IF NOT EXISTS idx_region_slots_lookup ON region_slots(event_slot_id, region);

-- --------------------------------------------------------
-- 5. 제휴 식당 POOL 테이블 (venues)
-- 관리자 식당 POOL 관리(A-05), 카카오맵/네이버지도 연동
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    map_url TEXT,
    naver_map_url TEXT,
    representative_menu VARCHAR(255),
    avg_price INT NOT NULL DEFAULT 25000,
    capacity_tables INT NOT NULL DEFAULT 4,
    phone VARCHAR(30),
    benefits TEXT,
    is_reserved BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 6. 확정 다이닝 테이블 (dining_tables)
-- AI 매칭 결과 및 관리자 수동 스왑(A-04), 칸반보드 및 4인 테이블
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slot_id BIGINT NOT NULL REFERENCES event_slots(id),
    table_no INT NOT NULL,
    region VARCHAR(50) NOT NULL,
    venue_id UUID REFERENCES venues(id),
    harmony_score DOUBLE PRECISION DEFAULT 85.0,
    male_count INT NOT NULL DEFAULT 2,
    female_count INT NOT NULL DEFAULT 2,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'UNDER_QUORUM', 'CANCELLED'
    reservation_status VARCHAR(30) NOT NULL DEFAULT 'AUTO_ASSIGNED',
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dining_tables_slot ON dining_tables(event_slot_id, region);

-- --------------------------------------------------------
-- 7. 참가 신청서 테이블 (applications)
-- 사용자 회차 신청(P-02~P-05), 관리자 신청자 관리(A-03)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_slot_id BIGINT NOT NULL REFERENCES event_slots(id),
    preferred_regions TEXT[] NOT NULL,
    ticket_type VARCHAR(20) NOT NULL DEFAULT '1_TICKET',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'REFUNDED'
    match_status VARCHAR(30) NOT NULL DEFAULT 'WAITING',   -- 'WAITING', 'CONFIRMED', 'FAILED_FALLBACK'
    assigned_table_id UUID REFERENCES dining_tables(id),
    fallback_choice VARCHAR(30), -- 'FREE_PASS', 'REFUND'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_match_lookup ON applications(event_slot_id, payment_status, match_status);

-- --------------------------------------------------------
-- 8. 주문 및 결제 내역 테이블 (orders)
-- 참가권 충전/신청 결제 및 관리자 즉시 전액 환불(A-03, A-09)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CARD',
    status VARCHAR(30) NOT NULL DEFAULT 'PAID', -- 'PAID', 'REFUNDED'
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- --------------------------------------------------------
-- 9. 테이블 구성원 매핑 (table_members)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS table_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'ATTENDED', 'NO_SHOW'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_table_user UNIQUE (table_id, user_id)
);

-- --------------------------------------------------------
-- 10. 단체 채팅방 및 메시지 (chat_rooms, chat_messages)
-- P-08, A-06 7대 메시지 타입(TALK, SYSTEM, ADMIN_NOTICE, VENUE_CARD, TOPIC, GAME, BLIND)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL UNIQUE REFERENCES dining_tables(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    sender_role VARCHAR(20) NOT NULL DEFAULT 'USER',
    message_type VARCHAR(30) NOT NULL DEFAULT 'TALK',
    content TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at ASC);

-- --------------------------------------------------------
-- 11. 회원 직접 차단 테이블 (user_blocks)
-- 마이페이지(/blocked-users), AI 매칭 네거티브 제약
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_blocked UNIQUE (user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_lookup ON user_blocks(user_id, blocked_user_id);

-- --------------------------------------------------------
-- 12. 회원 신고 테이블 (user_reports)
-- 채팅방 서랍 메뉴 신고 모달, 관리자 블랙리스트 연동(A-07)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_id UUID REFERENCES dining_tables(id),
    category VARCHAR(50) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'REJECTED'
    action_taken VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 13. 재가입 방지 블랙리스트 (user_blacklist)
-- A-07 영구 차단 기능 (휴대폰 번호 해시 저장)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash VARCHAR(64) NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    operator_name VARCHAR(50) NOT NULL DEFAULT '운영팀',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_blacklist_phone ON user_blacklist(phone_hash);

-- --------------------------------------------------------
-- 14. 사후 피드백 & 비공개 호감 매트릭스 (dining_feedbacks, secret_chemistry)
-- P-10 및 A-08 통계 화면
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS dining_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES dining_tables(id),
    user_id UUID NOT NULL REFERENCES users(id),
    atmosphere_rating INT NOT NULL CHECK (atmosphere_rating BETWEEN 1 AND 5),
    conversation_rating INT NOT NULL CHECK (conversation_rating BETWEEN 1 AND 5),
    venue_rating INT NOT NULL CHECK (venue_rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS secret_chemistry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES dining_tables(id),
    voter_id UUID NOT NULL REFERENCES users(id),
    target_user_id UUID NOT NULL REFERENCES users(id),
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('LIKE', 'DISLIKE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_chemistry_vote UNIQUE (table_id, voter_id, target_user_id)
);

-- --------------------------------------------------------
-- 15. 1:1 고객센터 문의 테이블 (cs_inquiries, cs_inquiry_replies)
-- P-11/고객센터(/cs) 및 A-07 1:1 실시간 상담 인박스
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS cs_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- '취소/환불', '매칭/식당', '에티켓/신고', '기타'
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ANSWERED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cs_inquiry_replies (
    id BIGSERIAL PRIMARY KEY,
    inquiry_id UUID NOT NULL REFERENCES cs_inquiries(id) ON DELETE CASCADE,
    operator_name VARCHAR(50) NOT NULL DEFAULT '운영자',
    reply_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 16. 관리자 보안 감사 로그 테이블 (admin_audit_logs)
-- A-01, A-03, A-04 수동 환불, 참가자 스왑, 영구차단 감사 추적
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    operator_name VARCHAR(50) NOT NULL,
    detail TEXT NOT NULL,
    target_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);

-- ========================================================
-- 초기 시드 데이터 (Seed Data)
-- ========================================================

-- 1. 관리자 및 테스트 유저 생성 (비밀번호: BCrypt $2a$10$wK1VwB... 또는 임의 해시)
INSERT INTO users (
    id, phone, password_hash, name, nickname, birth_year, gender, job, instagram_id, mbti,
    interests, my_tendencies, preferred_tendencies, budget_ranges, food_restrictions, role, manner_temp
) VALUES 
(
    'a0000000-0000-0000-0000-000000000001', '01000000000', 
    '$2a$10$4cS2bzERYOfbRWxAJRBf2.PXHNXggS9vXLjV4L4zPT35g0Yeb7UJS', -- password123
    '총괄관리자', '운영팀장', 1990, 'M', '서비스 운영 총괄', 'serendipity_official', 'ENFJ',
    ARRAY['자기계발·공부', '스타트업'], ARRAY['이야기를 이끄는 편'], ARRAY['열정 있는 사람'],
    ARRAY['20,000~30,000원'], '없음', 'ROLE_ADMIN', 45.0
),
(
    '10000000-0000-0000-0000-000000000001', '01084923310',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiV55R2mKL8G9/jE3t8yO9K8YyO9m2a', -- 1234
    '김서연', '서연', 1997, 'F', '브랜드 디자이너', 'seoyeon_k', 'ENFP',
    ARRAY['와인·위스키', '전시·미술관', '러닝·마라톤'], ARRAY['이야기를 이끄는 편', '웃음이 많은 편'],
    ARRAY['열정 있는 사람', '잘 들어주는 사람'], ARRAY['20,000~30,000원'], '오이', 'ROLE_USER', 36.8
),
(
    '10000000-0000-0000-0000-000000000002', '01011112222',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiV55R2mKL8G9/jE3t8yO9K8YyO9m2a',
    '이도현', '민트초코', 1996, 'M', '그로스 마케터', 'mint_dohyun', 'ENTP',
    ARRAY['스타트업·창업', '재테크·투자'], ARRAY['논리적인 대화 선호'], ARRAY['유쾌하고 긍정적인 사람'],
    ARRAY['20,000~30,000원'], '없음', 'ROLE_USER', 37.2
),
(
    '10000000-0000-0000-0000-000000000003', '01033334444',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiV55R2mKL8G9/jE3t8yO9K8YyO9m2a',
    '박지민', '러너', 1995, 'F', '백엔드 엔지니어', 'jimin_run', 'ISTJ',
    ARRAY['러닝·마라톤', '반려동물'], ARRAY['조용히 경청하는 편'], ARRAY['예의 바르고 배려심 넘치는 사람'],
    ARRAY['20,000~30,000원'], '갑각류 알레르기', 'ROLE_USER', 38.0
),
(
    '10000000-0000-0000-0000-000000000004', '01055556666',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiV55R2mKL8G9/jE3t8yO9K8YyO9m2a',
    '최원우', '책방지기', 1993, 'M', '공간 건축가', 'wonwoo_arch', 'INTP',
    ARRAY['독서·인문학', '전시·미술관'], ARRAY['생각을 깊게 나누는 편'], ARRAY['깊이 있는 대화를 좋아하는 사람'],
    ARRAY['20,000~30,000원'], '없음', 'ROLE_USER', 36.5
),
(
    '10000000-0000-0000-0000-000000000005', '01077778888',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiV55R2mKL8G9/jE3t8yO9K8YyO9m2a',
    '배강석', '강석', 1991, 'M', '프리랜서', 'gangseok_b', 'ESTP',
    ARRAY['영화·넷플릭스'], ARRAY['주도적인 편'], ARRAY['활동적인 사람'],
    ARRAY['20,000~30,000원'], '없음', 'ROLE_USER', 31.2
)
ON CONFLICT (phone) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    nickname = EXCLUDED.nickname,
    manner_temp = EXCLUDED.manner_temp;

-- 2. 테스트 참가권 발급 (김서연: 2회 남음, 유효기간 없음)
INSERT INTO user_tickets (id, user_id, ticket_type, total_count, remaining_count)
VALUES 
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '3_TICKETS', 3, 2),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '1_TICKET', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 3. 테스트 회차 등록 (매주 목요일 19:30)
INSERT INTO event_slots (id, event_date, event_time, match_deadline, status)
VALUES
(1, CURRENT_DATE + INTERVAL '2 days', '19:30:00', CURRENT_TIMESTAMP + INTERVAL '1 day', 'OPEN'),
(2, CURRENT_DATE + INTERVAL '9 days', '19:30:00', CURRENT_TIMESTAMP + INTERVAL '8 days', 'OPEN')
ON CONFLICT (id) DO NOTHING;

SELECT setval('event_slots_id_seq', (SELECT COALESCE(MAX(id), 1) FROM event_slots));

-- 4. 4대 권역 슬롯 등록
INSERT INTO region_slots (event_slot_id, region, target_capacity, current_count, is_closed)
VALUES
(1, '홍대/합정', 48, 42, FALSE),
(1, '강남/신논현', 48, 48, TRUE),
(1, '을지로/종로', 48, 36, FALSE),
(1, '잠실/송파', 48, 20, FALSE)
ON CONFLICT (event_slot_id, region) DO UPDATE SET
    current_count = EXCLUDED.current_count,
    is_closed = EXCLUDED.is_closed;

-- 5. 테스트 제휴 식당 등록 (네이버 지도 연동)
INSERT INTO venues (name, region, address, map_url, naver_map_url, representative_menu, avg_price, capacity_tables, phone, benefits, is_reserved, image_url)
VALUES
-- 홍대/합정 (3곳)
('연남토마 본점', '홍대/합정', '서울 마포구 월드컵북로6길 61', 'https://map.naver.com/p/entry/place/1229825670', 'https://map.naver.com/p/entry/place/1229825670', '명란 오일 파스타 & 가츠덮밥', 22000, 4, '02-332-8064', '웰컴 에이드 1잔 제공', false, 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80'),
('오레노라멘 본점', '홍대/합정', '서울 마포구 독막로6길 14', 'https://map.naver.com/p/entry/place/814481697', 'https://map.naver.com/p/entry/place/814481697', '토리 파이탄 라멘 & 차슈', 12000, 4, '02-322-3539', '면/밥 무료 리필 서비스', false, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'),
('멕시코식당', '홍대/합정', '서울 마포구 독막로2길 23', 'https://map.naver.com/p/entry/place/1700484018', 'https://map.naver.com/p/entry/place/1700484018', '치미창가 & 엔칠라다', 19000, 4, '02-336-3666', '나초칩 1바스켓 서비스', false, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80'),

-- 강남/신논현 (1곳)
('어거스트 힐 강남점', '강남/신논현', '서울 강남구 강남대로106길 25', 'https://map.naver.com/p/entry/place/661051254', 'https://map.naver.com/p/entry/place/661051254', '채끝 스테이크 & 트러플 파스타', 32000, 6, '02-568-8003', '웰컴 하우스 와인 1잔', false, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),

-- 을지로/종로 (3곳)
('을지다락', '을지로/종로', '서울 중구 수표로10길 19', 'https://map.naver.com/p/entry/place/1444910504', 'https://map.naver.com/p/entry/place/1444910504', '다락 오므라이스 & 매콤크림파스타', 23000, 4, '070-8844-4484', '웰컴 스파클링 에이드 1잔', true, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80'),
('녁 을지로점', '을지로/종로', '서울 중구 수표로 65', 'https://map.naver.com/p/entry/place/412011201', 'https://map.naver.com/p/entry/place/412011201', '갈비 리조또 & 수제 생면 파스타', 30000, 4, '070-4150-0504', '식전 브루스케타 서비스', false, 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80'),
('을지로보석', '을지로/종로', '서울 중구 마른내로 11-10 3층', 'https://map.naver.com/p/entry/place/1148721944', 'https://map.naver.com/p/entry/place/1148721944', '제철 한식 다이닝 코스', 27000, 5, '02-2274-1234', '내추럴 와인 시음 1잔', false, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'),

-- 잠실/송파 (2곳)
('엘리스리틀이태리 송리단길점', '잠실/송파', '서울 송파구 백제고분로41길 43-21', 'https://map.naver.com/p/entry/place/37192433', 'https://map.naver.com/p/entry/place/37192433', '화덕피자 & 트러플 리조또', 29000, 4, '02-421-2244', '웰컴 아란치니 서비스', true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'),
('갓잇 송리단길점', '잠실/송파', '서울 송파구 오금로16길 20', 'https://map.naver.com/p/entry/place/1246280409', 'https://map.naver.com/p/entry/place/1246280409', '멕시칸 타코 & 파히타 세트', 26000, 5, '02-423-9451', '또띠아 무제한 리필', false, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80');

-- 6. 테스트 확정 테이블 등록 (홍대 1번 테이블)
INSERT INTO dining_tables (id, event_slot_id, table_no, region, venue_id, harmony_score, male_count, female_count, status, reservation_status)
VALUES
('d0000000-0000-0000-0000-000000000001', 1, 1, '홍대/합정', 'b0000000-0000-0000-0000-000000000001', 94.2, 2, 2, 'CONFIRMED', 'RESERVED')
ON CONFLICT (id) DO NOTHING;

-- 7. 테이블 참가자 4인 매핑 (김서연, 이도현, 박지민, 최원우)
INSERT INTO table_members (id, table_id, user_id, role, status)
VALUES
('30000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'HOST', 'SCHEDULED'),
('30000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'MEMBER', 'SCHEDULED'),
('30000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'MEMBER', 'SCHEDULED'),
('30000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'MEMBER', 'SCHEDULED')
ON CONFLICT (table_id, user_id) DO NOTHING;

-- 8. 단체 채팅방 생성
INSERT INTO chat_rooms (id, table_id)
VALUES
('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT (table_id) DO NOTHING;

-- 9. 채팅 초기 메시지 시드 (7대 메시지 타입)
INSERT INTO chat_messages (room_id, sender_id, sender_role, message_type, content, payload, created_at)
VALUES
(
    'c0000000-0000-0000-0000-000000000001', NULL, 'SYSTEM', 'SYSTEM_WELCOME', 
    '우연한 식탁에 오신 것을 환영합니다! 서로를 존중하는 따뜻한 식탁을 만들어가요.', NULL, 
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    'c0000000-0000-0000-0000-000000000001', NULL, 'ADMIN', 'ADMIN_NOTICE',
    '[운영자 긴급 공지] 식당 2층 안쪽 우연한 식탁 4인 전용 룸으로 안내받으시면 됩니다.', NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
),
(
    'c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'USER', 'TALK',
    '안녕하세요! 오늘 다들 몇 시쯤 도착하시나요?', NULL,
    CURRENT_TIMESTAMP - INTERVAL '30 minutes'
),
(
    'c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'USER', 'TALK',
    '저는 7시 20분쯤 도착할 것 같아요!', NULL,
    CURRENT_TIMESTAMP - INTERVAL '20 minutes'
),
(
    'c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'USER', 'TALK',
    '다들 어디쯤 오셨나요? 도착하신 분 계세요?', NULL,
    CURRENT_TIMESTAMP - INTERVAL '4 minutes'
);

-- 10. 차단 관리 시드 (김서연 -> 배강석 차단)
INSERT INTO user_blocks (id, user_id, blocked_user_id, reason)
VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '대화 매너 부적합 (연락처 강요)')
ON CONFLICT (user_id, blocked_user_id) DO NOTHING;

-- 11. 고객센터 FAQ용 샘플 문의
INSERT INTO cs_inquiries (id, user_id, category, content, status)
VALUES
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '취소/환불', '모임 전날 급한 야근이 잡히면 취소 가능한가요?', 'ANSWERED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cs_inquiry_replies (inquiry_id, operator_name, reply_content)
VALUES
('50000000-0000-0000-0000-000000000001', '식탁 지킴이', '매칭 확정 전(화요일 12:00 이전) 취소 시 100% 무료 취소 및 환불/이월이 가능합니다.')
ON CONFLICT (id) DO NOTHING;

-- 12. 관리자 감사 로그 시드
INSERT INTO admin_audit_logs (action_type, operator_name, detail, target_id)
VALUES
('SLOT_CREATED', '총괄관리자', '금주 목요일 정기 회차 슬롯(ID: 1) 신규 개설', '1'),
('MANUAL_SWAP', '총괄관리자', '홍대 1번 테이블 남녀 2:2 성비 및 나이차 검증 완료', 'd0000000-0000-0000-0000-000000000001');
