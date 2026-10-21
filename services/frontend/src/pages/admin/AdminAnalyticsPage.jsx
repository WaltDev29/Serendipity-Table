import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminFeedbackAnalyticsApi } from '../../api/admin';

export default function AdminAnalyticsPage() {
  const [feedbackData, setFeedbackData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const res = await getAdminFeedbackAnalyticsApi();
        setFeedbackData(res);
      } catch (err) {
        console.warn('Failed to load feedback analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const atmosphereRating = feedbackData?.atmosphereRating ? feedbackData.atmosphereRating.toFixed(1) : '-';
  const conversationRating = feedbackData?.conversationRating ? feedbackData.conversationRating.toFixed(1) : '-';
  const venueRating = feedbackData?.venueRating ? feedbackData.venueRating.toFixed(1) : '-';
  const repurchaseRate = feedbackData?.repurchaseRate ? `${feedbackData.repurchaseRate}%` : '-';
  const reviews = feedbackData?.recentReviews || [];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            모임 사후 피드백 통계 (Feedback & Analytics)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            참가자 만족도와 비공개 호감 매트릭스 및 실시간 사후 한줄 리뷰를 모니터링합니다.
          </p>
        </div>
      </div>

      {/* 1. 3대 만족도 메트릭 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>테이블 분위기 만족도</span>
            <span className="material-symbols-outlined text-primary text-[18px]">sentiment_satisfied</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface font-headline-sm">
              {atmosphereRating}
            </span>
            {atmosphereRating !== '-' && <span className="text-xs text-on-surface-variant">/ 5.0</span>}
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: atmosphereRating !== '-' ? `${Math.min(100, (Number(atmosphereRating) / 5) * 100)}%` : '0%' }}
            />
          </div>
          <span className="text-[11px] text-tertiary font-semibold block">
            {atmosphereRating !== '-' ? '실제 피드백 기반 평점' : '피드백 수집 대기 중'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>대화 소통 케미 만족도</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">forum</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface font-headline-sm">
              {conversationRating}
            </span>
            {conversationRating !== '-' && <span className="text-xs text-on-surface-variant">/ 5.0</span>}
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all"
              style={{ width: conversationRating !== '-' ? `${Math.min(100, (Number(conversationRating) / 5) * 100)}%` : '0%' }}
            />
          </div>
          <span className="text-[11px] text-secondary font-semibold block">
            {conversationRating !== '-' ? '실제 피드백 기반 평점' : '피드백 수집 대기 중'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>식당 맛 & 서비스 만족도</span>
            <span className="material-symbols-outlined text-tertiary text-[18px]">restaurant</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface font-headline-sm">
              {venueRating}
            </span>
            {venueRating !== '-' && <span className="text-xs text-on-surface-variant">/ 5.0</span>}
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-tertiary rounded-full transition-all"
              style={{ width: venueRating !== '-' ? `${Math.min(100, (Number(venueRating) / 5) * 100)}%` : '0%' }}
            />
          </div>
          <span className="text-[11px] text-tertiary font-semibold block">
            {venueRating !== '-' ? '실제 피드백 기반 평점' : '피드백 수집 대기 중'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>재참여 희망률</span>
            <span className="material-symbols-outlined text-primary text-[18px]">repeat</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-primary font-headline-sm">
              {repurchaseRate}
            </span>
            {repurchaseRate !== '-' && <span className="text-xs text-on-surface-variant">희망</span>}
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: repurchaseRate !== '-' ? repurchaseRate : '0%' }}
            />
          </div>
          <span className="text-[11px] text-primary font-semibold block">
            {repurchaseRate !== '-' ? '모임 후 지속 참여 의향' : '데이터 수집 대기 중'}
          </span>
        </div>
      </div>

      {/* 2. Secret Chemistry Matrix & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Left: 비공개 선호/회피 매트릭스 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div>
              <h2 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">diversity_1</span>
                <span>비공개 호감 & 회피 매트릭스</span>
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                사후 피드백에서 지목된 결과가 AI 매칭 알고리즘의 네거티브/포지티브 제약으로 자동 주입됩니다.
              </p>
            </div>
            <Link
              to="/admin/analytics/preferences"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
            >
              <span>전체 목록</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {feedbackData?.favoriteUsers && feedbackData.favoriteUsers.length > 0 ? (
              <div className="p-3 rounded-xl bg-tertiary/5 border border-tertiary/20 flex items-start justify-between">
                <div>
                  <span className="font-bold text-tertiary flex items-center gap-1 text-xs">
                    <span className="material-symbols-outlined text-[15px]">favorite</span>
                    "다시 만나고 싶은 사람" 최다 지목
                  </span>
                  <p className="text-on-surface mt-1 font-semibold">
                    {feedbackData.favoriteUsers.join(' · ')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-center">
                아직 누적된 호감 지목 내역이 없습니다.
              </div>
            )}

            {feedbackData?.avoidedPairs && feedbackData.avoidedPairs.length > 0 ? (
              <div className="p-3 rounded-xl bg-error/5 border border-error/20 flex items-start justify-between">
                <div>
                  <span className="font-bold text-error flex items-center gap-1 text-xs">
                    <span className="material-symbols-outlined text-[15px]">block</span>
                    "다시 만나기 싫은 사람" 상호 배제 등록
                  </span>
                  <p className="text-on-surface mt-1 font-semibold">
                    {feedbackData.avoidedPairs.join(', ')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-center">
                등록된 상호 배제 대상이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right: 참가자 익명 한줄평 피드백 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <h2 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">rate_review</span>
              <span>실시간 사후 한줄 리뷰 피드</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-tertiary font-bold">
                {reviews.length > 0 ? `최신 ${reviews.length}건` : '리뷰 0건'}
              </span>
              <Link
                to="/admin/analytics/reviews"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span>전체 목록</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {reviews.length > 0 ? (
              reviews.map((rev, i) => (
                <div key={rev.id || i} className="p-2.5 rounded-xl bg-surface-container-low">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-primary text-[11px]">{rev.table}</span>
                    <span className="text-secondary font-bold text-[11px]">
                      {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                    </span>
                  </div>
                  <p className="text-on-surface text-[11px] leading-relaxed">"{rev.text}"</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-outline-variant">reviews</span>
                <span>아직 등록된 모임 후기 리뷰가 없습니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
