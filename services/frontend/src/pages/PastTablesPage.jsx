import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PastTablesPage() {
  const navigate = useNavigate();

  const pastTables = [
    {
      id: 'past-1',
      date: '2026.10.15 (목) 19:30',
      venue: '을지로 레트로 다이닝',
      region: '을지로/종로',
      desc: '내추럴 와인과 모던 한식 타파스 · 4인 테이블',
      members: ['김서연', '이도현', '박지민', '최원우'],
      status: '참석 완료',
      hasReview: true
    },
    {
      id: 'past-2',
      date: '2026.10.08 (목) 19:30',
      venue: '강남 모던 프렌치 비스트로',
      region: '강남/신논현',
      desc: '가을 제철 코스와 캐주얼 페어링 · 4인 테이블',
      members: ['김서연', '정유진', '강민수', '신예진'],
      status: '참석 완료',
      hasReview: true
    },
    {
      id: 'past-3',
      date: '2026.09.24 (목) 19:30',
      venue: '홍대 연남 브리즈 다이닝',
      region: '홍대/합정',
      desc: '이탈리안 생면 파스타 & 내추럴 와인 · 4인 테이블',
      members: ['김서연', '송재혁', '윤하은', '한승우'],
      status: '참석 완료',
      hasReview: true
    }
  ];

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
          {pastTables.map((table) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
