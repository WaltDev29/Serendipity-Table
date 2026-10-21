import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminChatOpsPage() {
  const {
    chatRooms,
    setChatRooms,
    activeChatRoomId,
    setActiveChatRoomId,
    sendEmergencyNotice,
    kickMember
  } = useAdmin();

  const [adminInput, setAdminInput] = useState('');
  const [kickTargetUser, setKickTargetUser] = useState(null);

  const defaultRoom = {
    id: 'placeholder',
    roomName: '개설된 채팅방 없음',
    venueName: '미배정',
    memberCount: 0,
    unreadCount: 0,
    lastMessage: '현재 활성화된 단체방이 없습니다.',
    lastMessageTime: '-',
    messages: [],
    members: []
  };

  const activeRoom = (chatRooms && chatRooms.length > 0)
    ? (chatRooms.find((r) => r.id === activeChatRoomId) || chatRooms[0])
    : defaultRoom;

  // 운영자 직접 메시지 전송
  const handleSendAdminMessage = (e) => {
    e.preventDefault();
    if (!adminInput.trim()) return;

    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoom.id
          ? {
              ...room,
              lastMessage: adminInput,
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              messages: [
                ...room.messages,
                {
                  id: `admin-${Date.now()}`,
                  type: 'TALK',
                  sender: '운영자 김관리 (Manager)',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  text: adminInput,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isAdmin: true
                }
              ]
            }
          : room
      )
    );
    setAdminInput('');
  };

  // AI 아이스브레이킹 추천 질문 전송
  const handleSendIcebreak = () => {
    const prompts = [
      '💡 [AI 추천 스몰토크] 최근 1년 동안 내 삶에 가장 신선한 자극을 주었던 경험이나 취미는 무엇인가요?',
      '💡 [AI 추천 스몰토크] 내가 생각하는 가장 완벽한 주말 휴식 루틴을 한 줄로 소개해주세요!',
      '💡 [AI 추천 스몰토크] 오늘 식탁에서 꼭 한 번 나눠보고 싶은 재미있는 대화 주제가 있나요?'
    ];
    const picked = prompts[Math.floor(Math.random() * prompts.length)];

    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoom.id
          ? {
              ...room,
              messages: [
                ...room.messages,
                {
                  id: `ice-${Date.now()}`,
                  type: 'ICEBREAKING_PROMPT',
                  text: picked,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            }
          : room
      )
    );
  };

  // 모임 채팅 전체 공지 모달 상태
  const [isRoomNoticeModalOpen, setIsRoomNoticeModalOpen] = useState(false);
  const [roomNoticeRegion, setRoomNoticeRegion] = useState('ALL'); // ALL, 홍대, 잠실, 강남, 을지로
  const [roomNoticeTitle, setRoomNoticeTitle] = useState('');
  const [roomNoticeContent, setRoomNoticeContent] = useState('');

  const handleBroadcastRoomNotice = (e) => {
    e.preventDefault();
    if (!roomNoticeContent.trim()) return;

    const targetNoticeText = roomNoticeTitle ? `[공지] ${roomNoticeTitle}\n${roomNoticeContent}` : `[공지] ${roomNoticeContent}`;

    // 현재 활성화된 모임에만 발송 (권역 필터 조건 반영)
    setChatRooms((prev) =>
      prev.map((room) => {
        const matchRegion = roomNoticeRegion === 'ALL' || (room.roomName || '').includes(roomNoticeRegion) || (room.region || '').includes(roomNoticeRegion);
        if (!matchRegion) return room;

        return {
          ...room,
          lastMessage: `[공지] ${roomNoticeTitle || roomNoticeContent}`,
          lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [
            ...room.messages,
            {
              id: `room-notice-${Date.now()}-${room.id}`,
              type: 'NOTICE',
              sender: '운영팀 공지',
              text: targetNoticeText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAdmin: true
            }
          ]
        };
      })
    );

    alert(`활성화된 모임(${roomNoticeRegion === 'ALL' ? '전체' : roomNoticeRegion})에 공지가 성공적으로 발송되었습니다.`);
    setIsRoomNoticeModalOpen(false);
    setRoomNoticeTitle('');
    setRoomNoticeContent('');
  };

  return (
    <div className="flex flex-col w-full space-y-space-md h-[calc(100vh-8.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-container shrink-0">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            모임 채팅 관리
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            진행 중인 모든 테이블 단체방을 실시간 모니터링하고 7대 메시지 타입 관제 및 활성 모임 대상 공지를 발송합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRoomNoticeModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-primary text-white hover:bg-primary-container transition-all font-label-md text-xs font-bold shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">campaign</span>
            <span>모임 전체 공지 발송</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span>실시간 관제 정상</span>
          </span>
        </div>
      </div>

      {/* 3-Column Split View */}
      <div className="flex-1 grid grid-cols-12 gap-space-md min-h-0 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
        {/* ========================================================= */}
        {/* 1. LEFT PANEL (3 cols): 채팅방 목록                       */}
        {/* ========================================================= */}
        <div className="col-span-3 border-r border-surface-container flex flex-col min-h-0 bg-surface-container-low/40">
          <div className="p-3 border-b border-surface-container flex items-center justify-between">
            <span className="font-title-md text-xs font-bold text-on-surface">
              테이블 단체방 ({chatRooms.length})
            </span>
            <span className="text-[10px] text-outline font-semibold">10/22 회차</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-surface-container-low">
            {chatRooms.map((room) => {
              const isActive = room.id === activeRoom.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveChatRoomId(room.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-on-surface">{room.roomName}</span>
                    <span className="text-[10px] text-outline font-mono">{room.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[13px] text-primary">storefront</span>
                    <span className="truncate">{room.venueName}</span>
                    <span>({room.memberCount}명)</span>
                  </div>
                  <p className="text-[11px] text-on-surface truncate font-normal">
                    {room.lastMessage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTER PANEL (6 cols): 실시간 대화 스트림 타임라인     */}
        {/* ========================================================= */}
        <div className="col-span-6 flex flex-col min-h-0 bg-background">
          {/* Room Header */}
          <div className="p-3 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title-md text-sm font-bold text-on-surface">
                  {activeRoom.roomName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">
                  {activeRoom.venueName}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                현재 참가자 {activeRoom.memberCount}명 접속 중
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="px-2 py-1 rounded-lg bg-surface-container text-on-surface text-[10px] font-semibold">
                클린 봇 가동 중
              </span>
            </div>
          </div>

          {/* Messages Stream 타임라인 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeRoom.messages.map((msg) => {
              // 7대 메시지 타입 렌더링
              if (msg.type === 'SYSTEM_WELCOME') {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-surface-container text-center text-xs text-on-surface border border-outline-variant/30 space-y-1">
                    <span className="material-symbols-outlined text-[20px] text-primary block">restaurant</span>
                    <p className="font-semibold text-primary">{msg.text}</p>
                    <span className="text-[10px] text-outline">{msg.time}</span>
                  </div>
                );
              }

              if (msg.type === 'VENUE_CARD') {
                return (
                  <div key={msg.id} className="p-3.5 rounded-2xl bg-surface-container-lowest border border-primary/30 shadow-xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        배정 식당 정보
                      </span>
                      <span className="text-[10px] text-outline">{msg.time}</span>
                    </div>
                    <p className="font-bold text-sm text-on-surface">{msg.venue.name}</p>
                    <p className="text-on-surface-variant text-[11px]">{msg.venue.address}</p>
                    <p className="text-secondary font-semibold text-[11px]">{msg.venue.table}</p>
                  </div>
                );
              }

              if (msg.type === 'ARRIVAL_CHECKIN') {
                return (
                  <div key={msg.id} className="p-2 rounded-xl bg-tertiary-fixed text-tertiary text-center text-xs font-bold flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>{msg.text}</span>
                    <span className="text-[10px] opacity-75">({msg.time})</span>
                  </div>
                );
              }

              if (msg.type === 'ICEBREAKING_PROMPT') {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-secondary-fixed/40 border border-secondary-fixed text-on-secondary-container text-xs font-semibold leading-relaxed">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        스몰토크 릴레이 질문
                      </span>
                      <span className="text-[10px] text-outline">{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                );
              }

              if (msg.type === 'ADMIN_NOTICE') {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-primary text-white shadow-md text-xs font-semibold leading-relaxed animate-pulse">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">campaign</span>
                        {msg.title}
                      </span>
                      <span className="text-[10px] text-white/80">{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                );
              }

              // Normal TALK message
              return (
                <div key={msg.id} className={`flex items-start gap-2 text-xs ${msg.isAdmin ? 'justify-end' : ''}`}>
                  {!msg.isAdmin && (
                    <img
                      src={msg.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={msg.sender}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-surface-container"
                    />
                  )}
                  <div className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`font-bold ${msg.isAdmin ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-outline">{msg.time}</span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[320px] leading-relaxed ${
                        msg.isAdmin
                          ? 'bg-primary-container text-on-primary rounded-tr-none'
                          : 'bg-surface-container-lowest text-on-surface border border-surface-container rounded-tl-none shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Direct Message Input Form */}
          <form onSubmit={handleSendAdminMessage} className="p-3 bg-surface-container-lowest border-t border-surface-container flex gap-2 shrink-0">
            <input
              type="text"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              placeholder="운영자 권한으로 단체방에 직접 메시지 전송..."
              className="flex-1 h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!adminInput.trim()}
              className="px-4 h-10 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-container transition-colors disabled:opacity-40"
            >
              전송
            </button>
          </form>
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT PANEL (3 cols): 운영자 즉시 개입 툴킷           */}
        {/* ========================================================= */}
        <div className="col-span-3 border-l border-surface-container p-4 flex flex-col justify-between min-h-0 bg-surface-container-lowest">
          <div className="space-y-4 overflow-y-auto">
            <div>
              <h3 className="font-title-md text-xs font-bold text-on-surface mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[17px]">bolt</span>
                <span>운영자 즉시 개입 액션</span>
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSendIcebreak}
                  className="w-full py-2.5 px-3 rounded-xl bg-secondary-fixed text-secondary font-bold text-xs hover:bg-secondary-fixed-dim transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    <span>AI 질문 즉시 투입</span>
                  </div>
                  <span className="material-symbols-outlined text-[14px]">send</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendEmergencyNotice(
                      activeRoom.roomName,
                      '식당 룸 위치 안내',
                      '매장 2층 안쪽 우연한 식탁 전용 룸으로 오시면 자리 안내를 도와드립니다.',
                      true
                    )
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">campaign</span>
                    <span>룸 위치 핀 공지 띄우기</span>
                  </div>
                  <span className="material-symbols-outlined text-[14px]">push_pin</span>
                </button>
              </div>
            </div>

            {/* Participants Status & Kick Action */}
            <div className="space-y-2 pt-3 border-t border-surface-container">
              <span className="font-bold text-xs text-on-surface block">
                참가자 명단 및 현장 도착 상태
              </span>
              <div className="space-y-1.5">
                {[
                  { name: '김서연', age: 29, status: '도착 완료 (19:24)', isArrived: true },
                  { name: '이도현', age: 31, status: '이동 중 (예상 19:28)', isArrived: false },
                  { name: '박지민', age: 28, status: '도착 완료 (19:20)', isArrived: true },
                  { name: '최원우', age: 30, status: '도착 완료 (19:25)', isArrived: true }
                ].map((member) => (
                  <div
                    key={member.name}
                    className="p-2 rounded-xl bg-surface-container-low flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-on-surface">{member.name}</span>
                        <span className="text-[10px] text-outline">({member.age}세)</span>
                      </div>
                      <span className={`text-[10px] font-semibold ${member.isArrived ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                        {member.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setKickTargetUser(member.name)}
                      className="px-2 py-0.5 rounded bg-error-container text-error hover:bg-error hover:text-white text-[10px] font-bold transition-colors"
                      title="비매너/폭언 시 강제 퇴장"
                    >
                      강퇴
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant leading-relaxed">
            <p className="font-bold text-on-surface text-[11px] mb-0.5">안심 모니터링 가이드</p>
            욕설, 연락처 강요 등 비매너 행위 감지 시 즉시 [강퇴] 버튼으로 소켓을 차단하고 영구 제재할 수 있습니다.
          </div>
        </div>
      </div>

      {/* 강퇴 확인 모달 */}
      {kickTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container flex flex-col gap-3">
            <h3 className="font-title-md text-sm font-bold text-error flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              <span>참가자 강제 퇴장 확인</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              참가자 <strong className="text-on-surface">{kickTargetUser}</strong>님을 해당 테이블 단체방에서 즉시 퇴장시키고 채팅 접근을 영구 차단하시겠습니까?
            </p>
            <div className="flex gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setKickTargetUser(null)}
                className="flex-1 h-9 rounded-xl bg-surface-container text-xs font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  kickMember(activeRoom.id, kickTargetUser);
                  setKickTargetUser(null);
                }}
                className="flex-1 h-9 rounded-xl bg-error text-white text-xs font-bold"
              >
                즉시 강제 퇴장
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 모임 전체/권역별 공지 발송 모달 */}
      {isRoomNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                </div>
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface">
                    모임 단체방 전체 공지 발송
                  </h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    현재 활성화된 모임 단체방에만 공지 메시지를 전송합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomNoticeModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastRoomNotice} className="space-y-3">
              {/* Target Region */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  발송 대상 (모임 전체 / 권역별 선택)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'ALL', label: '전체 모임' },
                    { id: '홍대', label: '홍대' },
                    { id: '잠실', label: '잠실' },
                    { id: '강남', label: '강남' },
                    { id: '을지로', label: '을지로' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoomNoticeRegion(r.id)}
                      className={`h-8 rounded-lg text-xs font-semibold transition-all ${
                        roomNoticeRegion === r.id
                          ? 'bg-primary text-white shadow-xs font-bold'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  공지 제목 (선택)
                </label>
                <input
                  type="text"
                  value={roomNoticeTitle}
                  onChange={(e) => setRoomNoticeTitle(e.target.value)}
                  placeholder="예: [안내] 모임 시작 10분 전 안내"
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  공지 내용 <span className="text-error">*</span>
                </label>
                <textarea
                  value={roomNoticeContent}
                  onChange={(e) => setRoomNoticeContent(e.target.value)}
                  rows={3}
                  required
                  placeholder="활성 모임 단체방에 전달할 안내 사항을 입력하세요."
                  className="w-full p-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsRoomNoticeModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-surface-container text-xs font-bold text-on-surface"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!roomNoticeContent.trim()}
                  className="flex-1 h-10 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>모임방에 공지 발송</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
