import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function AdminApplicationsPage() {
  const { applications, processRefund } = useAdmin();
  const [searchParams] = useSearchParams();

  // Filters
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const phoneQuery = searchParams.get('phone') || searchParams.get('search');
    if (phoneQuery) {
      setSearchKeyword(phoneQuery);
    }
  }, [searchParams]);

  // Contact Masking Toggle state (set of unmasked application IDs)
  const [unmaskedSet, setUnmaskedSet] = useState(new Set());

  // Slide Drawer State (M-02)
  const [activeAppDrawer, setActiveAppDrawer] = useState(null);

  // Refund Modal State (M-03)
  const [refundTargetApp, setRefundTargetApp] = useState(null);
  const [refundReason, setRefundReason] = useState('고객 단순 변심 (마감 전)');

  const toggleMask = (appId) => {
    setUnmaskedSet((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundTargetApp) return;
    await processRefund(refundTargetApp.id, refundReason);
    setRefundTargetApp(null);
    if (activeAppDrawer && activeAppDrawer.id === refundTargetApp.id) {
      setActiveAppDrawer(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (selectedRegion !== 'ALL' && !app.region.includes(selectedRegion)) return false;
    if (selectedGender !== 'ALL' && app.gender !== selectedGender) return false;
    if (selectedPaymentStatus !== 'ALL' && app.paymentStatus !== selectedPaymentStatus) return false;
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const matchName = app.name.toLowerCase().includes(q);
      const matchPhone = app.phone.includes(q);
      const matchInsta = app.instagramId.toLowerCase().includes(q);
      const matchId = app.id.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchInsta && !matchId) return false;
    }
    return true;
  });

  // 권역 및 성별 필터가 적용된 기준 집계 (요구사항: 권역별, 성별 선택 필터가 상단 총 참가자수, 매칭완료수, 대기신청수에도 반영될 것)
  const baseFilteredApps = applications.filter((app) => {
    if (selectedRegion !== 'ALL' && !(app.region || '').includes(selectedRegion)) return false;
    if (selectedGender !== 'ALL' && app.gender !== selectedGender) return false;
    return true;
  });

  const totalCount = baseFilteredApps.length;
  const matchedCount = baseFilteredApps.filter((a) => a.matchingStatus === 'CONFIRMED' || a.status === 'MATCHED').length;
  const waitingCount = baseFilteredApps.filter((a) => a.matchingStatus !== 'CONFIRMED' && a.status !== 'MATCHED' && a.status !== 'CANCELLED').length;

  // 권역별 신청 수 카운트 (성별 필터 조건 반영)
  const regionCounts = {
    ALL: applications.filter((a) => selectedGender === 'ALL' || a.gender === selectedGender).length,
    '홍대': applications.filter((a) => (selectedGender === 'ALL' || a.gender === selectedGender) && (a.region || '').includes('홍대')).length,
    '잠실': applications.filter((a) => (selectedGender === 'ALL' || a.gender === selectedGender) && (a.region || '').includes('잠실')).length,
    '강남': applications.filter((a) => (selectedGender === 'ALL' || a.gender === selectedGender) && (a.region || '').includes('강남')).length,
    '을지로': applications.filter((a) => (selectedGender === 'ALL' || a.gender === selectedGender) && (a.region || '').includes('을지로')).length
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">how_to_reg</span>
            <span>참가 신청 관리 (Applications)</span>
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            참가자의 6대 도메인 취향 설문 응답과 권역별 매칭 배정 현황을 실시간으로 관리합니다.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards (권역 및 성별 필터 조건 반영) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">총 참가 신청 수</span>
          <div className="text-xl font-bold text-primary mt-1">{totalCount}명</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">매칭 완료 수</span>
          <div className="text-xl font-bold text-tertiary mt-1">{matchedCount}명</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">대기 신청 수</span>
          <div className="text-xl font-bold text-secondary mt-1">{waitingCount}명</div>
        </div>
      </div>

      {/* 1. Multi-Filter Bar with Region Buttons & Selection Count */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Region Filter Buttons on Left */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: '전체' },
            { id: '홍대', label: '홍대/합정' },
            { id: '잠실', label: '잠실/송파' },
            { id: '강남', label: '강남/신논현' },
            { id: '을지로', label: '을지로/종로' }
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRegion(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRegion === r.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>{r.label}</span>
              <span className="ml-1 opacity-80 font-normal">({regionCounts[r.id] || 0})</span>
            </button>
          ))}

          {/* Gender Filter Dropdown */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="h-9 ml-1 px-3 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/30 focus:outline-none"
          >
            <option value="ALL">전체 성별</option>
            <option value="F">여성</option>
            <option value="M">남성</option>
          </select>
        </div>

        {/* Search Input on Right */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="이름, 전화번호, 인스타, 신청번호 검색..."
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* 2. Applications Master Grid */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container">
              <tr>
                <th className="py-3 px-3.5">실명 (인증)</th>
                <th className="py-3 px-3.5">성별 / 나이</th>
                <th className="py-3 px-3.5">연락처</th>
                <th className="py-3 px-3.5">인스타그램</th>
                <th className="py-3 px-3.5">신청 권역</th>
                <th className="py-3 px-3.5">예산 & 식이 제한</th>
                <th className="py-3 px-3.5">배정 상태</th>
                <th className="py-3 px-3.5">신청 일시</th>
                <th className="py-3 px-3.5 text-center">프로필 상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredApps.map((app) => {
                const isUnmasked = unmaskedSet.has(app.id);
                return (
                  <tr key={app.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1 font-bold text-on-surface">
                        <span>{app.name}</span>
                        <span className="material-symbols-outlined text-[13px] text-tertiary" title="신원 본인인증 완료">
                          verified
                        </span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant">{app.job}</span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={app.gender === 'F' ? 'text-primary font-bold' : 'text-blue-600 font-bold'}>
                        {app.gender === 'F' ? '여' : '남'}
                      </span>{' '}
                      / {app.age}세 ({app.birthYear})
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      <div className="flex items-center gap-1">
                        <span>
                          {isUnmasked ? app.phone : (app.phone || '').replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2')}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMask(app.id)}
                          className="text-on-surface-variant hover:text-primary p-0.5"
                          title="마스킹 해제/적용"
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {isUnmasked ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-primary hover:underline">
                      @{app.instagramId}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-[11px] font-semibold text-on-surface">
                        {app.region}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="text-[11px] text-on-surface">{app.budget || '20,000~30,000원'}</div>
                      {Array.isArray(app.foodRestrictions) && app.foodRestrictions.length > 0 ? (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {app.foodRestrictions.map((r) => (
                            <span key={r} className="px-1.5 py-0.2 rounded bg-error-container text-error text-[10px] font-bold">
                              제외: {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant">
                          {typeof app.foodRestrictions === 'string' && app.foodRestrictions !== '없음' ? `제외: ${app.foodRestrictions}` : '제한 없음'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-medium">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.matchingStatus === 'CONFIRMED'
                            ? 'bg-tertiary-fixed text-tertiary'
                            : 'bg-primary-fixed text-primary'
                        }`}
                      >
                        {app.assignedTable || '배정 대기'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-on-surface-variant text-[11px]">
                      {app.createdAt || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveAppDrawer(app)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[11px] transition-colors"
                      >
                        상세 설문
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL M-02: 신청자 상세 설문 슬라이드 드로어 (480px)        */}
      {/* ========================================================= */}
      {activeAppDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-[480px] h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 space-y-4 border-l border-surface-container">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                  {activeAppDrawer.name[0]}
                </div>
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface flex items-center gap-1.5">
                    <span>{activeAppDrawer.name}</span>
                    <span className="text-xs font-normal text-on-surface-variant">
                      ({activeAppDrawer.gender === 'F' ? '여' : '남'} / {activeAppDrawer.age}세)
                    </span>
                  </h3>
                  <p className="text-[11px] font-mono text-outline">{activeAppDrawer.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAppDrawer(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            {/* 1. Basic Profile */}
            <div className="bg-surface-container-low p-3.5 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-on-surface block text-[11px] uppercase tracking-wider text-outline">
                01. 인적사항 & 신원
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-on-surface-variant text-[11px] block">연락처</span>
                  <span className="font-mono font-bold">{activeAppDrawer.phone}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[11px] block">인스타그램 ID</span>
                  <span className="font-mono text-primary font-bold">@{activeAppDrawer.instagramId}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[11px] block">직업 / 분야</span>
                  <span className="font-semibold">{activeAppDrawer.job}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[11px] block">MBTI 성격유형</span>
                  <span className="font-bold text-primary">{activeAppDrawer.mbti}</span>
                </div>
              </div>
            </div>

            {/* 2. Interests & Chemistry */}
            <div className="bg-surface-container-low p-3.5 rounded-xl space-y-2.5 text-xs">
              <span className="font-bold text-on-surface block text-[11px] uppercase tracking-wider text-outline">
                02. 취향 및 대화 성향
              </span>
              <div>
                <span className="text-on-surface-variant text-[11px] block mb-1">관심사 키워드</span>
                <div className="flex flex-wrap gap-1">
                  {activeAppDrawer.interests.map((it) => (
                    <span key={it} className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-primary text-[11px] font-bold shadow-xs">
                      #{it}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant text-[11px] block mb-1">식탁에서의 내 성향</span>
                <div className="flex flex-wrap gap-1">
                  {activeAppDrawer.myTendency.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[11px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant text-[11px] block mb-1">만나고 싶은 상대 스타일</span>
                <div className="flex flex-wrap gap-1">
                  {activeAppDrawer.preferredTendency.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary text-[11px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Dining Preferences */}
            <div className="bg-surface-container-low p-3.5 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-on-surface block text-[11px] uppercase tracking-wider text-outline">
                03. 식사 선호 & 결제 내역
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">희망 권역:</span>
                  <span className="font-bold">{activeAppDrawer.region} (2순위: {activeAppDrawer.secondaryRegion || '없음'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">선호 예산:</span>
                  <span className="font-bold">{activeAppDrawer.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">식이 제한:</span>
                  <span className="font-bold text-error">
                    {Array.isArray(activeAppDrawer.foodRestrictions)
                      ? (activeAppDrawer.foodRestrictions.join(', ') || '없음')
                      : (activeAppDrawer.foodRestrictions || '없음')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">결제 티켓:</span>
                  <span className="font-bold text-secondary">{activeAppDrawer.ticketType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">신청 일시:</span>
                  <span className="font-mono text-outline">{activeAppDrawer.appliedAt}</span>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-2 border-t border-surface-container flex gap-2">
              {activeAppDrawer.paymentStatus === 'PAID' && (
                <button
                  type="button"
                  onClick={() => setRefundTargetApp(activeAppDrawer)}
                  className="w-full h-10 rounded-xl bg-error-container hover:bg-error hover:text-white text-error font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  <span>수동 즉시 전액 환불 처리</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL M-03: 수동 환불 처리 다이얼로그                     */}
      {/* ========================================================= */}
      {refundTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-surface-container">
              <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
              </div>
              <h3 className="font-title-md text-sm font-bold text-on-surface">
                수동 전액 환불 승인
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              참가자 <strong className="text-on-surface">{refundTargetApp.name}</strong>님의 결제 건(
              {refundTargetApp.ticketType})을 즉시 취소하고 전액 환불합니다.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  환불 사유 선택
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none"
                >
                  <option value="고객 단순 변심 (마감 전)">고객 단순 변심 (마감 전)</option>
                  <option value="일정 변경 불가 (야근/출장)">일정 변경 불가 (야근/출장)</option>
                  <option value="운영자 직권 취소 (수칙 위반)">운영자 직권 취소 (수칙 위반)</option>
                  <option value="서비스 장애/인원 미달 보상">서비스 장애/인원 미달 보상</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setRefundTargetApp(null)}
                  className="flex-1 h-9 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-error text-white text-xs font-bold shadow-md hover:bg-error-container hover:text-error transition-colors"
                >
                  환불 승인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
