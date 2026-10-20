import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function DemoSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userState, setUserState } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // 관리자 콘솔(/admin)에서는 숨김 (AdminLayout 자체 헤더/사이드바에 전환 버튼 내장)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const demoPresets = [
    { label: '⚙️ 운영자 콘솔 (A-01~09)', path: '/admin/dashboard', state: 'CONFIRMED', desc: '와이드 데스크톱 관리자 백오피스' },
    { label: 'P-01 홈 (미신청 상태)', path: '/', state: 'NONE', desc: '초기 홈 화면 및 회차 오픈 안내' },
    { label: 'P-01 홈 (신청 완료 배너)', path: '/', state: 'WAITING', desc: '상단 D-2 신청완료 퀵배너 표시' },
    { label: 'P-02~03 설문 작성 (1~2단계)', path: '/apply', state: 'NONE', desc: '인적사항 & 취향 성향 칩' },
    { label: 'P-04~05 일정/결제 (3~4단계)', path: '/booking', state: 'NONE', desc: '예산/식단/권역/모의결제' },
    { label: 'P-06 매칭 대기 (WAITING)', path: '/match/status', state: 'WAITING', desc: 'D-Day 카운트다운 타이머' },
    { label: 'P-07 매칭 완료 (CONFIRMED)', path: '/match/result', state: 'CONFIRMED', desc: '배정 식당 & 4인 프로필' },
    { label: 'P-08 실시간 단체 채팅방', path: '/chat', state: 'CONFIRMED', desc: '7대 메시지 타입 & 체크인' },
    { label: 'P-09 매칭 대안 선택', path: '/fallback', state: 'NONE', desc: '불매칭 시 무료이월/환불' },
    { label: 'P-10 모임 피드백 & 리텐션', path: '/feedback', state: 'FEEDBACK_DONE', desc: '3대 별점 & 1초 재신청' },
    { label: 'P-12 마이페이지 & CS', path: '/my', state: 'CONFIRMED', desc: '보유 참가권 & 1:1 CS 문의' },
    { label: 'P-13 내 채팅방 목록', path: '/chats', state: 'CONFIRMED', desc: '활성/종료 모임 탭' }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-2 w-80 bg-inverse-surface/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-inverse-surface text-inverse-on-surface animate-fade-in text-[13px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="font-bold text-primary-fixed flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              1초 화면/상태 프리셋
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[360px] overflow-y-auto space-y-1">
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserState(preset.state);
                  navigate(preset.path);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2 rounded-xl transition-all flex flex-col ${
                  location.pathname === preset.path && userState === preset.state
                    ? 'bg-primary text-white font-semibold shadow-xs'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <span className="font-medium">{preset.label}</span>
                <span className="text-[11px] opacity-70">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Toggle Button (Subtle & Compact) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-inverse-surface/80 hover:bg-inverse-surface text-inverse-on-surface shadow-md border border-white/10 flex items-center justify-center transition-all opacity-40 hover:opacity-100"
        title="빠른 상태 전환기"
      >
        <span className="material-symbols-outlined text-[18px]">
          tune
        </span>
      </button>
    </div>
  );
}
