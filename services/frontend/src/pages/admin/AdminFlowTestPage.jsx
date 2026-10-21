import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { triggerMatchingLifecycleStepApi } from '../../api/matching';
import { executeSimulationActionApi } from '../../api/admin';

export default function AdminFlowTestPage() {
  const {
    users = [],
    applications = [],
    matchingTables = [],
    refreshAdminData
  } = useAdmin();

  const [runningStep, setRunningStep] = useState(null);
  const [lastStepResult, setLastStepResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // 사용자 선택 및 필터 상태
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  // 1~10단계 서비스 흐름 실행
  const runLifecycleStep = async (stepKey, label) => {
    try {
      setRunningStep(stepKey);
      const res = await triggerMatchingLifecycleStepApi(stepKey);
      setLastStepResult({ step: label, data: res });
      if (refreshAdminData) await refreshAdminData();
    } catch (e) {
      alert(`❌ [${label}] 실행 실패: ` + (e.message || '오류 발생'));
    } finally {
      setRunningStep(null);
    }
  };

  // 참가자 데이터 매핑 (User + 최신 Application 병합)
  const userSimList = users.map((u) => {
    const userApp = applications.find((a) => a.userId === u.id || a.phone === u.phone);
    return {
      ...u,
      appId: userApp?.id,
      applicationStatus: userApp?.status || (userApp ? 'APPLIED' : 'NONE'),
      matchingStatus: userApp?.matchingStatus || 'NONE',
      assignedTable: userApp?.assignedTable || '미배정',
      region: userApp?.region || u.preferredRegion || '홍대/합정',
      appliedAt: userApp?.createdAt || '-'
    };
  });

  // 필터링 적용
  const filteredUsers = userSimList.filter((u) => {
    if (selectedRegion !== 'ALL' && !(u.region || '').includes(selectedRegion)) return false;
    if (selectedGender !== 'ALL' && u.gender !== (selectedGender === 'F' ? '여' : '남') && u.gender !== selectedGender) return false;
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'NONE' && u.applicationStatus !== 'NONE') return false;
      if (selectedStatus === 'APPLIED' && (u.applicationStatus !== 'APPLIED' && u.applicationStatus !== 'WAITING')) return false;
      if (selectedStatus === 'MATCHED' && u.applicationStatus !== 'MATCHED' && u.matchingStatus !== 'CONFIRMED') return false;
      if (selectedStatus === 'CANCELLED' && u.applicationStatus !== 'CANCELLED' && u.matchingStatus !== 'CANCELLED') return false;
    }
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      const matchJob = (u.job || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchJob) return false;
    }
    return true;
  });

  // 전체 선택 / 해제 토글
  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.has(u.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // 시뮬레이션 제어 액션 실행
  const handleSimulationAction = async (actionType, actionLabel) => {
    try {
      setIsSimulating(true);
      // 선택된 사용자가 있으면 선택 대상만, 없으면 필터링된 전체 사용자 대상
      const targetIds = selectedUserIds.size > 0
        ? Array.from(selectedUserIds)
        : filteredUsers.map((u) => u.id);

      if (targetIds.length === 0) {
        alert('대상 사용자가 없습니다. 필터를 확인해주세요.');
        return;
      }

      const res = await executeSimulationActionApi(actionType, targetIds);
      if (refreshAdminData) await refreshAdminData();
      alert(`✅ [${actionLabel}] 성공!\n반영 대상: ${targetIds.length}명\n결과: ${JSON.stringify(res || {}, null, 2)}`);
    } catch (e) {
      alert(`❌ [${actionLabel}] 실패: ` + (e.message || '오류 발생'));
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg pb-12">
      {/* 1. Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-2xl font-bold">science</span>
            <h1 className="font-headline-sm text-xl font-bold text-on-surface">
              전체 흐름 테스트 & 사용자 시뮬레이터 (Full Flow & User Simulator)
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-900 text-[10px] font-extrabold uppercase">
              QA Lab
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1">
            월/화/목/금 10대 서비스 라이프사이클을 즉시 가동하고, 권역/성별 더미 사용자들의 참가권 및 신청/취소 상태를 버튼 하나로 제어합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshAdminData && refreshAdminData()}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface border border-outline-variant/30 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>데이터 새로고침</span>
        </button>
      </div>

      {/* 2. Top: 10-Step Lifecycle Flow Panel */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
            <span className="font-title-md text-base font-bold text-on-surface">
              서비스 흐름 단계별 즉시 실행 (월 12:00 ~ 금 12:00 & 10번 초기화)
            </span>
          </div>
          {runningStep && (
            <span className="text-xs text-primary font-bold animate-pulse flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">progress_activity</span>
              <span>단계 실행 중: {runningStep}...</span>
            </span>
          )}
        </div>

        {/* 10 Step Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('monday-noon', '1. 월 12:00 1차 AI 매칭')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-primary">① 월 12:00</span>
            <span className="font-medium text-on-surface text-[11px]">1차 AI 매칭 (식당 미정, 멤버만 공개)</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('monday-night', '2. 월 21:00 2차 재매칭')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-primary">② 월 21:00</span>
            <span className="font-medium text-on-surface text-[11px]">2차 AI 재매칭 (미매칭자 대상)</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('tuesday-morning', '3. 화 08:00 최종 재매칭 & 실패 참가권 반환')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-primary">③ 화 08:00</span>
            <span className="font-medium text-on-surface text-[11px]">3차 재매칭 & 실패 참가권 자동반환</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('tuesday-noon', '4. 화 12:00 매칭 확정 & 식당 예약 & 채팅방 개설')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-emerald-600">④ 화 12:00</span>
            <span className="font-medium text-on-surface text-[11px]">최종 확정 + 식당 예약 + 채팅방 개설</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('tuesday-16', '5. 화 16:00 식당 미예약 예외큐 전송')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-amber-600">⑤ 화 16:00</span>
            <span className="font-medium text-on-surface text-[11px]">식당 미예약 시 예외큐(Exception) 등록</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('event-day-noon', '6. 목 12:00 모임 당일 리마인드')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-secondary">⑥ 목 12:00</span>
            <span className="font-medium text-on-surface text-[11px]">당일 전체 리마인드 알림 발송</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('event-day-30m', '7. 목 19:00 30분 전 알림')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-secondary">⑦ 목 19:00</span>
            <span className="font-medium text-on-surface text-[11px]">모임 30분 전 도착 안내 발송</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('event-day-start', '8. 목 19:30 모임 시작 알림')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-secondary">⑧ 목 19:30</span>
            <span className="font-medium text-on-surface text-[11px]">식탁 시작 및 환영 알림 발송</span>
          </button>

          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => runLifecycleStep('next-day-feedback', '9. 금 12:00 사후 피드백 요청')}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="font-bold text-secondary">⑨ 금 12:00</span>
            <span className="font-medium text-on-surface text-[11px]">사후 피드백 요청 알림 발송</span>
          </button>

          {/* 10. Reset Button */}
          <button
            type="button"
            disabled={Boolean(runningStep)}
            onClick={() => {
              if (window.confirm('정말로 모든 매칭 정보(테이블, 채팅방, 메시지, 멤버)를 삭제하고 신청 상태를 초기화하시겠습니까?')) {
                runLifecycleStep('reset', '10. 매칭 정보 초기화');
              }
            }}
            className="p-3 rounded-xl bg-error-container/40 hover:bg-error-container border border-error/40 text-left flex flex-col gap-1 transition-all active:scale-95 disabled:opacity-50 group shadow-xs"
          >
            <span className="font-extrabold text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">delete_forever</span>
              <span>⑩ 매칭 정보 초기화</span>
            </span>
            <span className="font-medium text-error text-[11px]">테이블·채팅방 삭제 & 상태 롤백</span>
          </button>
        </div>

        {/* Last Executed Result Banner */}
        {lastStepResult && (
          <div className="p-3 rounded-xl bg-surface-container-low text-xs border border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">task_alt</span>
              <span className="font-bold text-on-surface">[{lastStepResult.step}] 실행 완료:</span>
              <span className="font-mono text-outline">{JSON.stringify(lastStepResult.data)}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastStepResult(null)}
              className="text-on-surface-variant hover:text-on-surface text-xs"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom: User State Simulator & Batch Control */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">manage_accounts</span>
            <span className="font-title-md text-base font-bold text-on-surface">
              참가자 상태 제어 시뮬레이터 (Dummy & Active Users)
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              (총 {users.length}명 중 필터링 {filteredUsers.length}명)
            </span>
          </div>

          <div className="text-xs font-bold text-primary">
            {selectedUserIds.size > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary">
                선택된 참가자 {selectedUserIds.size}명 대상 적용
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                선택 없음: 필터링된 전체 {filteredUsers.length}명 대상 자동 적용
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulationAction('GRANT_TICKET', '참가권 1개 부여')}
            className="h-10 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[17px]">confirmation_number</span>
            <span>참가권 1개 부여</span>
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulationAction('REVOKE_TICKET', '참가권 1개 회수')}
            className="h-10 px-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[17px]">money_off</span>
            <span>참가권 1개 회수</span>
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulationAction('APPLY_SLOT', '가까운 날짜로 참가 신청')}
            className="h-10 px-3 rounded-xl bg-primary hover:bg-primary-container text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
            <span>가까운 날짜로 참가 신청</span>
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulationAction('CANCEL_APPLICATION', '참가 취소')}
            className="h-10 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[17px]">cancel</span>
            <span>참가 취소</span>
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulationAction('CANCEL_AFTER_MATCH', '매칭 후 참가 취소')}
            className="h-10 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 col-span-2 sm:col-span-1"
          >
            <span className="material-symbols-outlined text-[17px]">person_cancel</span>
            <span>매칭 후 참가 취소 (재매칭)</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/30 focus:outline-none"
            >
              <option value="ALL">전체 권역</option>
              <option value="홍대">홍대/합정</option>
              <option value="잠실">잠실/송파</option>
              <option value="강남">강남/신논현</option>
              <option value="을지로">을지로/종로</option>
            </select>

            {/* Gender Filter */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/30 focus:outline-none"
            >
              <option value="ALL">전체 성별</option>
              <option value="F">여성 (F)</option>
              <option value="M">남성 (M)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/30 focus:outline-none"
            >
              <option value="ALL">전체 신청 상태</option>
              <option value="APPLIED">신청 완료 / 대기</option>
              <option value="MATCHED">매칭 완료 (테이블 배정)</option>
              <option value="CANCELLED">참가 취소</option>
              <option value="NONE">미신청</option>
            </select>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="h-9 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
            >
              {allFilteredSelected ? '전체 해제' : '전체 선택'}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="이름, 전화번호, 직업 검색..."
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* User Simulator Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">이름</th>
                  <th className="py-2.5 px-3">성별 / 나이</th>
                  <th className="py-2.5 px-3">연락처</th>
                  <th className="py-2.5 px-3">직업 / MBTI</th>
                  <th className="py-2.5 px-3">권역</th>
                  <th className="py-2.5 px-3">신청 상태</th>
                  <th className="py-2.5 px-3">배정 식탁</th>
                  <th className="py-2.5 px-3">최근 신청일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-on-surface-variant text-xs">
                      조건에 일치하는 사용자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserIds.has(u.id);
                    const isCancelled = u.applicationStatus === 'CANCELLED' || u.matchingStatus === 'CANCELLED' || u.assignedTable === '참가 취소';
                    const isMatched = u.applicationStatus === 'MATCHED' || u.matchingStatus === 'CONFIRMED';
                    const isApplied = u.applicationStatus === 'APPLIED' || u.applicationStatus === 'WAITING';

                    return (
                      <tr
                        key={u.id}
                        onClick={() => toggleSelectUser(u.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary-fixed/20 hover:bg-primary-fixed/30'
                            : 'hover:bg-surface-container-low/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(u.id)}
                            className="w-4 h-4 rounded accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-on-surface">
                          {u.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={u.gender === 'F' || u.gender === '여' ? 'text-primary font-bold' : 'text-blue-600 font-bold'}>
                            {u.gender === 'F' || u.gender === '여' ? '여' : '남'}
                          </span>{' '}
                          / {u.age || 28}세
                        </td>
                        <td className="py-2.5 px-3 font-mono text-outline">
                          {u.phone}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-on-surface font-medium">{u.job || '직장인'}</span>
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-surface-container text-primary font-bold text-[10px]">
                            {u.mbti || 'ENFP'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-[11px] font-semibold">
                            {u.region}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {isCancelled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-container text-error">
                              참가 취소
                            </span>
                          ) : isMatched ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-fixed text-tertiary">
                              매칭 완료
                            </span>
                          ) : isApplied ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-primary">
                              신청 완료
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-container text-on-surface-variant">
                              미신청
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-on-surface">
                          {u.assignedTable}
                        </td>
                        <td className="py-2.5 px-3 text-on-surface-variant text-[11px]">
                          {u.appliedAt}
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
    </div>
  );
}
