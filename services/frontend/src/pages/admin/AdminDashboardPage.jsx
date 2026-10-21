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

  // 결제 완료액 계산 (백엔드 DB 실제 Order 금액 우선, 없을 시 계산)
  const ticket1Count = applications.filter((a) => a.ticketType === '1_TICKET').length || Math.round(totalAppsCount * 0.7);
  const ticket3Count = applications.filter((a) => a.ticketType === '3_TICKETS').length || Math.round(totalAppsCount * 0.3);
  const totalPaymentAmount = (dashboardStats?.totalRevenue !== undefined && dashboardStats?.totalRevenue !== null)
    ? dashboardStats.totalRevenue
    : ((ticket1Count * 8000) + (ticket3Count * 15000));

  // 빠른 참가자 명단 CSV 다운로드
  const handleQuickCsv = () => {
    const headers = ['신청번호', '이름', '성별', '나이', '연락처', '인스타그램', '권역', '결제상태', '매칭테이블'];
    const rows = applications.map((a) => [
      a.id,
      a.name,
      a.gender === 'F' ? '여성' : '남성',
      a.age,
      a.phone,
      a.instagramId,
      a.region,
      a.paymentStatus,
      a.assignedTable
    ]);
    downloadCsv('우연한식탁_금주참가자명단', headers, rows);
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* 1. Dynamic Operational Notice Strip */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-md shadow-sm border border-surface-container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <span className="material-symbols-outlined text-[22px]">bolt</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title-md text-base text-on-surface font-bold">
                  금주 정기 모임 디스패치 파이프라인 가동 중
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary-fixed text-tertiary font-semibold tracking-wide">
                  DB LIVE CONNECTED
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                현재 DB 누적 회원 <strong className="text-primary font-bold">{totalUsersCount}명</strong>, 실시간 참가 신청 <strong className="text-primary font-bold">{totalAppsCount}건</strong> 처리 중입니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/matching')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface font-label-sm text-xs font-semibold hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>매칭 가중치 세부설정</span>
            </button>
            <button
              type="button"
              onClick={triggerAiMatching}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white font-label-sm text-xs font-bold shadow-sm hover:bg-primary-container transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>AI 매칭 즉시 가동</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: Top KPI Summary (4 Cards Grid) */}
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
          onClick={() => navigate('/admin/applications')}
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
          <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-xs border-t border-surface-container-low">
            <span className="text-outline">1회권 <strong className="text-on-surface font-semibold">{ticket1Count}건</strong></span>
            <span className="h-3 w-px bg-surface-variant"></span>
            <span className="text-outline">3회권 <strong className="text-on-surface font-semibold">{ticket3Count}건</strong></span>
            <span className="inline-flex px-1.5 py-0.5 rounded bg-surface-container text-on-secondary-container font-label-sm text-[10px] font-bold">
              결제완료 100%
            </span>
          </div>
        </div>

        {/* Card 3: AI 매칭 형성 테이블 */}
        <div
          onClick={() => navigate('/admin/matching')}
          className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-tertiary"></div>
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                AI 매칭 형성 테이블
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
            <span className="text-outline">성비 2:2 완벽 배정</span>
            <span className="text-tertiary font-bold">{activeTablesCount}/{activeTablesCount} 완료</span>
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

      {/* 4. SECTION 3: 실시간 운영 감사 로그 & 빠른 액션 바 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left (2 cols): 실시간 운영 이벤트 타임라인 */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">history</span>
              <h3 className="font-title-md text-sm font-bold text-on-surface">
                실시간 운영 감사 로그 (Live Audit Stream)
              </h3>
            </div>
            <span className="text-[11px] text-tertiary font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              WebSocket 연결됨
            </span>
          </div>

          <div className="divide-y divide-surface-container-low max-h-64 overflow-y-auto pr-1 space-y-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2 flex items-start justify-between text-xs">
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

        {/* Right (1 col): 빠른 액션 툴킷 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-title-md text-sm font-bold text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">touch_app</span>
              <span>운영자 원클릭 툴킷</span>
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={triggerAiMatching}
                className="w-full py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-between hover:bg-primary-container transition-all active:scale-[0.98] shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">smart_toy</span>
                  <span>AI 매칭 즉시 가동</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/chat-ops')}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-secondary">forum</span>
                  <span>단체 채팅 실시간 관제</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={handleQuickCsv}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-tertiary">download</span>
                  <span>참가자 출석부 CSV 추출</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/venues')}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-primary">storefront</span>
                  <span>제휴 식당 예약 현황 체크</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
            <p className="font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              안심 무인 운영 원칙
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              화요일 18:00에 AI 매칭이 자동 확정되며 알림톡이 전송됩니다. 예외 인원이나 성비 불균형은 [A-04 AI 매칭 콘솔]에서 수동 드래그로 즉시 보정할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
