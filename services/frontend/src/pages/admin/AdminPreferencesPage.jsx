import React, { useState, useEffect } from 'react';
import { getAdminPreferenceEvaluationsApi } from '../../api/admin';

export default function AdminPreferencesPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, PREFER, AVOID
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchEvaluations = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminPreferenceEvaluationsApi();
      setEvaluations(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Failed to load preference evaluations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const filteredList = evaluations.filter((item) => {
    const itemType = item.type || item.evaluationType;
    if (typeFilter !== 'ALL' && itemType !== typeFilter) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchName = (item.userName || '').toLowerCase().includes(q);
      const matchTarget = (item.targetUserName || '').toLowerCase().includes(q);
      const matchPhone = (item.userPhone || item.phone || '').includes(q);
      return matchName || matchTarget || matchPhone;
    }
    return true;
  });

  const preferCount = evaluations.filter((e) => (e.type || e.evaluationType) === 'PREFER').length;
  const avoidCount = evaluations.filter((e) => (e.type || e.evaluationType) === 'AVOID').length;

  return (
    <div className="flex flex-col w-full space-y-space-md">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-lg font-bold text-on-surface">
              선호 & 비선호 평가 관리
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              총 {evaluations.length}건
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            모임 후 참가자가 제출한 비공개 호감("다시 만나고 싶음") 및 비선호("다시 만나기 싫음") 내역 목록입니다.
          </p>
        </div>

        <button
          onClick={fetchEvaluations}
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
            <span className="text-xs text-on-surface-variant font-medium">전체 평가 건수</span>
            <p className="text-2xl font-bold text-on-surface mt-0.5">{evaluations.length}건</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">checklist</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-medium">선호 (다시 만나고 싶음)</span>
            <p className="text-2xl font-bold text-secondary mt-0.5">{preferCount}건</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">favorite</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
          <div>
            <span className="text-xs text-error font-medium">비선호 (상호 배제)</span>
            <p className="text-2xl font-bold text-error mt-0.5">{avoidCount}건</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[20px]">block</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant">구분:</span>
          <div className="inline-flex rounded-lg border border-surface-container p-0.5 bg-surface-container-low text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              전체 ({evaluations.length})
            </button>
            <button
              onClick={() => setTypeFilter('PREFER')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                typeFilter === 'PREFER'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              선호 ({preferCount})
            </button>
            <button
              onClick={() => setTypeFilter('AVOID')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                typeFilter === 'AVOID'
                  ? 'bg-error text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-error'
              }`}
            >
              비선호 ({avoidCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="회원 이름, 대상 회원, 전화번호 검색"
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
                <th className="py-2.5 px-3">구분</th>
                <th className="py-2.5 px-4">대상 회원</th>
                <th className="py-2.5 px-4">모임 날짜</th>
                <th className="py-2.5 px-4 text-right">상세 라벨</th>
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
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline-variant">
                      inbox
                    </span>
                    <p className="mt-2 font-medium">평가 내역이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isPrefer = (item.type || item.evaluationType) === 'PREFER';
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

                      {/* 구분 (선호, 비선호) */}
                      <td className="py-3 px-3">
                        {isPrefer ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary/15 text-secondary">
                            <span className="material-symbols-outlined text-[13px]">favorite</span>
                            선호
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-error/15 text-error">
                            <span className="material-symbols-outlined text-[13px]">block</span>
                            비선호
                          </span>
                        )}
                      </td>

                      {/* 대상 회원 */}
                      <td className="py-3 px-4 font-bold text-on-surface">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-outline">
                            person
                          </span>
                          <span>{item.targetUserName || '-'}</span>
                        </div>
                      </td>

                      {/* 모임 날짜 */}
                      <td className="py-3 px-4 text-on-surface-variant">
                        {item.eventDate || '-'}
                      </td>

                      {/* 상세 라벨 */}
                      <td className="py-3 px-4 text-right text-on-surface-variant">
                        <span className="inline-block max-w-[200px] truncate text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface">
                          {item.typeLabel || (isPrefer ? '선호 (다시 만나고 싶음)' : '비선호 (상호 배제)')}
                        </span>
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
