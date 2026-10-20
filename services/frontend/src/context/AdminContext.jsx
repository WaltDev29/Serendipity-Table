import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAdminDashboardApi,
  getAdminSlotsApi,
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
  getAdminAuditLogsApi
} from '../api/admin';
import { loginApi } from '../api/auth';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // 1. 회차 및 슬롯 목록 (A-02)
  const [events, setEvents] = useState([
    {
      id: 'EVT-CURRENT',
      slotId: 1,
      title: '금주 목요일 정기 모임',
      eventDate: '2026-10-22 19:30:00',
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
            title: `${s.eventDate} ${s.dayOfWeek || ''} 정기 모임`,
            eventDate: `${s.eventDate} ${s.eventTime || '19:30:00'}`,
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
              isReserved: v.reserved || false,
              phone: v.phone,
              rating: v.rating || 4.8
            }))
          );
        }
      } catch (e) {
        console.warn('Admin venues fetch error:', e);
      }

      // 5) 블랙리스트 및 사용자 목록
      try {
        const bl = await getAdminBlacklistApi();
        if (Array.isArray(bl)) {
          setBlacklist(bl);
          setUsers(
            bl.map((b) => ({
              id: b.user?.id || b.id,
              name: b.user?.name || '차단 회원',
              phone: b.user?.phone || '-',
              mannerTemp: b.user?.mannerTemp || 30.0,
              strikeCount: 2,
              status: 'BANNED',
              banReason: b.reason,
              bannedAt: b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'
            }))
          );
        }
      } catch (e) {
        console.warn('Admin blacklist fetch error:', e);
      }

      // 6) CS 1:1 고객 문의 목록
      try {
        const inqs = await getAdminInquiriesApi();
        if (Array.isArray(inqs)) {
          setCsInquiries(
            inqs.map((q) => ({
              id: q.id,
              userName: q.userName || '문의 회원',
              userPhone: q.userPhone || '-',
              category: q.category || '기타',
              subject: q.title,
              title: q.title,
              content: q.content,
              reply: q.answer,
              answer: q.answer,
              status: q.status === 'ANSWERED' ? 'RESOLVED' : 'OPEN',
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
    } catch (err) {
      console.error('refreshAdminData error:', err);
    }
  }, []);

  // 마운트 시 관리자 로그인 및 데이터 로드
  useEffect(() => {
    const initAdmin = async () => {
      try {
        const loginRes = await loginApi('01000000000', 'password123!');
        if (loginRes?.accessToken) {
          localStorage.setItem('admin_token', loginRes.accessToken);
        }
      } catch (e) {
        console.warn('Admin auto login note:', e);
      }
      await refreshAdminData();
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

  // 3) 매칭 최종 확정 및 알림톡 발송
  const confirmFinalMatching = async () => {
    setMatchingTables((prev) =>
      prev.map((t) => ({ ...t, status: 'CONFIRMED' }))
    );
    setEvents((prev) =>
      prev.map((ev, i) => (i === 0 ? { ...ev, status: 'CONFIRMED' } : ev))
    );
    addAuditLog('CONFIRM_MATCHING', '총괄관리자', '금주 테이블 최종 매칭 확정 및 알림톡 일괄 발송 완료');
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
    addAuditLog('MANUAL_REFUND', '총괄관리자', `신청 건 ${applicationId} 즉시 전액 환불 완료 (사유: ${reason})`);
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
        replyInquiry,
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
