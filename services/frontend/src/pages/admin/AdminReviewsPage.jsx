import React, { useState, useEffect } from 'react';
import { getAdminReviewsApi } from '../../api/admin';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('ALL'); // ALL, 5, 4, 3, 2, 1
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminReviewsApi();
      setReviews(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((item) => {
    if (ratingFilter !== 'ALL' && item.rating !== Number(ratingFilter)) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchName = (item.userName || '').toLowerCase().includes(q);
      const matchPhone = (item.userPhone || item.phone || '').includes(q);
      const matchComment = (item.comment || '').toLowerCase().includes(q);
      const matchTable = (item.tableName || item.venueName || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchComment || matchTable;
    }
    return true;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, cur) => acc + (cur.rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="flex flex-col w-full space-y-space-md">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-lg font-bold text-on-surface">
              모임 리뷰 관리
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              총 {reviews.length}건
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            참가자가 식사 모임 종료 후 남긴 실시간 사후 한줄 리뷰 및 평점 목록입니다.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-container-high bg-surface-container-lowest text-xs font-semibold hover:bg-surface-container text-on-surface transition-all shadow-xs"
        >
          <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          새로고침
        </button>
      </div>

      {/* 2. Summary Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-medium">전체 리뷰 건수</span>
            <p className="text-2xl font-bold text-on-surface mt-0.5">{reviews.length}건</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">rate_review</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
          <div>
            <span className="text-xs text-primary font-medium">평균 만족도 평점</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-primary">{avgRating}</span>
              <span className="text-xs text-on-surface-variant">/ 5.0</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">star</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-medium">최고 평점 (5점) 비율</span>
            <p className="text-2xl font-bold text-secondary mt-0.5">
              {reviews.length > 0
                ? `${Math.round((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100)}%`
                : '0%'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">sentiment_very_satisfied</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant">평점 필터:</span>
          <div className="inline-flex rounded-lg border border-surface-container p-0.5 bg-surface-container-low text-xs">
            {['ALL', '5', '4', '3', '2', '1'].map((val) => (
              <button
                key={val}
                onClick={() => setRatingFilter(val)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  ratingFilter === val
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {val === 'ALL' ? '전체' : `★${val}`}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="회원 이름, 전화번호, 리뷰 내용 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* 4. Table List */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-on-surface-variant font-semibold">
                <th className="py-2.5 px-4">회원 이름</th>
                <th className="py-2.5 px-3">성별</th>
                <th className="py-2.5 px-3">나이</th>
                <th className="py-2.5 px-4">전화번호</th>
                <th className="py-2.5 px-4">모임 날짜</th>
                <th className="py-2.5 px-3">평점</th>
                <th className="py-2.5 px-4">리뷰 내용</th>
                <th className="py-2.5 px-4 text-right">테이블/식당</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">
                      progress_activity
                    </span>
                    <p className="mt-2">데이터를 불러오는 중입니다...</p>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline-variant">
                      reviews
                    </span>
                    <p className="mt-2 font-medium">등록된 리뷰가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((item) => {
                  const genderText = item.userGender || item.gender || '-';
                  const ageText = item.userAge || item.age;
                  const phoneText = item.userPhone || item.phone || '-';

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                      {/* 회원 이름 */}
                      <td className="py-3 px-4 font-bold text-on-surface">
                        {item.userName}
                      </td>

                      {/* 성별 */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            genderText.includes('남') || genderText === 'M'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {genderText.includes('남') || genderText === 'M' ? '남성' : '여성'}
                        </span>
                      </td>

                      {/* 나이 */}
                      <td className="py-3 px-3 font-medium text-on-surface-variant">
                        {ageText ? `${ageText}세` : '-'}
                      </td>

                      {/* 전화번호 */}
                      <td className="py-3 px-4 text-on-surface-variant font-mono">
                        {phoneText}
                      </td>

                      {/* 모임 날짜 */}
                      <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                        {item.eventDate || '-'}
                      </td>

                      {/* 평점 */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <span className="text-[11px]">★ {item.rating || 5}</span>
                        </div>
                      </td>

                      {/* 리뷰 내용 */}
                      <td className="py-3 px-4 text-on-surface font-medium leading-relaxed max-w-[340px]">
                        {item.comment ? (
                          <p className="line-clamp-2">"{item.comment}"</p>
                        ) : (
                          <span className="text-outline-variant italic">별도 코멘트 없음</span>
                        )}
                      </td>

                      {/* 테이블/식당 */}
                      <td className="py-3 px-4 text-right text-on-surface-variant whitespace-nowrap">
                        {item.tableName || item.venueName ? (
                          <span className="text-xs font-medium text-on-surface bg-surface-container px-2 py-0.5 rounded">
                            {item.tableName || item.venueName}
                          </span>
                        ) : (
                          <span className="text-outline-variant">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
