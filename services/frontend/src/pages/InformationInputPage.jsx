import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function InformationInputPage() {
  const navigate = useNavigate();
  const { applicationData, setApplicationData, currentUser, setCurrentUser } = useApp();

  const [step, setStep] = useState(1); // 1: 기본 프로필, 2: 취향/성향, 3: 식사 선호
  const [dietInput, setDietInput] = useState('');
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

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
    { id: 'hongdae', name: '홍대 / 합정', desc: '연남동·상수 비스트로' },
    { id: 'jamsil', name: '잠실 / 송파', desc: '송리단길·석촌호수' },
    { id: 'gangnam', name: '강남 / 신논현', desc: '역삼·서초 연계' },
    { id: 'euljiro', name: '을지로 / 종로', desc: '힙지로·익선동' }
  ];

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

  const handleSaveAll = () => {
    // CurrentUser 동기화
    setCurrentUser((prev) => ({
      ...prev,
      name: applicationData.name || prev.name,
      phone: applicationData.phone || prev.phone,
      instagramId: applicationData.instagramId || prev.instagramId,
      birthYear: applicationData.birthYear || prev.birthYear,
      gender: applicationData.gender || prev.gender,
      job: applicationData.job || prev.job,
      mbti: applicationData.mbti || prev.mbti,
      interests: applicationData.interests || prev.interests,
      myTendencies: applicationData.myTendencies || prev.myTendencies,
      preferredTendencies: applicationData.preferredTendencies || prev.preferredTendencies,
    }));
    setIsSavedModalOpen(true);
  };

  const stepsInfo = [
    { num: 1, title: '기본 정보', sub: '신원 및 프로필' },
    { num: 2, title: '취향·성향', sub: '관심사와 대화 성향' },
    { num: 3, title: '식사 선호', sub: '희망 권역·예산·식단' },
  ];

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-7rem)] pb-24">
      <div className="flex flex-col w-full items-center justify-start py-space-md px-margin sm:px-0">
        <div className="w-full max-w-[480px] flex flex-col gap-space-md">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-base font-bold text-on-surface">
              정보 입력
            </h1>
            <div className="w-9" />
          </div>

          {/* Top Step Progress Bar */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-primary font-bold">
                {step}단계: {stepsInfo[step - 1].title}
              </span>
              <span className="text-on-surface-variant text-[11px]">
                {stepsInfo[step - 1].sub}
              </span>
            </div>

            {/* Progress Track */}
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((i) => (
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
          {/* STEP 1: 기본 정보 (이름, 연락처, 연령대, 직업, MBTI)       */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col gap-space-md animate-fade-in">
              <div className="flex flex-col gap-1 pb-2 border-b border-surface-container">
                <h2 className="font-headline-sm text-base text-on-surface font-bold">
                  본인 확인 및 기본 프로필
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  회원가입 직후 설정하는 기본 정보입니다. 안전한 식탁 운영을 위해 활용되며 마이페이지에서 언제든 수정 가능합니다.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-label-md text-xs text-on-surface font-semibold mb-1">
                    이름 (실명)
                  </label>
                  <input
                    type="text"
                    value={applicationData.name}
                    onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-xs text-on-surface font-semibold mb-1">
                    휴대폰 번호 (매칭 알림 수신용)
                  </label>
                  <input
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-xs text-on-surface font-semibold mb-1">
                    인스타그램 아이디 <span className="text-on-surface-variant text-[11px] font-normal">(안심 신원 검증용, 비공개)</span>
                  </label>
                  <input
                    type="text"
                    value={applicationData.instagramId}
                    onChange={(e) => setApplicationData({ ...applicationData, instagramId: e.target.value })}
                    placeholder="@seoyeon_slowbistro"
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-md text-xs text-on-surface font-semibold mb-1">
                      출생연도
                    </label>
                    <input
                      type="number"
                      value={applicationData.birthYear}
                      onChange={(e) => setApplicationData({ ...applicationData, birthYear: e.target.value })}
                      placeholder="1995"
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-xs text-on-surface font-semibold mb-1">
                      성별
                    </label>
                    <div className="flex gap-2">
                      {['F', 'M'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setApplicationData({ ...applicationData, gender: g })}
                          className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all ${
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-md text-xs text-on-surface font-semibold mb-1">
                      직업/분야
                    </label>
                    <input
                      type="text"
                      value={applicationData.job}
                      onChange={(e) => setApplicationData({ ...applicationData, job: e.target.value })}
                      placeholder="브랜드 디자이너"
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-xs text-on-surface font-semibold mb-1">
                      MBTI
                    </label>
                    <input
                      type="text"
                      value={applicationData.mbti}
                      onChange={(e) => setApplicationData({ ...applicationData, mbti: e.target.value.toUpperCase() })}
                      placeholder="ENFP"
                      maxLength={4}
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!applicationData.name || !applicationData.phone}
                className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-label-lg text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <span>다음: 취향 및 성향 설정</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: 취향 & 대화 성향 (관심사 10종, 내 성향, 상대 성향) */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col gap-space-md animate-fade-in">
              <div className="flex flex-col gap-1 pb-2 border-b border-surface-container">
                <h2 className="font-headline-sm text-base text-on-surface font-bold">
                  취향 및 대화 스타일
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  AI 매칭 엔진이 나와 잘 맞는 4~6인 테이블을 배정하는 핵심 데이터입니다.
                </p>
              </div>

              {/* 1. 관심사 10종 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-xs text-on-surface font-bold">
                    관심사 키워드 (최대 3~4개)
                  </span>
                  <span className="text-[11px] text-primary font-semibold">
                    {applicationData.interests?.length || 0}개 선택됨
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interestChips.map((chip) => {
                    const isSelected = applicationData.interests?.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip('interests', chip)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
                <span className="font-label-md text-xs text-on-surface font-bold block">
                  식탁에서의 나의 성향
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {myTendencyChips.map((chip) => {
                    const isSelected = applicationData.myTendencies?.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip('myTendencies', chip)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
                <span className="font-label-md text-xs text-on-surface font-bold block">
                  만나고 싶은 상대의 성향
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {preferredTendencyChips.map((chip) => {
                    const isSelected = applicationData.preferredTendencies?.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip('preferredTendencies', chip)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!applicationData.interests?.length}
                  className="h-11 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <span>다음: 식사 선호 설정</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: 식사 선호 (선호 권역, 예산, 기피 식재료)           */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col gap-space-md animate-fade-in">
              <div className="flex flex-col gap-1 pb-2 border-b border-surface-container">
                <h2 className="font-headline-sm text-base text-on-surface font-bold">
                  식사 선호 및 주의 식재료
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  선호하는 활동 지역과 알레르기 식재료를 미리 등록해두시면 매칭 시 고려됩니다.
                </p>
              </div>

              {/* 1. 선호 권역 */}
              <div className="space-y-2">
                <span className="font-label-md text-xs text-on-surface font-bold block">
                  주요 활동 권역 (중복 선택)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {regionOptions.map((reg) => {
                    const isSelected = applicationData.preferredRegions?.includes(reg.name);
                    return (
                      <div
                        key={reg.id}
                        onClick={() => toggleRegion(reg.name)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-surface-container-high bg-surface-container-lowest hover:border-outline-variant'
                        }`}
                      >
                        <span className="text-xs font-bold text-on-surface">
                          {reg.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant mt-0.5">
                          {reg.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. 예산 범위 */}
              <div className="space-y-1.5 pt-2 border-t border-surface-container">
                <span className="font-label-md text-xs text-on-surface font-bold block">
                  선호 1인 식사 예산 (현장 1/N 정산)
                </span>
                <div className="space-y-1">
                  {budgetOptions.map((b) => (
                    <label
                      key={b}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
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
                        className="accent-primary w-3.5 h-3.5"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. 기피/알레르기 식재료 */}
              <div className="space-y-1.5 pt-2 border-t border-surface-container">
                <span className="font-label-md text-xs text-on-surface font-bold block">
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
                    className="flex-1 h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => addDietTag(dietInput)}
                    className="px-3 h-10 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-colors"
                  >
                    추가
                  </button>
                </div>

                {applicationData.foodRestrictions?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {applicationData.foodRestrictions.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-[11px] font-semibold"
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

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="h-11 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>내 정보 저장 완료</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Save Completed Modal */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-1">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                task_alt
              </span>
            </div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">
              정보가 안전하게 저장되었습니다!
            </h3>
            <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
              설정하신 취향과 성향을 바탕으로 매주 목요일 최고의 식탁을 매칭해 드립니다. 마이페이지에서 언제든 수정하실 수 있습니다.
            </p>
            <div className="w-full flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSavedModalOpen(false);
                  navigate('/mypage');
                }}
                className="flex-1 h-11 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs"
              >
                마이페이지로
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSavedModalOpen(false);
                  navigate('/');
                }}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-xs shadow-xs"
              >
                홈으로 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
