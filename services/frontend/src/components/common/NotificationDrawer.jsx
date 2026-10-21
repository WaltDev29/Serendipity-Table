import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function NotificationDrawer() {
  const { isNotiDrawerOpen, setIsNotiDrawerOpen, notifications, setNotifications } = useApp();

  if (!isNotiDrawerOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-on-background/30 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotiDrawerOpen(false)}
      />

      {/* Floating Center / Top Drawer */}
      <div className="fixed top-16 lg:top-20 right-4 lg:right-margin z-50 w-full max-w-[380px] bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden transition-all duration-200">
        <div className="px-space-md py-space-sm bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
            <span className="font-headline-sm text-[16px] text-on-surface font-bold">알림 센터</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={markAllRead}
              className="text-[12px] text-primary hover:underline font-semibold"
            >
              모두 읽음
            </button>
            <button
              onClick={() => setIsNotiDrawerOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto p-space-sm flex flex-col gap-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl transition-all ${
                item.read ? 'bg-surface-container-lowest hover:bg-surface-container-low' : 'bg-primary-fixed/20 border-l-4 border-primary'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-label-md text-[13px] font-bold text-on-surface leading-tight">
                  {item.title}
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant shrink-0">{item.time}</span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed mb-2">
                {item.desc}
              </p>
              {item.link && item.link !== '#' && (
                <Link
                  to={item.link}
                  onClick={() => setIsNotiDrawerOpen(false)}
                  className="inline-flex items-center gap-0.5 text-primary text-[11px] font-bold hover:underline"
                >
                  <span>자세히 보기</span>
                  <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer: '전체 알림 보기' 버튼 (버튼 모양 아님, 텍스트 링크 형태) */}
        <div className="p-3 bg-surface-container-low border-t border-surface-container flex items-center justify-center">
          <Link
            to="/notifications"
            onClick={() => setIsNotiDrawerOpen(false)}
            className="text-[13px] font-semibold text-primary hover:underline flex items-center gap-1 py-1"
          >
            <span>전체 알림 보기</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </>
  );
}
