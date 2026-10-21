import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminCustomerServicePage() {
  const { csInquiries, setCsInquiries, replyInquiry, addAuditLog } = useAdmin();

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Context Menu State (우클릭 팝업 메뉴)
  const [contextMenu, setContextMenu] = useState(null); // { x, y, inquiry }

  const handleContextMenu = (e, inq) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      inquiry: inq
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleSelectInquiry = (inq) => {
    setSelectedInquiry(inq);
    setReplyText(inq.answer || inq.reply || '');
    closeContextMenu();
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedInquiry) return;

    await replyInquiry(selectedInquiry.id, replyText);

    setCsInquiries((prev) =>
      prev.map((inq) =>
        inq.id === selectedInquiry.id
          ? { ...inq, status: 'RESOLVED', reply: replyText, answer: replyText }
          : inq
      )
    );
    setSelectedInquiry({ ...selectedInquiry, status: 'RESOLVED', reply: replyText, answer: replyText });
    setReplyText('');
  };

  const filteredInquiries = csInquiries.filter((inq) => {
    if (filterStatus !== 'ALL' && inq.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && inq.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg" onClick={closeContextMenu}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            고객센터 CS 관제 (Customer Support)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            1:1 고객 문의 접수 내역을 확인하고 실시간 답변을 전송합니다. (행 우클릭 시 세부 작업 메뉴 지원)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-on-surface">
            총 문의 {csInquiries.length}건
          </span>
          <span className="px-3 py-1 rounded-full bg-error-container text-error text-xs font-bold">
            미답변 {csInquiries.filter((q) => q.status === 'OPEN').length}건
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Left: CS Table (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-3">
          {/* Filters */}
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface">상태:</span>
              {[
                { id: 'ALL', label: '전체' },
                { id: 'OPEN', label: '대기 중' },
                { id: 'RESOLVED', label: '답변 완료' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterStatus === st.id
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface">유형:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs bg-surface-container border-none text-on-surface"
              >
                <option value="ALL">전체 유형</option>
                <option value="취소/환불">취소/환불</option>
                <option value="매칭/일정">매칭/일정</option>
                <option value="서비스 이용">서비스 이용</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container">
                  <tr>
                    <th className="py-3 px-3.5">회원명 / 연락처</th>
                    <th className="py-3 px-3.5">문의 유형</th>
                    <th className="py-3 px-3.5">문의 내용</th>
                    <th className="py-3 px-3.5">상태</th>
                    <th className="py-3 px-3.5">접수 일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-on-surface-variant">
                        문의 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inq) => {
                      const isSelected = selectedInquiry?.id === inq.id;
                      return (
                        <tr
                          key={inq.id}
                          onClick={() => handleSelectInquiry(inq)}
                          onContextMenu={(e) => handleContextMenu(e, inq)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/5 font-semibold' : 'hover:bg-surface-container-low/60'
                          }`}
                        >
                          <td className="py-3.5 px-3.5">
                            <div className="font-bold text-on-surface">{inq.userName}</div>
                            <span className="text-[10px] text-outline font-mono">{inq.userPhone}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold text-on-surface">
                              {inq.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 max-w-[280px]">
                            <div className="truncate text-on-surface">{inq.title || inq.content}</div>
                            <div className="truncate text-[10px] text-on-surface-variant font-normal">
                              {inq.content}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inq.status === 'RESOLVED'
                                  ? 'bg-tertiary-fixed text-tertiary'
                                  : 'bg-error-container text-error animate-pulse'
                              }`}
                            >
                              {inq.status === 'RESOLVED' ? '답변 완료' : '답변 대기'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-[11px] text-outline font-mono">
                            {inq.time}
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

        {/* Right: Reply Drawer / Detail (4 cols) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-4">
            <h3 className="font-title-md text-sm font-bold text-on-surface border-b border-surface-container pb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">chat</span>
              <span>1:1 문의 상담 및 답변</span>
            </h3>

            {selectedInquiry ? (
              <div className="space-y-3">
                <div className="bg-surface-container-low p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-on-surface">{selectedInquiry.userName} ({selectedInquiry.category})</span>
                    <span className="text-[10px] text-outline">{selectedInquiry.time}</span>
                  </div>
                  <p className="text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.content}
                  </p>
                </div>

                {selectedInquiry.reply && (
                  <div className="bg-tertiary-fixed/30 p-3 rounded-xl border border-tertiary-fixed space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>등록된 답변:</span>
                    </div>
                    <p className="text-xs text-on-surface whitespace-pre-wrap">
                      {selectedInquiry.reply}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="space-y-2">
                  <label className="text-xs font-bold text-on-surface block">
                    {selectedInquiry.reply ? '답변 수정하기' : '답변 작성하기'}
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="고객에게 안내할 답변 내용을 입력하세요..."
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="w-full py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    답변 발송 및 저장
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-16 text-center text-on-surface-variant text-xs">
                왼쪽 테이블에서 문의 항목을 클릭하거나 우클릭하세요.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 우클릭 컨텍스트 메뉴 팝업 */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl py-1 w-44 animate-fade-in text-xs"
        >
          <button
            type="button"
            onClick={() => handleSelectInquiry(contextMenu.inquiry)}
            className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">reply</span>
            <span>답변 작성/수정</span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(contextMenu.inquiry.userPhone);
              alert('연락처가 복사되었습니다: ' + contextMenu.inquiry.userPhone);
              closeContextMenu();
            }}
            className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface"
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">content_copy</span>
            <span>연락처 복사</span>
          </button>
        </div>
      )}
    </div>
  );
}
