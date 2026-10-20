import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 사용자 상태: 'NONE' (미신청), 'WAITING' (매칭대기), 'CONFIRMED' (매칭완료), 'ATTENDED' (체크인완료), 'FEEDBACK_DONE' (피드백완료)
  const [userState, setUserState] = useState('WAITING');

  // 현재 로그인된 사용자 정보 (데모 프로필: 김서연)
  const [currentUser, setCurrentUser] = useState({
    id: 'user-01',
    name: '김서연',
    nickname: '서연',
    phone: '010-8492-3310',
    instagramId: 'seoyeon_slowbistro',
    birthYear: '1995',
    age: 29,
    gender: 'F',
    job: '브랜드 디자이너',
    mbti: 'ENFP',
    mannerTemp: 98.0,
    tickets: 2, // 보유 참가권
    interests: ['맛집·카페 탐방', '전시·공연', '음악', '깊은 대화'],
    myTendencies: ['경청을 잘 함', '잔잔하고 조용한 편', '깊은 대화를 좋아함'],
    preferredTendencies: ['나와 비슷한 사람', '깊은 대화가 되는 사람', '편하고 유머 있는 사람'],
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_N_YMzu8pCWbe8bPYhe7u8whdLerjErZJb4Jg_QMYirk-DXZoSZuzgR8FDqFsNhVBXtSR_6I33sXtOeTt48Ymjj7EypGbCxDxid8QCaMKkGELHpP96p2ImA8lAzMIsmhsTJO5IvXnGm4EXBRzlaYRUjJs9x6Xk4zdPnR_SE-QMkgr9tJJvIVa5mPnRuSYsJHZ9ad0alkjhpZQCCf_jaBeqhsf0jvO-hYJdUFcehBUn-WgUuv05kE'
  });

  // 신청서 폼 임시 상태
  const [applicationData, setApplicationData] = useState({
    name: '김서연',
    phone: '010-8492-3310',
    instagramId: 'seoyeon_slowbistro',
    birthYear: '1995',
    gender: 'F',
    job: '브랜드 디자이너',
    mbti: 'ENFP',
    interests: ['맛집·카페 탐방', '전시·공연'],
    myTendencies: ['경청을 잘 함', '깊은 대화를 좋아함'],
    preferredTendencies: ['깊은 대화가 되는 사람'],
    budgetRange: '20,000 ~ 30,000원',
    foodRestrictions: ['오이', '날생선 / 회'],
    preferredRegions: ['홍대 / 합정'],
    ticketType: '1회 참가권 (₩8,000)',
    ticketPrice: 8000
  });

  // 배정된 식당 및 테이블 멤버 정보 (CONFIRMED 상태 시)
  const [matchResult, setMatchResult] = useState({
    tableId: 'hongdae-03',
    tableName: '10/22 홍대/합정 식탁',
    eventDate: '2026-10-22 (목) 저녁 7:30',
    venue: {
      name: '연남 브리즈 다이닝',
      genre: 'NATURAL WINE & BISTRO',
      address: '서울 마포구 동교로 210, 2층',
      subway: '홍대입구역 3번 출구 도보 5분',
      menu: '트러플 크림 파스타 & 채끝 스테이크',
      avgPrice: '1인 평균 약 25,000원 선 (N분의 1 현장 정산)',
      atmosphere: ['#따뜻한조명', '#조용한대화', '#와인페어링'],
      rating: '4.8 (210)',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNdZwCmXDUGfqcdgb2gYsJOsWHvuLVFaEoTy8wlWuxByW_ZmEkeNbz_Azbaj9cUiaTA2KWQVoHfgX67wZYqiw8D-jJ2cwDUwFdjGVBQsE1aJzNLq-3-EP8eaqCSdhSIorw7-Y14MAhKitNVgtE3krX6rnTZjCcvA0Fr3-Vd3FW2UKyottzb4BVlqusmSx7JSjJ2KGL_7tEDMjWvyIW5vnnkHB2WVOAzJ5-j07wb6fyw3R5vVrCDck'
    },
    members: [
      { id: 'm-1', name: '나 (김서연)', role: 'ME', gender: '여성', age: '20대 후반', job: '디자이너', mbti: 'ENFP', verified: true, status: '대화 선호', attended: true },
      { id: 'm-2', name: '민트초코', role: 'MEMBER', gender: '여성', age: '20대 중반', job: '마케터', mbti: 'INFP', verified: true, status: '경청 스타일', attended: true },
      { id: 'm-3', name: '러너', role: 'MEMBER', gender: '남성', age: '20대 후반', job: '개발자', mbti: 'INTJ', verified: true, status: '분위기 메이커', attended: false },
      { id: 'm-4', name: '책벌레', role: 'MEMBER', gender: '남성', age: '30대 초반', job: '건축가', mbti: 'ISFJ', verified: true, status: '차분한 대화', attended: true }
    ]
  });

  // 알림 센터 데이터
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'MATCH',
      title: '🎉 10/22 홍대/합정 식탁 매칭 완료!',
      desc: '배정된 식당(연남 브리즈)과 4인의 익명 블라인드 멤버 카드를 확인해보세요.',
      time: '10분 전',
      read: false,
      link: '/match/result'
    },
    {
      id: 2,
      type: 'REWARD',
      title: '매너 평가 리워드 1,000P 적립',
      desc: '지난 식탁 매너 온도 +0.3℃ 상승! 정성스러운 후기 감사합니다.',
      time: '1시간 전',
      read: false,
      link: '/my'
    },
    {
      id: 3,
      type: 'NOTICE',
      title: '우연한 식탁 노쇼 방지 및 에티켓 안내',
      desc: '행사 2일 전 이후 무단 노쇼 시 영구 이용이 제한됩니다.',
      time: '1일 전',
      read: true,
      link: '#'
    }
  ]);

  // 실시간 단체 채팅 메시지 (7대 메시지 타입 시뮬레이션)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-1',
      type: 'SYSTEM_WELCOME',
      sender: 'SYSTEM',
      content: '우연한 식탁에 오신 것을 환영합니다! 서로를 존중하는 따뜻한 식탁을 만들어가요. (행사 2일 전 이후 노쇼 시 영구 이용 제한)',
      timestamp: '17:00'
    },
    {
      id: 'msg-2',
      type: 'VENUE_CARD',
      sender: 'SYSTEM',
      content: {
        venueName: '연남 브리즈 다이닝',
        address: '서울 마포구 동교로 210, 2층',
        menu: '트러플 크림 파스타 & 채끝 스테이크 (1인 약 25,000원)',
        reservationName: '우연한 식탁'
      },
      timestamp: '17:00'
    },
    {
      id: 'msg-3',
      type: 'ICEBREAKING_PROMPT',
      sender: 'AI_BOT',
      content: '💡 오늘의 맞춤 스몰토크 질문 카드: “다들 요즘 가장 재미있게 본 영화나 인생 여행지를 한 곳씩 소개해볼까요?”',
      timestamp: '17:05'
    },
    {
      id: 'msg-4',
      type: 'TALK',
      sender: '민트초코',
      senderRole: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content: '안녕하세요! 다들 만나서 반갑습니다 :) 저는 연남동 쪽 자주 오는데 여기 파스타 진짜 맛있다고 들었어요!',
      timestamp: '18:12'
    },
    {
      id: 'msg-5',
      type: 'TALK',
      sender: '러너',
      senderRole: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      content: '반갑습니다! 퇴근하고 바로 출발하면 7시 20분쯤 도착할 것 같아요 ㅎㅎ',
      timestamp: '18:25'
    },
    {
      id: 'msg-6',
      type: 'ADMIN_NOTICE',
      sender: 'ADMIN',
      content: '[운영자 긴급 공지] 식당 2층 안쪽 우연한 식탁 4인 전용 룸으로 바로 안내받으시면 됩니다.',
      timestamp: '19:15'
    },
    {
      id: 'msg-7',
      type: 'ARRIVAL_CHECKIN',
      sender: 'SYSTEM',
      content: '📍 서연(나)님이 식당에 도착하여 [도착 체크인]을 완료했습니다! (19:24)',
      timestamp: '19:24'
    }
  ]);

  // 모달 제어 상태
  const [isNotiDrawerOpen, setIsNotiDrawerOpen] = useState(false);
  const [isEtiquetteOpen, setIsEtiquetteOpen] = useState(false);
  const [isCsOpen, setIsCsOpen] = useState(false);

  // 메시지 전송 핸들러
  const sendMessage = (text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      type: 'TALK',
      sender: '나',
      senderRole: 'ME',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // 도착 체크인 핸들러
  const handleCheckIn = () => {
    const checkinMsg = {
      id: `checkin-${Date.now()}`,
      type: 'ARRIVAL_CHECKIN',
      sender: 'SYSTEM',
      content: `📍 서연(나)님이 식당에 도착하여 [도착 체크인]을 완료했습니다! (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, checkinMsg]);
    setUserState('ATTENDED');
  };

  return (
    <AppContext.Provider
      value={{
        userState,
        setUserState,
        currentUser,
        setCurrentUser,
        applicationData,
        setApplicationData,
        matchResult,
        setMatchResult,
        notifications,
        setNotifications,
        chatMessages,
        setChatMessages,
        sendMessage,
        handleCheckIn,
        isNotiDrawerOpen,
        setIsNotiDrawerOpen,
        isEtiquetteOpen,
        setIsEtiquetteOpen,
        isCsOpen,
        setIsCsOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
