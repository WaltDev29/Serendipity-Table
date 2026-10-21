import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const {
    events,
    auditLogs,
    triggerAiMatching,
    downloadCsv,
    applications,
    dashboardStats,
    matchingTables,
    csInquiries
  } = useAdmin();

  const currentEvent = events[0] || {
    totalApplicants: 0,
    regions: []
  };

  // DB 실시간 수치 계산
  const totalAppsCount = applications.length > 0 ? applications.length : (dashboardStats?.currentApplications || 0);
  const totalUsersCount = dashboardStats?.totalUsers || 270;
  const activeTablesCount = matchingTables.length > 0 ? matchingTables.length : (dashboardStats?.activeTables || 0);
  // 해결되지 않은 문의 (처리 완료 상태가 아닌 문의: OPEN 또는 ANSWERED) 수 계산
  const pendingCsCount = csInquiries.filter((q) => q.status !== 'RESOLVED').length;

  // 결제 완료액 및 티켓 수 계산 (DB dashboardStats 우선 사용)
  const ticket1Count = dashboardStats?.ticket1Count !== undefined 
    ? dashboardStats.ticket1Count 
    : applications.filter((a) => a.ticketType === '1_TICKET').length;
  const ticket3Count = dashboardStats?.ticket3Count !== undefined 
    ? dashboardStats.ticket3Count 
    : applications.filter((a) => a.ticketType === '3_TICKETS').length;
  const totalPaymentAmount = (dashboardStats?.totalRevenue !== undefined && dashboardStats?.totalRevenue !== null)
    ? dashboardStats.totalRevenue
    : ((ticket1Count * 8000) + (ticket3Count * 15000));

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* 1. SECTION 1: Top KPI Summary (4 Cards Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Card 1: 이번 주 총 신청자 */}
        <div
          onClick={() => navigate('/admin/applications')}
          className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                총 참가 신청 건수
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-fixed text-primary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-kpi-stat text-3xl font-extrabold text-on-surface tracking-tight">
                {totalAppsCount}
              </span>
              <span className="font-headline-sm text-sm text-on-surface-variant">명</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-[11px] font-bold ml-auto">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                DB 동기화
              </span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-surface-container-low">
            <span className="font-body-sm text-xs text-outline">총 등록 회원 {totalUsersCount}명 중</span>
            <span className="font-label-sm text-xs text-primary font-bold">신청률 {totalUsersCount > 0 ? Math.round((totalAppsCount / totalUsersCount) * 100) : 0}%</span>
          </div>
        </div>

        {/* Card 2: 모의 결제 완료액 */}
        <div
          onClick={() => navigate('/admin/payments')}
          className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary"></div>
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                결제 완료액
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-fixed text-secondary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="text-base text-on-surface-variant font-semibold">₩</span>
              <span className="font-kpi-stat text-3xl font-extrabold text-on-surface tracking-tight">
                {totalPaymentAmount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center gap-3 font-body-sm text-xs border-t border-surface-container-low">
            <span className="text-outline">1회권 <strong className="text-on-surface font-semibold">{ticket1Count}건</strong></span>
            <span className="h-3 w-px bg-surface-variant"></span>
            <span className="text-outline">3회권 <strong className="text-on-surface font-semibold">{ticket3Count}건</strong></span>
          </div>
        </div>

        {/* Card 3: 매칭 테이블 */}
        <div
          onClick={() => navigate('/admin/matching')}
          className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-tertiary"></div>
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                매칭 테이블
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-tertiary-fixed text-tertiary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-kpi-stat text-3xl font-extrabold text-on-surface tracking-tight">{activeTablesCount}</span>
              <span className="font-headline-sm text-sm text-on-surface-variant">개 조</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-tertiary font-label-sm text-[11px] ml-auto font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                평균 94.2점
              </span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-xs border-t border-surface-container-low">
            <span className="text-tertiary font-bold">테이블 생성 완료</span>
            <span className="text-xs text-primary font-semibold">관리 이동 →</span>
          </div>
        </div>

        {/* Card 4: 긴급 CS 및 예외 큐 -> 고객센터 미해결 문의 */}
        <div
          onClick={() => navigate('/admin/cs')}
          className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-error"></div>
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                미해결 고객 문의
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-error-container text-error shadow-xs">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-kpi-stat text-3xl font-extrabold text-error tracking-tight">{pendingCsCount}</span>
              <span className="font-headline-sm text-sm text-on-surface-variant">건</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-error font-label-sm text-[11px] font-bold ml-auto">
                실시간 접수
              </span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-xs border-t border-surface-container-low">
            <span className="text-outline">미처리 CS {pendingCsCount}건</span>
            <span className="text-error font-bold flex items-center gap-0.5">
              확인하기 →
            </span>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: 4대 권역별 모객 상태 그리드 */}
      <section className="space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-title-md text-base font-bold text-on-surface">
              4대 핵심 권역 모객 현황
            </h3>
            <span className="text-xs text-on-surface-variant">
              (권역별 목표 48명 = 4인 12개 테이블)
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/slots')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>회차 및 권역 슬롯 관리</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {currentEvent.regions.map((reg, rIdx) => {
            const pct = Math.min(100, Math.round((reg.current / reg.target) * 100));
            return (
              <div
                key={reg.id || reg.name || `reg-${rIdx}`}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-on-surface">{reg.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        reg.status === 'CLOSED'
                          ? 'bg-primary-container text-white'
                          : 'bg-tertiary-fixed text-tertiary'
                      }`}
                    >
                      {reg.status === 'CLOSED' ? '모집 마감' : '모집 중'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">
                    {reg.current} <span className="text-on-surface-variant font-normal">/ {reg.target}명</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-primary' : 'bg-tertiary'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-1 font-medium">
                    <span>달성률 {pct}%</span>
                    <span>{reg.ageGroup}</span>
                  </div>
                </div>

                {/* Gender Ratio */}
                <div className="bg-surface-container-low p-2 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[11px] text-on-surface-variant font-medium">성비 밸런스</span>
                  <div className="flex items-center gap-2 font-bold text-[11px]">
                    <span className="text-blue-600">남 {reg.maleRatio}%</span>
                    <span className="text-on-surface-variant">|</span>
                    <span className="text-primary">여 {reg.femaleRatio}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION 3: 실시간 운영 감사 로그 */}
      <section className="w-full">
        <div className="w-full bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">history</span>
              <h3 className="font-title-md text-sm font-bold text-on-surface">
                실시간 운영 감사 로그 (Live Audit Stream)
              </h3>
            </div>
            <span className="text-[11px] text-tertiary font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              DB 실시간 연동
            </span>
          </div>

          <div className="divide-y divide-surface-container-low max-h-96 overflow-y-auto pr-1 space-y-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface font-mono text-[10px] font-bold mt-0.5">
                    {log.action}
                  </span>
                  <div>
                    <p className="font-semibold text-on-surface text-xs">{log.detail}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">조작자: {log.operator}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-outline shrink-0 ml-2">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
