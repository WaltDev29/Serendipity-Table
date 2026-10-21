import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function FallbackPage() {
  const navigate = useNavigate();
  const { setUserState } = useApp();

  const handleFallbackSelect = (type) => {
    if (type === 'next_week') {
      alert('🎉 10월 31일(목) 다음 주 식탁으로 1순위 우선 배정 이동되었습니다!');
      setUserState('WAITING');
      navigate('/matching-waiting');
    } else if (type === 'keep_ticket') {
      alert('보유 참가권 1회가 안전하게 보관 충전되었습니다. (유효기간 60일 연장)');
      setUserState('NONE');
      navigate('/mypage');
    } else if (type === 'refund') {
      alert('100% 모의 전액 환불 처리가 접수되었습니다. (영업일 기준 즉시 취소)');
      setUserState('NONE');
      navigate('/');
    }
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="w-full flex justify-center py-space-md lg:py-space-xl px-space-md">
        <div className="w-full max-w-[440px] flex flex-col gap-space-lg">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">매칭 결과 안내</h1>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-xl">home</span>
            </button>
          </div>

          {/* Hero Status Card */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>
            
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-space-md shadow-inner text-primary-container">
              <span className="material-symbols-outlined text-[32px] text-primary">sentiment_dissatisfied</span>
            </div>

            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm mb-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              이번 회차 미매칭 안내
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-space-xs font-bold leading-snug">
              이번 회차에는 딱 맞는<br />테이블을 찾지 못했어요 😢
            </h2>

            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed px-space-xs">
              연령차 8세 이내 &amp; 성비, 관심사 조건을 엄격히 지키다 보니 아쉽게 미성사되었습니다. 회원님의 소중한 기회를 온전히 보장해 드립니다.
            </p>

            <div className="w-full mt-space-md pt-space-md bg-surface-container-low rounded-lg p-space-sm flex items-center justify-around text-center">
              <div className="flex flex-col items-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">엄격 매칭률</span>
                <span className="font-headline-sm text-headline-sm text-tertiary font-bold">96.4%</span>
              </div>
              <div className="w-px h-8 bg-surface-variant"></div>
              <div className="flex flex-col items-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">안심 보증</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">100% 무료 이동</span>
              </div>
            </div>
          </section>

          {/* Section Title */}
          <div className="flex items-center justify-between px-space-xs">
            <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide">
              선택 가능한 대안 옵션
            </span>
            <span className="font-label-sm text-label-sm text-primary font-medium">원클릭 즉시 처리</span>
          </div>

          {/* 3 Action Cards */}
          <div className="flex flex-col gap-space-md">
            
            {/* Option 1: Next Week Move (Recommended) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-transform active:scale-[0.99] flex flex-col gap-space-sm relative overflow-hidden border border-primary/20">
              <div className="absolute top-0 right-0 bg-primary-container text-on-primary-container px-space-sm py-0.5 rounded-bl-lg font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[13px]">recommend</span>
                강력 추천
              </div>
              <div className="flex items-start gap-space-sm pr-16">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed">
                  <span className="material-symbols-outlined text-xl">event_repeat</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    다음 주 목요일 모임으로 무료 이동
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    다음 회차 매칭 시 <strong className="text-primary font-semibold">1순위 자동 우선 배정권</strong>이 부여됩니다.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-sm text-tertiary">verified</span>
                <span>일정: 10월 29일 (목) 19:30 • 추가 비용 0원</span>
              </div>
              <button
                type="button"
                onClick={() => handleFallbackSelect('next_week')}
                className="w-full mt-space-xs h-[50px] bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-space-xs transition-colors shadow-sm font-bold"
              >
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                다음 주 목요일 모임으로 이동하기
              </button>
            </div>

            {/* Option 2: Keep Ticket */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-transform active:scale-[0.99] flex flex-col gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-xl">confirmation_number</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      보유 참가권으로 안전 보관
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                      60일 연장
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    원하는 주차에 언제든 다시 참가 신청할 수 있도록 정규 티켓으로 충전해 둡니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFallbackSelect('keep_ticket')}
                className="w-full mt-space-xs h-[48px] bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-space-xs transition-colors"
              >
                <span className="material-symbols-outlined text-lg">bookmark</span>
                보유 참가권으로 보관하기
              </button>
            </div>

            {/* Option 3: Refund */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-transform active:scale-[0.99] flex flex-col gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      100% 자동 모의 환불 받기
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                      수수료 0원
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    미성사 귀책 사유로 결제 수단으로 위약금 없이 즉시 전액 취소 환불됩니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFallbackSelect('refund')}
                className="w-full mt-space-xs h-[48px] bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md rounded-xl flex items-center justify-center gap-space-xs transition-colors"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                수수료 없이 전액 즉시 환불
              </button>
            </div>

          </div>

          {/* Help Notice */}
          <div className="flex items-center justify-center gap-1 text-on-surface-variant font-label-sm text-label-sm py-space-xs">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            <span>
              선택에 어려움이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate('/mypage')}
                className="text-primary underline font-medium"
              >
                실시간 상담 매니저 연결
              </button>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
