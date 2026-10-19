import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { matchResult, userState, setUserState } = useApp();

  const [ratings, setRatings] = useState({
    atmos: 5,
    conv: 5,
    food: 5
  });
  const [reviewText, setReviewText] = useState('');
  const [preferRematch, setPreferRematch] = useState(true);
  const [blockSomeone, setBlockSomeone] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(userState === 'FEEDBACK_DONE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setRating = (dimension, value) => {
    setRatings(prev => ({ ...prev, [dimension]: value }));
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setUserState('FEEDBACK_DONE');
    }, 600);
  };

  const handleQuickReapply = () => {
    alert('🎉 단골 우대 1초 재신청 완료! 기존 프로필로 10월 29일(목) 식탁 1순위 신청되었습니다.');
    navigate('/matching-waiting');
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col w-full items-center justify-start pb-24">
        
        {/* Mobile Container (Max 480px on Desktop) */}
        <div className="w-full max-w-[480px] px-space-md sm:px-gutter-md flex flex-col gap-space-lg">
          
          {/* Top Action Bar */}
          <header className="flex items-center justify-between pt-space-sm">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="뒤로가기"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-headline-sm text-on-surface text-center font-bold">
              {isSubmitted ? '피드백 완료 & 다음 모임 신청' : '모임 사후 피드백'}
            </h1>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="닫기"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </header>

          {!isSubmitted ? (
            /* ==================================================== */
            /* FORM STATE: 별점 평가 및 피드백 작성                  */
            /* ==================================================== */
            <div className="flex flex-col gap-space-md">
              {/* Self Check-in Banner */}
              <div className="bg-tertiary-container text-on-tertiary-container rounded-xl p-space-md shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-on-tertiary-container/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      restaurant
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-80">Venue Arrival</span>
                    <span className="font-headline-sm text-headline-sm font-bold">식당 모임 완료!</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-lowest/20 backdrop-blur-sm px-space-sm py-1.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>참석 확인됨 ✓</span>
                </div>
              </div>

              {/* Dining Context Badge Card */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative">
                  <img
                    className="w-full h-full object-cover"
                    src={matchResult.venue.image}
                    alt={matchResult.venue.name}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                      {matchResult.venue.name}
                    </span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">테이블 A (4인)</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate mt-0.5 font-bold">
                    {matchResult.tableName}
                  </h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {matchResult.eventDate}
                  </span>
                </div>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleFeedbackSubmit} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
                <div className="text-center flex flex-col items-center">
                  <span className="text-secondary font-label-sm text-label-sm font-semibold uppercase tracking-wider mb-1">
                    Serendipity Review
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                    오늘 우연한 식탁은 어떠셨나요?
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    남겨주신 피드백은 더 만족스러운 다음 식탁 매칭에 소중히 반영됩니다.
                  </p>
                </div>

                {/* 3-Dimension Star Ratings */}
                <div className="flex flex-col gap-space-md bg-surface-container-low p-space-md rounded-xl">
                  {/* Dimension 1: Atmosphere */}
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">1. 테이블 전체 분위기</span>
                      <span className="font-label-md text-label-md text-primary font-bold">{ratings.atmos}.0 / 5.0</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating('atmos', star)}
                            className="focus:outline-none"
                          >
                            <span
                              className="material-symbols-outlined text-[28px]"
                              style={{ fontVariationSettings: star <= ratings.atmos ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {ratings.atmos === 5 ? '더할 나위 없었어요' : ratings.atmos >= 3 ? '편안했어요' : '아쉬웠어요'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-surface-container-highest"></div>

                  {/* Dimension 2: Conversation */}
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">2. 대화 및 소통 만족도</span>
                      <span className="font-label-md text-label-md text-primary font-bold">{ratings.conv}.0 / 5.0</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating('conv', star)}
                            className="focus:outline-none"
                          >
                            <span
                              className="material-symbols-outlined text-[28px]"
                              style={{ fontVariationSettings: star <= ratings.conv ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {ratings.conv === 5 ? '이야기가 풍성했어요' : ratings.conv >= 3 ? '적당했어요' : '어색했어요'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-surface-container-highest"></div>

                  {/* Dimension 3: Food & Service */}
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">3. 식당의 맛과 서비스</span>
                      <span className="font-label-md text-label-md text-primary font-bold">{ratings.food}.0 / 5.0</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating('food', star)}
                            className="focus:outline-none"
                          >
                            <span
                              className="material-symbols-outlined text-[28px]"
                              style={{ fontVariationSettings: star <= ratings.food ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {ratings.food === 5 ? '정말 맛있었어요' : ratings.food >= 3 ? '괜찮았어요' : '보통 이하'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Review */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="review-text">
                      솔직한 다이닝 후기
                    </label>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">자유 작성</span>
                  </div>
                  <textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="식당 맛과 오늘 모임 대화에 대한 솔직한 후기를 남겨주세요. 함께한 멤버들에게 따뜻한 응원이 됩니다."
                    className="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm resize-none"
                  ></textarea>
                </div>

                {/* Private Chemistry Matching Checkboxes */}
                <div className="bg-surface-container-high/60 rounded-xl p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-lg">shield_lock</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">비공개 매칭 알고리즘 선호도 반영</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    이 선택은 상대방에게 일절 공개되지 않으며, 서버에서 다음 매칭 조율에만 은밀히 사용됩니다.
                  </p>
                  
                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    {/* Prefer Option */}
                    <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest cursor-pointer shadow-sm">
                      <input
                        type="checkbox"
                        checked={preferRematch}
                        onChange={(e) => setPreferRematch(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded accent-primary cursor-pointer shrink-0"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">다음 모임에서 다시 만나고 싶은 멤버</span>
                          <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">우선 매칭</span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          서로 희망 시 향후 테이블에 우선 자동 편성됩니다. (민트초코, 책방지기 님 등)
                        </span>
                      </div>
                    </label>

                    {/* Block Option */}
                    <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest cursor-pointer shadow-sm">
                      <input
                        type="checkbox"
                        checked={blockSomeone}
                        onChange={(e) => setBlockSomeone(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded accent-primary cursor-pointer shrink-0"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">다시 만나고 싶지 않은 분</span>
                          <span className="px-1.5 py-0.2 rounded bg-error-container text-on-error-container font-label-sm text-label-sm">100% 영구 분리</span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          사유를 묻지 않고 영구적으로 같은 테이블 배정에서 제외 보장합니다.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary-container hover:text-on-primary font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-space-xs transition-all shadow-md font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      <span>피드백 전송 중...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <span>소중한 피드백 제출하기</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm px-space-md text-center">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>모든 후기와 별점 평가는 암호화 처리되며 익명으로 관리됩니다.</span>
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* SUBMITTED STATE: 후기 등록 완료 + 1초 재신청 카드      */
            /* ==================================================== */
            <div className="flex flex-col gap-space-lg">
              
              {/* Celebration Card */}
              <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-space-md shadow-sm">
                    <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-space-xs font-bold">
                    Feedback Confirmed
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs font-bold leading-tight">
                    소중한 후기가 등록되었습니다!<br />감사합니다 ❤️
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-space-xs">
                    보내주신 피드백은 상대방에게 익명으로 안전하게 처리되며, 알고리즘 매칭 품질 개선에 즉시 반영됩니다.
                  </p>

                  {/* Rating Tags Pills */}
                  <div className="w-full mt-space-lg pt-space-md bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between text-on-surface">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">내가 남긴 오늘의 식탁 만족도</span>
                      <span className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary font-bold">
                        <span className="material-symbols-outlined text-sm">verified</span> 반영 완료
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-space-xs">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm">
                        <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        테이블 분위기 <strong className="text-primary font-bold">{ratings.atmos}.0</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm">
                        <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        대화 소통 <strong className="text-primary font-bold">{ratings.conv}.0</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm">
                        <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        식당 맛 <strong className="text-primary font-bold">{ratings.food}.0</strong>
                      </span>
                    </div>

                    {/* Secret Match Pill */}
                    <div className="flex items-center gap-space-xs bg-tertiary-fixed/40 text-on-tertiary-fixed-variant px-3 py-2 rounded-lg mt-space-xs">
                      <span className="material-symbols-outlined text-base text-tertiary">lock_person</span>
                      <span className="font-body-sm text-body-sm leading-snug">
                        비공개 선호도: <strong className="font-semibold text-tertiary">다시 만나고 싶은 멤버</strong> 우선 매칭 등록됨
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Visual Memory Snippet */}
              <section className="relative rounded-xl overflow-hidden bg-surface-container-low shadow-sm">
                <div className="relative h-28 w-full">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${matchResult.venue.image}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">local_dining</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {matchResult.venue.name} 식탁
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">모임 완료</span>
                  </div>
                </div>
              </section>

              {/* RETENTION CARD: 단골 우대 1초 재신청 */}
              <section className="relative rounded-xl bg-gradient-to-b from-primary-fixed/40 via-surface-container-lowest to-surface-container-lowest p-space-md shadow-md border border-primary/20">
                <div className="absolute top-0 right-1/4 w-36 h-24 bg-primary-container/10 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-sm">
                    <span className="material-symbols-outlined text-sm">local_fire_department</span>
                    단골 우대 1초 재신청
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    우선 배정 권한 활성화
                  </span>
                </div>

                <div className="mb-space-md">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    다음 주 목요일에도<br />따뜻한 식탁이 열려요!
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    번거로운 설문 작성 없이, 오늘 축적된 취향 그대로 식탁을 예약하세요.
                  </p>
                </div>

                {/* Recommended Slot Sub-card */}
                <div className="rounded-xl bg-surface-container-low p-space-md mb-space-md flex flex-col gap-space-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">추천 다이닝 슬롯</span>
                      <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-xl">event_available</span>
                        10월 29일 (목) 19:30
                      </div>
                      <span className="font-label-md text-label-md text-secondary font-semibold mt-0.5">
                        홍대 / 합정 권역 (감성 비스트로 &amp; 타파스)
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded font-label-sm text-label-sm">
                      D-7
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest rounded-lg p-space-sm flex items-start gap-space-xs shadow-sm">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">auto_awesome</span>
                    <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                      오늘 입력하신 <strong>성향과 피드백</strong>을 바탕으로 더욱 잘 맞는 분들과 매칭해 드립니다.
                    </p>
                  </div>

                  <div className="bg-secondary-fixed/50 text-on-secondary-fixed rounded-lg p-space-sm flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-base">card_membership</span>
                      <span className="font-label-md text-label-md font-bold">재참여 멤버 매칭 가중치 1.5배</span>
                    </div>
                    <span className="font-label-sm text-label-sm bg-surface-container-lowest px-2 py-0.5 rounded-full text-secondary font-bold">
                      보유 참가권 사용
                    </span>
                  </div>
                </div>

                {/* 1-Second Reapply Button */}
                <button
                  type="button"
                  onClick={handleQuickReapply}
                  className="w-full h-14 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-on-primary font-label-lg text-label-lg shadow-md cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-xl">bolt</span>
                  <span>동일 프로필로 다음 주 1초 신청하기</span>
                </button>
              </section>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
