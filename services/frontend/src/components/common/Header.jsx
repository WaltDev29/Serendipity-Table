import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const location = useLocation();
  const { isNotiDrawerOpen, setIsNotiDrawerOpen, setIsEtiquetteOpen, notifications } = useApp();

  // 관리자 콘솔(/admin), 로그인(/login), 회원가입(/signup) 경로에서는 모바일 사용자 헤더 숨김
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/signup'
  ) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-surface-container-high/60 h-14 flex items-center px-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
      <div className="w-full max-w-[480px] mx-auto flex items-center justify-between">
        {/* Left-aligned Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-xs">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              restaurant
            </span>
          </div>
          <span className="font-headline-sm text-[16px] text-primary font-bold tracking-tight">
            우연한 식탁
          </span>
        </Link>

        {/* Right-aligned Utility and Auth Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEtiquetteOpen(true)}
            className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors"
            title="식탁 에티켓 및 안심 수칙"
          >
            <span className="material-symbols-outlined text-[15px]">info</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNotiDrawerOpen(!isNotiDrawerOpen)}
            className="relative w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors"
            title="알림함"
          >
            <span className="material-symbols-outlined text-[15px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
