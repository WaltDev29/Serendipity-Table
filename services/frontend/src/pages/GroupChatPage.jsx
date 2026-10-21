import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function GroupChatPage() {
  const navigate = useNavigate();
  const { matchResult, currentUser, chatMessages, sendChatMessage, isReadOnlyMode, setIsReadOnlyMode } = useApp();
  
  const [inputText, setInputText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGameVote, setSelectedGameVote] = useState(null); // 'A' or 'B'
  const [gameVotes, setGameVotes] = useState({ A: 2, B: 1 });
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);

  // 신고 모달 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetNickname, setReportTargetNickname] = useState('민트초코');
  const [reportReason, setReportReason] = useState('과도한 음주 또는 불쾌한 언행');
  const [reportDetail, setReportDetail] = useState('');

  const chatMembers = (matchResult?.members || []).map((m, idx) => {
    const bgColors = ['bg-primary-fixed text-primary', 'bg-secondary-fixed text-secondary', 'bg-tertiary-fixed text-tertiary', 'bg-surface-container-high text-on-surface-variant'];
    return {
      id: m.id || `m-${idx}`,
      nickname: m.nickname,
      isMe: m.isMe,
      job: m.job,
      ageGroup: m.ageGroup || `${m.age}`,
      mannerTemp: m.mannerTemp || 36.5,
      initial: m.nickname ? m.nickname.substring(0, 1) : '회',
      avatarBg: bgColors[idx % 4]
    };
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isReadOnlyMode) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  const handleVote = (option) => {
    if (selectedGameVote === option) return;
    setGameVotes(prev => ({
      ...prev,
      [option]: prev[option] + 1,
      ...(selectedGameVote ? { [selectedGameVote]: Math.max(0, prev[selectedGameVote] - 1) } : {})
    }));
    setSelectedGameVote(option);
  };

  if (!matchResult) {
    return (
      <div className="w-full bg-surface min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 text-center">
        <div className="max-w-sm bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">chat</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface">참여 중인 단체 채팅방이 없습니다</h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              목요일 정기 식탁 매칭이 완료되면 4인 전용 실시간 채팅방이 자동으로 열립니다.
            </p>
          </div>
          <div className="w-full flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="w-full h-11 rounded-2xl bg-primary text-white font-bold text-sm shadow-sm hover:bg-primary-container transition-all"
            >
              목요일 식탁 신청하기
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full h-11 rounded-2xl bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-variant transition-colors"
            >
              홈 화면으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col w-full items-center justify-start py-space-md px-space-xs sm:px-space-md">
        
        {/* Main Desktop/Mobile Container */}
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-start justify-center gap-space-lg relative">
          
          {/* Central Mobile Chat Container (Max 480px) */}
          <div className="w-full max-w-[480px] mx-auto bg-surface-container-lowest shadow-xl rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300">
            
            {/* Top Chat Header: 좌측 상단 메뉴 버튼 배치 */}
            <div className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-space-md py-space-sm shadow-sm flex items-center justify-between border-b border-surface-container">
              {/* Left Side: 메뉴 버튼 & 식탁 타이틀 */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-9 h-9 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0"
                  title="대화방 메뉴 열기"
                >
                  <span className="material-symbols-outlined text-xl">menu</span>
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-headline-sm text-sm font-bold text-on-surface truncate">{matchResult.tableName}</h2>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary text-[10px] font-bold shrink-0">4명</span>
                  </div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant truncate">{matchResult.venue.name} · 19:30</p>
                </div>
              </div>

              {/* Right Side: 식당 정보 버튼 & 닫기(채팅 목록 이동) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(true)}
                  className="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center hover:opacity-90 transition-opacity"
                  title="식당 정보 보기"
                >
                  <span className="material-symbols-outlined text-lg">place</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/chats')}
                  className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  title="채팅 목록으로 이동"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Pinned Notices Area (도착 체크인 기능 삭제) */}
            <div className="flex flex-col bg-surface-container-low">
              {/* ADMIN_NOTICE */}
              <div className="bg-primary px-space-md py-2.5 flex items-start gap-space-xs text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">warning</span>
                <div className="flex-1 text-label-md font-label-md leading-snug">
                  <strong className="font-bold">[운영자 긴급 공지]</strong> 식당 2층 안쪽 '우연한 식탁' 4인 전용 룸으로 안내받으시면 됩니다.
                </div>
              </div>
              
              {/* Pin Notice (도착 체크인 버튼 제거) */}
              <div className="px-space-md py-2 bg-surface-container-high flex items-center justify-between text-on-surface-variant text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-secondary text-base">push_pin</span>
                  <span className="truncate text-on-surface font-medium">📍 오늘 저녁 7:30 {matchResult.venue.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(true)}
                  className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-highest text-on-surface text-[11px] font-semibold flex items-center gap-0.5 shrink-0 transition-colors"
                >
                  <span>식당 안내</span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </button>
              </div>
            </div>

            {/* CHAT STREAM */}
            <div className="flex-1 p-space-md flex flex-col gap-space-md overflow-y-auto bg-surface-bright" style={{ maxHeight: '640px', minHeight: '480px' }}>
              
              {/* 1. SYSTEM_WELCOME */}
              <div className="flex flex-col items-center justify-center my-space-xs">
                <div className="bg-surface-container rounded-2xl p-space-md max-w-sm text-center shadow-sm flex flex-col items-center gap-space-xs">
                  <span className="text-2xl">🎉</span>
                  <p className="font-label-lg text-label-lg text-primary font-bold">우연한 식탁에 오신 것을 환영합니다!</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    서로를 존중하는 따뜻한 식탁을 만들어가요.<br />
                    <span className="text-error font-semibold">(행사 2일 전 이후 노쇼 시 영구 이용 제한)</span>
                  </p>
                </div>
              </div>

              {/* 2. VENUE_CARD */}
              <div className="flex flex-col rounded-2xl overflow-hidden bg-surface-container-lowest shadow-md">
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={matchResult.venue.image}
                    alt={matchResult.venue.name}
                  />
                  <span className="absolute top-2.5 left-2.5 px-space-xs py-0.5 rounded-full bg-on-background/80 text-surface text-label-sm font-label-sm backdrop-blur-sm">
                    배정 식당 안내
                  </span>
                </div>
                <div className="p-space-md flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{matchResult.venue.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-label-sm text-label-sm">예약명: 우연한 식탁</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-secondary">location_on</span>
                    {matchResult.venue.address}
                  </p>
                  <div className="p-space-xs bg-surface-container-low rounded-lg mt-1 flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">추천 메뉴 &amp; 예상 금액</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">{matchResult.venue.menu} ({matchResult.venue.avgPrice})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs mt-space-xs">
                    <button
                      type="button"
                      onClick={() => alert('카카오맵으로 길찾기를 실행합니다.')}
                      className="h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-md text-label-md font-semibold gap-1 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-base">near_me</span>
                      카카오맵 길찾기
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('네이버지도로 상세 정보를 봅니다.')}
                      className="h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-label-md text-label-md font-semibold gap-1 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-base">map</span>
                      네이버지도
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. DYNAMIC CHAT MESSAGES */}
              {chatMessages.map((msg) => {
                const msgType = msg.messageType || msg.type;
                const senderName = msg.senderNickname || msg.senderName || msg.sender || '멤버';
                const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.timestamp || '');

                if (msgType === 'SYSTEM' || msgType === 'SYSTEM_WELCOME') {
                  return (
                    <div key={msg.id} className="flex justify-center my-space-xs">
                      <div className="px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm shadow-sm max-w-sm text-center">
                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                      </div>
                    </div>
                  );
                }

                if (msgType === 'CHECKIN_NOTICE' || msgType === 'ARRIVAL_CHECKIN') {
                  return (
                    <div key={msg.id} className="flex justify-center my-space-xs">
                      <div className="px-space-md py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm shadow-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">where_to_vote</span>
                        <span>{typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}</span>
                      </div>
                    </div>
                  );
                }

                if (msgType === 'ADMIN_NOTICE') {
                  return (
                    <div key={msg.id} className="flex justify-center my-space-xs">
                      <div className="px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center gap-2 shadow-sm max-w-md">
                        <span className="material-symbols-outlined text-lg">campaign</span>
                        <span>{typeof msg.content === 'string' ? msg.content : msg.content?.text}</span>
                      </div>
                    </div>
                  );
                }

                if (msgType === 'BLIND') {
                  return (
                    <div key={msg.id} className="rounded-xl p-space-sm bg-surface-container-high/60 flex items-center justify-between text-on-surface-variant">
                      <div className="flex items-center gap-1 font-body-sm text-body-sm">
                        <span className="material-symbols-outlined text-base">block</span>
                        <span>차단한 사용자의 메시지입니다.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert('차단된 메시지: ' + msg.content)}
                        className="font-label-sm text-label-sm text-primary hover:underline font-semibold"
                      >
                        내용 보기 ▾
                      </button>
                    </div>
                  );
                }

                if (msgType === 'VENUE_CARD') {
                  return null;
                }

                // TALK MESSAGE
                const isMe = msg.isMe || msg.senderId === currentUser?.id || msg.senderRole === 'ME' || senderName === '나' || senderName === currentUser?.nickname;

                if (isMe) {
                  return (
                    <div key={msg.id} className="flex flex-col items-end self-end max-w-[78%]">
                      <div className="flex items-end gap-1 justify-end">
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{timeStr}</span>
                        </div>
                        <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm px-space-md py-2.5 font-body-md text-body-md shadow-sm">
                          {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex items-start gap-space-xs">
                    <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 text-on-secondary-fixed font-bold text-sm shadow-sm">
                      {senderName.slice(0, 2)}
                    </div>
                    <div className="flex flex-col items-start max-w-[75%]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-label-md text-label-md text-on-surface font-bold">{senderName}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {msg.senderRole || '멤버'}
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <div className="bg-surface-container rounded-2xl rounded-tl-sm px-space-md py-2.5 text-on-surface font-body-md text-body-md shadow-sm">
                          {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 4. TOPIC_CARD (Auto-posted at 19:30) */}
              <div className="rounded-2xl p-space-md bg-secondary-fixed text-on-secondary-fixed shadow-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">19:30 자동 전달 질문</span>
                  <span className="material-symbols-outlined text-lg">lightbulb</span>
                </div>
                <p className="font-headline-sm text-headline-sm font-bold text-on-secondary-fixed leading-snug">
                  💡 오늘의 스몰토크 질문 카드
                </p>
                <p className="font-body-md text-body-md text-on-secondary-fixed leading-normal">
                  "요즘 가장 재미있게 본 영화나 인생 여행지를 한 곳씩 가볍게 소개해볼까요?"
                </p>
              </div>

              {/* 5. GAME_CARD (Interactive Balance Game) */}
              <div className="rounded-2xl p-space-md bg-surface-container-low shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-xl">casino</span>
                  <h4 className="font-headline-sm text-headline-sm font-bold">식탁 밸런스 게임</h4>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">주말 충전 스타일은 어느 쪽인가요?</p>
                <div className="flex flex-col gap-space-xs mt-1">
                  <button
                    type="button"
                    onClick={() => handleVote('A')}
                    className={`w-full text-left p-space-sm rounded-xl transition-all flex items-center justify-between group ${
                      selectedGameVote === 'A' ? 'bg-primary-fixed/40 ring-2 ring-primary' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary">
                      A. 집에서 OTT 정주행 🛋️
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm">
                      {gameVotes.A}명 투표 {selectedGameVote === 'A' && '✓'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote('B')}
                    className={`w-full text-left p-space-sm rounded-xl transition-all flex items-center justify-between group ${
                      selectedGameVote === 'B' ? 'bg-secondary-fixed/40 ring-2 ring-secondary' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary">
                      B. 밖에서 러닝/야외활동 🏃
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                      {gameVotes.B}명 투표 {selectedGameVote === 'B' && '✓'}
                    </span>
                  </button>
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* BOTTOM CONTROL & INPUT SECTION */}
            <div className="bg-surface-container-lowest p-space-sm flex flex-col gap-space-xs shadow-md border-t border-surface-container">
              {/* Active Input Bar */}
              {!isReadOnlyMode ? (
                <form onSubmit={handleSendMessage} className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => alert('사진 또는 장소 공유 팝업을 연결합니다.')}
                    className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                    title="사진 또는 위치 첨부"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="따뜻한 대화를 나눠보세요..."
                      className="w-full h-11 px-space-md rounded-full bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-95 shadow-md active:scale-95 transition-all disabled:opacity-50"
                    title="메시지 전송"
                  >
                    <span className="material-symbols-outlined text-xl">send</span>
                  </button>
                </form>
              ) : (
                /* Read-Only Notice Bar */
                <div className="py-3 px-space-md rounded-xl bg-surface-container-high text-center font-label-md text-label-md text-on-surface-variant flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>모임이 종료되어 읽기 전용 상태입니다. (피드백을 작성해보세요)</span>
                </div>
              )}
            </div>

          </div>

          {/* Drawer Backdrop on mobile */}
          {isDrawerOpen && (
            <div
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
            />
          )}

          {/* Slide-Out Drawer / Desktop Companion Panel (대화방 메뉴) */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-[320px] max-w-[85vw] bg-surface-container-lowest shadow-2xl p-space-md flex flex-col gap-space-md transition-transform duration-300 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:w-80 lg:shadow-xl lg:rounded-2xl lg:translate-x-0 ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:flex'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">forum</span>
                  <span>대화방 메뉴</span>
                </h3>
                <span className="font-body-sm text-[11px] text-on-surface-variant">{matchResult.tableName}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                title="닫기"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Section 1: Member List (멤버 목록) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-on-surface">참여 멤버 (4명)</span>
                <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  전원 참여 중
                </span>
              </div>

              <div className="space-y-2">
                {chatMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${member.avatarBg}`}>
                        {member.initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-on-surface truncate">
                            {member.nickname} {member.isMe && '(나)'}
                          </span>
                          <span className="text-[10px] text-secondary font-semibold">
                            {member.mannerTemp}°C
                          </span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant truncate">
                          {member.job} · {member.ageGroup}
                        </span>
                      </div>
                    </div>

                    {!member.isMe && (
                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetNickname(member.nickname);
                          setIsReportModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-[10px] text-on-surface-variant font-medium shrink-0 transition-colors flex items-center gap-0.5"
                        title={`${member.nickname} 신고하기`}
                      >
                        <span className="material-symbols-outlined text-[12px]">report</span>
                        <span>신고</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: 신고하기 및 안심 보호 */}
            <div className="p-3.5 rounded-xl bg-error-container/20 border border-error/20 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-error font-bold text-xs">
                <span className="material-symbols-outlined text-[17px]">gavel</span>
                <span>에티켓 및 안심 보호</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                쾌적한 식탁 문화를 위해 무례한 행동이나 불쾌한 언행은 즉시 신고해주세요.
              </p>

              <button
                type="button"
                onClick={() => {
                  setReportTargetNickname('민트초코');
                  setIsReportModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-error text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-error/90 active:scale-[0.99] transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">campaign</span>
                <span>비매너 참가자 신고하기</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/blocked-users')}
                className="w-full py-2 rounded-xl bg-surface-container-lowest text-on-surface text-xs font-semibold flex items-center justify-center gap-1 hover:bg-surface-container transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">shield</span>
                <span>차단 관리 목록 가기</span>
              </button>
            </div>

            {/* Section 3: 바로가기 메뉴 */}
            <div className="space-y-1 pt-2 border-t border-surface-container text-xs">
              <button
                type="button"
                onClick={() => setIsVenueModalOpen(true)}
                className="w-full p-2.5 rounded-xl hover:bg-surface-container-low flex items-center justify-between text-on-surface font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-secondary">store</span>
                  <span>배정 식당 정보 및 지도</span>
                </span>
                <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/feedback')}
                className="w-full p-2.5 rounded-xl hover:bg-surface-container-low flex items-center justify-between text-on-surface font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-primary">rate_review</span>
                  <span>모임 후기 남기기</span>
                </span>
                <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/cs')}
                className="w-full p-2.5 rounded-xl hover:bg-surface-container-low flex items-center justify-between text-on-surface font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-tertiary">support_agent</span>
                  <span>1:1 고객센터 문의</span>
                </span>
                <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Venue Quick Modal */}
      {isVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsVenueModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              {matchResult.venue.name}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              {matchResult.venue.address}
            </p>
            <div className="rounded-xl overflow-hidden mb-4 h-36">
              <img src={matchResult.venue.image} alt="식당" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-primary font-semibold mb-4">
              대표 메뉴: {matchResult.venue.menu}
            </p>
            <button
              onClick={() => setIsVenueModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Report Modal (비매너 참가자 신고하기) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-surface-container relative">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex items-center gap-2 text-error mb-2">
              <span className="material-symbols-outlined text-2xl">report_problem</span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">비매너 참가자 신고</h3>
            </div>

            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              신고 내용은 운영팀에서 24시간 이내에 확인하며, 신고자의 정보는 상대방에게 절대 공개되지 않습니다.
            </p>

            {/* Target Member Select */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-on-surface mb-1">신고 대상 멤버</label>
              <select
                value={reportTargetNickname}
                onChange={(e) => setReportTargetNickname(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none"
              >
                {chatMembers.filter(m => !m.isMe).map(m => (
                  <option key={m.id} value={m.nickname}>{m.nickname} ({m.job})</option>
                ))}
              </select>
            </div>

            {/* Reason Select */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-on-surface mb-1">신고 사유</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none"
              >
                <option value="과도한 음주 또는 불쾌한 언행">과도한 음주 또는 불쾌한 언행</option>
                <option value="노쇼 및 무단 지각">노쇼 및 무단 지각</option>
                <option value="원치 않는 연락처/SNS 요구">원치 않는 연락처/SNS 요구</option>
                <option value="식사비 정산 불이행">식사비 정산 불이행</option>
                <option value="영업/홍보/상업적 목적">영업/홍보/상업적 목적</option>
                <option value="기타 에티켓 위반">기타 에티켓 위반</option>
              </select>
            </div>

            {/* Detail Note */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-on-surface mb-1">상세 내용 (선택)</label>
              <textarea
                rows={3}
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                placeholder="상황을 구체적으로 적어주시면 신속한 조치에 도움이 됩니다."
                className="w-full p-2.5 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`[신고 완료] ${reportTargetNickname}님에 대한 신고가 접수되었습니다.\n운영팀에서 검토 후 즉시 조치하겠습니다.`);
                  setIsReportModalOpen(false);
                  setReportDetail('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-error text-white text-xs font-bold shadow-sm hover:bg-error/90 transition-colors"
              >
                신고 접수
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
