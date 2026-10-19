import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ApplicationWizardPage() {
  const navigate = useNavigate();
  const { applicationData, setApplicationData, setUserState } = useApp();

  const [step, setStep] = useState(1); // 1: 기본정보, 2: 취향/성향, 3: 식사옵션, 4: 결제
  const [dietInput, setDietInput] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 10종 관심사
  const interestChips = [
    '맛집·카페 탐방', '전시·공연', '음악', '깊은 대화',
    '와인·위스키', '스타트업·IT', '여행', '독서',
    '반려동물', '운동·러닝'
  ];

  // 6종 내 성향
  const myTendencyChips = [
    '경청을 잘 함', '리액션이 풍부함', '분위기 메이커',
    '잔잔하고 조용한 편', '깊은 대화를 좋아함', '유쾌하고 장난기 많음'
  ];

  // 6종 상대 성향
  const preferredTendencyChips = [
    '나와 비슷한 사람', '이야기를 잘 이끄는 사람', '경청을 잘하는 사람',
    '편하고 유머 있는 사람', '깊은 대화가 되는 사람', '에너지가 밝은 사람'
  ];

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

  // Toggle Handlers
  const toggleChip = (category, item) => {
    setApplicationData((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [category]: updated };
    });
  };

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
      foodRestrictions: (prev.foodRestrictions || []).filter((t) => t !== tag),
    }));
  };

  const handlePayment = (paymentMethod) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUserState('WAITING');
      setIsSuccessModalOpen(true);
    }, 800);
  };

  const stepsInfo = [
    { num: 1, title: '기본 정보', sub: '신원 및 기본 프로필' },
    { num: 2, title: '취향·성향', sub: '관심사와 대화 스타일' },
    { num: 3, title: '식사 옵션', sub: '권역·예산·식단' },
    { num: 4, title: '참가권 결제', sub: '노쇼 방지 보증 결제' },
  ];

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)] pb-24">
      <div className="flex flex-col w-full items-center justify-start py-space-md px-margin sm:px-0">
        <div className="w-full max-w-[480px] flex flex-col gap-space-md">
          
          {/* Top Wizard Step Bar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-primary font-bold">
                Step {step} of 4: {stepsInfo[step - 1].title}
              </span>
              <span className="text-on-surface-variant">
                {stepsInfo[step - 1].sub}
              </span>
            </div>

            {/* Progress Track */}
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* STEP 1: 기본 정보 (이름, 연락처, 성별, 연령대, 직업, MBTI) */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col gap-space-md animate-fade-in">
              <div className="flex flex-col gap-1 pb-2 border-b border-surface-container">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  본인 확인 및 기본 프로필
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  실제 만남의 안전을 위해 100% 본인 인증 정보로 검증됩니다. (닉네임만 상대에게 노출)
                </p>
              </div>

              {/* Name & Phone */}
              <div className="space-y-3">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                    이름 (실명)
                  </label>
                  <input
                    type="text"
                    value={applicationData.name}
                    onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                    휴대폰 번호 (매칭 확정 알림톡 수신용)
                  </label>
                  <input
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                    인스타그램 아이디 <span className="text-on-surface-variant text-xs font-normal">(안심 신원 검증용, 비공개)</span>
                  </label>
                  <input
                    type="text"
                    value={applicationData.instagramId}
                    onChange={(e) => setApplicationData({ ...applicationData, instagramId: e.target.value })}
                    placeholder="@seoyeon_slowbistro"
                    className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* BirthYear & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                      출생연도
                    </label>
                    <input
                      type="number"
                      value={applicationData.birthYear}
                      onChange={(e) => setApplicationData({ ...applicationData, birthYear: e.target.value })}
                      placeholder="1995"
                      className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                      성별
                    </label>
                    <div className="flex gap-2">
                      {['F', 'M'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setApplicationData({ ...applicationData, gender: g })}
                          className={`flex-1 h-11 rounded-xl font-label-md text-label-md font-bold transition-all ${
                            applicationData.gender === g
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {g === 'F' ? '여성' : '남성'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Job & MBTI */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                      직업/분야
                    </label>
                    <input
                      type="text"
                      value={applicationData.job}
                      onChange={(e) => setApplicationData({ ...applicationData, job: e.target.value })}
                      placeholder="브랜드 디자이너"
                      className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                      MBTI
                    </label>
                    <input
                      type="text"
                      value={applicationData.mbti}
                      onChange={(e) => setApplicationData({ ...applicationData, mbti: e.target.value.toUpperCase() })}
                      placeholder="ENFP"
                      maxLength={4}
                      className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!applicationData.name || !applicationData.phone}
                className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-label-lg text-label-lg font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <span>다음: 취향 및 성향 선택</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: 취향 & 대화 성향 (관심사 10종, 내 성향, 상대 성향) */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col gap-space-md animate-fade-in">
              <div className="flex flex-col gap-1 pb-2 border-b border-surface-container">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  나의 취향과 대화 스타일
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  AI 매칭 엔진이 대화가 끊이지 않는 최적의 4인을 배정하는 핵심 데이터입니다.
                </p>
              </div>

              {/* 1. 관심사 10종 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    관심사 키워드 (최대 3~4개 권장)
                  </span>
                  <span className="text-xs text-primary font-semibold">
                    {applicationData.interests?.length || 0}개 선택
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestChips.map((chip) => {
                    const isSelected = applicationData.interests?.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip('interests', chip)}
                        className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-white shadow-xs font-bold'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. 내 성향 6종 */}
              <div className="space-y-2 pt-2 border-t border-surface-container">
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  식탁에서의 나의 성향
                </span>
                <div className="flex flex-wrap gap-2">
                  {myTendencyChips.map((chip) => {
                    const isSelected = applicationData.myTendencies?.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip('myTendencies', chip)}
                        className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-secondary text-white shadow-xs font-bold'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. 희망 상대 성향 6종 */}
              <div className="space-y-2 pt-2 border-t border-surface-container">
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  만나고 싶은 상대의 성향
                </span>
                <div className="flex flex-wrap gap-2">
                  {preferredTendencyChips.map((chip) => {
                    const isSelected = applicationData.preferredTendencies?.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip('preferredTendencies', chip)}
                        className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-tertiary text-white shadow-xs font-bold'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!applicationData.interests?.length}
                  className="h-12 rounded-xl bg-primary text-white font-label-lg text-label-lg font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <span>다음: 식사 옵션</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: 식사 옵션 (권역, 예산 범위, 기피 식재료)           */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col gap-space-md animate-fade-in">
              <div className="flex flex-col gap-1 pb-2 border-b border-surface-container">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  희망 권역 및 식사 옵션
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  알레르기 없는 편안한 식사와 동선을 위해 희망 권역을 선택해 주세요.
                </p>
              </div>

              {/* 1. 권역 선택 */}
              <div className="space-y-2">
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  희망 권역 선택 (중복 가능)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {regionOptions.map((reg) => {
                    const isSelected = applicationData.preferredRegions?.includes(reg.name);
                    return (
                      <div
                        key={reg.id}
                        onClick={() => toggleRegion(reg.name)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-surface-container-high bg-surface-container-lowest hover:border-outline-variant'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            {reg.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            reg.tag === '마감임박' ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {reg.tag}
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant mt-1">
                          {reg.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. 예산 범위 */}
              <div className="space-y-2 pt-2 border-t border-surface-container">
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  선호 1인 식사 예산 (현장 1/N 정산)
                </span>
                <div className="space-y-1.5">
                  {budgetOptions.map((b) => (
                    <label
                      key={b}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        applicationData.budgetRange === b
                          ? 'border-primary bg-primary/5 font-semibold text-primary'
                          : 'border-surface-container-high bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        checked={applicationData.budgetRange === b}
                        onChange={() => setApplicationData({ ...applicationData, budgetRange: b })}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. 기피/알레르기 식재료 */}
              <div className="space-y-2 pt-2 border-t border-surface-container">
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  식이 제한 / 알레르기 식재료
                </span>
                <div className="flex gap-2">
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
                    placeholder="예: 오이, 땅콩, 갑각류, 날생선"
                    className="flex-1 h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => addDietTag(dietInput)}
                    className="px-4 h-11 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors font-bold"
                  >
                    추가
                  </button>
                </div>

                {applicationData.foodRestrictions?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {applicationData.foodRestrictions.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-xs font-semibold"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeDietTag(tag)}
                          className="hover:opacity-70"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-12 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!applicationData.preferredRegions?.length}
                  className="h-12 rounded-xl bg-primary text-white font-label-lg text-label-lg font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <span>다음: 참가권 결제</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: 참가권 결제 (노쇼 방지 보증 결제)                   */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col gap-space-md animate-fade-in">
              <div className="flex flex-col gap-1 pb-2 border-b border-surface-container">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  참가권 선택 및 결제
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  우연한 식탁은 100% 노쇼 방지를 위해 참가권 사전 예치제로 운영됩니다. (미매칭 시 100% 자동 환불)
                </p>
              </div>

              {/* Ticket Pass Options */}
              <div className="space-y-2">
                <div
                  onClick={() => setApplicationData({ ...applicationData, ticketType: '1회 참가권', ticketPrice: 8000 })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    applicationData.ticketPrice === 8000
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-surface-container-high bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      1회 정규 참가권
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      이번 주 목요일 1회 매칭 참여
                    </span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    ₩8,000
                  </span>
                </div>

                <div
                  onClick={() => setApplicationData({ ...applicationData, ticketType: '3회 정기 패스', ticketPrice: 21000 })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between relative overflow-hidden ${
                    applicationData.ticketPrice === 21000
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-surface-container-high bg-surface-container-lowest'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] px-2 py-0.5 rounded-bl font-bold">
                    12% 할인
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      3회 정기 멤버십 패스
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      회당 7,000원 + 우선 매칭 가중치 1.5배
                    </span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    ₩21,000
                  </span>
                </div>
              </div>

              {/* No-show Guarantee Box */}
              <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-1 text-on-surface font-bold">
                  <span className="material-symbols-outlined text-sm text-tertiary">verified_user</span>
                  <span>안심 환불 보장 정책</span>
                </div>
                <p>• 매칭 마감 전(화요일 18시 이전): 위약금 없이 100% 무료 취소 가능</p>
                <p>• AI 매칭 미성사 시: 전액 100% 자동 환불 또는 차주 우선 이월 보장</p>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-xs text-on-surface cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-primary w-4 h-4 rounded"
                />
                <span>우연한 식탁 노쇼 방지 및 에티켓 서약(2일 전 취소 시 이용권 차감)에 동의합니다.</span>
              </label>

              {/* Payment Methods */}
              <div className="space-y-2 pt-2 border-t border-surface-container">
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  간편 결제 수단 선택
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!agreed || isSubmitting}
                    onClick={() => handlePayment('카카오페이')}
                    className="h-12 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-sm flex items-center justify-center gap-1.5 hover:brightness-95 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <span>카카오페이</span>
                  </button>
                  <button
                    type="button"
                    disabled={!agreed || isSubmitting}
                    onClick={() => handlePayment('토스페이')}
                    className="h-12 rounded-xl bg-[#0064FF] text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:brightness-95 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <span>토스페이</span>
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!agreed || isSubmitting}
                  onClick={() => handlePayment('신용카드')}
                  className="w-full h-12 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">credit_card</span>
                  <span>일반 신용 / 체크카드 결제</span>
                </button>
              </div>

              {/* Prev Button */}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-10 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
              >
                이전 단계로
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-1">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              참가 신청이 완료되었습니다! 🎉
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              10월 22일(목) 식탁 AI 매칭이 시작되었습니다.<br />
              마감 후 식당과 테이블 멤버가 공개됩니다.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate('/matching-waiting');
              }}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all"
            >
              매칭 대기 현황 확인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
