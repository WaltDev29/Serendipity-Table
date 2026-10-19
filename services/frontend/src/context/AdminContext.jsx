import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // 1. 회차 데이터 (A-02)
  const [events, setEvents] = useState([
    {
      id: 'EVT-20261022-THU',
      title: '2026년 10월 4주차 목요일 정기 모임',
      eventDate: '2026-10-22 19:30:00',
      deadline: '2026-10-20 18:00:00',
      totalApplicants: 184,
      targetCapacity: 192,
      status: 'MATCHING', // OPEN, MATCHING, CONFIRMED, COMPLETED
      regions: [
        { id: 'hongdae', name: '홍대/합정', current: 52, target: 48, status: 'CLOSED', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 중후반' },
        { id: 'jamsil', name: '잠실/송파', current: 46, target: 48, status: 'OPEN', maleRatio: 48, femaleRatio: 52, ageGroup: '20대 후반~30대 초' },
        { id: 'gangnam', name: '강남/신논현', current: 44, target: 48, status: 'OPEN', maleRatio: 52, femaleRatio: 48, ageGroup: '20대 후반~30대' },
        { id: 'euljiro', name: '을지로/종로', current: 42, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 후반~30대' }
      ]
    },
    {
      id: 'EVT-20261029-THU',
      title: '2026년 10월 5주차 목요일 정기 모임',
      eventDate: '2026-10-29 19:30:00',
      deadline: '2026-10-27 18:00:00',
      totalApplicants: 36,
      targetCapacity: 192,
      status: 'OPEN',
      regions: [
        { id: 'hongdae', name: '홍대/합정', current: 12, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 중후반' },
        { id: 'jamsil', name: '잠실/송파', current: 8, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 후반~30대 초' },
        { id: 'gangnam', name: '강남/신논현', current: 10, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 후반~30대' },
        { id: 'euljiro', name: '을지로/종로', current: 6, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 후반~30대' }
      ]
    }
  ]);

  // 2. 신청자 마스터 목록 (A-03)
  const [applications, setApplications] = useState([
    {
      id: 'APL-20261022-0042',
      name: '김서연',
      gender: 'F',
      birthYear: 1995,
      age: 29,
      phone: '010-8492-3310',
      instagramId: 'seoyeon_slowbistro',
      region: '홍대/합정',
      secondaryRegion: '잠실/송파',
      budget: '20,000 ~ 30,000원',
      foodRestrictions: ['오이', '날생선'],
      ticketType: '1회권 (₩8,000)',
      paymentStatus: 'PAID', // PAID, REFUNDED, CANCELLED
      matchingStatus: 'CONFIRMED', // WAITING, CONFIRMED, COMPLETED
      assignedTable: '테이블 #03 (홍대)',
      job: '브랜드 디자이너',
      mbti: 'ENFP',
      interests: ['맛집·카페 탐방', '전시·공연', '와인·위스키', '깊은 대화'],
      myTendency: ['경청을 잘 함', '깊은 대화를 좋아함'],
      preferredTendency: ['편하고 유머 있는 사람', '깊은 대화가 되는 사람'],
      appliedAt: '2026-10-16 14:22:10',
      mannerTemp: 98.0
    },
    {
      id: 'APL-20261022-0015',
      name: '이도현',
      gender: 'M',
      birthYear: 1993,
      age: 31,
      phone: '010-3392-1849',
      instagramId: 'dohyun_architect',
      region: '홍대/합정',
      secondaryRegion: '을지로/종로',
      budget: '20,000 ~ 30,000원',
      foodRestrictions: [],
      ticketType: '3회권 차감 (잔여 2회)',
      paymentStatus: 'PAID',
      matchingStatus: 'CONFIRMED',
      assignedTable: '테이블 #03 (홍대)',
      job: '건축 설계사',
      mbti: 'INTJ',
      interests: ['전시·공연', '독서', '스타트업·IT'],
      myTendency: ['잔잔하고 조용한 편', '깊은 대화를 좋아함'],
      preferredTendency: ['이야기를 잘 이끄는 사람', '에너지가 밝은 사람'],
      appliedAt: '2026-10-16 11:05:32',
      mannerTemp: 96.5
    },
    {
      id: 'APL-20261022-0089',
      name: '박지민',
      gender: 'F',
      birthYear: 1996,
      age: 28,
      phone: '010-5542-8871',
      instagramId: 'jimin_curator',
      region: '홍대/합정',
      secondaryRegion: '',
      budget: '20,000 ~ 30,000원',
      foodRestrictions: ['갑각류'],
      ticketType: '1회권 (₩8,000)',
      paymentStatus: 'PAID',
      matchingStatus: 'CONFIRMED',
      assignedTable: '테이블 #03 (홍대)',
      job: '아트 큐레이터',
      mbti: 'INFP',
      interests: ['전시·공연', '음악', '여행'],
      myTendency: ['리액션이 풍부함', '경청을 잘 함'],
      preferredTendency: ['깊은 대화가 되는 사람', '편하고 유머 있는 사람'],
      appliedAt: '2026-10-16 16:40:19',
      mannerTemp: 95.0
    },
    {
      id: 'APL-20261022-0112',
      name: '최원우',
      gender: 'M',
      birthYear: 1994,
      age: 30,
      phone: '010-9182-4433',
      instagramId: 'wonwoo_product',
      region: '홍대/합정',
      secondaryRegion: '강남/신논현',
      budget: '20,000 ~ 30,000원',
      foodRestrictions: [],
      ticketType: '1회권 (₩8,000)',
      paymentStatus: 'PAID',
      matchingStatus: 'CONFIRMED',
      assignedTable: '테이블 #03 (홍대)',
      job: 'IT 프로덕트 매니저',
      mbti: 'ENFJ',
      interests: ['스타트업·IT', '와인·위스키', '운동·러닝'],
      myTendency: ['분위기 메이커', '유쾌하고 장난기 많음'],
      preferredTendency: ['나와 비슷한 사람', '에너지가 밝은 사람'],
      appliedAt: '2026-10-17 09:12:45',
      mannerTemp: 97.2
    },
    {
      id: 'APL-20261022-0143',
      name: '정유진',
      gender: 'F',
      birthYear: 1997,
      age: 27,
      phone: '010-7721-3990',
      instagramId: 'yujin_dev',
      region: '홍대/합정',
      secondaryRegion: '강남/신논현',
      budget: '20,000 ~ 30,000원',
      foodRestrictions: ['땅콩'],
      ticketType: '1회권 (₩8,000)',
      paymentStatus: 'PAID',
      matchingStatus: 'WAITING',
      assignedTable: '대기 중 (풀 잔여)',
      job: '프론트엔드 개발자',
      mbti: 'ISFP',
      interests: ['맛집·카페 탐방', '반려동물', '독서'],
      myTendency: ['잔잔하고 조용한 편'],
      preferredTendency: ['이야기를 잘 이끄는 사람'],
      appliedAt: '2026-10-17 14:55:01',
      mannerTemp: 93.0
    },
    {
      id: 'APL-20261022-0160',
      name: '강민수',
      gender: 'M',
      birthYear: 1992,
      age: 32,
      phone: '010-4411-8273',
      instagramId: 'minsu_fin',
      region: '강남/신논현',
      secondaryRegion: '',
      budget: '30,000원 이상',
      foodRestrictions: [],
      ticketType: '1회권 (₩8,000)',
      paymentStatus: 'PAID',
      matchingStatus: 'CONFIRMED',
      assignedTable: '테이블 #01 (강남)',
      job: '금융 애널리스트',
      mbti: 'ENTJ',
      interests: ['와인·위스키', '스타트업·IT', '여행'],
      myTendency: ['이야기를 잘 이끄는 사람'],
      preferredTendency: ['깊은 대화가 되는 사람'],
      appliedAt: '2026-10-17 18:20:10',
      mannerTemp: 94.8
    }
  ]);

  // 3. AI 매칭 테이블 칸반 데이터 (A-04)
  const [matchingTables, setMatchingTables] = useState([
    {
      id: 'TBL-HONGDAE-03',
      tableNo: '홍대-03',
      region: '홍대/합정',
      venue: { id: 'V01', name: '연남 브리즈 다이닝', genre: '이탈리안 & 내추럴와인', budget: '₩25,000' },
      harmonyScore: 96,
      maleCount: 2,
      femaleCount: 2,
      targetSize: 4,
      isBalanced: true,
      status: 'CONFIRMED', // DRAFT, BALANCED, CONFIRMED
      members: [
        { id: 'U01', name: '김서연', gender: 'F', age: 29, job: '브랜드 디자이너', mbti: 'ENFP', mannerTemp: 98.0 },
        { id: 'U02', name: '이도현', gender: 'M', age: 31, job: '건축 설계사', mbti: 'INTJ', mannerTemp: 96.5 },
        { id: 'U03', name: '박지민', gender: 'F', age: 28, job: '아트 큐레이터', mbti: 'INFP', mannerTemp: 95.0 },
        { id: 'U04', name: '최원우', gender: 'M', age: 30, job: 'IT 프로덕트 매니저', mbti: 'ENFJ', mannerTemp: 97.2 }
      ]
    },
    {
      id: 'TBL-HONGDAE-04',
      tableNo: '홍대-04',
      region: '홍대/합정',
      venue: { id: 'V02', name: '살롱 드 망원', genre: '프렌치 비스트로', budget: '₩28,000' },
      harmonyScore: 92,
      maleCount: 2,
      femaleCount: 2,
      targetSize: 4,
      isBalanced: true,
      status: 'CONFIRMED',
      members: [
        { id: 'U05', name: '송재혁', gender: 'M', age: 29, job: '스타트업 마케터', mbti: 'ENTP', mannerTemp: 94.0 },
        { id: 'U06', name: '윤하은', gender: 'F', age: 27, job: '패션 바이어', mbti: 'ESFP', mannerTemp: 97.5 },
        { id: 'U07', name: '한승우', gender: 'M', age: 32, job: '데이터 엔지니어', mbti: 'INTP', mannerTemp: 92.5 },
        { id: 'U08', name: '오세린', gender: 'F', age: 28, job: '출판 에디터', mbti: 'INFJ', mannerTemp: 96.0 }
      ]
    },
    {
      id: 'TBL-JAMSIL-01',
      tableNo: '잠실-01',
      region: '잠실/송파',
      venue: { id: 'V03', name: '송리단 테라스 키친', genre: '모던 캐주얼 양식', budget: '₩24,000' },
      harmonyScore: 94,
      maleCount: 2,
      femaleCount: 2,
      targetSize: 4,
      isBalanced: true,
      status: 'CONFIRMED',
      members: [
        { id: 'U09', name: '류현준', gender: 'M', age: 31, job: '경영 컨설턴트', mbti: 'ESTJ', mannerTemp: 95.8 },
        { id: 'U10', name: '임채원', gender: 'F', age: 29, job: 'UI 디자이너', mbti: 'ISFJ', mannerTemp: 96.4 },
        { id: 'U11', name: '배준혁', gender: 'M', age: 30, job: '변리사', mbti: 'ISTJ', mannerTemp: 93.9 },
        { id: 'U12', name: '신예진', gender: 'F', age: 27, job: '외국계 HR', mbti: 'ENFJ', mannerTemp: 98.2 }
      ]
    },
    {
      id: 'TBL-EULJIRO-04',
      tableNo: '을지로-04',
      region: '을지로/종로',
      venue: { id: 'V04', name: '을지로 선셋 바이브', genre: '퓨전 펍 & 파스타', budget: '₩22,000' },
      harmonyScore: 81,
      maleCount: 1,
      femaleCount: 1,
      targetSize: 4,
      isBalanced: false, // 4인 미달 예외 상태
      status: 'UNDER_QUORUM', // UNDER_QUORUM
      members: [
        { id: 'U13', name: '문동현', gender: 'M', age: 28, job: '연구원', mbti: 'ISTP', mannerTemp: 91.0 },
        { id: 'U14', name: '권수아', gender: 'F', age: 26, job: '그래픽 디자이너', mbti: 'INFP', mannerTemp: 94.2 }
      ]
    }
  ]);

  // 4. 제휴 식당 POOL (A-05)
  const [venues, setVenues] = useState([
    {
      id: 'V01',
      name: '연남 브리즈 다이닝',
      region: '홍대/합정',
      genre: '이탈리안 & 내추럴와인',
      tables: '4인 프라이빗 룸 3개, 6인석 2개',
      avgBudget: 25000,
      benefits: '웰컴 스파클링 드링크 1잔 무료',
      address: '서울 마포구 동교로 242-8 2층',
      isReserved: true,
      assignedTables: ['홍대-01', '홍대-02', '홍대-03'],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'V02',
      name: '살롱 드 망원',
      region: '홍대/합정',
      genre: '프렌치 비스트로',
      tables: '4인 테이블 4개',
      avgBudget: 28000,
      benefits: '디저트 수제 셔벗 제공',
      address: '서울 마포구 포은로 75 1층',
      isReserved: true,
      assignedTables: ['홍대-04'],
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'V03',
      name: '송리단 테라스 키친',
      region: '잠실/송파',
      genre: '모던 캐주얼 양식',
      tables: '4인 부스석 5개',
      avgBudget: 24000,
      benefits: '테이블당 바게트 & 트러플 버터 추가',
      address: '서울 송파구 백제고분로45길 12 3층',
      isReserved: true,
      assignedTables: ['잠실-01', '잠실-02'],
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'V04',
      name: '을지로 선셋 바이브',
      region: '을지로/종로',
      genre: '퓨전 펍 & 파스타',
      tables: '4인 테이블 3개',
      avgBudget: 22000,
      benefits: '나초 & 살사 디핑 무료',
      address: '서울 중구 을지로 12길 14 4층',
      isReserved: false,
      assignedTables: [],
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=500&auto=format&fit=crop&q=80'
    }
  ]);

  // 5. 채팅 관제 & 메시지 스트림 (A-06)
  const [activeChatRoomId, setActiveChatRoomId] = useState('TBL-HONGDAE-03');
  const [chatRooms, setChatRooms] = useState([
    {
      id: 'TBL-HONGDAE-03',
      roomName: '10/22 홍대-03',
      venueName: '연남 브리즈 다이닝',
      memberCount: 4,
      lastMessage: '도착했습니다! 2층 룸에 자리 잡았어요 :)',
      lastMessageTime: '19:26',
      unreadAlerts: 0,
      hasWarning: false,
      messages: [
        {
          id: 'm1',
          type: 'SYSTEM_WELCOME',
          text: '우연한 식탁에 오신 것을 환영합니다! 오늘의 호스트는 테이블의 모두입니다. 편안하고 따뜻한 대화 나눠보세요.',
          time: '18:00'
        },
        {
          id: 'm2',
          type: 'VENUE_CARD',
          venue: {
            name: '연남 브리즈 다이닝',
            address: '서울 마포구 동교로 242-8 2층',
            table: '우연한 식탁 전용 룸 (예약자명: 우연한 식탁)',
            time: '2026.10.22 (목) 19:30'
          },
          time: '18:00'
        },
        {
          id: 'm3',
          type: 'TALK',
          sender: '김서연',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: '안녕하세요 여러분! 오늘 다들 날씨 추운데 조심히 오세요 :)',
          time: '19:10'
        },
        {
          id: 'm4',
          type: 'TALK',
          sender: '최원우',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          text: '반갑습니다 서연님! 저 홍대입구역 3번출구에서 걸어가는 중입니다 ㅎㅎ',
          time: '19:15'
        },
        {
          id: 'm5',
          type: 'ARRIVAL_CHECKIN',
          text: '김서연님이 현장에 도착하여 체크인을 완료했습니다.',
          time: '19:24'
        },
        {
          id: 'm6',
          type: 'ICEBREAKING_PROMPT',
          text: '💡 [오늘의 추천 질문] 최근 1년 동안 내 삶에 가장 신선한 자극을 주었던 순간이나 새로운 경험은 무엇인가요?',
          time: '19:25'
        },
        {
          id: 'm7',
          type: 'TALK',
          sender: '김서연',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: '도착했습니다! 2층 룸에 자리 잡았어요 :)',
          time: '19:26'
        }
      ]
    },
    {
      id: 'TBL-HONGDAE-04',
      roomName: '10/22 홍대-04',
      venueName: '살롱 드 망원',
      memberCount: 4,
      lastMessage: '네 10분 정도 조금 늦을 것 같습니다 죄송해요!',
      lastMessageTime: '19:20',
      unreadAlerts: 1,
      hasWarning: false,
      messages: [
        {
          id: 'm1',
          type: 'SYSTEM_WELCOME',
          text: '우연한 식탁에 오신 것을 환영합니다!',
          time: '18:00'
        },
        {
          id: 'm2',
          type: 'TALK',
          sender: '윤하은',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          text: '네 10분 정도 조금 늦을 것 같습니다 죄송해요!',
          time: '19:20'
        }
      ]
    },
    {
      id: 'TBL-JAMSIL-01',
      roomName: '10/22 잠실-01',
      venueName: '송리단 테라스 키친',
      memberCount: 4,
      lastMessage: '모두 도착해서 메뉴 고르고 있습니다~',
      lastMessageTime: '19:32',
      unreadAlerts: 0,
      hasWarning: false,
      messages: [
        {
          id: 'm1',
          type: 'TALK',
          sender: '신예진',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          text: '모두 도착해서 메뉴 고르고 있습니다~',
          time: '19:32'
        }
      ]
    }
  ]);

  // 6. 회원 관리 & 블랙리스트 (A-07)
  const [users, setUsers] = useState([
    {
      id: 'USR-001',
      name: '김서연',
      gender: '여',
      birthYear: 1995,
      phone: '010-8492-3310',
      instagram: '@seoyeon_slowbistro',
      joinedAt: '2026-08-12',
      attendanceCount: 4,
      totalSpend: 32000,
      mannerTemp: 98.0,
      strikeCount: 0,
      status: 'CLEAN' // CLEAN, WARNING, BANNED
    },
    {
      id: 'USR-002',
      name: '이도현',
      gender: '남',
      birthYear: 1993,
      phone: '010-3392-1849',
      instagram: '@dohyun_architect',
      joinedAt: '2026-07-04',
      attendanceCount: 6,
      totalSpend: 48000,
      mannerTemp: 96.5,
      strikeCount: 0,
      status: 'CLEAN'
    },
    {
      id: 'USR-003',
      name: '배강석',
      gender: '남',
      birthYear: 1989,
      phone: '010-9941-2038',
      instagram: '@gangseok_b',
      joinedAt: '2026-09-01',
      attendanceCount: 2,
      totalSpend: 16000,
      mannerTemp: 64.2,
      strikeCount: 1,
      status: 'WARNING' // 주의 1회: 30일 참가 제한
    },
    {
      id: 'USR-004',
      name: '박철민',
      gender: '남',
      birthYear: 1987,
      phone: '010-1123-9999',
      instagram: '@chulmin_park',
      joinedAt: '2026-06-20',
      attendanceCount: 1,
      totalSpend: 8000,
      mannerTemp: 42.0,
      strikeCount: 2,
      status: 'BANNED' // 영구 차단
    }
  ]);

  // 1:1 고객센터 문의 인박스 (A-07 우측)
  const [csInquiries, setCsInquiries] = useState([
    {
      id: 'CS-101',
      userName: '정유진',
      category: '취소/환불',
      subject: '갑작스러운 야근으로 일정 변경 가능할까요?',
      content: '안녕하세요 오늘 신청자 정유진입니다. 회사에 긴급 배포가 생겨서 다음 주로 이월하고 싶은데 가능한지 문의드립니다.',
      time: '10분 전',
      status: 'OPEN',
      reply: ''
    },
    {
      id: 'CS-102',
      userName: '강민수',
      category: '식단 문의',
      subject: '혹시 와인 페어링 필수인가요?',
      content: '차를 가져가서 술을 못 마실 것 같은데 무알콜 음료로 변경 가능한지 궁금합니다.',
      time: '35분 전',
      status: 'RESOLVED',
      reply: '안녕하세요 강민수님! 배정되는 모든 식당은 1인 1음료(무알콜 음료 및 에이드 포함) 선택이 자유롭습니다.'
    }
  ]);

  // 7. 실시간 감사 로그 (Audit Logs)
  const [auditLogs, setAuditLogs] = useState([
    { id: 'LOG-01', time: '19:28:40', action: 'CHECKIN', operator: '김서연 (유저)', detail: '홍대-03 현장 도착 체크인 완료' },
    { id: 'LOG-02', time: '19:20:15', action: 'MANUAL_OVERRIDE', operator: '운영자 김관리', detail: '홍대-04 참가자 성비 보정 (여2:남2 스왑 완료)' },
    { id: 'LOG-03', time: '18:55:02', action: 'RESERVE_CONFIRM', operator: '운영자 김관리', detail: '연남 브리즈 다이닝 (홍대 3개 테이블) 예약 확정' },
    { id: 'LOG-04', time: '18:00:00', action: 'AI_MATCHING', operator: 'AI Matching Engine', detail: '금주 신청자 184명 대상 38개 테이블 최적 배정 산출' }
  ]);

  // 긴급 공지 핀 배너 상태
  const [pinnedNotice, setPinnedNotice] = useState(null);

  // ----------------------------------------------------
  // 운영 액션 핸들러들
  // ----------------------------------------------------

  // 1) AI 자동 매칭 실행
  const triggerAiMatching = () => {
    // 임의의 조화도 재계산 시뮬레이션
    setMatchingTables((prev) =>
      prev.map((t) => ({
        ...t,
        harmonyScore: Math.min(99, Math.max(90, Math.floor(92 + Math.random() * 6))),
        status: t.id === 'TBL-EULJIRO-04' ? 'UNDER_QUORUM' : 'BALANCED'
      }))
    );
    addAuditLog('AI_MATCHING', '운영자 김관리', 'AI 매칭 엔진 수동 재실행 완료 (조화도 재연산)');
  };

  // 2) 참가자 테이블 간 스왑 (Manual Override)
  const swapMembers = (tableIdA, memberIdA, tableIdB, memberIdB) => {
    setMatchingTables((prev) => {
      const tableA = prev.find((t) => t.id === tableIdA);
      const tableB = prev.find((t) => t.id === tableIdB);
      if (!tableA || !tableB) return prev;

      const memberA = tableA.members.find((m) => m.id === memberIdA);
      const memberB = tableB.members.find((m) => m.id === memberIdB);
      if (!memberA || !memberB) return prev;

      const newTableAMembers = tableA.members.map((m) => (m.id === memberIdA ? memberB : m));
      const newTableBMembers = tableB.members.map((m) => (m.id === memberIdB ? memberA : m));

      const getMaleCount = (mems) => mems.filter((m) => m.gender === 'M').length;
      const getFemaleCount = (mems) => mems.filter((m) => m.gender === 'F').length;

      return prev.map((t) => {
        if (t.id === tableIdA) {
          const mCount = getMaleCount(newTableAMembers);
          const fCount = getFemaleCount(newTableAMembers);
          return {
            ...t,
            members: newTableAMembers,
            maleCount: mCount,
            femaleCount: fCount,
            isBalanced: mCount === 2 && fCount === 2
          };
        }
        if (t.id === tableIdB) {
          const mCount = getMaleCount(newTableBMembers);
          const fCount = getFemaleCount(newTableBMembers);
          return {
            ...t,
            members: newTableBMembers,
            maleCount: mCount,
            femaleCount: fCount,
            isBalanced: mCount === 2 && fCount === 2
          };
        }
        return t;
      });
    });

    addAuditLog(
      'MANUAL_OVERRIDE',
      '운영자 김관리',
      `${tableIdA}와 ${tableIdB} 간 참가자 (${memberIdA} ↔ ${memberIdB}) 수동 스왑 배치`
    );
  };

  // 3) 매칭 최종 확정 및 알림톡 발송
  const confirmFinalMatching = () => {
    setMatchingTables((prev) =>
      prev.map((t) => ({ ...t, status: 'CONFIRMED' }))
    );
    setEvents((prev) =>
      prev.map((ev, i) => (i === 0 ? { ...ev, status: 'CONFIRMED' } : ev))
    );
    addAuditLog('CONFIRM_MATCHING', '운영자 김관리', '금주 38개 테이블 최종 매칭 확정 및 알림톡 일괄 발송 완료');
  };

  // 4) 수동 환불 처리
  const processRefund = (applicationId, reason) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? { ...app, paymentStatus: 'REFUNDED', matchingStatus: 'CANCELLED' }
          : app
      )
    );
    addAuditLog('MANUAL_REFUND', '운영자 김관리', `신청 건 ${applicationId} 즉시 전액 환불 완료 (사유: ${reason})`);
  };

  // 5) 긴급 공지 발송 (Admin Notice)
  const sendEmergencyNotice = (target, title, message, isPinned = true) => {
    const noticeObj = {
      id: `notice-${Date.now()}`,
      target,
      title,
      message,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (isPinned) {
      setPinnedNotice(noticeObj);
    }

    // 활성 채팅방에도 ADMIN_NOTICE 메시지 주입
    setChatRooms((prev) =>
      prev.map((room) => ({
        ...room,
        messages: [
          ...room.messages,
          {
            id: `admin-msg-${Date.now()}`,
            type: 'ADMIN_NOTICE',
            title: title || '🚨 운영자 긴급 공지',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }))
    );

    addAuditLog('EMERGENCY_BROADCAST', '운영자 김관리', `긴급 공지 발송 [대상: ${target}] - ${title || message}`);
  };

  // 6) 비매너 참가자 강제 퇴장 (Kick)
  const kickMember = (chatRoomId, memberName) => {
    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === chatRoomId
          ? {
              ...room,
              memberCount: Math.max(1, room.memberCount - 1),
              messages: [
                ...room.messages,
                {
                  id: `kick-${Date.now()}`,
                  type: 'TALK',
                  sender: '운영자 알림',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  text: `참가자 ${memberName}님이 운영진에 의해 이용 수칙 위반으로 퇴장 조치되었습니다.`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            }
          : room
      )
    );
    addAuditLog('KICK_MEMBER', '운영자 김관리', `${chatRoomId} 참가자 ${memberName} 강제 퇴장 조치`);
  };

  // 7) 회원 블랙리스트 등록
  const banUser = (userId, reason, note) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'BANNED', strikeCount: 2 }
          : u
      )
    );
    addAuditLog('PERMANENT_BAN', '운영자 김관리', `회원 ${userId} 영구 차단 조치 (사유: ${reason}, 메모: ${note})`);
  };

  // 8) 인원 미달 테이블 대안 일괄 처리 (이월권 발급 vs 전액 환불)
  const resolveUnderQuorum = (tableId, actionType) => {
    setMatchingTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: actionType === 'TRANSFER' ? 'TRANSFERRED_NEXT_WEEK' : 'REFUNDED_ALL' }
          : t
      )
    );
    addAuditLog(
      'UNDER_QUORUM_RESOLVE',
      '운영자 김관리',
      `${tableId} 인원 미달 건 ${actionType === 'TRANSFER' ? '차주 무료 이월권 발급' : '100% 자동 환불'} 처리 완료`
    );
  };

  // 9) CSV 실제 다운로드 헬퍼
  const downloadCsv = (filename, headers, rows) => {
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addAuditLog('CSV_EXPORT', '운영자 김관리', `${filename} CSV 파일 다운로드`);
  };

  // 10) 식당 예약 완료 토글
  const toggleVenueReservation = (venueId) => {
    setVenues((prev) =>
      prev.map((v) =>
        v.id === venueId ? { ...v, isReserved: !v.isReserved } : v
      )
    );
    addAuditLog('VENUE_RESERVE_TOGGLE', '운영자 김관리', `식당 ${venueId} 예약 상태 변경`);
  };

  // 11) 감사 로그 추가
  const addAuditLog = (action, operator, detail) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      operator,
      detail
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  };

  return (
    <AdminContext.Provider
      value={{
        events,
        setEvents,
        applications,
        setApplications,
        matchingTables,
        setMatchingTables,
        venues,
        setVenues,
        chatRooms,
        setChatRooms,
        activeChatRoomId,
        setActiveChatRoomId,
        users,
        setUsers,
        csInquiries,
        setCsInquiries,
        auditLogs,
        pinnedNotice,
        setPinnedNotice,
        // Actions
        triggerAiMatching,
        swapMembers,
        confirmFinalMatching,
        processRefund,
        sendEmergencyNotice,
        kickMember,
        banUser,
        resolveUnderQuorum,
        downloadCsv,
        toggleVenueReservation,
        addAuditLog
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
