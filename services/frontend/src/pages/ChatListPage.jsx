import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ChatListPage() {
  const navigate = useNavigate();
  const { matchResult } = useApp();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'past'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="relative w-full py-space-md sm:py-space-xl flex justify-center bg-surface">
        {/* Ambient organic gradient glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-96 left-1/3 -translate-x-1/2 w-80 h-80 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Centered Mobile Canvas Frame (max-w-[480px]) */}
        <div className="relative w-full max-w-[480px] bg-surface-container-lowest shadow-xl sm:rounded-xl overflow-hidden flex flex-col pb-28">
          
          {/* Viewport Header Bar */}
          <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-space-md pt-space-md pb-space-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">채팅</h1>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm">
                  3
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

            {/* Segment Filter Tabs */}
            <div className="flex items-center gap-space-xs p-1 bg-surface-container-low rounded-lg mt-1">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`tab-pill flex-1 py-1.5 px-space-xs rounded-md text-center font-label-md text-label-md transition-all ${
                  activeTab === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                전체 대화 <span className={activeTab === 'all' ? 'text-primary font-bold' : ''}>3</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`tab-pill flex-1 py-1.5 px-space-xs rounded-md text-center font-label-md text-label-md transition-all ${
                  activeTab === 'active'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                진행 중 <span className={activeTab === 'active' ? 'text-primary font-bold' : ''}>1</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`tab-pill flex-1 py-1.5 px-space-xs rounded-md text-center font-label-md text-label-md transition-all ${
                  activeTab === 'past'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                지난 모임 <span className={activeTab === 'past' ? 'text-primary font-bold' : ''}>2</span>
              </button>
            </div>
          </header>

          {/* Main Feed Scroll Area */}
          <main className="flex flex-col px-space-md pt-space-sm gap-space-md">
            
            {/* 1. ACTIVE DINING CHAT (Hero Level Card) */}
            {(activeTab === 'all' || activeTab === 'active') && (
              <section className="flex flex-col">
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    <span className="font-label-sm text-label-sm text-tertiary tracking-wider uppercase font-semibold">
                      지금 참여 중인 대화방
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">D-Day 오늘 모임</span>
                </div>

                <article
                  onClick={() => navigate('/chat')}
                  className="group relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-primary/20"
                >
                  {/* Accent Top Stripe */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>
                  
                  <div className="p-space-md flex flex-col gap-space-sm">
                    {/* Top Row: Live Indicator Badge + Time */}
                    <div className="flex items-center justify-between gap-space-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                        </span>
                        <span>모임 진행 중 (D-Day)</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">19:21</span>
                    </div>

                    {/* Dining Context Title & Venue Meta */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors">
                          {matchResult.tableName}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                          4인
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        <span className="font-medium text-on-surface">{matchResult.venue.name}</span>
                        <span className="text-outline-variant">·</span>
                        <span className="text-secondary font-semibold">19:30 예약</span>
                      </div>
                    </div>

                    {/* Matched Member Avatar Stack */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center -space-x-2">
                        <div className="w-8 h-8 rounded-full ring-2 ring-surface-container-lowest overflow-hidden bg-secondary-fixed text-secondary font-bold flex items-center justify-center text-xs">
                          민트
                        </div>
                        <div className="w-8 h-8 rounded-full ring-2 ring-surface-container-lowest overflow-hidden bg-tertiary-fixed text-tertiary font-bold flex items-center justify-center text-xs">
                          러너
                        </div>
                        <div className="w-8 h-8 rounded-full ring-2 ring-surface-container-lowest overflow-hidden bg-surface-container-high text-on-surface-variant font-bold flex items-center justify-center text-xs">
                          책방
                        </div>
                        <div className="w-8 h-8 rounded-full ring-2 ring-surface-container-lowest overflow-hidden bg-primary-fixed text-primary font-bold flex items-center justify-center text-xs">
                          나
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">모임원 4명 전원 입장</span>
                    </div>

                    {/* Message Preview Bubble */}
                    <div className="flex items-start justify-between gap-space-sm p-3 rounded-lg bg-surface-container-low/70">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">chat_bubble</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">민트초코</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                            다들 어디쯤 오셨나요? 도착하신 분 계세요?
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-sm animate-pulse">
                        2
                      </div>
                    </div>

                    {/* Primary Action CTA */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/chat');
                      }}
                      className="mt-1 flex items-center justify-center gap-1.5 w-full h-11 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container active:scale-[0.99] transition-all"
                    >
                      <span>채팅방 바로 입장하기</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </article>
              </section>
            )}

            {/* 2. 1:1 CS Concierge Service Card */}
            {(activeTab === 'all' || activeTab === 'active') && (
              <section className="flex flex-col">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold">
                    도움이 필요하신가요?
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    실시간 응답 가능
                  </span>
                </div>

                <div
                  onClick={() => navigate('/mypage')}
                  className="bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md flex items-center justify-between cursor-pointer transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">smart_toy</span>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">식탁 지킴이 1:1 고객센터</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">모임 장소, 지각, 에티켓 신고 실시간 상담</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </div>
              </section>
            )}

            {/* 3. PAST DINING CHATS */}
            {(activeTab === 'all' || activeTab === 'past') && (
              <section className="flex flex-col gap-space-sm pt-space-xs">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold">
                    지난 모임 대화 기록
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">읽기 전용</span>
                </div>

                {/* Past Item 1 */}
                <div
                  onClick={() => alert('지난 모임 대화방(을지로 레트로 다이닝)을 열람합니다.')}
                  className="p-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all cursor-pointer shadow-sm border border-surface-container"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-bold text-on-surface">10/15 을지로 레트로 식탁</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant text-[10px]">종료</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">10/15 21:40</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    "오늘 다들 너무 반가웠어요! 다음에 와인 모임 또 해요 :)"
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>후기 작성 완료 ✓</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </div>
                </div>

                {/* Past Item 2 */}
                <div
                  onClick={() => alert('지난 모임 대화방(강남 모던 프렌치)을 열람합니다.')}
                  className="p-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all cursor-pointer shadow-sm border border-surface-container"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-bold text-on-surface">10/08 강남 프렌치 식탁</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant text-[10px]">종료</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">10/08 22:10</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    "정산 금액 28,000원씩 송금 완료했습니다!"
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>후기 작성 완료 ✓</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </div>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
