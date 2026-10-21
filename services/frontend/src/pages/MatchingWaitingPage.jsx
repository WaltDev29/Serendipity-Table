import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';

export default function MatchingWaitingPage() {
  const navigate = useNavigate();
  const { applicationData, setUserState } = useApp();
  const { showAlert, showConfirm } = useModal();

  // D-1 실시간 카운트다운 타이머 시뮬레이션
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 14,
    minutes: 32,
    seconds: 8
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancelApplication = async () => {
    const ok = await showConfirm(
      '참가 신청을 취소하시겠습니까?\n(행사 2일 전 정오 이전이므로 사용하신 참가권이 다시 반환됩니다.)',
      '신청 취소 확인'
    );
    if (ok) {
      setUserState('NONE');
      await showAlert('참가 신청이 취소되었으며, 참가권 1회가 보유 참가권으로 반환되었습니다.', '취소 완료');
      navigate('/');
    }
  };

  const formatPad = (n) => String(n).padStart(2, '0');

  return (
    <div className="w-full flex justify-center py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-[440px] flex flex-col gap-5 pb-24">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-headline-sm text-sm font-bold text-on-surface">매칭 진행 상황</span>
            <span className="font-label-sm text-[10px] text-primary tracking-wider uppercase font-semibold">
              Matching Status
            </span>
          </div>
          <button
            onClick={() => alert('화요일 18:00에 매칭 알고리즘이 완료되면 카카오톡 알림톡 및 앱 푸시로 최종 안내됩니다.')}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>
        </div>

        {/* Matching Countdown Hero Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF0ED] via-[#FFF6F4] to-surface-container-lowest p-6 shadow-md border border-primary-fixed/50 flex flex-col gap-4">
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-label-md text-xs text-primary font-bold">매칭 알고리즘 가동 중</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">(WAITING)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-tertiary bg-tertiary-fixed/60 px-2.5 py-0.5 rounded-full font-bold">
              <span className="material-symbols-outlined text-[13px]">shield</span>
              <span>안심 검증</span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="relative z-10 flex flex-col items-center text-center py-2">
            <span className="text-[11px] text-on-surface-variant tracking-wider uppercase mb-1">
              매칭 결과 발표까지 남은 시간
            </span>
            <div className="flex items-baseline justify-center gap-2 text-primary font-headline-xl">
              <span className="text-secondary font-bold text-2xl">D-{timeLeft.days}</span>
              <span className="tabular-nums font-extrabold text-3xl">
                {formatPad(timeLeft.hours)}:{formatPad(timeLeft.minutes)}:{formatPad(timeLeft.seconds)}
              </span>
            </div>
          </div>

          <div className="relative z-10 p-3 rounded-xl bg-surface-container-low/90 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
              notifications_active
            </span>
            <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-semibold">화요일 18:00</strong>에 카카오 알림톡 및 앱 푸시로 매칭된 식탁 멤버 카드와 식당 안내가 발표됩니다.
            </p>
          </div>
        </section>

        {/* Stepper */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container flex flex-col gap-4">
          <h2 className="font-headline-sm text-sm font-bold text-on-surface">진행 단계</h2>
          <div className="relative flex flex-col gap-4 pl-2">
            {/* Step 1 */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-xs z-10 text-xs">
                ✓
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">1단계: 참가 신청서 접수 완료</span>
                <span className="text-[11px] text-on-surface-variant">기본 취향 및 인적사항 확인 완료</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs z-10 animate-pulse text-xs">
                ⟳
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary">2단계: AI 성향 & 연령 밸런싱 분석 중</span>
                <span className="text-[11px] text-on-surface-variant">성비 2:2, 연령차 8세 이내 최적 테이블 조합 연산</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 relative opacity-60">
              <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 z-10 text-xs">
                3
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">3단계: 최종 식당 및 단체 채팅방 오픈</span>
                <span className="text-[11px] text-on-surface-variant">화요일 18:00 발표 예정</span>
              </div>
            </div>
          </div>
        </section>

        {/* My Application Summary Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <span className="text-xs font-bold text-on-surface">내 신청 정보 요약</span>
            <span className="text-[11px] text-primary font-bold">결제 완료</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">모임 일시:</span>
              <span className="font-semibold text-on-surface">2026.10.22 (목) 19:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">선택 권역:</span>
              <span className="font-semibold text-on-surface">
                {(applicationData.preferredRegions || ['홍대 / 합정']).join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">선호 예산:</span>
              <span className="font-semibold text-on-surface">{applicationData.budgetRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">제외 식단:</span>
              <span className="font-semibold text-on-surface">
                {(applicationData.foodRestrictions || []).join(', ') || '없음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">결제 티켓:</span>
              <span className="font-semibold text-primary">{applicationData.ticketType}</span>
            </div>
          </div>
        </section>

        {/* Cancel Button */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-[11px] text-on-surface-variant text-center">
            행사 2일 전 정오(화요일 12:00) 이전까지 취소 시 참가권이 반환됩니다. (현금 환불 불가)
          </p>
          <button
            onClick={handleCancelApplication}
            className="text-xs text-outline hover:text-red-600 underline font-semibold transition-colors"
          >
            신청 취소
          </button>
        </div>

      </div>
    </div>
  );
}
