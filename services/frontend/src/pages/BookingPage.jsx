import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function BookingPage() {
  const navigate = useNavigate();
  const { applicationData, setApplicationData, setUserState } = useApp();

  const [dietInput, setDietInput] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const budgetOptions = [
    '10,000 ~ 20,000원 (가벼운 식사)',
    '20,000 ~ 30,000원 (추천 비스트로)',
    '30,000원 이상 (상관없음)'
  ];

  const regionOptions = [
    { id: 'hongdae', name: '홍대 / 합정', desc: '연남동·상수 비스트로', tag: '마감임박' },
    { id: 'jamsil', name: '잠실 / 송파', desc: '송리단길·석촌호수', tag: '모집중' },
    { id: 'gangnam', name: '강남 / 신논현', desc: '역삼·서초 연계', tag: '모집중' },
    { id: 'euljiro', name: '을지로 / 종로', desc: '힙지로·익선동', tag: '모집중' }
  ];

  const toggleRegion = (regionName) => {
    setApplicationData((prev) => {
      const current = prev.preferredRegions || [];
      const updated = current.includes(regionName)
        ? current.filter((r) => r !== regionName)
        : [...current, regionName];
      return { ...prev, preferredRegions: updated };
    });
  };

  const addDietTag = (tag) => {
    if (!tag.trim()) return;
    setApplicationData((prev) => {
      const current = prev.foodRestrictions || [];
      if (current.includes(tag)) return prev;
      return { ...prev, foodRestrictions: [...current, tag] };
    });
    setDietInput('');
  };

  const removeDietTag = (tag) => {
    setApplicationData((prev) => ({
      ...prev,
      foodRestrictions: (prev.foodRestrictions || []).filter((t) => t !== tag)
    }));
  };

  const handleCheckout = () => {
    if (!agreed) {
      alert('필수 이용 약관 및 노쇼 제재 규정에 동의해주세요.');
      return;
    }
    if ((applicationData.preferredRegions || []).length === 0) {
      alert('희망 지역을 최소 1개 이상 선택해주세요.');
      return;
    }
    // 모의 결제 성공 모달 팝업
    setIsSuccessModalOpen(true);
  };

  const handleConfirmDone = () => {
    setIsSuccessModalOpen(false);
    setUserState('WAITING');
    navigate('/match/status');
  };

  return (
    <div className="w-full flex justify-center py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-[460px] flex flex-col gap-5 pb-32">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/apply')}
              className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <span className="font-label-lg text-sm text-on-surface font-bold">
              일정 및 결제 (4/4)
            </span>
            <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
              완료 단계
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div className="h-full bg-primary rounded-full w-full transition-all" />
          </div>
        </div>

        {/* Section 1: 선호 식사 예산대 */}
        <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
          <div className="flex items-center justify-between">
            <label className="font-label-lg text-sm text-on-surface font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
              선호 식사 예산대 (인당)
            </label>
            <span className="font-label-sm text-[11px] text-on-surface-variant">현장 정산</span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            모임 장소의 예상 1인 메뉴 가격대입니다.
          </p>
          <div className="flex flex-col gap-2">
            {budgetOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setApplicationData({ ...applicationData, budgetRange: opt })}
                className={`p-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${applicationData.budgetRange === opt
                    ? 'bg-primary-fixed text-primary border border-primary/30 font-bold shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
              >
                <span>{opt}</span>
                {applicationData.budgetRange === opt && (
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: 식단 제한 및 알레르기 */}
        <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
          <div className="flex items-center justify-between">
            <label className="font-label-lg text-sm text-on-surface font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">no_food</span>
              식단 제한 및 알레르기 (선택)
            </label>
            <span className="font-label-sm text-[11px] text-tertiary font-bold">배려 테이블 반영</span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            식당 선정 시 해당 재료를 우선적으로 제외합니다.
          </p>

          {/* Active Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(applicationData.foodRestrictions || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-semibold"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeDietTag(tag)}
                  className="hover:text-red-700 leading-none text-sm font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['갑각류', '땅콩/견과류', '유제품', '오이', '날생선'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => addDietTag(preset)}
                className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] hover:bg-surface-container-highest"
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Direct Input */}
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={dietInput}
              onChange={(e) => setDietInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDietTag(dietInput);
                }
              }}
              placeholder="직접 입력 (예: 고수, 메밀)"
              className="flex-1 h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => addDietTag(dietInput)}
              className="px-3 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest"
            >
              추가
            </button>
          </div>
        </div>

        {/* Section 3: 선호 모임 지역 */}
        <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
          <div className="flex items-center justify-between">
            <label className="font-label-lg text-sm text-on-surface font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
              선호 모임 지역 <span className="text-primary text-xs font-semibold">(중복 가능)</span>
            </label>
            <span className="font-label-sm text-[11px] text-on-surface-variant">서울 핵심 권역</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {regionOptions.map((reg) => {
              const selected = (applicationData.preferredRegions || []).includes(reg.name);
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => toggleRegion(reg.name)}
                  className={`p-3 rounded-xl text-left flex flex-col justify-between transition-all ${selected
                      ? 'bg-primary-fixed text-primary border border-primary/30 font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{reg.name}</span>
                    {selected && (
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-75 mt-1">{reg.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: 참가권 선택 & 모의 결제 */}
        <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
          <h3 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">confirmation_number</span>
            참가권 선택
          </h3>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                setApplicationData({
                  ...applicationData,
                  ticketType: '1회 참가권 (₩8,000)',
                  ticketPrice: 8000
                })
              }
              className={`p-3.5 rounded-xl text-left flex items-center justify-between transition-all ${applicationData.ticketPrice === 8000
                  ? 'bg-primary-fixed text-primary border border-primary/30 font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold">1회 참가권</span>
                <span className="text-[11px] opacity-75">이번 주 목요일 모임 1회 참석</span>
              </div>
              <span className="text-sm font-extrabold">₩8,000</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setApplicationData({
                  ...applicationData,
                  ticketType: '3회 패스권 (₩20,000)',
                  ticketPrice: 20000
                })
              }
              className={`p-3.5 rounded-xl text-left flex items-center justify-between transition-all ${applicationData.ticketPrice === 20000
                  ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary/30 font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">3회 패스권</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                    인기
                  </span>
                </div>
                <span className="text-[11px] opacity-75">회당 ₩6,600 · 3개월 유효</span>
              </div>
              <span className="text-sm font-extrabold">₩20,000</span>
            </button>
          </div>

          {/* Agreement Checkbox */}
          <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-2.5 mt-2">
            <input
              type="checkbox"
              id="agree-rules"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded accent-primary cursor-pointer w-4 h-4"
            />
            <label htmlFor="agree-rules" className="text-[11px] text-on-surface-variant leading-relaxed cursor-pointer">
              <strong>[필수]</strong> 단체 채팅방 참여 및 노쇼 제재 규정에 동의합니다. (행사 2일 전 이후 취소 불가 및 무단 불참 시 영구 이용 제한)
            </label>
          </div>
        </div>

        {/* Bottom Floating Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-surface-container flex justify-center z-30">
          <div className="w-full max-w-[460px] flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant">결제 예정 금액</span>
              <span className="text-base font-extrabold text-primary">
                ₩{(applicationData.ticketPrice || 8000).toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-label-lg text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>모의 결제 및 참가 신청 완료</span>
            </button>
          </div>
        </div>

        {/* Mock Payment Success Modal */}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 border border-surface-container">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  task_alt
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  모의 결제 및 신청 완료!
                </h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                  <strong className="text-primary font-bold">{applicationData.ticketType}</strong> 결제가 완료되었습니다.<br />
                  설문 분석을 거쳐 화요일 18:00에 매칭 결과가 발표됩니다.
                </p>
              </div>
              <button
                onClick={handleConfirmDone}
                className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-sm font-bold shadow-md hover:bg-primary-container transition-all"
              >
                매칭 대기 현황 확인하기
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
