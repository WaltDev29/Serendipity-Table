import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getMyProfileApi, loginApi, signupApi } from '../api/auth';
import { getMyActiveTableApi, getMyPastTablesApi } from '../api/table';
import { getMyApplicationsApi, applySlotApi, cancelApplicationApi } from '../api/application';
import { getRoomMessagesApi, createStompChatClient, publishChatMessage } from '../api/chat';
import { getMyInquiriesApi } from '../api/cs';
import { getMyNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../api/notification';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 사용자 상태: 'NONE' (미신청), 'WAITING' (매칭대기), 'CONFIRMED' (매칭완료), 'ATTENDED' (체크인완료), 'FEEDBACK_DONE' (피드백완료)
  const [userState, setUserState] = useState('NONE');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    phone: '',
    birthYear: '1995',
    gender: 'F',
    job: '브랜드 디자이너',
    mbti: 'ENFP',
    interests: ['맛집·카페 탐방', '전시·공연'],
    myTendencies: ['경청을 잘 함', '깊은 대화를 좋아함'],
    preferredTendencies: ['깊은 대화가 되는 사람'],
    budgetRange: '20,000 ~ 30,000원',
    foodRestrictions: [],
    preferredRegions: ['홍대 / 합정'],
    ticketType: '1회 참가권 (₩8,000)',
    ticketPrice: 8000
  });

  const [matchResult, setMatchResult] = useState(null);
  const [pastTables, setPastTables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

  // 모달 제어 상태
  const [isNotiDrawerOpen, setIsNotiDrawerOpen] = useState(false);
  const [isEtiquetteOpen, setIsEtiquetteOpen] = useState(false);
  const [isCsOpen, setIsCsOpen] = useState(false);

  // STOMP 클라이언트 참조
  const stompClientRef = useRef(null);

  // 백엔드 ActiveTable 응답을 프론트 UI 포맷으로 변환
  const formatTableResponse = useCallback((table, userId) => {
    if (!table) return null;
    return {
      tableId: table.tableId,
      tableName: `${table.region} 식탁 #${table.tableNo || 1}`,
      eventDate: `${table.eventDate} ${table.eventTime ? table.eventTime.substring(0, 5) : '19:30'}`,
      status: table.status,
      chatRoomId: table.chatRoomId,
      harmonyScore: table.harmonyScore,
      venue: {
        id: table.venue?.id,
        name: table.venue?.name || '추천 다이닝',
        genre: 'DINING & BISTRO',
        address: table.venue?.address || '서울 마포구 동교로 210, 2층',
        subway: '인근 지하철역 도보 5분',
        menu: table.venue?.representativeMenu || '시그니처 코스 & 와인 페어링',
        avgPrice: table.venue?.avgPrice ? `1인 약 ${table.venue.avgPrice.toLocaleString()}원` : '1인 약 25,000원 선',
        atmosphere: ['#따뜻한조명', '#조용한대화', '#와인페어링'],
        rating: '4.8 (210)',
        image: table.venue?.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        kakaoMapUrl: table.venue?.mapUrl,
        naverMapUrl: table.venue?.naverMapUrl,
        phone: table.venue?.phone
      },
      members: (table.members || []).map((m, idx) => {
        const isMe = m.userId === userId;
        const age = m.birthYear ? (2026 - m.birthYear) : 28;
        const ageGroup = age >= 30 ? '30대 초반' : '20대 후반';
        return {
          id: m.userId || `m-${idx}`,
          name: isMe ? `나 (${m.nickname})` : m.nickname,
          nickname: m.nickname,
          isMe,
          role: isMe ? 'ME' : (m.role || 'MEMBER'),
          gender: m.gender === 'M' ? '남성' : '여성',
          age: `${age}세`,
          ageGroup: `${ageGroup} · ${m.gender === 'M' ? '남성' : '여성'}`,
          job: m.job || '직장인',
          mbti: m.mbti || 'ENFP',
          mannerTemp: m.mannerTemp || 36.5,
          status: isMe ? '호스트/예약확인' : '대화 선호',
          attended: true
        };
      })
    };
  }, []);

  // 전체 데이터 갱신 로직
  const refreshAppData = useCallback(async () => {
    try {
      // 1. 프로필 조회
      let profile = null;
      try {
        profile = await getMyProfileApi();
        if (profile) {
          setCurrentUser(profile);
          setApplicationData(prev => ({
            ...prev,
            name: profile.name || prev.name,
            phone: profile.phone || prev.phone,
            job: profile.job || prev.job,
            mbti: profile.mbti || prev.mbti,
            birthYear: profile.birthYear ? String(profile.birthYear) : prev.birthYear,
            gender: profile.gender || prev.gender
          }));
        }
      } catch (e) {
        console.warn('Profile fetch error:', e);
      }

      const activeUserId = profile?.id;

      // 2. 활성 식탁 조회
      let activeTable = null;
      try {
        activeTable = await getMyActiveTableApi();
      } catch (e) {
        // 활성 식탁 없을 수 있음
      }

      if (activeTable && activeTable.tableId) {
        const formatted = formatTableResponse(activeTable, activeUserId);
        setMatchResult(formatted);
        setUserState(activeTable.status === 'MATCHED' ? 'MATCHED' : 'CONFIRMED');

        // 관리자 공지 및 서버 알림 목록 병합
        let adminNotices = [];
        try {
          const stored = localStorage.getItem('global_notices');
          if (stored) {
            adminNotices = JSON.parse(stored);
          }
        } catch (e) {
          console.warn('Failed to parse global notices:', e);
        }

        let serverNotices = [];
        try {
          const sNotices = await getMyNotificationsApi();
          if (Array.isArray(sNotices)) serverNotices = sNotices;
        } catch (e) {
          console.warn('Failed to fetch server notices:', e);
        }

        setNotifications([
          ...adminNotices,
          ...serverNotices
        ]);

        // 채팅방 메시지 로드 및 웹소켓 연결
        if (activeTable.chatRoomId) {
          try {
            const msgs = await getRoomMessagesApi(activeTable.chatRoomId);
            setChatMessages(Array.isArray(msgs) ? msgs : []);
          } catch (e) {
            console.warn('Failed to load chat messages:', e);
          }

          // 기존 웹소켓 연결 종료 후 재연결
          if (stompClientRef.current) {
            stompClientRef.current.deactivate();
          }

          const client = createStompChatClient({
            roomId: activeTable.chatRoomId,
            onMessageReceived: (newMsg) => {
              setChatMessages(prev => {
                // 중복 체크
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          });
          client.activate();
          stompClientRef.current = client;
        }
      } else {
        // 활성 식탁이 없는 경우 신청 목록 확인
        setMatchResult(null);
        let serverNotices = [];
        try {
          const sNotices = await getMyNotificationsApi();
          if (Array.isArray(sNotices)) serverNotices = sNotices;
        } catch (e) {
          console.warn('Failed to fetch server notices:', e);
        }

        setNotifications((prev) => {
          const nonNotices = prev.filter((p) => p.type !== 'NOTICE');
          return [...adminNotices, ...serverNotices, ...nonNotices.filter(n => !serverNotices.some(sn => sn.id === n.id))];
        });

        try {
          const apps = await getMyApplicationsApi();
          const activeApp = (apps || []).find(a => a.status === 'APPLIED' || a.status === 'WAITING');
          if (activeApp) {
            setUserState('WAITING');
          } else {
            setUserState('NONE');
          }
        } catch (e) {
          setUserState('NONE');
        }
      }

      // 3. 지난 식탁 조회
      try {
        const past = await getMyPastTablesApi();
        setPastTables(past || []);
      } catch (e) {
        setPastTables([]);
      }

    } catch (err) {
      console.error('refreshAppData failed:', err);
    }
  }, [formatTableResponse]);

  // 마운트 시 토큰 확인 및 초기 로그인/데이터 로드
  useEffect(() => {
    const initAuth = async () => {
      let token = localStorage.getItem('token');
      let profile = null;
      if (token) {
        try {
          profile = await getMyProfileApi();
        } catch (e) {
          token = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      if (token && profile) {
        await refreshAppData();
      } else {
        // 비로그인 상태여도 기본 공지사항은 로드
        try {
          const stored = localStorage.getItem('global_notices');
          if (stored) {
            setNotifications(JSON.parse(stored));
          }
        } catch (e) {
          console.warn('Failed to load guest notices:', e);
        }
      }
      setIsAuthInitialized(true);
    };

    initAuth();

    // 관리자 공지 발송 실시간 브로드캐스트 리스너
    const handleNewNotice = () => {
      try {
        const stored = localStorage.getItem('global_notices');
        if (stored) {
          const notices = JSON.parse(stored);
          setNotifications((prev) => {
            const nonNotices = prev.filter((p) => p.type !== 'NOTICE');
            return [...notices, ...nonNotices];
          });
        }
      } catch (e) {
        console.warn('Error reading new notice broadcast:', e);
      }
    };

    window.addEventListener('new_notice_broadcast', handleNewNotice);

    return () => {
      window.removeEventListener('new_notice_broadcast', handleNewNotice);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [refreshAppData]);

  // 메시지 전송 핸들러 (STOMP 웹소켓 발행)
  const sendChatMessage = (text, type = 'TALK', payload = null) => {
    if (!text && !payload) return;
    if (!matchResult?.chatRoomId) {
      console.warn('No active chat room ID');
      return;
    }

    if (stompClientRef.current && stompClientRef.current.connected) {
      publishChatMessage(stompClientRef.current, {
        roomId: matchResult.chatRoomId,
        senderId: currentUser?.id,
        senderRole: 'USER',
        messageType: type,
        content: text,
        payload
      });
    } else {
      console.warn('STOMP client not connected, message not sent');
    }
  };

  const sendMessage = (text) => sendChatMessage(text);

  // 도착 체크인 핸들러
  const handleCheckIn = () => {
    if (!matchResult?.chatRoomId) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sendChatMessage(
      `📍 ${currentUser?.nickname || '회원'}님이 식당에 도착하여 [도착 체크인]을 완료했습니다! (${timeStr})`,
      'ARRIVAL_CHECKIN'
    );
    setUserState('ATTENDED');
  };

  // 로그인 핸들러
  const login = async (phone, password) => {
    const data = await loginApi(phone, password);
    await refreshAppData();
    return data;
  };

  // 로그아웃 핸들러
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setMatchResult(null);
    setChatMessages([]);
    setUserState('NONE');
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
  };

  // 알림 읽음 처리 핸들러 (개별 알림 상세 보기 또는 클릭 시)
  const markNotificationAsRead = async (id) => {
    try {
      await markNotificationReadApi(id);
    } catch (e) {
      // ignore
    }
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        const stored = localStorage.getItem('global_notices');
        if (stored) {
          const list = JSON.parse(stored);
          const updatedList = list.map((n) => (n.id === id ? { ...n, read: true } : n));
          localStorage.setItem('global_notices', JSON.stringify(updatedList));
        }
      } catch (e) {
        console.warn('Failed to update stored notice read status:', e);
      }
      return updated;
    });
  };

  const markAllNotificationsRead = async () => {
    try {
      await markAllNotificationsReadApi();
    } catch (e) {
      // ignore
    }
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        const stored = localStorage.getItem('global_notices');
        if (stored) {
          const list = JSON.parse(stored);
          const updatedList = list.map((n) => ({ ...n, read: true }));
          localStorage.setItem('global_notices', JSON.stringify(updatedList));
        }
      } catch (e) {
        console.warn('Failed to update stored notice read status:', e);
      }
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthInitialized,
        userState,
        setUserState,
        currentUser,
        setCurrentUser,
        applicationData,
        setApplicationData,
        matchResult,
        setMatchResult,
        pastTables,
        notifications,
        setNotifications,
        chatMessages,
        setChatMessages,
        sendMessage,
        sendChatMessage,
        handleCheckIn,
        refreshAppData,
        login,
        logout,
        isReadOnlyMode,
        setIsReadOnlyMode,
        isNotiDrawerOpen,
        setIsNotiDrawerOpen,
        isEtiquetteOpen,
        setIsEtiquetteOpen,
        isCsOpen,
        setIsCsOpen,
        markNotificationAsRead,
        markAllNotificationsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

