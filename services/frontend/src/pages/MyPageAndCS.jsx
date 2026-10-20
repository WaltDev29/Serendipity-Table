import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MyPageAndCS() {
  const navigate = useNavigate();
  const { currentUser, matchResult } = useApp();

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col w-full items-center justify-start py-space-md px-margin sm:px-0">
        <div className="w-full max-w-[450px] flex flex-col gap-space-md pb-24">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <h1 className="font-headline-sm text-base font-bold text-on-surface">
              마이페이지
            </h1>
            <span className="text-xs text-on-surface-variant font-medium">
              내 계정 및 이용 현황
            </span>
          </div>

          <div className="flex flex-col gap-space-md w-full">
            
            {/* 1. USER PROFILE CARD */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden border border-surface-container">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-space-md">
                  <div className="relative">
                    <img
                      className="w-16 h-16 rounded-full object-cover shadow-sm ring-4 ring-surface-container-low"
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                      alt="프로필"
                    />
                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[12px] font-bold">verified_user</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{currentUser?.nickname || '회원'}</h2>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">({currentUser?.name || '본인'})</span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                      {currentUser?.age || (currentUser?.birthYear ? 2026 - currentUser.birthYear : 28)}세 · {currentUser?.job || '직장인'} · {currentUser?.mbti || 'ENFP'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges & Manners */}
              <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                <div className="bg-tertiary-fixed/30 rounded-xl p-space-sm flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">신원 인증</span>
                    <span className="font-label-md text-label-md text-tertiary font-bold">본인인증 완료</span>
                  </div>
                </div>
                <div className="bg-secondary-fixed/30 rounded-xl p-space-sm flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">테이블 매너</span>
                    <span className="font-label-md text-label-md text-secondary font-bold">
                      {currentUser?.mannerTemp ? Number(currentUser.mannerTemp).toFixed(1) : '36.5'}°C 온화함
                    </span>
                  </div>
                </div>
              </div>

              {/* Interest Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(currentUser?.interests && currentUser.interests.length > 0 ? currentUser.interests : ['맛집·카페 탐방', '전시·공연', '깊은 대화']).map((tag, idx) => (
                  <span key={idx} className="px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                    #{tag}
                  </span>
                ))}
                <span className="px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                  #목요일소셜
                </span>
              </div>

              {/* Edit Profile & Tastes Action Button */}
              <div className="pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => navigate('/information-input')}
                  className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[17px] text-primary">edit_note</span>
                  <span>내 정보 및 취향 수정하기</span>
                </button>
              </div>
            </div>

            {/* 2. RESERVED TABLE CARD (예약된 활성 식탁이 있을 때만 상세 표시) */}
            {matchResult ? (
              <div
                onClick={() => navigate('/match/result')}
                className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-primary/20 flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                    <span className="material-symbols-outlined text-[18px]">restaurant</span>
                    <span>예약된 식탁</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-xs">
                    매칭 완료
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface">
                      {matchResult.tableName}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {matchResult.venue?.name} · {matchResult.eventDate}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center justify-between">
                  <span>4인 배정 완료 · 익명 멤버 프로필</span>
                  <span className="text-primary font-bold">확인하기 →</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => navigate('/apply')}
                className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">restaurant</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm font-bold text-on-surface">현재 예약된 식탁이 없어요</span>
                    <span className="text-xs text-on-surface-variant">목요일 밤 따뜻한 식탁에 참여해보세요</span>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold">신청하기</span>
              </div>
            )}

            {/* 3. MY TICKET CARD */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg">
                  <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                  <span className="font-bold">보유 참가권</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-xs font-bold">
                  무제한 사용
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                    {currentUser?.ticketCount ?? currentUser?.tickets ?? 0}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">회 남음</span>
                </div>
                <span className="font-label-sm text-xs text-tertiary font-bold">언제든 사용 가능</span>
              </div>

              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '66.6%' }}></div>
              </div>

              <div className="flex items-center justify-between pt-space-xs">
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-space-xs active:scale-95 font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>참가권 추가 충전 / 구매</span>
                </button>
              </div>
            </div>

            {/* 4. DEDICATED NAVIGATION BUTTONS (지난 식탁 & 차단 관리 버튼) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/past-tables')}
                className="w-full p-4 rounded-2xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-all shadow-sm flex items-center justify-between text-xs font-bold text-on-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">지난 식탁 다이어리</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">내가 참여했던 따뜻한 식탁 목록 (총 5회)</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/blocked-users')}
                className="w-full p-4 rounded-2xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-all shadow-sm flex items-center justify-between text-xs font-bold text-on-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">shield</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">안심 모임 & 차단 관리</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">비매너 참가자 영구 배제 룰 설정 (1명 차단 중)</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>
            </div>

            {/* 5. CUSTOMER SERVICE BUTTON (마이페이지 항목들 마지막에 버튼으로 구현) */}
            <div className="pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => navigate('/cs')}
                className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between text-xs font-bold text-on-surface border border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold">고객센터 & FAQ</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">자주 묻는 질문 및 1:1 실시간 문의하기</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

