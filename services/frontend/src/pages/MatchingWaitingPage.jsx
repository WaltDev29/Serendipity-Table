import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';

export default function MatchingWaitingPage() {
  const navigate = useNavigate();
  const { applicationData, currentUser, setUserState, setMatchResult } = useApp();
  const { showAlert, showConfirm } = useModal();

  const [isMatchingNow, setIsMatchingNow] = useState(false);

  // D-2 (모임 2일 전 최종 확정) 카운트다운 타이머
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

  // 지금 바로 매칭 (테스트용) 핸들러
  const handleImmediateMatch = async () => {
    try {
      setIsMatchingNow(true);
      const region = (applicationData.preferredRegions && applicationData.preferredRegions[0]) || '홍대 / 합정';
      const myNickname = currentUser?.nickname || currentUser?.name || '나';
      const myAge = currentUser?.birthYear ? (2026 - currentUser.birthYear) : 28;
      const myGender = currentUser?.gender === 'M' ? '남성' : '여성';

      const mockInstantTable = {
        tableId: 'instant-test-table-1',
        tableName: `${region} 식탁 #1`,
        eventDate: '2026-10-22 19:30',
        status: 'CONFIRMED',
        chatRoomId: 'instant-room-1',
        harmonyScore: 96,
        venue: {
          id: 'venue-1',
          name: region.includes('잠실') ? '송리단 테라스 다이닝' : region.includes('강남') ? '루프탑 모던 비스트로' : '연남 슬로우 비스트로',
          genre: 'DINING & BISTRO',
          address: region.includes('잠실') ? '서울 송파구 백제고분로45길 12' : region.includes('강남') ? '서울 강남구 테헤란로 152' : '서울 마포구 동교로 210, 2층',
          subway: '인근 지하철역 도보 5분',
          menu: '시그니처 스테이크 & 내추럴 와인 페어링',
          avgPrice: '1인 약 25,000원 선',
          atmosphere: ['#따뜻한조명', '#조용한대화', '#와인페어링'],
          rating: '4.8 (210)',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          kakaoMapUrl: 'https://map.kakao.com',
          naverMapUrl: 'https://map.naver.com',
          phone: '02-333-1234'
        },
        members: [
          {
            id: currentUser?.id || 'me',
            name: `나 (${myNickname})`,
            nickname: myNickname,
            isMe: true,
            role: 'ME',
            gender: myGender,
            age: `${myAge}세`,
            ageGroup: `${myAge >= 30 ? '30대 초반' : '20대 후반'} · ${myGender}`,
            job: currentUser?.job || '직장인',
            mbti: currentUser?.mbti || 'ENFP',
            mannerTemp: currentUser?.mannerTemp || 36.5,
            status: '호스트/예약확인',
            attended: true
          },
          {
            id: 'm-2',
            name: '지민',
            nickname: '지민',
            isMe: false,
            role: 'MEMBER',
            gender: myGender === '남성' ? '여성' : '남성',
            age: `${myAge - 1}세`,
            ageGroup: `${myAge >= 30 ? '30대 초반' : '20대 후반'} · ${myGender === '남성' ? '여성' : '남성'}`,
            job: 'UX 기획자',
            mbti: 'INFJ',
            mannerTemp: 37.2,
            status: '대화 선호',
            attended: true
          },
          {
            id: 'm-3',
            name: '민우',
            nickname: '민우',
            isMe: false,
            role: 'MEMBER',
            gender: '남성',
            age: `${myAge + 1}세`,
            ageGroup: `${myAge >= 30 ? '30대 초반' : '20대 후반'} · 남성`,
            job: '소프트웨어 엔지니어',
            mbti: 'ENTP',
            mannerTemp: 36.8,
            status: '와인 애호가',
            attended: true
          },
          {
            id: 'm-4',
            name: '서연',
            nickname: '서연',
            isMe: false,
            role: 'MEMBER',
            gender: '여성',
            age: `${myAge}세`,
            ageGroup: `${myAge >= 30 ? '30대 초반' : '20대 후반'} · 여성`,
            job: '콘텐츠 에디터',
            mbti: 'ISFP',
            mannerTemp: 37.0,
            status: '맛집 탐방러',
            attended: true
          }
        ]
      };

      setMatchResult(mockInstantTable);
      setUserState('CONFIRMED');
      await showAlert('⚡ AI 매칭이 즉시 완료되었습니다! 배정된 4인 식탁 및 식당 정보를 확인하세요.', '매칭 확정 완료');
      navigate('/match/result');
    } finally {
      setIsMatchingNow(false);
    }
  };

  const handleCancelApplication = async () => {
    const ok = await showConfirm(
      '참가 신청을 취소하시겠습니까?\n(모임 2일 전 확정 이전이므로 사용하신 참가권이 반환됩니다.)',
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
            onClick={() => alert('모임 3일 전에 1차 AI 매칭이 진행되며, 하루 동안 참가 취소 접수 후 2일 전에 최종 식탁이 확정됩니다.')}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>
        </div>

        {/* Test Quick Action: 지금 바로 매칭(테스트용) */}
        <div className="w-full bg-gradient-to-r from-primary-fixed/60 via-surface-container-low to-secondary-fixed/50 p-4 rounded-2xl border border-primary/30 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">developer_mode</span>
              <span>테스트 편의 기능</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
              즉시 검증
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            모임 3일 전/2일 전 스케줄러 대기 없이, 지금 즉시 최적의 4인 식탁 매칭을 확정하고 결과를 확인합니다.
          </p>
          <button
            type="button"
            disabled={isMatchingNow}
            onClick={handleImmediateMatch}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:bg-primary-container shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>{isMatchingNow ? '매칭 연산 및 식당 배정 중...' : '지금 바로 매칭 (테스트용)'}</span>
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
              최종 식탁 확정(모임 2일 전)까지 남은 시간
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
              <strong className="text-on-surface font-semibold">모임 3일 전</strong>에 AI 1차 매칭이 진행되며, 참가 취소 조율 후 <strong className="text-on-surface font-semibold">모임 2일 전</strong>에 최종 식당 및 단체방이 확정 개설됩니다.
            </p>
          </div>
        </section>

        {/* Stepper (3일전 매칭 / 하루 취소 및 재매칭 / 2일전 최종 확정) */}
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
                <span className="text-[11px] text-on-surface-variant">취향, 권역 및 기본 인적사항 등록 완료</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs z-10 animate-pulse text-xs">
                ⟳
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary">2단계: AI 1차 매칭 및 취소·재매칭 (모임 3일 전)</span>
                <span className="text-[11px] text-on-surface-variant">성비 2:2, 연령차 8세 이내 매칭 후 하루 동안 취소 접수 및 불발 모임 재배치</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 relative opacity-60">
              <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 z-10 text-xs">
                3
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">3단계: 최종 식탁 확정 & 식당 예약·단체방 오픈 (모임 2일 전)</span>
                <span className="text-[11px] text-on-surface-variant">최종 4인 식탁 확정, 엄선 식당 안내 및 단체 채팅방 오픈</span>
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
            AI 1차 매칭 후 하루 동안(모임 2일 전 최종 확정 이전) 취소 시 참가권이 전액 반환됩니다.
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
