import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminCustomerServicePage() {
  const { csInquiries, setCsInquiries, replyInquiry, resolveInquiry, deleteInquiry } = useAdmin();

  // 상단 필터: 'ALL' (전체), 'OPEN' (미답변), 'ANSWERED' (답변 완료), 'RESOLVED' (처리 완료)
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 우클릭 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState(null); // { x, y, room }

  // 선택된 상담 세션 (회원 단위 또는 문의 단위)
  const [selectedUserKey, setSelectedUserKey] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef(null);

  // 컨텍스트 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 문의 목록을 최신순으로 정렬
  const sortedInquiries = [...csInquiries].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // 회원별(userId 또는 userPhone/userName)로 채팅방 그룹화
  const chatRoomsMap = new Map();

  sortedInquiries.forEach((inq) => {
    const key = inq.userId || inq.userPhone || inq.userName || inq.id;
    if (!chatRoomsMap.has(key)) {
      chatRoomsMap.set(key, {
        userKey: key,
        userId: inq.userId,
        userName: inq.userName || '고객',
        userPhone: inq.userPhone || '-',
        lastInquiryTime: inq.createdAt ? new Date(inq.createdAt).getTime() : 0,
        lastTimeDisplay: inq.time || '최근',
        inquiries: []
      });
    }
    chatRoomsMap.get(key).inquiries.push(inq);
  });

  const chatRooms = Array.from(chatRoomsMap.values()).map((room) => {
    // 룸 상태 판별:
    // 1) 처리 완료(RESOLVED): 모든 문의가 해결 완료이거나 최신 문의가 RESOLVED인 경우
    // 2) 미답변(OPEN): 답변이 등록되지 않은 문의가 있는 경우
    // 3) 답변 완료(ANSWERED): 운영팀 답변은 달렸으나 최종 '처리 완료'는 안 된 상태
    const hasUnanswered = room.inquiries.some((q) => q.status === 'OPEN' || (!q.reply && !q.answer && (!q.replies || q.replies.length === 0)));
    const allResolved = room.inquiries.every((q) => q.status === 'RESOLVED');
    const latestInq = room.inquiries[0];

    let roomStatus = 'OPEN';
    if (allResolved || latestInq.status === 'RESOLVED') {
      roomStatus = 'RESOLVED'; // 처리 완료
    } else if (hasUnanswered) {
      roomStatus = 'OPEN'; // 미답변
    } else {
      roomStatus = 'ANSWERED'; // 답변 완료
    }

    return {
      ...room,
      status: roomStatus,
      lastMessage: latestInq.reply ? `[답변] ${latestInq.reply}` : latestInq.content,
      category: latestInq.category || '고객 문의'
    };
  });

  // 상단 필터 적용: 전체('ALL'), 미답변('OPEN'), 답변 완료('ANSWERED'), 처리 완료('RESOLVED')
  const filteredRooms = chatRooms.filter((room) => {
    if (filterStatus === 'OPEN' && room.status !== 'OPEN') return false;
    if (filterStatus === 'ANSWERED' && room.status !== 'ANSWERED') return false;
    if (filterStatus === 'RESOLVED' && room.status !== 'RESOLVED') return false;

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchName = room.userName.toLowerCase().includes(q);
      const matchPhone = room.userPhone.includes(q);
      const matchMsg = room.lastMessage.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMsg) return false;
    }
    return true;
  });

  // 기본 선택: 선택된 것이 없거나 목록이 변경되면 첫 번째 방 자동 선택
  useEffect(() => {
    if (!selectedUserKey && filteredRooms.length > 0) {
      setSelectedUserKey(filteredRooms[0].userKey);
    }
  }, [filteredRooms, selectedUserKey]);

  // 활성 채팅방 정보
  const activeRoom = chatRooms.find((r) => r.userKey === selectedUserKey) || null;

  // 활성 방의 문의들을 시간순(오래된 것 -> 최신 것)으로 대화 버블 변환
  const messageStream = [];
  if (activeRoom) {
    const ascInquiries = [...activeRoom.inquiries].reverse();
    ascInquiries.forEach((inq) => {
      // 1) 고객의 문의 메시지
      messageStream.push({
        id: `user-msg-${inq.id}`,
        sender: 'USER',
        senderName: activeRoom.userName,
        content: inq.content,
        category: inq.category,
        time: inq.time,
        timestamp: inq.createdAt ? new Date(inq.createdAt).getTime() : 0,
        inquiryId: inq.id
      });

      // 2) 관리자의 답변들
      if (inq.replies && inq.replies.length > 0) {
        inq.replies.forEach((rep) => {
          messageStream.push({
            id: `admin-rep-${rep.id}`,
            sender: 'ADMIN',
            senderName: rep.operatorName || '운영팀',
            content: rep.replyContent,
            time: rep.createdAt ? new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            timestamp: rep.createdAt ? new Date(rep.createdAt).getTime() : 0,
            inquiryId: inq.id
          });
        });
      } else if (inq.reply || inq.answer) {
        messageStream.push({
          id: `admin-rep-legacy-${inq.id}`,
          sender: 'ADMIN',
          senderName: '운영팀',
          content: inq.reply || inq.answer,
          time: inq.time,
          timestamp: inq.createdAt ? new Date(inq.createdAt).getTime() + 1000 : 0,
          inquiryId: inq.id
        });
      }
    });
  }

  // 메시지 스크롤 하단 이동
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageStream.length, selectedUserKey]);

  // 답변 전송 핸들러
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeRoom || isSending) return;

    // 답변 대상 문의: 미답변인 최신 문의를 우선 타깃하거나 최신 문의 선택
    const targetInquiry = activeRoom.inquiries.find((q) => q.status === 'OPEN') || activeRoom.inquiries[0];
    if (!targetInquiry) return;

    setIsSending(true);
    try {
      await replyInquiry(targetInquiry.id, replyInput.trim());
      setReplyInput('');
    } catch (err) {
      alert('답변 전송 실패: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const totalCount = chatRooms.length;
  const openCount = chatRooms.filter((r) => r.status === 'OPEN').length;
  const answeredCount = chatRooms.filter((r) => r.status === 'ANSWERED').length;
  const resolvedCount = chatRooms.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">forum</span>
            <span>고객센터 실시간 상담 (1:1 CS Chat)</span>
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            사용자 앱과 연동된 1:1 대화형 상담창입니다. 문의 고객을 선택해 실시간으로 소통할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-on-surface">
            전체 {totalCount}개
          </span>
          <span className="px-3 py-1 rounded-full bg-error-container text-error text-xs font-bold">
            미답변 {openCount}개
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary-fixed text-secondary text-xs font-bold">
            답변 완료 {answeredCount}개
          </span>
          <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary text-xs font-bold">
            처리 완료 {resolvedCount}개
          </span>
        </div>
      </div>

      {/* Main 2-Column Chat Interface */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-14rem)] min-h-[580px]">
        {/* Left Column: Chat Room List (4 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm flex flex-col overflow-hidden">
          {/* Top Filter Buttons (전체, 미답변, 답변 완료, 처리 완료) & Search */}
          <div className="p-3 border-b border-surface-container space-y-2 bg-surface-container-low/40">
            <div className="grid grid-cols-4 gap-1 bg-surface-container-low p-1 rounded-xl">
              {[
                { id: 'ALL', label: `전체 (${totalCount})` },
                { id: 'OPEN', label: `미답변 (${openCount})` },
                { id: 'ANSWERED', label: `답변 완료 (${answeredCount})` },
                { id: 'RESOLVED', label: `처리 완료 (${resolvedCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                    filterStatus === tab.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[16px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="고객명, 연락처, 대화 내용 검색"
                className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-surface-container text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Rooms Scroll List (최신순 정렬) */}
          <div className="flex-1 overflow-y-auto divide-y divide-surface-container-low">
            {filteredRooms.length === 0 ? (
              <div className="py-16 text-center text-xs text-on-surface-variant">
                해당 조건의 상담 채팅방이 없습니다.
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isSelected = selectedUserKey === room.userKey;
                return (
                  <article
                    key={room.userKey}
                    onClick={() => setSelectedUserKey(room.userKey)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        room
                      });
                    }}
                    className={`p-3 cursor-pointer transition-colors flex items-start gap-3 select-none relative ${
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-primary font-semibold'
                        : 'hover:bg-surface-container-low/60'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      {room.userName.substring(0, 1)}
                    </div>

                    {/* Room Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-on-surface truncate">
                            {room.userName}
                          </span>
                          <span className="text-[10px] text-outline font-mono truncate">
                            {room.userPhone}
                          </span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant shrink-0 font-mono">
                          {room.lastTimeDisplay}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] text-on-surface-variant truncate flex-1">
                          {room.lastMessage}
                        </p>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                            room.status === 'OPEN'
                              ? 'bg-error-container text-error'
                              : room.status === 'ANSWERED'
                              ? 'bg-secondary-fixed text-secondary'
                              : 'bg-tertiary-fixed text-tertiary'
                          }`}
                        >
                          {room.status === 'OPEN' ? '미답변' : room.status === 'ANSWERED' ? '답변 완료' : '처리 완료'}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Room Page (8 cols) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-8 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm flex flex-col overflow-hidden">
          {activeRoom ? (
            <>
              {/* Chat Room Header */}
              <header className="p-3.5 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
                    {activeRoom.userName.substring(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-bold text-on-surface">
                        {activeRoom.userName} 님과의 1:1 상담
                      </h2>
                      <span className="text-[11px] font-mono text-outline">
                        {activeRoom.userPhone}
                      </span>
                    </div>
                    <span className="text-[10px] text-primary font-medium">
                      최근 문의 유형: {activeRoom.category} (총 {activeRoom.inquiries.length}건)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeRoom.status === 'OPEN'
                        ? 'bg-error-container text-error'
                        : 'bg-tertiary-fixed text-tertiary'
                    }`}
                  >
                    {activeRoom.status === 'OPEN' ? '답변 대기' : '답변 완료'}
                  </span>
                </div>
              </header>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto bg-surface-bright flex flex-col gap-3">
                {/* Notice Bubble */}
                <div className="flex justify-center my-1">
                  <div className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px]">
                    고객센터와 회원의 1:1 실시간 대화창입니다.
                  </div>
                </div>

                {messageStream.map((msg) => {
                  const isMe = msg.sender === 'ADMIN';

                  if (isMe) {
                    // 관리자 말풍선 (우측)
                    return (
                      <div key={msg.id} className="flex flex-col items-end self-end max-w-[75%]">
                        <span className="text-[10px] text-outline mb-0.5 mr-1 font-semibold">
                          운영팀 답변
                        </span>
                        <div className="flex items-end gap-1.5 justify-end">
                          <span className="text-[10px] text-on-surface-variant shrink-0">{msg.time}</span>
                          <div className="bg-primary text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap shadow-xs">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 고객 문의 말풍선 (좌측)
                  return (
                    <div key={msg.id} className="flex items-start gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {activeRoom.userName.substring(0, 1)}
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-on-surface">{activeRoom.userName}</span>
                          {msg.category && (
                            <span className="px-1.5 py-0.2 rounded-md bg-surface-container text-primary text-[9px] font-bold">
                              {msg.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-end gap-1.5">
                          <div className="bg-surface-container rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-on-surface text-xs leading-relaxed whitespace-pre-wrap shadow-xs border border-surface-container-high">
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-on-surface-variant shrink-0">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Bottom Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-surface-container-lowest border-t border-surface-container flex items-center gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={`${activeRoom.userName} 님에게 전달할 답변을 입력하세요...`}
                  className="flex-1 h-10 px-4 rounded-full bg-surface-container-low text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={!replyInput.trim() || isSending}
                  className="h-10 px-4 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:bg-primary-container disabled:opacity-40 transition-all flex items-center gap-1 shrink-0"
                >
                  <span>{isSending ? '전송중...' : '답변 전송'}</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline">chat</span>
              <p className="text-sm font-bold">상담할 대화방을 선택해주세요</p>
              <p className="text-xs text-outline mt-1">좌측 목록에서 고객과의 채팅방을 클릭하시면 1:1 대화가 열립니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 우클릭 컨텍스트 메뉴 (문의 해결, 문의 삭제) */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container py-1 w-40 text-xs font-medium animate-fade-in"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 100),
            left: Math.min(contextMenu.x, window.innerWidth - 180)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={async () => {
              const room = contextMenu.room;
              setContextMenu(null);
              if (!room || room.inquiries.length === 0) return;

              if (window.confirm(`'${room.userName}' 님의 문의를 '처리 완료'하시겠습니까?`)) {
                // 해당 채팅방의 문의들에 대해 백엔드 해결 API 호출
                for (const inq of room.inquiries) {
                  await resolveInquiry(inq.id);
                }
                // 로컬 상태를 'RESOLVED'로 일괄 전환하여 즉시 [처리 완료] 탭으로 이동
                setCsInquiries((prev) =>
                  prev.map((q) =>
                    room.inquiries.some((rq) => rq.id === q.id)
                      ? { ...q, status: 'RESOLVED', rawStatus: 'RESOLVED' }
                      : q
                  )
                );
              }
            }}
            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-surface-container text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            <span>문의 해결</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              const targetInq = contextMenu.room.inquiries[0];
              const room = contextMenu.room;
              setContextMenu(null);
              if (!targetInq) return;

              if (window.confirm(`'${room.userName}' 님의 문의를 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.`)) {
                // 해당 룸의 모든 문의 삭제 처리
                for (const inq of room.inquiries) {
                  await deleteInquiry(inq.id);
                }
                setCsInquiries((prev) =>
                  prev.filter((q) => !room.inquiries.some((rq) => rq.id === q.id))
                );
                if (selectedUserKey === room.userKey) {
                  setSelectedUserKey(null);
                }
              }
            }}
            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-error-container/20 text-error transition-colors border-t border-surface-container-low"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>문의 삭제</span>
          </button>
        </div>
      )}
    </div>
  );
}
