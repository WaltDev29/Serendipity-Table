import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function GroupChatPage() {
  const navigate = useNavigate();
  const { matchResult, currentUser, chatMessages, sendChatMessage, checkInStatus, doCheckIn, isReadOnlyMode, setIsReadOnlyMode } = useApp();
  
  const [inputText, setInputText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGameVote, setSelectedGameVote] = useState(null); // 'A' or 'B'
  const [gameVotes, setGameVotes] = useState({ A: 2, B: 1 });
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);

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

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col w-full items-center justify-start py-space-md px-space-xs sm:px-space-md">
        
        {/* Main Desktop/Mobile Container */}
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-start justify-center gap-space-lg relative">
          
          {/* Central Mobile Chat Container (Max 480px) */}
          <div className="w-full max-w-[480px] mx-auto bg-surface-container-lowest shadow-xl rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300">
            
            {/* Top Chat Header */}
            <div className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-space-md py-space-sm shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <button
                  type="button"
                  onClick={() => navigate('/match/result')}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                  title="뒤로가기"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{matchResult.tableName}</h2>
                    <span className="px-space-xs py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm shrink-0">4명</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{matchResult.venue.name} · 19:30</p>
                </div>
              </div>

              <div className="flex items-center gap-space-xs shrink-0">
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
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                  className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors relative"
                  title="멤버 및 도착 현황 서랍 열기"
                >
                  <span className="material-symbols-outlined text-xl">menu</span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary"></span>
                </button>
              </div>
            </div>

            {/* Pinned Notices Area */}
            <div className="flex flex-col bg-surface-container-low">
              {/* ADMIN_NOTICE */}
              <div className="bg-primary px-space-md py-2.5 flex items-start gap-space-xs text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">warning</span>
                <div className="flex-1 text-label-md font-label-md leading-snug">
                  <strong className="font-bold">[운영자 긴급 공지]</strong> 식당 2층 안쪽 '우연한 식탁' 4인 전용 룸으로 안내받으시면 됩니다.
                </div>
              </div>
              
              {/* Collapsible Pin Notice */}
              <div className="px-space-md py-space-xs bg-surface-container-high flex items-center justify-between text-on-surface-variant text-label-sm font-label-sm">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="material-symbols-outlined text-secondary text-base">push_pin</span>
                  <span className="truncate text-on-surface font-medium">📍 오늘 저녁 7:30 연남 브리즈 다이닝</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    doCheckIn();
                    setIsDrawerOpen(true);
                  }}
                  className={`px-space-xs py-1 rounded font-label-sm text-label-sm flex items-center gap-0.5 hover:opacity-90 shrink-0 transition-opacity ${
                    checkInStatus ? 'bg-tertiary-fixed text-on-tertiary-fixed font-bold' : 'bg-tertiary text-on-tertiary'
                  }`}
                >
                  <span>{checkInStatus ? '도착 완료 ✓' : '도착 체크인'}</span>
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
                const senderName = msg.senderName || msg.sender || '멤버';

                if (msg.type === 'SYSTEM' || msg.type === 'SYSTEM_WELCOME') {
                  return (
                    <div key={msg.id} className="flex justify-center my-space-xs">
                      <div className="px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm shadow-sm max-w-sm text-center">
                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                      </div>
                    </div>
                  );
                }

                if (msg.type === 'CHECKIN_NOTICE' || msg.type === 'ARRIVAL_CHECKIN') {
                  return (
                    <div key={msg.id} className="flex justify-center my-space-xs">
                      <div className="px-space-md py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-md text-label-md flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-base">notifications_active</span>
                        <span>{typeof msg.content === 'string' ? msg.content : msg.content?.text}</span>
                      </div>
                    </div>
                  );
                }

                if (msg.type === 'ADMIN_NOTICE') {
                  return (
                    <div key={msg.id} className="flex justify-center my-space-xs">
                      <div className="px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center gap-2 shadow-sm max-w-md">
                        <span className="material-symbols-outlined text-lg">campaign</span>
                        <span>{typeof msg.content === 'string' ? msg.content : msg.content?.text}</span>
                      </div>
                    </div>
                  );
                }

                if (msg.type === 'BLIND') {
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

                if (msg.type === 'VENUE_CARD') {
                  // 이미 상단에 별도 카드가 있으므로 패스하거나 칩으로 표시
                  return null;
                }

                // TALK MESSAGE
                const isMe = msg.isMe || msg.senderId === currentUser.id || senderName === '나' || senderName === currentUser.nickname;

                if (isMe) {
                  return (
                    <div key={msg.id} className="flex flex-col items-end self-end max-w-[78%]">
                      <div className="flex items-end gap-1 justify-end">
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="font-label-sm text-label-sm text-primary font-bold">읽음 3</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{msg.timestamp}</span>
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
                          {msg.senderRole || '멤버'} · 20대
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <div className="bg-surface-container rounded-2xl rounded-tl-sm px-space-md py-2.5 text-on-surface font-body-md text-body-md shadow-sm">
                          {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">{msg.timestamp}</span>
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

          {/* Slide-Out Drawer / Desktop Companion Panel */}
          <div
            className={`w-full lg:w-80 bg-surface-container-lowest rounded-2xl shadow-xl p-space-md flex flex-col gap-space-md transition-all duration-300 ${
              isDrawerOpen ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">식탁 멤버 실시간 도착 현황</h3>
                <span className="font-body-sm text-body-sm text-secondary font-medium">{matchResult.venue.name} (총 4명)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="lg:hidden w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Real-time Summary Progress */}
            <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <span className="text-on-surface font-semibold">도착 완료 인원</span>
                <span className="text-tertiary font-bold">{checkInStatus ? '3 / 4명 도착' : '2 / 4명 도착'}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-tertiary rounded-full transition-all duration-500"
                  style={{ width: checkInStatus ? '75%' : '50%' }}
                ></div>
              </div>
            </div>

            {/* Self Check-in CTA Button */}
            {!checkInStatus ? (
              <button
                type="button"
                onClick={doCheckIn}
                className="w-full py-3 rounded-xl bg-tertiary text-on-tertiary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>식당 도착 셀프 체크인하기</span>
              </button>
            ) : (
              <div className="p-space-xs rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center gap-1 font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>나의 도착 체크인이 완료되었습니다 ✓</span>
              </div>
            )}

            {/* Member Arrival List */}
            <div className="flex flex-col gap-space-sm divide-y divide-surface-container">
              {/* 1) 나 */}
              <div className="pt-space-xs flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                      나
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">나 (주최 참여)</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">디자이너 · 20대 후반</span>
                    </div>
                  </div>
                  {checkInStatus ? (
                    <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> 도착 완료 19:22
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                      이동 중...
                    </span>
                  )}
                </div>
              </div>

              {/* 2) 민트초코 */}
              <div className="pt-space-xs flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed text-secondary font-bold text-xs flex items-center justify-center">
                      민트
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">민트초코</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">마케터 · 20대 중반</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> 도착 완료 19:24
                  </span>
                </div>
              </div>

              {/* 3) 러너 */}
              <div className="pt-space-xs flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary font-bold text-xs flex items-center justify-center">
                      러너
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">러너</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">개발자 · 20대 후반</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    이동 중 (도보 3분)
                  </span>
                </div>
              </div>

              {/* 4) 책방지기 */}
              <div className="pt-space-xs flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center">
                      책방
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">책방지기</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">건축가 · 30대 초반</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> 도착 완료 19:28
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <button
                type="button"
                onClick={() => navigate('/feedback')}
                className="text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>모임 후기 남기기</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/mypage')}
                className="hover:text-on-surface"
              >
                고객센터 문의
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
    </div>
  );
}
