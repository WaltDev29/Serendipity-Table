import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pinnedNotice,
    setPinnedNotice,
    sendEmergencyNotice,
    auditLogs,
    adminUser,
    logoutAdmin,
    matchingTables = [],
    csInquiries = [],
    exceptionsAcknowledged
  } = useAdmin();

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const [isNotiDropdownOpen, setIsNotiDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // 실시간 긴급 운영 큐: 4인 미달 테이블만 표시 (취소된 모임 및 0명 모임 제외)
  const urgentTables = matchingTables.filter((t) => {
    const memCount = t.members?.length || 0;
    return memCount > 0 && memCount < 4 && t.status !== 'CANCELLED' && t.status !== 'TRANSFERRED_NEXT_WEEK' && t.status !== 'REFUNDED_ALL';
  });
  const totalUrgentCount = exceptionsAcknowledged ? 0 : urgentTables.length;

  const handleSendNotice = (e) => {
    e.preventDefault();
    if (!noticeMessage.trim()) return;
    sendEmergencyNotice('ALL', noticeTitle || '📢 전체 공지사항', noticeMessage, false);
    setIsNoticeModalOpen(false);
    setNoticeTitle('');
    setNoticeMessage('');
    alert('전체 회원에게 공지사항이 성공적으로 발송되었습니다.');
  };

  const navGroups = [
    {
      group: '',
      items: [
        { to: '/admin/dashboard', icon: 'dashboard', label: '대시보드' },
        { to: '/admin/users', icon: 'groups', label: '회원 목록' },
        { to: '/admin/applications', icon: 'how_to_reg', label: '참가 신청' },
        { to: '/admin/payments', icon: 'payments', label: '결제 내역' },
        { to: '/admin/slots', icon: 'calendar_month', label: '회차 슬롯 관리' },
        { to: '/admin/matching', icon: 'smart_toy', label: 'AI 매칭' },
        { to: '/admin/venues', icon: 'storefront', label: '식당 Pool' },
        { to: '/admin/chat-ops', icon: 'forum', label: '모임 채팅 관리' },
        { to: '/admin/cs', icon: 'support_agent', label: '고객센터' },
        {
          to: '/admin/analytics',
          icon: 'query_stats',
          label: '피드백',
          subItems: [
            { to: '/admin/analytics/preferences', label: '선호&비선호 평가' },
            { to: '/admin/analytics/reviews', label: '리뷰' }
          ]
        },
        { to: '/admin/exceptions', icon: 'download', label: '예외 큐' },
        { to: '/admin/readme', icon: 'menu_book', label: '시스템 명세 (README)' },
        { to: '/admin/flow-test', icon: 'science', label: '전체 흐름 테스트', isHighlight: true }
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
              <span className="font-semibold">자동화 활성화 중</span>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-space-md">
            {navGroups.map((group, gIdx) => (
              <div key={group.group || `g-${gIdx}`} className="space-y-space-xxs">
                {group.group && (
                  <div className="px-space-sm py-space-xxs font-label-sm text-label-sm uppercase tracking-wider text-outline-variant font-semibold">
                    {group.group}
                  </div>
                )}
                <nav className="space-y-space-xs">
                  {group.items.map((item) => (
                    <React.Fragment key={item.to}>
                      {item.isHighlight ? (
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `group relative flex items-center justify-between px-space-sm py-2 rounded-xl transition-all duration-300 font-label-lg text-label-lg font-bold shadow-md mt-2 ${
                              isActive
                                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white ring-2 ring-amber-300/80 shadow-lg scale-[1.02]'
                                : 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400'
                            }`
                          }
                        >
                          <div className="flex items-center gap-space-sm min-w-0">
                            <span className="material-symbols-outlined text-[19px] text-amber-400">science</span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-900 shadow-xs">
                            TEST
                          </span>
                        </NavLink>
                      ) : (
                        <NavLink
                          to={item.to}
                          end={item.to === '/admin/analytics'}
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
                      )}

                      {/* Sub-items (하단 들여쓰기 배치) */}
                      {item.subItems && (
                        <div className="pl-6 space-y-1 mt-1 mb-1 border-l-2 border-surface-variant/30 ml-3">
                          {item.subItems.map((sub) => (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              className={({ isActive }) =>
                                `group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium ${
                                  isActive
                                    ? 'bg-primary/20 text-primary-container font-bold border-l-2 border-primary -ml-[2px]'
                                    : 'text-surface-variant/80 hover:bg-inverse-surface/60 hover:text-surface'
                                }`
                              }
                            >
                              <span className="text-[10px] text-surface-variant/50 leading-none">•</span>
                              <span className="truncate">{sub.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
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
                {adminUser?.name ? adminUser.name.slice(0, 1) : '관'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-surface truncate font-semibold">
                  {adminUser?.name || '운영자'}
                </span>
                <span className="font-label-sm text-[10px] text-outline-variant">
                  {adminUser?.role === 'ROLE_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  logoutAdmin();
                  navigate('/admin/login', { replace: true });
                }}
                className="p-1.5 rounded text-outline-variant hover:text-error hover:bg-inverse-surface transition-colors flex items-center justify-center"
                title="관리자 로그아웃"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
              <Link
                to="/"
                className="p-1.5 rounded text-outline-variant hover:text-surface hover:bg-inverse-surface transition-colors flex items-center justify-center"
                title="모바일 사용자 웹으로 이동"
              >
                <span className="material-symbols-outlined text-[18px]">smartphone</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE (헤더 64px + 우측 콘텐츠 영역) */}
      <div className="pl-[260px] flex-1 flex flex-col min-w-0">
        {/* Top Global Header (64px) */}
        <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest border-b border-surface-variant z-40 px-gutter flex items-center justify-between shadow-[0_1px_8px_rgba(26,27,30,0.04)]">
          <div className="flex items-center gap-space-md">
            {/* 검색 영역 및 모임 일정 제거 완료 */}
          </div>

          {/* Header Right: Actions & Tools */}
          <div className="flex items-center gap-space-sm">
            {/* Quick Notice Broadcast Action (사용자 앱 전체/공지 발송) */}
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-primary-container text-on-primary hover:bg-on-primary-fixed-variant transition-colors font-label-md text-label-md shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              <span>공지 발송</span>
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
                {totalUrgentCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary-container text-on-primary text-[10px] font-bold">
                    {totalUrgentCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotiDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-variant p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                    <span className="font-title-md text-xs font-bold text-on-surface">실시간 긴급 운영 큐</span>
                    <span className="text-[11px] text-primary font-semibold">
                      {totalUrgentCount > 0 ? `${totalUrgentCount}건 미확인` : '대기 항목 없음'}
                    </span>
                  </div>
                  <div className="divide-y divide-surface-container-low max-h-60 overflow-y-auto mt-1">
                    {totalUrgentCount === 0 ? (
                      <div className="py-6 text-center text-on-surface-variant text-xs">
                        <span className="material-symbols-outlined text-2xl text-outline block mb-1">check_circle</span>
                        현재 긴급 처리 대기 중인 항목이 없습니다.
                      </div>
                    ) : (
                      urgentTables.map((t) => (
                        <div key={t.id} className="py-2 text-xs">
                          <p className="font-bold text-error flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            {t.name || t.id} 4인 미달 (현재 {t.members?.length || 0}명)
                          </p>
                          <p className="text-on-surface-variant text-[11px] mt-0.5">대안 처리(이월/환불/추가배정) 조치 필요</p>
                        </div>
                      ))
                    )}
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
                    사용자 앱 전체 공지 발송 (User App Notice)
                  </h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    사용자 앱의 모든 회원에게 공지 알림을 발송합니다.
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

            <form onSubmit={handleSendNotice} className="space-y-4">
              {/* Target Notice Info */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">groups</span>
                  발송 대상
                </span>
                <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[11px]">
                  전체 회원 일괄 발송
                </span>
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
                  placeholder="예: [공지] 모임 시작 안내 및 주의사항"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  공지 본문 내용 <span className="text-error">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="회원들에게 전달할 공지사항 내용을 입력하세요. 사용자 앱 알림함과 상단 알림에 즉시 표시됩니다."
                  className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                />
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
                  <span>전체 공지 발송</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
