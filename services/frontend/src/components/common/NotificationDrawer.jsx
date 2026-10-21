import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function NotificationDrawer() {
  const {
    isNotiDrawerOpen,
    setIsNotiDrawerOpen,
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsRead
  } = useApp();

  if (!isNotiDrawerOpen) return null;

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleMarkAllRead = () => {
    if (markAllNotificationsRead) {
      markAllNotificationsRead();
    }
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
              onClick={handleMarkAllRead}
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

        {/* Notifications List (Only Unread notifications displayed in Drawer Modal) */}
        <div className="max-h-[420px] overflow-y-auto p-space-sm flex flex-col gap-2">
          {unreadNotifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-2xl text-outline">done_all</span>
              <span>모든 알림을 확인했습니다.</span>
            </div>
          ) : (
            unreadNotifications.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-primary-fixed/20 border-l-4 border-primary transition-all"
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-label-md text-[13px] font-bold text-on-surface leading-tight">
                    {item.title}
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant shrink-0">{item.time}</span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed mb-2">
                  {item.desc || item.message}
                </p>
                <div className="flex items-center justify-between">
                  {item.link && item.link !== '#' ? (
                    <Link
                      to={item.link}
                      onClick={() => {
                        markNotificationAsRead(item.id);
                        setIsNotiDrawerOpen(false);
                      }}
                      className="inline-flex items-center gap-0.5 text-primary text-[11px] font-bold hover:underline"
                    >
                      <span>자세히 보기</span>
                      <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                    </Link>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={() => markNotificationAsRead(item.id)}
                    className="text-[10px] text-on-surface-variant hover:text-primary font-medium px-1.5 py-0.5 rounded hover:bg-surface-container"
                  >
                    확인
                  </button>
                </div>
              </div>
            ))
          )}
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
