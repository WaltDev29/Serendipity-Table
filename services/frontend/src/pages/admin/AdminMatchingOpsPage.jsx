import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminMatchingOpsPage() {
  const {
    matchingTables,
    triggerAiMatching,
    swapMembers,
    confirmFinalMatching
  } = useAdmin();

  // 권역 필터
  const [selectedRegionTab, setSelectedRegionTab] = useState('ALL');

  // AI 가중치 슬라이더 상태
  const [weights, setWeights] = useState({
    gender: 30,
    age: 25,
    interests: 25,
    tendency: 20
  });

  // 수동 스왑 선택 상태: { tableId, memberId, memberName }
  const [swapSource, setSwapSource] = useState(null);

  // 최종 확정 모달 상태 (M-04)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState('');

  // 스왑 클릭 핸들러
  const handleMemberClick = (tableId, member) => {
    if (!swapSource) {
      // 1단계: 첫 번째 참가자 선택
      setSwapSource({ tableId, memberId: member.id, memberName: member.name, gender: member.gender });
    } else {
      // 2단계: 두 번째 참가자 선택 (같은 사람이면 취소, 다른 테이블이면 스왑 실행)
      if (swapSource.tableId === tableId && swapSource.memberId === member.id) {
        setSwapSource(null);
        return;
      }
      swapMembers(swapSource.tableId, swapSource.memberId, tableId, member.id);
      setSwapSource(null);
    }
  };

  const filteredTables = matchingTables.filter((t) => {
    if (selectedRegionTab === 'ALL') return true;
    return t.region.includes(selectedRegionTab);
  });

  const avgHarmony = Math.round(
    matchingTables.reduce((acc, cur) => acc + cur.harmonyScore, 0) / matchingTables.length
  );

  const unbalancedCount = matchingTables.filter((t) => !t.isBalanced).length;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            AI 매칭 모니터 및 수동 개입 (Matching Ops & Manual Override)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            AI 매칭 엔진 결과를 검증하고, 테이블 간 참가자를 원클릭으로 스왑하여 최적의 밸런스를 구성합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerAiMatching}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>AI 자동 매칭 재가동</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-tertiary text-white text-xs font-bold shadow-md hover:bg-tertiary-container transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>최종 확정 및 공표</span>
          </button>
        </div>
      </div>

      {/* 1. Control Toolbar: 가중치 튜닝 & 권역 탭 */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-3">
        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-3 border-b border-surface-container">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-on-surface">남녀 성비 균형 (2:2)</span>
              <span className="text-primary font-bold">{weights.gender}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.gender}
              onChange={(e) => setWeights({ ...weights, gender: Number(e.target.value) })}
              className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-on-surface">연령대 유사도 (±3세)</span>
              <span className="text-secondary font-bold">{weights.age}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.age}
              onChange={(e) => setWeights({ ...weights, age: Number(e.target.value) })}
              className="w-full accent-secondary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-on-surface">관심사 키워드 일치</span>
              <span className="text-tertiary font-bold">{weights.interests}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.interests}
              onChange={(e) => setWeights({ ...weights, interests: Number(e.target.value) })}
              className="w-full accent-tertiary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-on-surface">대화 및 소통 성향 케미</span>
              <span className="text-on-surface-variant font-bold">{weights.tendency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.tendency}
              onChange={(e) => setWeights({ ...weights, tendency: Number(e.target.value) })}
              className="w-full accent-on-surface-variant h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Region Tabs & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: '전체 (38개 조)' },
              { id: '홍대', label: '홍대/합정' },
              { id: '잠실', label: '잠실/송파' },
              { id: '강남', label: '강남/신논현' },
              { id: '을지로', label: '을지로/종로' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRegionTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedRegionTab === tab.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-on-surface-variant">
              평균 조화도: <strong className="text-tertiary font-bold text-sm">{avgHarmony}점</strong>
            </span>
            <span className="text-on-surface-variant">|</span>
            <span className={unbalancedCount > 0 ? 'text-error font-bold' : 'text-tertiary font-bold'}>
              {unbalancedCount > 0 ? `⚠️ 불균형/미달 테이블: ${unbalancedCount}건` : '✓ 전 테이블 성비 완벽'}
            </span>
          </div>
        </div>
      </div>

      {/* Swap In-Progress Banner */}
      {swapSource && (
        <div className="bg-secondary-fixed text-on-secondary-container p-3 rounded-2xl border border-secondary-fixed-dim shadow-sm flex items-center justify-between animate-fade-in text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            <span>
              선택된 참가자: <strong className="font-bold underline">{swapSource.memberName}</strong> (
              {swapSource.gender === 'F' ? '여' : '남'}) ➔ 교체할 대상 테이블의 참가자를 클릭하세요.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSwapSource(null)}
            className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface text-[11px] font-bold shadow-xs hover:bg-surface-container"
          >
            스왑 취소 ✕
          </button>
        </div>
      )}

      {/* 2. Table Matching Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {filteredTables.map((table) => {
          const isUnderQuorum = table.status === 'UNDER_QUORUM';
          const isUnbalanced = !table.isBalanced;

          return (
            <div
              key={table.id}
              className={`rounded-2xl border p-4 shadow-sm transition-all flex flex-col justify-between gap-3 ${
                isUnderQuorum
                  ? 'bg-error-container/20 border-error/40'
                  : isUnbalanced
                  ? 'bg-secondary-fixed/20 border-secondary/50'
                  : 'bg-surface-container-lowest border-surface-container hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-on-surface">
                      테이블 #{table.tableNo}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-semibold text-on-surface-variant">
                      {table.region}
                    </span>
                  </div>

                  {/* Harmony Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      table.harmonyScore >= 90
                        ? 'bg-tertiary-fixed text-tertiary'
                        : 'bg-secondary-fixed text-secondary'
                    }`}
                  >
                    조화도 {table.harmonyScore}점
                  </span>
                </div>

                {/* Venue & Ratio Subheader */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px] text-primary">storefront</span>
                    <span className="font-semibold text-on-surface truncate max-w-[120px]">
                      {table.venue.name}
                    </span>
                    {table.reservationStatus === 'RESERVED' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-tertiary-fixed text-tertiary">
                        예약 완료
                      </span>
                    ) : table.reservationStatus === 'PENDING' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 animate-pulse">
                        예약 대기 (10s)
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant">
                        예약 미완료
                      </span>
                    )}
                  </div>

                  {/* Gender Indicator */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        table.isBalanced
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-error-container text-error animate-pulse'
                      }`}
                    >
                      남 {table.maleCount} : 여 {table.femaleCount} {table.isBalanced ? '(균형)' : '(불균형)'}
                    </span>
                  </div>
                </div>

                {isUnderQuorum && (
                  <div className="mt-2 p-2 rounded-xl bg-error-container text-error text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>4인 미달 (현재 {table.members.length}명) - 예외 큐 처리 필요</span>
                  </div>
                )}
              </div>

              {/* Members List (Click to Swap) */}
              <div className="space-y-1.5 mt-2">
                <span className="text-[11px] text-outline block font-semibold">
                  참가자 명단 ({table.members.length}/{table.targetSize}명) - 클릭 시 스왑
                </span>
                {table.members.map((m) => {
                  const isSelectedForSwap =
                    swapSource && swapSource.tableId === table.id && swapSource.memberId === m.id;

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleMemberClick(table.id, m)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelectedForSwap
                          ? 'bg-primary text-white border-primary shadow-sm font-bold scale-[1.02]'
                          : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/20 text-on-surface'
                      }`}
                      title="클릭하여 다른 테이블의 참가자와 위치를 바꿉니다."
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isSelectedForSwap
                              ? 'bg-white text-primary'
                              : m.gender === 'F'
                              ? 'bg-primary-fixed text-primary'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {m.gender}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{m.name}</span>
                            <span className="text-[10px] opacity-75">({m.age}세)</span>
                          </div>
                          <span className="text-[10px] opacity-80">{m.job}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-mono font-bold">
                          {m.mbti}
                        </span>
                        <span className="text-[11px] font-bold text-secondary">
                          {m.mannerTemp}°C
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>예산: {table.venue.budget}</span>
                <span className="font-semibold text-tertiary">
                  {table.status === 'CONFIRMED' ? '확정 대기' : '조정 가능'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODAL M-04: 최종 매칭 확정 및 알림톡 일괄 발송 모달         */}
      {/* ========================================================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-surface-container">
              <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
              </div>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">
                  최종 매칭 확정 및 알림톡 발송
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  금주 목요일 38개 테이블 참가자 전원에게 결과가 공표됩니다.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">총 확정 테이블:</span>
                <span className="font-bold">38개 테이블</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">총 매칭 참가자:</span>
                <span className="font-bold">184명 (결제 완료자 전원)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">평균 조화도 점수:</span>
                <span className="font-bold text-tertiary">94.2점 (최우수)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">성비 불균형 테이블:</span>
                <span className="font-bold text-on-surface">0건</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-bold text-on-surface">
                실행 확인 (오발송 방지)
              </label>
              <p className="text-[11px] text-on-surface-variant mb-1">
                아래 입력창에 <strong className="text-primary font-bold">확정승인</strong>을 입력하세요.
              </p>
              <input
                type="text"
                value={confirmInputText}
                onChange={(e) => setConfirmInputText(e.target.value)}
                placeholder="확정승인"
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setConfirmInputText('');
                }}
                className="flex-1 h-10 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={confirmInputText !== '확정승인'}
                onClick={() => {
                  confirmFinalMatching();
                  setIsConfirmModalOpen(false);
                  setConfirmInputText('');
                }}
                className="flex-1 h-10 rounded-xl bg-tertiary text-white text-xs font-bold shadow-md hover:bg-tertiary-container disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>확정 및 알림톡 발송</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
