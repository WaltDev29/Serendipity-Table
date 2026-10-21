import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getMyInquiriesApi } from '../api/cs';

export default function ChatListPage() {
  const navigate = useNavigate();
  const { matchResult, pastTables } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    getMyInquiriesApi()
      .then((data) => {
        if (Array.isArray(data)) setInquiries(data);
      })
      .catch((err) => console.warn('Failed to load inquiries for chat list:', err));
  }, []);

  const chatRooms = [];

  if (matchResult) {
    chatRooms.push({
      id: matchResult.chatRoomId || 'active-1',
      title: matchResult.tableName,
      isActive: true,
      statusText: '진행 중',
      venue: matchResult.venue?.name || '배정 식당',
      timeDisplay: '오늘',
      lastMessage: '실시간 그룹 대화방에 참여해보세요.',
      unreadCount: 0,
      path: '/chat',
      members: (matchResult.members || []).map((m, idx) => {
        const bgColors = ['bg-primary-fixed text-primary', 'bg-secondary-fixed text-secondary', 'bg-tertiary-fixed text-tertiary', 'bg-surface-container-high text-on-surface-variant'];
        return {
          name: m.nickname,
          initial: m.nickname ? m.nickname.substring(0, 1) : '회',
          bg: bgColors[idx % 4]
        };
      })
    });
  }

  if (inquiries.length > 0) {
    const latestInq = inquiries[0]; // Assuming newest or first
    const hasReplies = latestInq.replies && latestInq.replies.length > 0;
    const latestReply = hasReplies ? latestInq.replies[latestInq.replies.length - 1] : null;
    const lastMsgText = latestReply ? `[답변] ${latestReply.replyContent}` : latestInq.content;
    const timeText = latestInq.createdAt ? latestInq.createdAt.substring(5, 10) : '최근';

    chatRooms.push({
      id: 'cs-inquiry-room',
      title: '우연한 식탁 고객센터 (1:1 상담)',
      isActive: latestInq.status === 'WAITING' || latestInq.category === '운영자 1:1 안내',
      statusText: latestInq.status === 'ANSWERED' ? '답변완료' : (latestInq.category === '운영자 1:1 안내' ? '운영자 알림' : '답변대기'),
      venue: '고객지원팀',
      timeDisplay: timeText,
      lastMessage: lastMsgText || '1:1 문의 및 운영자 안내 내역을 확인해보세요.',
      unreadCount: latestInq.status === 'ANSWERED' ? 1 : 0,
      path: '/chat/inquiry',
      isCs: true,
      members: [
        { name: 'CS 매니저', initial: 'CS', bg: 'bg-primary-fixed text-primary' }
      ]
    });
  } else {
    // 기본 안내방
    chatRooms.push({
      id: 'cs-inquiry-room',
      title: '우연한 식탁 고객센터 (1:1 문의)',
      isActive: false,
      statusText: '상담 운영중',
      venue: '고객지원팀',
      timeDisplay: '상시',
      lastMessage: '궁금한 점이 있으시면 언제든 1:1 문의를 남겨주세요.',
      unreadCount: 0,
      path: '/chat/inquiry',
      isCs: true,
      members: [
        { name: 'CS 매니저', initial: 'CS', bg: 'bg-primary-fixed text-primary' }
      ]
    });
  }

  (pastTables || []).forEach((pt, idx) => {
    chatRooms.push({
      id: pt.tableId || `past-${idx}`,
      title: `${pt.eventDate} ${pt.region} 식탁`,
      isActive: false,
      statusText: '종료',
      venue: pt.venueName || '다이닝',
      timeDisplay: pt.eventDate ? pt.eventDate.substring(5) : '완료',
      lastMessage: '모임이 종료되었습니다. 매너 평가에 참여해주셔서 감사합니다.',
      unreadCount: 0,
      path: '/chat',
      members: (pt.members || []).map((m, mIdx) => {
        const bgColors = ['bg-primary-fixed text-primary', 'bg-secondary-fixed text-secondary', 'bg-tertiary-fixed text-tertiary', 'bg-surface-container-high text-on-surface-variant'];
        return {
          name: m.nickname,
          initial: m.nickname ? m.nickname.substring(0, 1) : '회',
          bg: bgColors[mIdx % 4]
        };
      })
    });
  });

  const filteredChats = chatRooms.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="relative w-full py-space-md sm:py-space-xl flex justify-center bg-surface">
        {/* Ambient organic gradient glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-96 left-1/3 -translate-x-1/2 w-80 h-80 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Centered Mobile Canvas Frame (max-w-[480px]) */}
        <div className="relative w-full max-w-[480px] bg-surface-container-lowest shadow-xl sm:rounded-xl overflow-hidden flex flex-col pb-28">
          
          {/* Viewport Header Bar (탭 네비게이션 제거) */}
          <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-space-md pt-space-md pb-space-sm flex flex-col gap-space-sm border-b border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">채팅</h1>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm">
                  {filteredChats.length}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  aria-label="채팅 검색"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('필터 정렬: 최신순')}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  aria-label="채팅 목록 필터"
                >
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>
              </div>
            </div>

            {/* Collapsible Search Input */}
            {isSearchOpen && (
              <div className="overflow-hidden transition-all duration-300">
                <div className="relative flex items-center w-full mt-1">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="식탁 지역, 모임 날짜, 대화 검색"
                    className="w-full h-10 pl-9 pr-8 bg-surface-container-low rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Unified Chat List Feed */}
          <main className="flex flex-col px-space-md pt-space-md gap-3">
            {filteredChats.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant text-sm">
                검색된 채팅방이 없습니다.
              </div>
            ) : (
              filteredChats.map((chat) => (
                <article
                  key={chat.id}
                  onClick={() => navigate(chat.path)}
                  className={`p-space-md rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low transition-all cursor-pointer shadow-sm border ${
                    chat.isActive ? 'border-primary/30 ring-1 ring-primary/10' : 'border-surface-container'
                  }`}
                >
                  {/* Top Row: Title & Status on Left, Member Avatars & Time on Right */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Left: Chat Title & Status */}
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className="font-headline-sm text-sm font-bold text-on-surface truncate">
                        {chat.title}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          chat.isActive
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {chat.statusText}
                      </span>
                    </div>

                    {/* Right: Member Avatar Stack (좌측) + Time/Date (우측) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 멤버들 아바타 아이콘 */}
                      <div className="flex items-center -space-x-1.5" title="참여 멤버들">
                        {chat.members.map((member, idx) => (
                          <div
                            key={idx}
                            className={`w-6 h-6 rounded-full ring-2 ring-surface-container-lowest flex items-center justify-center text-[10px] font-bold shadow-xs ${member.bg}`}
                            title={member.name}
                          >
                            {member.initial}
                          </div>
                        ))}
                      </div>

                      {/* 시간: 당일 메시지는 시간만, 날짜 지난 경우 날짜만 표시 */}
                      <span className="font-label-sm text-[12px] text-on-surface-variant font-medium min-w-[34px] text-right">
                        {chat.timeDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Last Message Snippet & Unread Badge / Arrow */}
                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <p className="font-body-sm text-xs text-on-surface-variant truncate flex-1">
                      {chat.lastMessage}
                    </p>

                    {chat.unreadCount > 0 ? (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-on-primary font-label-sm text-[11px] font-bold flex items-center justify-center shadow-xs">
                        {chat.unreadCount}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
                        chevron_right
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
