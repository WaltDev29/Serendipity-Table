import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminExceptionsPage() {
  const { matchingTables, resolveUnderQuorum, downloadCsv, applications, venues } = useAdmin();

  // 미달 테이블 타겟
  const [selectedExceptionTable, setSelectedExceptionTable] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('TRANSFER'); // TRANSFER or REFUND

  // 인원 미달 테이블들
  const underQuorumTables = matchingTables.filter((t) => t.members.length < 4);

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!selectedExceptionTable) return;
    resolveUnderQuorum(selectedExceptionTable.id, resolutionAction);
    setSelectedExceptionTable(null);
  };

  // 1) 출석부 CSV 다운로드
  const handleExportAttendance = () => {
    const headers = ['신청번호', '이름', '성별', '나이', '연락처', '배정권역', '배정식당', '테이블번호', '식이제한'];
    const rows = applications.map((a) => [
      a.id,
      a.name,
      a.gender === 'F' ? '여성' : '남성',
      a.age,
      a.phone,
      a.region,
      a.assignedTable.includes('대기') ? '대기 중' : '연남 브리즈 다이닝',
      a.assignedTable,
      a.foodRestrictions.join('/') || '없음'
    ]);
    downloadCsv('우연한식탁_금주출석부', headers, rows);
  };

  // 2) 식당 예약표 CSV 다운로드
  const handleExportVenues = () => {
    const headers = ['식당코드', '식당명', '권역', '예약인원', '예약시간', '예약자명', '제외식단메모', '예약상태'];
    const rows = venues.map((v) => [
      v.id,
      v.name,
      v.region,
      v.assignedTables.length > 0 ? `${v.assignedTables.length * 4}명` : '0명',
      '2026-10-22 19:30',
      '우연한 식탁',
      '오이 제외 1명, 날생선 제외 1명, 갑각류 제외 1명',
      v.isReserved ? '예약 확정 완료' : '예약 미완료'
    ]);
    downloadCsv('우연한식탁_식당예약현황표', headers, rows);
  };

  // 3) 회계 정산표 CSV 다운로드
  const handleExportFinance = () => {
    const headers = ['주문번호', '신청자명', '결제일시', '결제금액', '티켓유형', '결제상태', '환불사유'];
    const rows = applications.map((a) => [
      `ORD-${a.id.slice(-8)}`,
      a.name,
      a.appliedAt,
      a.ticketType.includes('3회') ? '₩24,000' : '₩8,000',
      a.ticketType,
      a.paymentStatus,
      a.paymentStatus === 'REFUNDED' ? '고객 단순 변심 (마감 전)' : '-'
    ]);
    downloadCsv('우연한식탁_회계정산원장', headers, rows);
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            예외 큐 및 데이터 내보내기 (Exceptions & Data Export)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            4인 미달 테이블을 원클릭으로 일괄 구제하고(이월권/환불), 출석부·예약표·정산표 CSV를 다운로드합니다.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-error-container text-error text-xs font-bold">
          인원 미달 예외 {underQuorumTables.length}건 대기
        </span>
      </div>

      {/* 1. SECTION 1: 인원 미달 테이블 대체 처리 큐 (Under-Quorum Queue) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <h2 className="font-title-md text-sm font-bold text-on-surface">
              인원 미달 테이블 처리 큐 (Under-Quorum Queue)
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            최소 성원 기준: 4명
          </span>
        </div>

        {underQuorumTables.length === 0 ? (
          <div className="p-8 text-center text-xs text-tertiary font-bold bg-tertiary/5 rounded-xl">
            ✓ 현재 인원 미달 테이블이 없습니다. 모든 테이블이 4~6인 성원을 충족했습니다!
          </div>
        ) : (
          <div className="space-y-3">
            {underQuorumTables.map((table) => {
              const isResolved =
                table.status === 'TRANSFERRED_NEXT_WEEK' || table.status === 'REFUNDED_ALL';

              return (
                <div
                  key={table.id}
                  className="p-4 rounded-xl border border-error/30 bg-error/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-on-surface">
                        테이블 #{table.tableNo} ({table.region})
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-error text-white text-[10px] font-bold">
                        현재 {table.members.length}명 (2명 부족)
                      </span>
                      {isResolved && (
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary text-[10px] font-bold">
                          {table.status === 'TRANSFERRED_NEXT_WEEK' ? '차주 이월 처리 완료' : '100% 자동 환불 완료'}
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant text-[11px]">
                      소속 참가자: {table.members.map((m) => `${m.name}(${m.job}, ${m.gender})`).join(', ')}
                    </p>
                  </div>

                  {!isResolved ? (
                    <button
                      type="button"
                      onClick={() => setSelectedExceptionTable(table)}
                      className="px-4 py-2 rounded-xl bg-error text-white font-bold text-xs shadow-xs hover:bg-error-container hover:text-error transition-colors shrink-0"
                    >
                      대안 일괄 처리 (이월권 / 환불)
                    </button>
                  ) : (
                    <span className="text-tertiary font-bold text-xs shrink-0">
                      처리 완료됨 (알림톡 발송 완료)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SECTION 2: 데이터 내보내기 센터 (CSV Export Center) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">download</span>
            <h2 className="font-title-md text-sm font-bold text-on-surface">
              데이터 내보내기 센터 (CSV Export Center)
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">
            UTF-8 BOM 인코딩 (Excel 한글 깨짐 방지 적용)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Card 1: 출석부 CSV */}
          <div className="p-4 rounded-xl border border-surface-container bg-surface-container-low flex flex-col justify-between gap-3">
            <div>
              <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface">참가자 현장 출석부 CSV</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                이름, 연락처, 성별, 연령, 배정 권역, 배정 식당, 테이블 번호, 제외 식단 메모 포함.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportAttendance}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>출석부 다운로드 (.csv)</span>
            </button>
          </div>

          {/* Card 2: 식당 예약표 CSV */}
          <div className="p-4 rounded-xl border border-surface-container bg-surface-container-low flex flex-col justify-between gap-3">
            <div>
              <div className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined text-[20px]">storefront</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface">제휴 식당 예약 현황표 CSV</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                식당명, 예약자명(우연한 식탁), 예약 인원수, 도착 시간, 테이블 알레르기 식단 메모 포함.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportVenues}
              className="w-full py-2.5 rounded-xl bg-secondary text-white font-bold text-xs shadow-xs hover:bg-on-secondary-container transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>식당 예약표 다운로드 (.csv)</span>
            </button>
          </div>

          {/* Card 3: 회계 정산표 CSV */}
          <div className="p-4 rounded-xl border border-surface-container bg-surface-container-low flex flex-col justify-between gap-3">
            <div>
              <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-2">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface">회계 결제 & 정산 원장 CSV</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                주문 번호, 결제 일시, 금액, 결제 수단, 환불 여부, 플랫폼 수수료 집계 데이터 포함.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportFinance}
              className="w-full py-2.5 rounded-xl bg-tertiary text-white font-bold text-xs shadow-xs hover:bg-tertiary-container transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>회계 정산표 다운로드 (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL M-08: 인원 미달 테이블 대안 일괄 처리 모달           */}
      {/* ========================================================= */}
      {selectedExceptionTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
              <span className="material-symbols-outlined text-error text-[22px]">pending_actions</span>
              <h3 className="font-title-md text-base font-bold text-on-surface">
                인원 미달 테이블 대안 일괄 처리
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              대상: <strong className="text-on-surface">테이블 #{selectedExceptionTable.tableNo}</strong> (
              {selectedExceptionTable.region}, 총 {selectedExceptionTable.members.length}명)
              <br />
              참가자 전원에게 선택한 대안을 즉시 실행하고 카카오 알림톡을 발송합니다.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    resolutionAction === 'TRANSFER'
                      ? 'border-primary bg-primary/5 font-semibold text-primary'
                      : 'border-surface-container bg-surface-container-low text-on-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    checked={resolutionAction === 'TRANSFER'}
                    onChange={() => setResolutionAction('TRANSFER')}
                    className="accent-primary mt-0.5"
                  />
                  <div>
                    <span className="font-bold block">옵션 A: 다음 주 목요일 모임 무료 이월권 일괄 발급</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">
                      우선 배정 권한이 부여되며 보유 참가권 잔여 횟수가 1회 자동 연장됩니다.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    resolutionAction === 'REFUND'
                      ? 'border-primary bg-primary/5 font-semibold text-primary'
                      : 'border-surface-container bg-surface-container-low text-on-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    checked={resolutionAction === 'REFUND'}
                    onChange={() => setResolutionAction('REFUND')}
                    className="accent-primary mt-0.5"
                  />
                  <div>
                    <span className="font-bold block">옵션 B: 100% 모의 결제 자동 환불 일괄 처리</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">
                      결제 승인을 전액 취소하고 환불 완료 안내 알림톡을 전송합니다.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setSelectedExceptionTable(null)}
                  className="flex-1 h-10 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-colors"
                >
                  대안 일괄 처리 실행
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
