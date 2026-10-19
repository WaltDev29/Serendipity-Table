import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function BottomNav() {
  const location = useLocation();
  const { userState } = useApp();

  // 대화 중인 채팅방 내부(/chat) 또는 관리자 콘솔(/admin)에서는 하단 바 숨김
  if (location.pathname === '/chat' || location.pathname.startsWith('/admin')) {
    return null;
  }

  // 4대 메뉴: 홈, 매칭, 채팅, 마이페이지 (식탁 신청 탭 제외)
  const navItems = [
    { to: '/', label: '홈', icon: 'home' },
    {
      to: '/matching',
      label: '매칭',
      icon: 'groups',
      // 매칭 대기 중이거나 매칭 완료된 모임이 있는 경우 뱃지 포인트
      hasBadge: userState === 'WAITING' || userState === 'CONFIRMED' || userState === 'ATTENDED',
      badgeText: userState === 'CONFIRMED' ? '확정' : userState === 'WAITING' ? '대기' : null
    },
    { to: '/chats', label: '채팅', icon: 'chat' },
    { to: '/mypage', label: '마이페이지', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-container-high py-1 px-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-[480px] mx-auto grid grid-cols-4 items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[23px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
