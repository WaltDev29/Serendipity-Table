import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminPaymentsPage() {
  const { applications, processRefund } = useAdmin();

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Refund Modal State
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('고객 단순 변심 (마감 전)');

  // Contact Masking
  const [unmaskedSet, setUnmaskedSet] = useState(new Set());

  const toggleMask = (id) => {
    setUnmaskedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRefundSubmit = (e) => {
    e.preventDefault();
    if (!refundTarget) return;
    processRefund(refundTarget.id, refundReason);
    setRefundTarget(null);
  };

  const filteredList = applications.filter((app) => {
    if (selectedStatus !== 'ALL' && app.paymentStatus !== selectedStatus) return false;
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const matchName = (app.name || '').toLowerCase().includes(q);
      const matchPhone = (app.phone || '').includes(q);
      const matchId = (app.id || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId) return false;
    }
    return true;
  });

  const totalPaidAmount = applications
    .filter((a) => a.paymentStatus === 'PAID')
    .reduce((sum, a) => sum + (a.paidAmount || 15000), 0);
  const paidCount = applications.filter((a) => a.paymentStatus === 'PAID').length;
  const refundCount = applications.filter((a) => a.paymentStatus === 'REFUNDED').length;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
            <span>결제 내역 관리 (Payments & Orders)</span>
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            참가권 결제 및 환불 내역을 조회하고 실시간 수동 환불 승인을 처리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-on-surface">
            총 {applications.length}건
          </span>
          <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary text-xs font-bold">
            결제 완료 {paidCount}건
          </span>
          <span className="px-3 py-1 rounded-full bg-error-container text-error text-xs font-bold">
            환불 {refundCount}건
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">총 유효 결제 금액</span>
          <div className="text-xl font-bold text-primary mt-1">
            {totalPaidAmount.toLocaleString()}원
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">정상 결제 건수</span>
          <div className="text-xl font-bold text-on-surface mt-1">{paidCount}건</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">환불 완료 건수</span>
          <div className="text-xl font-bold text-error mt-1">{refundCount}건</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/30 focus:outline-none"
          >
            <option value="ALL">전체 결제 상태</option>
            <option value="PAID">결제 완료</option>
            <option value="REFUNDED">환불 완료</option>
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="회원명, 연락처, 주문번호 검색"
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">주문/결제 번호</th>
                <th className="py-3 px-4">회원명</th>
                <th className="py-3 px-4">연락처</th>
                <th className="py-3 px-4">상품 (참가권 유형)</th>
                <th className="py-3 px-4">결제 금액</th>
                <th className="py-3 px-4">결제 상태</th>
                <th className="py-3 px-4">결제 일시</th>
                <th className="py-3 px-4 text-center">조치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-on-surface-variant">
                    조회된 결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredList.map((app) => {
                  const isUnmasked = unmaskedSet.has(app.id);
                  const isRefunded = app.paymentStatus === 'REFUNDED';
                  const amount = app.paidAmount || (app.ticketType?.includes('3회') ? 42000 : 15000);

                  return (
                    <tr key={app.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {app.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        {app.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-on-surface-variant">
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
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[10px]">
                          {app.ticketType || '1회 참가권'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        {amount.toLocaleString()}원
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isRefunded
                              ? 'bg-error-container text-error'
                              : 'bg-tertiary-fixed text-tertiary'
                          }`}
                        >
                          {isRefunded ? '환불 완료' : '결제 완료'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {app.paidAt || app.createdAt || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {!isRefunded ? (
                          <button
                            type="button"
                            onClick={() => setRefundTarget(app)}
                            className="px-2.5 py-1 rounded-lg bg-error-container hover:bg-error hover:text-white text-error font-semibold text-[11px] transition-colors"
                          >
                            환불 처리
                          </button>
                        ) : (
                          <span className="text-[11px] text-outline">환불됨</span>
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

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-error text-[18px]">currency_exchange</span>
                <span>수동 환불 승인 ({refundTarget.name})</span>
              </h3>
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">주문 번호:</span>
                  <span className="font-mono font-bold text-on-surface">{refundTarget.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">환불 대상 상품:</span>
                  <span className="font-bold text-on-surface">{refundTarget.ticketType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">환불 예정 금액:</span>
                  <span className="font-bold text-error">
                    {(refundTarget.paidAmount || 15000).toLocaleString()}원 (100% 전액)
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">환불 사유 선택</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface focus:outline-none"
                >
                  <option value="고객 단순 변심 (마감 전)">고객 단순 변심 (마감 전)</option>
                  <option value="운영진 직권 취소 (정원 미달)">운영진 직권 취소 (정원 미달)</option>
                  <option value="개인 사정 및 병가 제출">개인 사정 및 병가 제출</option>
                  <option value="중복 결제 취소 요청">중복 결제 취소 요청</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-error text-white font-bold hover:bg-error/90 transition-colors"
                >
                  환불 승인 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
