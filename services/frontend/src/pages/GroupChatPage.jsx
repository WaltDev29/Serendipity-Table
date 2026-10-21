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

  const isVenueReserved = matchResult.venue?.isReserved === true;
  const rawDate = matchResult.eventDate ? matchResult.eventDate.split(' ')[0] : '목요일';
  const chatRoomTitle = `${rawDate} ${isVenueReserved ? (matchResult.venue?.name || '식당') : '식당 예약 전'}`;

  return (
    <div id="group-chat-container" className="w-full h-full bg-surface-container-lowest flex flex-col relative overflow-hidden flex-1">
      {/* Central Chat Container (Full width & height of phone screen) */}
      <div className="w-full h-full flex flex-col flex-1 min-h-0 relative">
        {/* Top Chat Header */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-surface-container shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/chats')}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
                title="채팅 목록으로"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-lg">restaurant</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-headline-sm text-sm font-bold text-on-surface truncate">{chatRoomTitle}</h1>
                  <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary text-[10px] font-bold shrink-0">4명</span>
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                  {isVenueReserved ? `${matchResult.venue?.name} · ${matchResult.eventDate}` : `식당 예약 전 · ${matchResult.eventDate}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsVenueModalOpen(true)}
                className="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center hover:opacity-90 transition-opacity"
                title="식당 정보 보기"
              >
                <span className="material-symbols-outlined text-base">place</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors"
                title="대화방 메뉴 열기"
              >
                <span className="material-symbols-outlined text-base">menu</span>
              </button>
            </div>
          </header>

          {/* Pinned Notice Bar (Matches CS notice style) */}
          <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center justify-between text-xs text-on-surface">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-primary text-base shrink-0">place</span>
              <span className="text-[11px] text-on-surface-variant truncate font-medium">
                {isVenueReserved
                  ? `${matchResult.eventDate} @ ${matchResult.venue?.name} (예약자명: 우연한 식탁)`
                  : `${matchResult.eventDate} @ 식당 예약 전 (예약 진행 중입니다)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsVenueModalOpen(true)}
              className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-highest text-on-surface text-[11px] font-semibold flex items-center gap-0.5 shrink-0 transition-colors ml-2"
            >
              <span>{isVenueReserved ? '식당 안내' : '예약 현황'}</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </button>
          </div>

          {/* CHAT STREAM (Full vertical flex fill inside mobile screen) */}
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto bg-surface-bright min-h-0">
            {/* System Welcome Card */}
            <div className="flex justify-center my-1">
              <div className="bg-surface-container rounded-2xl p-3 max-w-sm text-center shadow-xs flex flex-col items-center gap-1">
                <span className="text-xl">🎉</span>
                <p className="text-xs font-bold text-primary">{chatRoomTitle} 대화방입니다</p>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  취향이 통하는 4인의 매칭이 완료되었습니다.<br />
                  편안하고 다정한 대화를 나눠보세요!
                </p>
              </div>
            </div>

            {/* DYNAMIC CHAT MESSAGES */}
            {chatMessages.map((msg) => {
              const msgType = msg.messageType || msg.type;
              const senderName = msg.senderNickname || msg.senderName || msg.sender || '멤버';
              const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.timestamp || '');

              if (msgType === 'SYSTEM' || msgType === 'SYSTEM_WELCOME') {
                return (
                  <div key={msg.id} className="flex justify-center my-1">
                    <div className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-[11px] font-medium shadow-xs max-w-sm text-center">
                      {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                    </div>
                  </div>
                );
              }

              if (msgType === 'CHECKIN_NOTICE' || msgType === 'ARRIVAL_CHECKIN') {
                return (
                  <div key={msg.id} className="flex justify-center my-1">
                    <div className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-medium shadow-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">where_to_vote</span>
                      <span>{typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}</span>
                    </div>
                  </div>
                );
              }

              if (msgType === 'ADMIN_NOTICE') {
                return (
                  <div key={msg.id} className="flex justify-center my-1">
                    <div className="px-3.5 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-medium flex items-center gap-2 shadow-xs max-w-md">
                      <span className="material-symbols-outlined text-base">campaign</span>
                      <span>{typeof msg.content === 'string' ? msg.content : msg.content?.text}</span>
                    </div>
                  </div>
                );
              }

              if (msgType === 'BLIND') {
                return (
                  <div key={msg.id} className="rounded-xl p-2.5 bg-surface-container-high/60 flex items-center justify-between text-on-surface-variant text-xs">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">block</span>
                      <span>차단한 사용자의 메시지입니다.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('차단된 메시지: ' + msg.content)}
                      className="text-primary hover:underline font-semibold text-[11px]"
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
                  <div key={msg.id} className="flex flex-col items-end self-end max-w-[80%]">
                    <div className="flex items-end gap-1.5 justify-end">
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-[10px] text-on-surface-variant">{timeStr}</span>
                      </div>
                      <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs font-medium shadow-xs leading-relaxed whitespace-pre-wrap">
                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    {senderName.slice(0, 2)}
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold text-on-surface">{senderName}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant text-[9px] font-semibold">
                        {msg.senderRole || '멤버'}
                      </span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <div className="bg-surface-container rounded-2xl rounded-tl-sm px-3.5 py-2 text-on-surface text-xs shadow-xs leading-relaxed whitespace-pre-wrap border border-surface-container-high">
                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                      </div>
                      <span className="text-[10px] text-on-surface-variant shrink-0">{timeStr}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* BOTTOM INPUT BAR (Matches InquiryChatPage UI style) */}
          <div className="p-3 bg-surface-container-lowest border-t border-surface-container">
            {!isReadOnlyMode ? (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="따뜻한 대화를 나눠보세요..."
                  className="flex-1 h-11 px-4 rounded-full bg-surface-container-low text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container disabled:opacity-40 transition-all shrink-0"
                  title="메시지 전송"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </form>
            ) : (
              <div className="py-2.5 px-4 rounded-xl bg-surface-container-high text-center text-xs text-on-surface-variant flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-base">lock</span>
                <span>모임이 종료되어 읽기 전용 상태입니다.</span>
              </div>
            )}
          </div>

          {/* Drawer Backdrop */}
          {isDrawerOpen && (
            <div
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            />
          )}

          {/* Slide-Out Drawer (대화방 메뉴: 메뉴 버튼 클릭 시에만 오픈) */}
          <div
            className={`fixed inset-y-0 right-0 z-50 w-[320px] max-w-[85vw] bg-surface-container-lowest shadow-2xl p-space-md flex flex-col gap-space-md transition-transform duration-300 overflow-y-auto ${
              isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
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

            {/* Section 2: 바로가기 메뉴 (식당 정보 및 고객센터 문의) */}
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
            {isVenueReserved ? (
              <>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
                  {matchResult.venue?.name}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  {matchResult.venue?.address}
                </p>
                <div className="rounded-xl overflow-hidden mb-4 h-36">
                  <img src={matchResult.venue?.image} alt="식당" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-primary font-semibold mb-4">
                  대표 메뉴: {matchResult.venue?.menu}
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl">pending</span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface mb-1.5">
                  식당 예약 진행 중
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mb-4 leading-relaxed">
                  현재 운영팀에서 모임 권역에 최적화된 프라이빗 식당을 예약 조율 중입니다.<br />
                  예약이 확정되면 식당 정보와 위치가 즉시 안내됩니다!
                </p>
              </div>
            )}
            <button
              onClick={() => setIsVenueModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm"
            >
              확인
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
