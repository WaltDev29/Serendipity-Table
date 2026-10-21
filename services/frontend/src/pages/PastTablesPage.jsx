import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPastTablesApi } from '../api/table';

export default function PastTablesPage() {
  const navigate = useNavigate();

  const [pastTables, setPastTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPast = async () => {
      try {
        setLoading(true);
        const res = await getMyPastTablesApi();
        if (Array.isArray(res)) {
          setPastTables(res.map(p => ({
            id: p.tableId,
            date: `${p.eventDate} (목) 19:30`,
            venue: p.venueName || '추천 다이닝',
            region: p.region,
            desc: `${p.region} 4인 식탁 모임`,
            members: (p.members || []).map(m => m.nickname),
            status: '참석 완료',
            hasReview: p.hasReview || false
          })));
        }
      } catch (e) {
        console.warn('Failed to load past tables:', e);
      } finally {
        setLoading(false);
      }
    };
    loadPast();
  }, []);

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-4rem)] flex justify-center py-space-md px-margin sm:px-0">
      <div className="w-full max-w-[450px] flex flex-col gap-space-md pb-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h1 className="font-headline-sm text-base font-bold text-on-surface">
            지난 식탁 다이어리
          </h1>
          <div className="w-9" />
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-on-surface-variant font-semibold">
            내가 참여했던 따뜻한 식탁 기록입니다.
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold">
            총 {pastTables.length}회 참여
          </span>
        </div>

        {/* List of Past Tables */}
        <div className="space-y-3">
          {pastTables.length === 0 ? (
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container text-center flex flex-col items-center gap-3 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">history_edu</span>
              </div>
              <p className="font-headline-sm text-sm font-bold text-on-surface">아직 완료된 지난 식탁이 없습니다</p>
              <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                목요일 밤 우연한 식탁에 참여하고 소중한 인연들과의 다이닝 추억을 남겨보세요.
              </p>
              <button
                type="button"
                onClick={() => navigate('/booking')}
                className="mt-2 px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all"
              >
                이번 주 식탁 신청하기
              </button>
            </div>
          ) : (
            pastTables.map((table) => (
            <div
              key={table.id}
              className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                  <span>{table.date}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[10px]">
                  {table.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  {table.venue}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-[11px] font-semibold">
                  {table.region}
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                {table.desc}
              </p>

              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-outline">
                  <span className="material-symbols-outlined text-[14px]">groups</span>
                  <span>함께한 멤버: {table.members.join(', ')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/feedback')}
                  className="text-primary font-bold hover:underline flex items-center gap-0.5 text-xs"
                >
                  <span>후기 열람</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
