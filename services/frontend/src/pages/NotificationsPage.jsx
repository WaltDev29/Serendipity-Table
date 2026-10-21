import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useApp();

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-body-md text-on-surface">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-container px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="font-title-md text-base font-bold text-on-surface">전체 알림함</h1>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="text-xs text-primary font-bold hover:underline"
        >
          모두 읽음
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Notification List */}
        {notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline-variant">notifications_off</span>
            <p className="text-sm font-semibold text-on-surface-variant">수신된 알림이 없습니다.</p>
            <p className="text-xs text-outline">새로운 공지나 매칭 소식이 도착하면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.read
                    ? 'bg-surface-container-lowest border-surface-container hover:shadow-xs'
                    : 'bg-primary-fixed/20 border-primary/50 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'NOTICE' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-error-container text-error">
                        공지
                      </span>
                    ) : item.type === 'MATCH' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-tertiary-fixed text-tertiary">
                        매칭
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container text-on-surface-variant">
                        안내
                      </span>
                    )}
                    <h2 className="text-sm font-bold text-on-surface">{item.title}</h2>
                  </div>
                  <span className="text-[11px] text-on-surface-variant shrink-0">{item.time || item.createdAt}</span>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line pl-1 mb-2">
                  {item.desc || item.message}
                </p>

                {item.link && item.link !== '#' && item.link !== '/notifications' && (
                  <button
                    type="button"
                    onClick={() => navigate(item.link)}
                    className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline pl-1"
                  >
                    <span>바로가기</span>
                    <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
