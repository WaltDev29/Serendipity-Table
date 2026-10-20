import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SurveyPage() {
  const navigate = useNavigate();
  const { applicationData, setApplicationData } = useApp();

  const [step, setStep] = useState(1); // 1: 기본 인적사항, 2: 취향 & 성향

  // 10종 관심사
  const interestOptions = [
    '맛집·카페 탐방', '전시·공연', '음악', '영화·드라마', '여행',
    '운동 (헬스/러닝)', '독서·글쓰기', '사진·영상', '패션·뷰티', '자기계발·공부'
  ];

  // 6종 본인 성향
  const myTendencyOptions = [
    '경청을 잘 함', '잔잔하고 조용한 편', '깊은 대화를 좋아함',
    '활기차고 에너지 있는 편', '이야기를 이끄는 편', '가볍고 유머 있는 편'
  ];

  // 6종 희망 상대 스타일
  const preferredTendencyOptions = [
    '깊은 대화가 되는 사람', '나와 비슷한 사람', '편하고 유머 있는 사람',
    '다른 자극을 주는 사람', '열정 있는 사람', '잔잔하고 안정적인 사람'
  ];

  const mbtiList = [
    'ENFP', 'ENFJ', 'ENTP', 'ENTJ', 'ESFP', 'ESFJ', 'ESTP', 'ESTJ',
    'INFP', 'INFJ', 'INTP', 'INTJ', 'ISFP', 'ISFJ', 'ISTP', 'ISTJ'
  ];

  const toggleArrayItem = (field, item) => {
    setApplicationData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!applicationData.name || !applicationData.phone || !applicationData.instagramId) {
        alert('필수 인적사항(이름, 연락처, 인스타그램 ID)을 입력해주세요.');
        return;
      }
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      if ((applicationData.interests || []).length === 0) {
        alert('관심사를 최소 1개 이상 선택해주세요.');
        return;
      }
      navigate('/booking');
    }
  };

  return (
    <div className="w-full flex justify-center py-4 sm:py-6 px-3 sm:px-4">
      <div className="w-full max-w-[460px] flex flex-col gap-6 pb-28">
        
        {/* Step Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (step === 2 ? setStep(1) : navigate('/'))}
              className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <span className="font-label-lg text-sm text-on-surface font-bold">
              참가 신청서 작성 ({step}/2)
            </span>
            <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
              안심 검증
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* ================= STEP 1: 기본 인적사항 ================= */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
              <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
                실명 및 인스타그램 기반으로 본인 확인이 진행되며, 테이블 매칭 시에는 <strong className="text-on-surface">익명 닉네임과 성향</strong>만 공개됩니다.
              </p>
            </div>

            <div className="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface flex justify-between">
                  <span>이름 (실명) <span className="text-primary">*</span></span>
                  <span className="text-tertiary text-[11px]">신분 확인용</span>
                </label>
                <input
                  type="text"
                  value={applicationData.name}
                  onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                  placeholder="실명을 입력해주세요"
                  className="h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">
                  연락처 <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  value={applicationData.phone}
                  onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[11px] text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">info</span>
                  카카오 알림톡 및 매칭 안내 발송용으로 정확히 입력해주세요.
                </span>
              </div>

              {/* Instagram ID */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface flex justify-between">
                  <span>인스타그램 ID <span className="text-primary">*</span></span>
                  <span className="text-on-surface-variant text-[11px]">비공개 계정 가능</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-outline text-sm">@</span>
                  <input
                    type="text"
                    value={applicationData.instagramId}
                    onChange={(e) => setApplicationData({ ...applicationData, instagramId: e.target.value })}
                    placeholder="instagram_id"
                    className="w-full h-11 pl-8 pr-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Birth Year & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">출생연도</label>
                  <select
                    value={applicationData.birthYear}
                    onChange={(e) => setApplicationData({ ...applicationData, birthYear: e.target.value })}
                    className="h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002].map((y) => (
                      <option key={y} value={y}>{y}년생</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">성별</label>
                  <div className="grid grid-cols-2 gap-2 h-11">
                    <button
                      type="button"
                      onClick={() => setApplicationData({ ...applicationData, gender: 'M' })}
                      className={`rounded-xl text-xs font-bold transition-all ${
                        applicationData.gender === 'M'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      남성
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplicationData({ ...applicationData, gender: 'F' })}
                      className={`rounded-xl text-xs font-bold transition-all ${
                        applicationData.gender === 'F'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      여성
                    </button>
                  </div>
                </div>
              </div>

              {/* Job */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">직업 (구체적으로)</label>
                <input
                  type="text"
                  value={applicationData.job}
                  onChange={(e) => setApplicationData({ ...applicationData, job: e.target.value })}
                  placeholder="예) 브랜드 디자이너, 프론트엔드 개발자"
                  className="h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* MBTI Grid */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">MBTI</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {mbtiList.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setApplicationData({ ...applicationData, mbti: m })}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        applicationData.mbti === m
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: 취향 & 성향 ================= */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Interests */}
            <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  01. 요즘 나의 관심사는? <span className="text-primary">*</span>
                </h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant">첫 대화를 열어줄 공통 관심사를 골라주세요 (복수 선택)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((item) => {
                  const selected = (applicationData.interests || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem('interests', item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-primary-fixed text-primary border border-primary/30 font-bold shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '} {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* My Tendencies */}
            <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  02. 나는 테이블에서 어떤 사람인가요?
                </h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant">나의 편안한 대화 스타일을 골라주세요</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {myTendencyOptions.map((item) => {
                  const selected = (applicationData.myTendencies || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem('myTendencies', item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary/30 font-bold shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '} {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Tendencies */}
            <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container">
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  03. 어떤 분들과 함께하고 싶나요?
                </h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant">선호하는 대화 파트너 분위기를 선택해주세요</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferredTendencyOptions.map((item) => {
                  const selected = (applicationData.preferredTendencies || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem('preferredTendencies', item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/30 font-bold shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '} {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Next CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-surface-container flex justify-center z-30">
          <button
            onClick={handleNext}
            className="w-full max-w-[460px] h-12 rounded-xl bg-primary text-on-primary font-label-lg text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{step === 1 ? '다음 단계 (성향/취향 선택)' : '다음 단계 (일정/결제 선택)'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}
