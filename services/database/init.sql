-- 우연한 식탁 (Serendipity Table) Initial DDL & Seed Data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    birth_year INT NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F')),
    job VARCHAR(100) NOT NULL,
    instagram_id VARCHAR(100) NOT NULL,
    mbti VARCHAR(4) NOT NULL,
    interests TEXT[] NOT NULL,
    my_tendencies TEXT[] NOT NULL,
    preferred_tendencies TEXT[] NOT NULL,
    budget_ranges TEXT[] NOT NULL,
    food_restrictions TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_interests_gin ON users USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_users_my_tendencies_gin ON users USING GIN (my_tendencies);
CREATE INDEX IF NOT EXISTS idx_users_preferred_tendencies_gin ON users USING GIN (preferred_tendencies);

-- 2. 회차 정보 테이블
CREATE TABLE IF NOT EXISTS event_slots (
    id BIGSERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    region VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 24,
    match_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
);

-- 3. 제휴 식당 풀 테이블
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    map_url TEXT,
    representative_menu VARCHAR(255),
    avg_price INT NOT NULL DEFAULT 20000,
    capacity_tables INT NOT NULL DEFAULT 4,
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 확정 다이닝 테이블
CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slot_id BIGINT NOT NULL REFERENCES event_slots(id),
    venue_id UUID REFERENCES venues(id),
    region VARCHAR(50) NOT NULL,
    member_count INT NOT NULL,
    match_score DOUBLE PRECISION,
    venue_name VARCHAR(100),
    venue_address VARCHAR(255),
    venue_map_url TEXT,
    venue_menu VARCHAR(255),
    venue_avg_price INT,
    reservation_status VARCHAR(30) NOT NULL DEFAULT 'AUTO_ASSIGNED',
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 신청서 테이블
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_slot_id BIGINT NOT NULL REFERENCES event_slots(id),
    preferred_regions TEXT[] NOT NULL,
    ticket_type VARCHAR(20) NOT NULL,
    application_status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    match_status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
    assigned_table_id UUID REFERENCES dining_tables(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_applications_match_lookup ON applications(event_slot_id, payment_status, match_status);

-- 6. 테이블 구성원 매핑
CREATE TABLE IF NOT EXISTS table_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    attendance_status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    is_checkin BOOLEAN NOT NULL DEFAULT FALSE,
    checkin_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_table_user UNIQUE (table_id, user_id)
);

-- 7. 채팅방 및 메시지
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
    message_type VARCHAR(20) NOT NULL DEFAULT 'TALK',
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at ASC);

-- 8. 회원 직접 차단 테이블
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id),
    blocked_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_blocker_blocked UNIQUE (blocker_id, blocked_id)
);
CREATE INDEX IF NOT EXISTS idx_user_blocks_lookup ON user_blocks(blocker_id, blocked_id);

-- 9. 회원 신고 테이블
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    reported_id UUID NOT NULL REFERENCES users(id),
    table_id UUID REFERENCES dining_tables(id),
    category VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    proof_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. 재가입 방지 블랙리스트 테이블
CREATE TABLE IF NOT EXISTS user_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash VARCHAR(64) NOT NULL UNIQUE,
    instagram_id VARCHAR(100),
    reason TEXT NOT NULL,
    blocked_by_admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_blacklist_phone ON user_blacklist(phone_hash);

-- 11. 피드백 및 모임 종료 후 평점/상세 리뷰
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES dining_tables(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    atmosphere_rating INT NOT NULL CHECK (atmosphere_rating BETWEEN 1 AND 5),
    conversation_rating INT NOT NULL CHECK (conversation_rating BETWEEN 1 AND 5),
    venue_rating INT NOT NULL CHECK (venue_rating BETWEEN 1 AND 5),
    nps_score INT CHECK (nps_score BETWEEN 1 AND 10),
    preferred_user_ids UUID[],
    avoid_user_ids UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES dining_tables(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    venue_id UUID REFERENCES venues(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    venue_review TEXT,
    table_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. 공지 관리
CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,
    target_id UUID,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    popup_type VARCHAR(20) NOT NULL DEFAULT 'BANNER',
    created_by_admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. 1:1 고객센터 DM (LLM 하이브리드)
CREATE TABLE IF NOT EXISTS cs_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    chat_mode VARCHAR(20) NOT NULL DEFAULT 'LLM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cs_messages (
    id BIGSERIAL PRIMARY KEY,
    cs_room_id UUID NOT NULL REFERENCES cs_rooms(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    sender_id UUID,
    content TEXT NOT NULL,
    llm_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cs_messages_room ON cs_messages(cs_room_id, created_at ASC);

-- 14. 예산 및 정산 관리 테이블
CREATE TABLE IF NOT EXISTS settlement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slot_id BIGINT NOT NULL REFERENCES event_slots(id),
    total_revenue INT NOT NULL DEFAULT 0,
    total_venue_cost INT NOT NULL DEFAULT 0,
    total_refund_loss INT NOT NULL DEFAULT 0,
    total_noshow_loss INT NOT NULL DEFAULT 0,
    gross_profit INT NOT NULL DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. 이용권 테이블
CREATE TABLE IF NOT EXISTS user_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    ticket_type VARCHAR(20) NOT NULL,
    total_count INT NOT NULL,
    remaining_count INT NOT NULL,
    expire_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 초기 시드 데이터 (Seed Data)
-- ========================================================

-- 관리자 계정 생성
INSERT INTO users (id, phone, name, birth_year, gender, job, instagram_id, mbti, interests, my_tendencies, preferred_tendencies, budget_ranges, food_restrictions, role)
VALUES 
('a0000000-0000-0000-0000-000000000001', '01000000000', '관리자', 1990, 'M', '서비스 운영자', 'serendipity_official', 'ENFJ', ARRAY['자기계발·공부'], ARRAY['이야기를 이끄는 편'], ARRAY['열정 있는 사람'], ARRAY['20,000~30,000원'], '없음', 'ROLE_ADMIN')
ON CONFLICT (phone) DO NOTHING;

-- 테스트 회차 (매주 목요일)
INSERT INTO event_slots (id, event_date, event_time, region, capacity, match_deadline, status)
VALUES
(1, CURRENT_DATE + INTERVAL '5 days', '19:30:00', '홍대/합정', 24, CURRENT_TIMESTAMP + INTERVAL '3 days', 'OPEN'),
(2, CURRENT_DATE + INTERVAL '5 days', '19:30:00', '강남/신논현', 24, CURRENT_TIMESTAMP + INTERVAL '3 days', 'OPEN'),
(3, CURRENT_DATE + INTERVAL '5 days', '19:30:00', '을지로/종로', 24, CURRENT_TIMESTAMP + INTERVAL '3 days', 'OPEN'),
(4, CURRENT_DATE + INTERVAL '5 days', '19:30:00', '잠실', 24, CURRENT_TIMESTAMP + INTERVAL '3 days', 'OPEN')
ON CONFLICT (id) DO NOTHING;

-- 테스트 제휴 식당 풀
INSERT INTO venues (id, name, region, address, map_url, representative_menu, avg_price, capacity_tables, phone)
VALUES
('b0000000-0000-0000-0000-000000000001', '연남 브리즈 다이닝', '홍대/합정', '서울 마포구 동교로 210', 'https://map.kakao.com/link/to/연남브리즈', '트러플 크림 파스타 & 와인', 25000, 4, '02-333-1001'),
('b0000000-0000-0000-0000-000000000002', '합정 슬로우키친', '홍대/합정', '서울 마포구 독막로 45', 'https://map.kakao.com/link/to/합정슬로우', '수비드 부채살 스테이크', 28000, 3, '02-333-1002'),
('b0000000-0000-0000-0000-000000000003', '신논현 어반비스트로', '강남/신논현', '서울 강남구 봉은사로 12', 'https://map.kakao.com/link/to/신논현어반', '구운 관자 리조또', 27000, 5, '02-555-2001'),
('b0000000-0000-0000-0000-000000000004', '강남 숲속의 식탁', '강남/신논현', '서울 서초구 강남대로 381', 'https://map.kakao.com/link/to/강남숲속', '화덕피자 & 라자냐', 22000, 4, '02-555-2002'),
('b0000000-0000-0000-0000-000000000005', '을지로 감성식당 노을', '을지로/종로', '서울 중구 을지로 105', 'https://map.kakao.com/link/to/을지로노을', '봉골레 파스타 & 감바스', 24000, 4, '02-222-3001'),
('b0000000-0000-0000-0000-000000000006', '잠실 레이크사이드 비스트로', '잠실', '서울 송파구 송파나루길 48', 'https://map.kakao.com/link/to/잠실레이크', '안심 찹스테이크', 26000, 4, '02-444-4001')
ON CONFLICT (id) DO NOTHING;
