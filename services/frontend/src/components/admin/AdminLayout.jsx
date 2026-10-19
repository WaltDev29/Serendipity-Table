import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pinnedNotice, setPinnedNotice, sendEmergencyNotice, auditLogs } = useAdmin();

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTarget, setNoticeTarget] = useState('ALL'); // ALL, HONGDAE, ACTIVE
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isPinNotice, setIsPinNotice] = useState(true);

  const [isNotiDropdownOpen, setIsNotiDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // 공지 프리셋 템플릿
  const noticePresets = [
    { label: '식당 룸 위치 안내', title: '식당 룸 위치 안내', text: '매장 2층 안쪽 "우연한 식탁" 전용 룸으로 오시면 테이블별 자리 안내를 도와드립니다.' },
    { label: '지각/도착 체크인 안내', title: '모임 시작 10분 전 안내', text: '모임 시작 10분 전입니다! 현장 도착 시 채팅방의 [도착 체크인] 버튼을 눌러주세요.' },
    { label: '주차 및 길찾기 안내', title: '매장 주차 및 길찾기 유의사항', text: '매장 건물 주차가 불가하오니 도보 3분 거리의 인근 공영주차장을 이용해주시기 바랍니다.' }
  ];

  const handleSendNotice = (e) => {
    e.preventDefault();
    if (!noticeMessage.trim()) return;
    sendEmergencyNotice(noticeTarget, noticeTitle || '🚨 운영자 긴급 공지', noticeMessage, isPinNotice);
    setIsNoticeModalOpen(false);
    setNoticeTitle('');
    setNoticeMessage('');
  };

  const navGroups = [
    {
      group: '대시보드',
      items: [
        { to: '/admin/dashboard', icon: 'dashboard', label: 'A-01 운영 대시보드' }
      ]
    },
    {
      group: '운영 관리',
      items: [
        { to: '/admin/slots', icon: 'calendar_month', label: 'A-02 회차 & 슬롯 관리' },
        { to: '/admin/applications', icon: 'receipt_long', label: 'A-03 참가 신청 & 결제' },
        { to: '/admin/matching', icon: 'smart_toy', label: 'A-04 AI 매칭 & 개입' },
        { to: '/admin/venues', icon: 'storefront', label: 'A-05 식당 POOL & 배정' }
      ]
    },
    {
      group: '관제 & 고객',
      items: [
        { to: '/admin/chat-ops', icon: 'forum', label: 'A-06 채팅 관제 & 공지' },
        { to: '/admin/users', icon: 'shield_person', label: 'A-07 회원 & 블랙리스트' }
      ]
    },
    {
      group: '통계 & 정산',
      items: [
        { to: '/admin/analytics', icon: 'query_stats', label: 'A-08 피드백 & 정산 통계' }
      ]
    },
    {
      group: '예외 & 데이터',
      items: [
        { to: '/admin/exceptions', icon: 'download', label: 'A-09 예외 큐 & CSV 내보내기' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex">
      {/* 1. LEFT SIDEBAR (260px 고정) */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] bg-on-surface z-50 flex flex-col justify-between border-r border-inverse-surface shadow-[0_2px_8px_rgba(26,27,30,0.12)]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header Branding */}
          <div className="p-space-md border-b border-inverse-surface">
            <Link to="/admin/dashboard" className="flex items-center gap-space-sm mb-space-xs">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  restaurant
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-surface truncate tracking-tight">
                  우연한 식탁 Admin
                </span>
                <span className="font-label-sm text-label-sm text-surface-variant truncate">
                  Social Dining Back-Office
                </span>
              </div>
            </Link>

            {/* AI Status Badge */}
            <div className="mt-space-sm inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-tertiary-fixed text-tertiary-container font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-semibold">AI Engine: ONLINE (Zero-Touch)</span>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-space-md">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-space-xxs">
                <div className="px-space-sm py-space-xxs font-label-sm text-label-sm uppercase tracking-wider text-outline-variant font-semibold">
                  {group.group}
                </div>
                <nav className="space-y-space-xxs">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors font-label-lg text-label-lg ${
                          isActive
                            ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                            : 'text-surface-variant hover:bg-inverse-surface hover:text-surface'
                        }`
                      }
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Operator Profile Bottom Box */}
        <div className="p-space-sm bg-[#141518] border-t border-inverse-surface">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs ring-1 ring-inverse-surface">
                김
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-surface truncate font-semibold">
                  운영자 김관리
                </span>
                <span className="font-label-sm text-[10px] text-outline-variant">
                  Super Admin
                </span>
              </div>
            </div>
            <Link
              to="/"
              className="p-1.5 rounded text-outline-variant hover:text-surface hover:bg-inverse-surface transition-colors flex items-center justify-center"
              title="모바일 사용자 웹으로 이동"
            >
              <span className="material-symbols-outlined text-[18px]">smartphone</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE (헤더 64px + 우측 콘텐츠 영역) */}
      <div className="pl-[260px] flex-1 flex flex-col min-w-0">
        {/* Top Global Header (64px) */}
        <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest border-b border-surface-variant z-40 px-gutter flex items-center justify-between shadow-[0_1px_8px_rgba(26,27,30,0.04)]">
          {/* Header Left: Event Countdown Pill */}
          <div className="flex items-center gap-space-md">
            <div className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-container border border-secondary-fixed-dim/40 font-label-sm text-label-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="font-semibold tracking-tight">
                🔥 이번 주 목요일 모임 (2026.10.22 19:30) | D-2 (화 18:00 매칭 자동 마감)
              </span>
            </div>
          </div>

          {/* Header Center: Global Search Input */}
          <div className="relative w-[400px] max-w-full hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="이름, 전화번호, 인스타그램 ID, 배정 식당 검색..."
              className="w-full h-9 pl-9 pr-14 rounded-xl bg-surface-container-low border border-surface-variant font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container-high text-on-surface-variant border border-surface-variant">
              Ctrl + K
            </kbd>
          </div>

          {/* Header Right: Actions & Tools */}
          <div className="flex items-center gap-space-sm">
            {/* Quick Emergency Broadcast Action */}
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-primary-container text-on-primary hover:bg-on-primary-fixed-variant transition-colors font-label-md text-label-md shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">notification_add</span>
              <span>긴급 공지 발송</span>
            </button>

            <div className="h-5 w-px bg-surface-variant mx-space-xxs"></div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotiDropdownOpen(!isNotiDropdownOpen)}
                className="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                title="실시간 운영 알림"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary-container text-on-primary text-[10px] font-bold">
                  3
                </span>
              </button>

              {/* Notification Dropdown */}
              {isNotiDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-variant p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                    <span className="font-title-md text-xs font-bold text-on-surface">실시간 긴급 운영 큐</span>
                    <span className="text-[11px] text-primary font-semibold">3건 미확인</span>
                  </div>
                  <div className="divide-y divide-surface-container-low max-h-60 overflow-y-auto mt-1">
                    <div className="py-2 text-xs">
                      <p className="font-bold text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        을지로-04 테이블 4인 미달 (현재 2명)
                      </p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">화요일 18:00까지 대안 처리(이월/환불) 필요</p>
                    </div>
                    <div className="py-2 text-xs">
                      <p className="font-bold text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">support_agent</span>
                        정유진 회원 일정 변경 CS 인입
                      </p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">다음 주로 모임 이월 요청 (10분 전)</p>
                    </div>
                    <div className="py-2 text-xs">
                      <p className="font-bold text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-secondary">payments</span>
                        강민수 회원 1회권 결제 완료
                      </p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">강남/신논현 1번 테이블 배정 대기</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotiDropdownOpen(false);
                      navigate('/admin/exceptions');
                    }}
                    className="w-full mt-2 py-1.5 text-center text-[11px] font-bold text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    예외 큐 센터 바로가기 →
                  </button>
                </div>
              )}
            </div>

            {/* Mobile User App Direct Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs font-semibold transition-colors"
              title="사용자 모바일 웹뷰 화면으로 전환"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>사용자 앱 보기</span>
            </Link>
          </div>
        </header>

        {/* Global Pinned Notice Banner (If active) */}
        {pinnedNotice && (
          <div className="pt-16 px-gutter">
            <div className="bg-primary text-white px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-between text-xs mt-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">push_pin</span>
                <span className="font-bold">[{pinnedNotice.title}]</span>
                <span>{pinnedNotice.message}</span>
                <span className="text-white/70 text-[11px]">({pinnedNotice.createdAt} 발송)</span>
              </div>
              <button
                type="button"
                onClick={() => setPinnedNotice(null)}
                className="text-white/80 hover:text-white font-bold ml-4"
              >
                핀 해제 ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Content Router Outlet */}
        <main className={`flex-1 w-full px-gutter py-space-lg ${pinnedNotice ? 'pt-4' : 'pt-20'}`}>
          <Outlet />
        </main>
      </div>

      {/* ========================================================= */}
      {/* GLOBAL MODAL M-06: 긴급 공지(ADMIN_NOTICE) 발송 팝업      */}
      {/* ========================================================= */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                </div>
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface">
                    운영자 긴급 공지 발송 (Admin Notice)
                  </h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    테이블 단체방에 상단 핀 배너 및 알림톡을 동시 발송합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-3">
              {/* Target Range */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  발송 대상 범위
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: '금주 전체 (38개 방)' },
                    { id: 'HONGDAE', label: '홍대/합정 권역' },
                    { id: 'ACTIVE', label: '현재 관제 중인 방' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNoticeTarget(t.id)}
                      className={`h-9 rounded-xl text-xs font-semibold transition-all ${
                        noticeTarget === t.id
                          ? 'bg-primary text-white shadow-xs font-bold'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  자주 쓰는 템플릿 프리셋
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {noticePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNoticeTitle(preset.title);
                        setNoticeMessage(preset.text);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-[11px] font-medium border border-outline-variant/30 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  공지 제목
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="예: [안내] 매장 룸 위치 및 도착 체크인"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  공지 본문 내용 (최대 200자)
                </label>
                <textarea
                  rows={3}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="참가자들에게 전달할 명확하고 긴급한 운영 공지사항을 입력하세요."
                  className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinNotice}
                  onChange={(e) => setIsPinNotice(e.target.checked)}
                  className="accent-primary w-4 h-4 rounded"
                />
                <label htmlFor="pinNotice" className="text-xs text-on-surface font-semibold cursor-pointer">
                  채팅방 상단에 핀 배너로 영구 고정 및 카카오 알림톡 동시 발송
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!noticeMessage.trim()}
                  className="flex-1 h-10 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>즉시 일괄 발송</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
