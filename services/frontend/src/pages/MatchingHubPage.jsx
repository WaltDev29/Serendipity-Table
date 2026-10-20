import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MatchingWaitingPage from './MatchingWaitingPage';
import VenueMembersPage from './VenueMembersPage';
import FeedbackPage from './FeedbackPage';

export default function MatchingHubPage() {
  const navigate = useNavigate();
  const { userState } = useApp();

  // 1. 매칭 대기 중
  if (userState === 'WAITING') {
    return <MatchingWaitingPage />;
  }

  // 2. 매칭 확정 완료 (식당 및 멤버 공개)
  if (userState === 'CONFIRMED' || userState === 'ATTENDED') {
    return <VenueMembersPage />;
  }

  // 3. 모임 종료 및 피드백 완료
  if (userState === 'FEEDBACK_DONE') {
    return <FeedbackPage />;
  }

  // 4. 미신청 상태 (NONE) - 참여 유도 및 내 정보 입력 확인
  return (
    <div className="w-full bg-surface min-h-[calc(100vh-7rem)] flex justify-center py-6 px-4 pb-24">
      <div className="w-full max-w-[480px] flex flex-col items-center justify-center text-center gap-5 my-auto">
        <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shadow-inner">
          <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            restaurant
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold self-center mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            10/22 (목) 회차 모집 중
          </span>
          <h2 className="font-headline-md text-xl font-bold text-on-surface">
            현재 참여 중인 식탁이 없습니다
          </h2>
          <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed max-w-xs">
            나의 취향과 대화 성향을 바탕으로 AI가 최적의 4~6인 테이블을 자동 구성해 드립니다.
          </p>
        </div>

        <div className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-2.5 text-left">
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span>우연한 식탁 참여 절차</span>
          </div>
          <div className="space-y-1.5 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary text-[10px] font-bold flex items-center justify-center">1</span>
              <span><strong>정보 입력</strong>: 내 취향, 관심사, 성향 1회 설정</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary text-[10px] font-bold flex items-center justify-center">2</span>
              <span><strong>권역 신청</strong>: 목요일 희망 권역 및 참가권 예치</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary text-[10px] font-bold flex items-center justify-center">3</span>
              <span><strong>AI 매칭 발표</strong>: 화요일 18:00 식당 및 멤버 확인</span>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/information-input')}
            className="w-full h-12 rounded-xl bg-primary text-white font-label-lg text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">edit_note</span>
            <span>내 정보 & 취향 입력하기</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-bold transition-colors"
          >
            이번 주 오픈 권역 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
