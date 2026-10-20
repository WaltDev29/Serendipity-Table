import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BlockedUsersPage() {
  const navigate = useNavigate();

  const [blockedUsers, setBlockedUsers] = useState([
    { id: 'b-1', name: '배강석', date: '2026.09.28', reason: '대화 매너 부적합 (연락처 강요)' },
    { id: 'b-2', name: '이민우', date: '2026.08.14', reason: '시간 미준수 및 언어 무례' }
  ]);

  const handleUnblock = (id, name) => {
    if (window.confirm(`${name}님의 차단을 해제하시겠습니까?\n해제 시 향후 목요일 모임에서 같은 테이블로 매칭될 수 있습니다.`)) {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-4rem)] flex justify-center py-space-md px-margin sm:px-0">
      <div className="w-full max-w-[450px] flex flex-col gap-space-md pb-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h1 className="font-headline-sm text-base font-bold text-on-surface">
            안심 모임 & 차단 관리
          </h1>
          <div className="w-9" />
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-secondary-fixed/40 border border-secondary-fixed text-on-secondary-container text-xs leading-relaxed flex items-start gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
            shield
          </span>
          <div>
            <span className="font-bold block mb-0.5">상호 배제 원칙 안내</span>
            차단한 사용자는 향후 모든 목요일 다이닝 매칭 시 AI 매칭 엔진의 네거티브 제약으로 자동 주입되어 같은 테이블로 절대 배정되지 않습니다.
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-on-surface-variant font-semibold">
            현재 차단 중인 참가자 목록
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-error-container text-error text-xs font-bold">
            {blockedUsers.length}명
          </span>
        </div>

        {/* List of Blocked Users */}
        {blockedUsers.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container text-center text-xs text-on-surface-variant">
            차단한 사용자가 없습니다. 깨끗하고 안전한 식탁을 누려보세요!
          </div>
        ) : (
          <div className="space-y-2.5">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-sm">
                    {user.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-on-surface text-sm">
                      <span>{user.name}</span>
                      <span className="text-[10px] text-outline font-normal">
                        (차단일: {user.date})
                      </span>
                    </div>
                    <p className="text-[11px] text-error mt-0.5">
                      사유: {user.reason}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnblock(user.id, user.name)}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs transition-colors shrink-0"
                >
                  차단 해제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
