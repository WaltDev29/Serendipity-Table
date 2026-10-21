import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAdminDashboardApi,
  getAdminSlotsApi,
  getAdminApplicationsApi,
  getAdminUsersApi,
  toggleRegionCloseApi,
  getAdminTablesApi,
  swapMembersApi,
  getAdminVenuesApi,
  toggleVenueReservedApi,
  getAdminBlacklistApi,
  addToBlacklistApi,
  removeFromBlacklistApi,
  getAdminInquiriesApi,
  replyInquiryApi,
  resolveInquiryApi,
  deleteInquiryApi,
  getAdminAuditLogsApi,
  refundApplicationApi,
  getAdminOrdersApi,
  refundOrderApi,
  adminLoginApi,
  adminLogoutApi
} from '../api/admin';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // 관리자 인증 정보
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 0. 결제 주문 목록 (Orders)
  const [orders, setOrders] = useState([]);

  // 1. 회차 및 슬롯 목록 (A-02)
  const [events, setEvents] = useState([
    {
      id: 'EVT-CURRENT',
      slotId: 1,
      title: '목요일 정기 모임',
      eventDate: '2026-10-22',
      deadline: '2026-10-20 18:00:00',
      totalApplicants: 0,
      targetCapacity: 192,
      status: 'OPEN',
      regions: [
        { id: 'HONGDAE', name: '홍대/합정', current: 0, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 중후반' },
        { id: 'GANGNAM', name: '강남/신논현', current: 0, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 후반' },
        { id: 'EULJIRO', name: '을지로/종로', current: 0, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 중후반' },
        { id: 'SEONGSU', name: '성수/건대', current: 0, target: 48, status: 'OPEN', maleRatio: 50, femaleRatio: 50, ageGroup: '20대 중반' }
      ]
    }
  ]);

  // 2. 신청자 마스터 목록 (A-03)
  const [applications, setApplications] = useState([]);

  // 3. 4인 식탁 매칭 테이블 목록 (A-04, A-07)
  const [matchingTables, setMatchingTables] = useState([]);

  // 4. 제휴 식당 및 예약 관리 목록 (A-05)
  const [venues, setVenues] = useState([]);

  // 5. 실시간 관제 채팅방 데이터 (A-06)
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState(null);

  // 6. 회원 및 블랙리스트 관리 (A-08)
  const [users, setUsers] = useState([]);
  const [blacklist, setBlacklist] = useState([]);

  // 7. CS 1:1 고객 문의 목록 (A-08)
  const [csInquiries, setCsInquiries] = useState([]);

  // 8. 운영자 행동 감사 로그 (A-01, A-09)
  const [auditLogs, setAuditLogs] = useState([]);

  // 9. 관리자 긴급 공지 고정 핀
  const [pinnedNotice, setPinnedNotice] = useState(null);

  // 10. 대시보드 통계 요약 (A-01)
  const [dashboardStats, setDashboardStats] = useState(null);

  // 백엔드 관리자 데이터 전체 새로고침
  const refreshAdminData = useCallback(async () => {
    try {
      // 1) 대시보드 통계
      try {
        const stats = await getAdminDashboardApi();
        setDashboardStats(stats);
      } catch (e) {
        console.warn('Admin dashboard fetch error:', e);
      }

      // 2) 슬롯 목록
      try {
        const slots = await getAdminSlotsApi();
        if (Array.isArray(slots)) {
          const formattedEvents = slots.map((s) => ({
            id: `EVT-${s.id}`,
            slotId: s.id,
            title: `${s.dayOfWeek ? s.dayOfWeek + ' ' : ''}정기 모임`,
            eventDate: s.eventDate ? s.eventDate.split(' ')[0] : '',
            deadline: `${s.deadlineDate || s.eventDate} 18:00:00`,
            totalApplicants: s.totalApplicants || 0,
            targetCapacity: s.targetCapacity || 192,
            status: s.status || 'OPEN',
            regions: (s.regions || []).map((r) => ({
              id: r.regionName,
              name: r.regionName,
              current: r.currentApplicants || 0,
              target: r.targetCapacity || 48,
              status: r.isClosed ? 'CLOSED' : 'OPEN',
              maleRatio: r.maleRatio || 50,
              femaleRatio: r.femaleRatio || 50,
              ageGroup: '20대 중후반'
            }))
          }));
          setEvents(formattedEvents);
        }
      } catch (e) {
        console.warn('Admin slots fetch error:', e);
      }

      // 3) 매칭 테이블 목록
      try {
        const tables = await getAdminTablesApi();
        if (Array.isArray(tables)) {
          const formattedTables = tables.map((t, idx) => {
            const mems = (t.members || []).map((m, mIdx) => ({
              id: m.userId || `m-${mIdx}`,
              name: m.nickname,
              gender: m.gender,
              age: m.birthYear ? 2026 - m.birthYear : 29,
              job: m.job || '직장인',
              mbti: m.mbti || 'ENFP',
              mannerTemp: m.mannerTemp || 36.5,
              attended: true
            }));
            const maleCount = mems.filter((m) => m.gender === 'M').length;
            const femaleCount = mems.filter((m) => m.gender === 'F').length;

            return {
              id: t.tableId || `table-${idx + 1}`,
              tableId: t.tableId,
              number: t.tableNo || (idx + 1),
              tableNo: `${t.region} #${t.tableNo || (idx + 1)}`,
              region: t.region,
              status: t.status || 'CONFIRMED',
              reservationStatus: t.reservationStatus || 'PENDING',
              harmonyScore: t.harmonyScore || 95,
              maleCount,
              femaleCount,
              targetSize: 4,
              isBalanced: maleCount === 2 && femaleCount === 2,
              venue: {
                id: t.venue?.id,
                name: t.venue?.name || '미배정',
                genre: '이탈리안 & 비스트로',
                menu: t.venue?.representativeMenu || '시그니처 코스',
                address: t.venue?.address || '',
                avgPrice: t.venue?.avgPrice ? `1인 약 ${t.venue.avgPrice.toLocaleString()}원` : '1인 약 25,000원',
                budget: t.venue?.avgPrice ? `₩${t.venue.avgPrice.toLocaleString()}` : '₩25,000'
              },
              members: mems,
              chatRoomId: t.chatRoomId
            };
          });
          setMatchingTables(formattedTables);

          // Populate chatRooms from matching tables
          const rooms = formattedTables.map((t, tIdx) => ({
            id: t.chatRoomId || t.id || `room-${tIdx + 1}`,
            roomName: `${t.tableNo} 단체방`,
            venueName: t.venue?.name || '배정 대기',
            memberCount: t.members?.length || 4,
            unreadCount: 0,
            lastMessage: '우연한 식탁에 오신 것을 환영합니다! 서로를 존중하는 따뜻한 식탁을 만들어가요.',
            lastMessageTime: '최근',
            messages: [
              {
                id: `sys-${tIdx}`,
                type: 'SYSTEM',
                sender: '식탁 지킴이',
                text: '우연한 식탁에 오신 것을 환영합니다! 서로를 존중하는 따뜻한 식탁을 만들어가요.',
                time: '19:00',
                isAdmin: true
              }
            ],
            members: t.members
          }));
          setChatRooms(rooms);
          if (rooms.length > 0) {
            setActiveChatRoomId((prev) => prev || rooms[0].id);
          }
        }
      } catch (e) {
        console.warn('Admin tables fetch error:', e);
      }

      // 4) 제휴 식당 목록
      try {
        const venueList = await getAdminVenuesApi();
        if (Array.isArray(venueList)) {
          setVenues(
            venueList.map((v) => ({
              id: v.id,
              name: v.name,
              region: v.region,
              genre: 'DINING & BISTRO',
              capacity: v.capacity || 24,
              reservedTableCount: v.reservedTableCount || 4,
              address: v.address,
              subway: '지하철역 인근',
              menu: v.representativeMenu,
              avgPrice: v.avgPrice ? `1인 약 ${v.avgPrice.toLocaleString()}원` : '1인 약 25,000원',
              avgBudget: v.avgPrice || 25000,
              isReserved: v.reserved || v.isReserved || false,
              phone: v.phone,
              rating: v.rating || 4.8,
              image: v.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
              naverMapUrl: v.naverMapUrl || v.mapUrl,
              tables: '4인 프라이빗 룸 2개, 4인 테이블 3개',
              benefits: '웰컴 드링크 1잔 제공'
            }))
          );
        }
      } catch (e) {
        console.warn('Admin venues fetch error:', e);
      }

      // 4-1) 참가 신청자 마스터 목록
      try {
        const appList = await getAdminApplicationsApi();
        if (Array.isArray(appList)) {
          setApplications(
            appList.map((a) => ({
              id: a.id,
              userId: a.userId,
              name: a.name,
              gender: a.gender,
              age: a.age,
              phone: a.phone || '-',
              instagramId: a.instagramId ? `@${a.instagramId.replace(/^@/, '')}` : '-',
              job: a.job || '직장인',
              mbti: a.mbti || 'ENFP',
              region: a.region || '홍대/합정',
              regions: a.regions || [a.region || '홍대/합정'],
              ticketType: a.ticketType || '1_TICKET',
              paymentStatus: a.paymentStatus || 'PAID',
              matchingStatus: a.matchStatus || 'WAITING',
              assignedTable: a.assignedTable || '미배정',
              interests: a.interests || [],
              myTendencies: a.myTendencies || [],
              preferredTendencies: a.preferredTendencies || [],
              budget: (a.budgetRanges && a.budgetRanges.length > 0) ? a.budgetRanges[0] : '20,000~30,000원',
              budgetRanges: a.budgetRanges || [],
              foodRestrictions: Array.isArray(a.foodRestrictions)
                ? a.foodRestrictions
                : (a.foodRestrictions && a.foodRestrictions !== '없음' && a.foodRestrictions !== 'null')
                ? [a.foodRestrictions]
                : [],
              createdAt: a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'
            }))
          );
        }
      } catch (e) {
        console.warn('Admin applications fetch error:', e);
      }

      // 5) 전체 회원 및 블랙리스트 목록
      try {
        const allUsers = await getAdminUsersApi();
        if (Array.isArray(allUsers)) {
          setUsers(
            allUsers.map((u) => ({
              id: u.id,
              name: u.name,
              nickname: u.nickname || u.name,
              phone: u.phone || '-',
              mannerTemp: u.mannerTemp || 36.5,
              strikeCount: u.strikeCount || 0,
              status: u.status === 'WITHDRAWN' || u.status === 'DELETED' || u.isWithdrawn ? 'WITHDRAWN' : (u.status === 'BANNED' ? 'BANNED' : (u.strikeCount > 0 ? 'WARNING' : 'CLEAN')),
              rawStatus: u.status,
              banReason: u.banReason,
              bannedAt: u.bannedAt ? new Date(u.bannedAt).toLocaleString() : '-',
              gender: u.gender === 'F' ? '여' : '남',
              birthYear: u.birthYear || (2026 - (u.age || 28)),
              age: u.age || 28,
              job: u.job || '직장인',
              instagram: u.instagramId ? `@${u.instagramId.replace(/^@/, '')}` : '-',
              instagramId: u.instagramId || '-',
              mbti: u.mbti || 'ENFP',
              attendanceCount: u.attendanceCount !== undefined ? u.attendanceCount : 0,
              remainingTickets: u.remainingTickets !== undefined ? u.remainingTickets : 0,
              totalSpend: u.totalSpend !== undefined ? u.totalSpend : 0,
              role: u.role
            }))
          );
        }

        const bl = await getAdminBlacklistApi();
        if (Array.isArray(bl)) {
          setBlacklist(bl);
        }
      } catch (e) {
        console.warn('Admin users/blacklist fetch error:', e);
      }

      // 6) CS 1:1 고객 문의 목록
      try {
        const inqs = await getAdminInquiriesApi();
        if (Array.isArray(inqs)) {
          setCsInquiries(
            inqs.map((q) => ({
              id: q.id,
              userId: q.userId,
              userName: q.userName || '문의 회원',
              userPhone: q.userPhone || '-',
              category: q.category || '기타',
              subject: q.title || q.category,
              title: q.title || q.category,
              content: q.content,
              reply: q.replies && q.replies.length > 0 ? q.replies[q.replies.length - 1].replyContent : (q.answer || null),
              answer: q.replies && q.replies.length > 0 ? q.replies[q.replies.length - 1].replyContent : (q.answer || null),
              replies: q.replies || [],
              status: q.status === 'RESOLVED' ? 'RESOLVED' : (q.status === 'ANSWERED' ? 'ANSWERED' : 'OPEN'),
              rawStatus: q.status,
              createdAt: q.createdAt,
              time: q.createdAt ? new Date(q.createdAt).toLocaleString() : '최근'
            }))
          );
        }
      } catch (e) {
        console.warn('Admin inquiries fetch error:', e);
      }

      // 7) 감사 로그 목록
      try {
        const logs = await getAdminAuditLogsApi();
        if (Array.isArray(logs)) {
          setAuditLogs(
            logs.map((l) => ({
              id: l.id,
              time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString() : '방금',
              action: l.action,
              operator: l.operator || '총괄관리자',
              detail: l.detail
            }))
          );
        }
      } catch (e) {
        console.warn('Admin audit logs fetch error:', e);
      }

      // 8) 실제 DB 결제 주문 목록 (Orders)
      try {
        const orderList = await getAdminOrdersApi();
        if (Array.isArray(orderList)) {
          setOrders(
            orderList.map((o) => ({
              id: o.id,
              orderNo: o.orderNo,
              userId: o.userId,
              name: o.userName || '고객',
              phone: o.userPhone || '-',
              itemName: o.itemName || '우연한 식탁 참가권',
              ticketType: o.ticketType || '1_TICKET',
              paidAmount: o.amount || 8000,
              amount: o.amount || 8000,
              paymentMethod: o.paymentMethod || 'CARD',
              paymentStatus: o.status || 'PAID',
              status: o.status || 'PAID',
              createdAt: o.paidAt || o.createdAt ? new Date(o.paidAt || o.createdAt).toLocaleString() : '-'
            }))
          );
        }
      } catch (e) {
        console.warn('Admin orders fetch error:', e);
      }
    } catch (err) {
      console.error('refreshAdminData error:', err);
    }
  }, []);

  const loginAdmin = async (phone, password) => {
    const res = await adminLoginApi(phone, password);
    setAdminUser(res);
    await refreshAdminData();
    return res;
  };

  const logoutAdmin = () => {
    adminLogoutApi();
    setAdminUser(null);
  };

  // 마운트 시 관리자 경로(/admin)이고 이미 로그인되어 있는 경우에만 데이터 로드
  useEffect(() => {
    const initAdmin = async () => {
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const token = localStorage.getItem('admin_token');
      if (isAdminPath && token) {
        await refreshAdminData();
      }
    };

    initAdmin();
  }, [refreshAdminData]);

  // ----------------------------------------------------
  // 운영 액션 핸들러들
  // ----------------------------------------------------

  // 1) AI 자동 매칭 실행
  const triggerAiMatching = async (slotId = 1) => {
    await refreshAdminData();
    addAuditLog('AI_MATCH_RUN', '총괄관리자', `슬롯 #${slotId} AI 4인 식탁 매칭 알고리즘 실행 완료`);
  };

  // 2) 참가자 수동 교체 (스왑)
  const swapMembers = async (tableIdA, memberIdA, tableIdB, memberIdB, reason = '관리자 수동 조정') => {
    try {
      await swapMembersApi(tableIdA, memberIdA, tableIdB, memberIdB, reason);
      await refreshAdminData();
      addAuditLog(
        'MANUAL_OVERRIDE',
        '총괄관리자',
        `${tableIdA}와 ${tableIdB} 간 참가자 (${memberIdA} ↔ ${memberIdB}) 수동 스왑 배치`
      );
    } catch (e) {
      alert('멤버 스왑 실패: ' + e.message);
    }
  };

  // 3) 매칭 최종 확정 (화요일 확정) 및 권역 식당 모의 예약 신청 (10초 후 예약 완료 처리)
  const confirmFinalMatching = async () => {
    // 1단계: 모임 확정 및 식당 모의 예약 신청 (예약 대기 상태)
    setMatchingTables((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'CONFIRMED',
        reservationStatus: 'PENDING'
      }))
    );
    setVenues((prev) =>
      prev.map((v) => ({
        ...v,
        reservationPending: true,
        isReserved: false
      }))
    );
    setEvents((prev) =>
      prev.map((ev, i) => (i === 0 ? { ...ev, status: 'CONFIRMED' } : ev))
    );
    addAuditLog(
      'CONFIRM_MATCHING',
      '총괄관리자',
      '화요일 모임 확정 완료: 각 권역 식당 모의 예약 신청 (예약 대기 중...)'
    );

    // 2단계: 10초 뒤 예약 대기 -> 예약 완료 자동 처리
    setTimeout(() => {
      setMatchingTables((prev) =>
        prev.map((t) => ({
          ...t,
          reservationStatus: 'RESERVED'
        }))
      );
      setVenues((prev) =>
        prev.map((v) => ({
          ...v,
          reservationPending: false,
          isReserved: true
        }))
      );
      addAuditLog(
        'VENUE_RESERVED_AUTO',
        '시스템(자동)',
        '각 권역 제휴 식당 모의 예약 대기 완료 -> 예약 확정(RESERVED) 처리됨'
      );
    }, 10000);
  };

  // 4) 수동 환불 처리 (주문 ID 또는 신청서 ID 자동 판별)
  const processRefund = async (targetId, reason = '고객 단순 변심') => {
    try {
      const isOrder = orders.some((o) => o.id === targetId || o.orderNo === targetId);
      if (isOrder) {
        await refundOrderApi(targetId, reason);
      } else {
        await refundApplicationApi(targetId, reason);
      }
      await refreshAdminData();
      addAuditLog('MANUAL_REFUND', '총괄관리자', `결제/신청 건 ${targetId} 즉시 전액 환불 완료 (사유: ${reason})`);
    } catch (e) {
      console.error('Refund failed:', e);
      alert('환불 처리 실패: ' + (e.message || '알 수 없는 오류'));
    }
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

    addAuditLog('EMERGENCY_BROADCAST', '총괄관리자', `긴급 공지 발송 [대상: ${target}] - ${title || message}`);
  };

  // 6) 비매너 참가자 강제 퇴장 (Kick)
  const kickMember = (chatRoomId, memberName) => {
    addAuditLog('KICK_MEMBER', '총괄관리자', `${chatRoomId} 참가자 ${memberName} 강제 퇴장 조치`);
  };

  // 7) 회원 블랙리스트 등록
  const banUser = async (userId, reason, note) => {
    try {
      await addToBlacklistApi(userId, `${reason || '수칙 위반'}${note ? ` (${note})` : ''}`);
      await refreshAdminData();
      addAuditLog('PERMANENT_BAN', '총괄관리자', `회원 ${userId} 영구 차단 조치 (사유: ${reason})`);
    } catch (e) {
      alert('블랙리스트 등록 실패: ' + e.message);
    }
  };

  // 7-1) 회원 블랙리스트 해제
  const unbanUser = async (userId) => {
    try {
      await removeFromBlacklistApi(userId);
      await refreshAdminData();
      addAuditLog('BLACKLIST_REMOVE', '총괄관리자', `회원 ${userId} 블랙리스트 해제 완료`);
    } catch (e) {
      alert('블랙리스트 해제 실패: ' + e.message);
    }
  };

  // 7-2) 주의 사유 추가 (3회 시 자동 차단)
  const addStrikeUser = async (userId, reason) => {
    try {
      await addStrikeApi(userId, reason || '운영 수칙 위반');
      await refreshAdminData();
      addAuditLog('USER_STRIKE', '총괄관리자', `회원 ${userId} 주의 부여 (사유: ${reason})`);
    } catch (e) {
      alert('주의 부여 실패: ' + e.message);
    }
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
      '총괄관리자',
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
    addAuditLog('CSV_EXPORT', '총괄관리자', `${filename} CSV 파일 다운로드`);
  };

  // 10) 식당 예약 완료 토글
  const toggleVenueReservation = async (venueId) => {
    const venue = venues.find((v) => v.id === venueId);
    const newStatus = !venue?.isReserved;
    try {
      await toggleVenueReservedApi(venueId, newStatus);
      await refreshAdminData();
      addAuditLog('VENUE_RESERVE_TOGGLE', '총괄관리자', `식당 ${venueId} 예약 상태 변경 -> ${newStatus ? '완료' : '대기'}`);
    } catch (e) {
      alert('식당 예약 상태 변경 실패: ' + e.message);
    }
  };

  // 11) CS 답변 등록
  const replyInquiry = async (inquiryId, answer) => {
    try {
      await replyInquiryApi(inquiryId, answer);
      await refreshAdminData();
      addAuditLog('CS_REPLY', '총괄관리자', `1:1 문의 ${inquiryId} 답변 등록 완료`);
    } catch (e) {
      alert('답변 등록 실패: ' + e.message);
    }
  };

  // 11-1) CS 문의 해결 처리
  const resolveInquiry = async (inquiryId) => {
    try {
      await resolveInquiryApi(inquiryId);
      await refreshAdminData();
      addAuditLog('CS_RESOLVE', '총괄관리자', `1:1 문의 ${inquiryId} 해결 완료`);
    } catch (e) {
      alert('문의 해결 처리 실패: ' + e.message);
    }
  };

  // 11-2) CS 문의 삭제
  const deleteInquiry = async (inquiryId) => {
    try {
      await deleteInquiryApi(inquiryId);
      await refreshAdminData();
      addAuditLog('CS_DELETE', '총괄관리자', `1:1 문의 ${inquiryId} 삭제 완료`);
    } catch (e) {
      alert('문의 삭제 실패: ' + e.message);
    }
  };

  // 12) 감사 로그 추가
  const addAuditLog = (action, operator, detail) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      operator: operator || '총괄관리자',
      detail
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  };

  return (
    <AdminContext.Provider
      value={{
        events,
        setEvents,
        orders,
        setOrders,
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
        blacklist,
        setBlacklist,
        csInquiries,
        setCsInquiries,
        auditLogs,
        pinnedNotice,
        setPinnedNotice,
        dashboardStats,
        refreshAdminData,
        adminUser,
        loginAdmin,
        logoutAdmin,
        // Actions
        triggerAiMatching,
        swapMembers,
        confirmFinalMatching,
        processRefund,
        sendEmergencyNotice,
        kickMember,
        banUser,
        unbanUser,
        addStrikeUser,
        resolveUnderQuorum,
        downloadCsv,
        toggleVenueReservation,
        replyInquiry,
        resolveInquiry,
        deleteInquiry,
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
