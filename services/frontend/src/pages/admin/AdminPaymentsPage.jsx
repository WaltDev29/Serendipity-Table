import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function AdminPaymentsPage() {
  const { orders, applications, processRefund } = useAdmin();
  const [searchParams] = useSearchParams();

  // Filters: 'ALL' (결제 전체), 'REFUND_REQUEST' (환불 요청), 'REFUNDED' (환불완료)
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const phoneQuery = searchParams.get('phone') || searchParams.get('search');
    if (phoneQuery) {
      setSearchKeyword(phoneQuery);
    }
  }, [searchParams]);

  // Right-click Context Menu State
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null
  });

  // Contact Masking
  const [unmaskedSet, setUnmaskedSet] = useState(new Set());

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [contextMenu.visible]);

  // Date Formatter Helper
  const formatDate = (val) => {
    if (!val || val === '-') return '-';
    if (typeof val === 'string' && val.includes(':') && (val.includes('오전') || val.includes('오후') || val.length > 20)) {
      return val;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      return typeof val === 'string' ? val : '-';
    }
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleMask = (id) => {
    setUnmaskedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleRefundClick = async () => {
    if (!contextMenu.item) return;
    const item = contextMenu.item;
    const itemName = item.userName || item.name || '회원';
    const amount = item.amount || item.paidAmount || 8000;

    const ok = window.confirm(
      `[환불 확인]\n\n주문번호: ${item.orderNo || item.id}\n회원명: ${itemName}\n환불 금액: ${amount.toLocaleString()}원\n\n정말 해당 결제 건을 환불 처리하시겠습니까?`
    );

    if (ok) {
      try {
        await processRefund(item.id || item.orderNo, '관리자 수동 환불');
        alert('환불 처리가 완료되었습니다.');
      } catch (err) {
        alert('환불 처리 실패: ' + err.message);
      }
    }
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  };

  const paymentList = (orders && orders.length > 0) ? orders : applications;

  const filteredList = paymentList.filter((item) => {
    const status = item.status || item.paymentStatus || 'PAID';

    if (filterTab === 'REFUNDED') {
      if (status !== 'REFUNDED') return false;
    } else if (filterTab === 'REFUND_REQUEST') {
      if (status !== 'REFUND_REQUEST' && status !== 'CANCELLED') return false;
    }

    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const matchName = (item.userName || item.name || '').toLowerCase().includes(q);
      const matchPhone = (item.userPhone || item.phone || '').includes(q);
      const matchId = (item.orderNo || item.id || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId) return false;
    }
    return true;
  });

  const totalPaidAmount = paymentList
    .filter((a) => (a.status === 'PAID' || a.paymentStatus === 'PAID'))
    .reduce((sum, a) => sum + (a.amount || a.paidAmount || 8000), 0);
  const paidCount = paymentList.filter((a) => (a.status === 'PAID' || a.paymentStatus === 'PAID')).length;
  const refundCount = paymentList.filter((a) => (a.status === 'REFUNDED' || a.paymentStatus === 'REFUNDED')).length;

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
            참가권 결제 및 환불 내역을 조회합니다. 결제 행을 우클릭하여 환불 처리를 진행할 수 있습니다.
          </p>
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

      {/* Filter Bar with Tab Buttons & Search */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Buttons on left: '결제 전체', '환불 요청', '환불완료' */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            결제 전체 ({paymentList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('REFUND_REQUEST')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'REFUND_REQUEST'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            환불 요청
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('REFUNDED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'REFUNDED'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            환불완료 ({refundCount})
          </button>
        </div>

        {/* Search Input on right */}
        <div className="relative min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="회원명, 연락처, 주문번호 검색"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Payment Table ('조치' 컬럼 삭제, 우클릭 시 환불 메뉴) */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden relative">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-on-surface-variant">
                    조회된 결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredList.map((app) => {
                  const isUnmasked = unmaskedSet.has(app.id || app.orderNo);
                  const status = app.status || app.paymentStatus || 'PAID';
                  const isRefunded = status === 'REFUNDED';
                  const amount = app.amount || app.paidAmount || (app.ticketType?.includes('3회') ? 15000 : 8000);
                  const name = app.userName || app.name || '-';
                  const phone = app.userPhone || app.phone || '-';

                  return (
                    <tr
                      key={app.id || app.orderNo}
                      onContextMenu={(e) => handleContextMenu(e, app)}
                      className="hover:bg-surface-container-low/60 transition-colors cursor-context-menu select-none"
                      title="우클릭하여 환불 메뉴를 확인하세요"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {app.orderNo || app.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        {name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <span>
                            {isUnmasked ? phone : (phone || '').replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2')}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleMask(app.id || app.orderNo)}
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
                          {app.itemName || app.ticketType || '1회 참가권'}
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
                      <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                        {formatDate(app.paidAt || app.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Context Menu on Right Click */}
      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 min-w-[160px] bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container py-1.5 animate-fade-in text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-on-surface-variant border-b border-surface-container">
            주문 관리 메뉴
          </div>

          {(contextMenu.item?.status === 'PAID' || contextMenu.item?.paymentStatus === 'PAID') ? (
            <button
              type="button"
              onClick={handleRefundClick}
              className="w-full px-3 py-2 text-left text-error hover:bg-error-container/30 flex items-center gap-2 font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-sm">currency_exchange</span>
              <span>환불 처리</span>
            </button>
          ) : (
            <div className="px-3 py-2 text-outline flex items-center gap-2 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">block</span>
              <span>환불 불가 ({contextMenu.item?.status === 'REFUNDED' ? '이미 환불됨' : '상태 확인'})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
