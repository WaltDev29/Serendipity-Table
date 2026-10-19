import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminUsersPage() {
  const { users, banUser, csInquiries, setCsInquiries, addAuditLog } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // M-07 Ban Modal State
  const [banTargetUser, setBanTargetUser] = useState(null);
  const [banReason, setBanReason] = useState('당일 무단 노쇼 2회');
  const [banNote, setBanNote] = useState('');

  // 1:1 CS Reply State
  const [selectedInquiry, setSelectedInquiry] = useState(csInquiries[0]);
  const [replyText, setReplyText] = useState('');

  const handleBanSubmit = (e) => {
    e.preventDefault();
    if (!banTargetUser) return;
    banUser(banTargetUser.id, banReason, banNote);
    setBanTargetUser(null);
    setBanNote('');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedInquiry) return;

    setCsInquiries((prev) =>
      prev.map((inq) =>
        inq.id === selectedInquiry.id
          ? { ...inq, status: 'RESOLVED', reply: replyText }
          : inq
      )
    );
    setSelectedInquiry({ ...selectedInquiry, status: 'RESOLVED', reply: replyText });
    setReplyText('');
    addAuditLog('CS_REPLY', '운영자 김관리', `${selectedInquiry.userName} 회원 1:1 문의 답변 완료`);
  };

  const filteredUsers = users.filter((u) => {
    if (filterStatus !== 'ALL' && u.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.instagram.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            회원 관리 및 블랙리스트 센터 (User Ops & Blacklist)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            회원 프로필, 매너온도(℃), 노쇼 2진 아웃제(Strike)를 관리하고 영구 차단 및 1:1 실시간 CS 상담을 진행합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-on-surface">
            전체 회원 {users.length}명
          </span>
          <span className="px-3 py-1 rounded-full bg-error-container text-error text-xs font-bold">
            블랙리스트 {users.filter((u) => u.status === 'BANNED').length}명
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid: Left(Master User Grid 8 cols) + Right(1:1 CS Inbox 4 cols) */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* ========================================================= */}
        {/* 1. LEFT: 회원 마스터 데이터 그리드 (8 cols)                 */}
        {/* ========================================================= */}
        <div className="col-span-12 lg:col-span-8 space-y-3">
          {/* Filter Bar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface">상태:</span>
              {[
                { id: 'ALL', label: '전체' },
                { id: 'CLEAN', label: '정상 회원' },
                { id: 'WARNING', label: '주의 (1회)' },
                { id: 'BANNED', label: '영구 차단' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterStatus === st.id
                      ? 'bg-primary text-white font-bold'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름, 연락처, 인스타 검색..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container">
                  <tr>
                    <th className="py-3 px-3.5">회원 실명</th>
                    <th className="py-3 px-3.5">성별 / 나이</th>
                    <th className="py-3 px-3.5">연락처</th>
                    <th className="py-3 px-3.5">참여 / 누적결제</th>
                    <th className="py-3 px-3.5">매너온도</th>
                    <th className="py-3 px-3.5">제재 단계</th>
                    <th className="py-3 px-3.5 text-center">조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {filteredUsers.map((u) => {
                    const isBanned = u.status === 'BANNED';
                    const isWarning = u.status === 'WARNING';
                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <div className="font-bold text-on-surface">{u.name}</div>
                          <span className="text-[10px] text-primary font-mono">{u.instagram}</span>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span className={u.gender === '여' ? 'text-primary font-bold' : 'text-blue-600 font-bold'}>
                            {u.gender}
                          </span>{' '}
                          / {2026 - u.birthYear + 1}세
                        </td>
                        <td className="py-3.5 px-3.5 font-mono text-[11px] text-on-surface-variant">
                          {u.phone}
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span className="font-bold text-on-surface">{u.attendanceCount}회</span>
                          <span className="text-[10px] text-outline block">₩{u.totalSpend.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span
                            className={`font-bold text-xs ${
                              u.mannerTemp >= 90
                                ? 'text-secondary'
                                : u.mannerTemp >= 70
                                ? 'text-tertiary'
                                : 'text-error'
                            }`}
                          >
                            {u.mannerTemp}°C
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isBanned
                                ? 'bg-error-container text-error'
                                : isWarning
                                ? 'bg-secondary-fixed text-secondary'
                                : 'bg-tertiary-fixed text-tertiary'
                            }`}
                          >
                            {isBanned
                              ? '영구 차단 (스트라이크 2)'
                              : isWarning
                              ? '주의 1회 (참가제한)'
                              : '정상 이용'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          {!isBanned ? (
                            <button
                              type="button"
                              onClick={() => setBanTargetUser(u)}
                              className="px-2.5 py-1 rounded-lg bg-error-container hover:bg-error hover:text-white text-error font-bold text-[11px] transition-colors"
                            >
                              영구 차단
                            </button>
                          ) : (
                            <span className="text-[11px] text-outline">차단됨</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. RIGHT: 1:1 고객센터 실시간 문의 인박스 (4 cols)        */}
        {/* ========================================================= */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
                <h3 className="font-title-md text-sm font-bold text-on-surface">
                  1:1 CS 문의 실시간 인박스
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">
                미처리 {csInquiries.filter((c) => c.status === 'OPEN').length}건
              </span>
            </div>

            {/* Inquiries List */}
            <div className="space-y-2">
              {csInquiries.map((inq) => {
                const isSelected = selectedInquiry && selectedInquiry.id === inq.id;
                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-surface-container bg-surface-container-low hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{inq.userName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-container text-[10px] text-outline">
                          {inq.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-outline">{inq.time}</span>
                    </div>
                    <p className="font-semibold text-on-surface truncate">{inq.subject}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span
                        className={`font-bold ${
                          inq.status === 'OPEN' ? 'text-primary' : 'text-tertiary'
                        }`}
                      >
                        {inq.status === 'OPEN' ? '● 답변 대기 중' : '✓ 답변 완료'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Inquiry Detail & Reply Form */}
            {selectedInquiry && (
              <div className="p-3 rounded-xl bg-surface-container-low space-y-2 text-xs">
                <div className="border-b border-surface-container pb-2">
                  <span className="font-bold text-on-surface block mb-0.5">
                    [{selectedInquiry.category}] {selectedInquiry.subject}
                  </span>
                  <p className="text-on-surface-variant leading-relaxed text-[11px]">
                    {selectedInquiry.content}
                  </p>
                </div>

                {selectedInquiry.reply ? (
                  <div className="p-2.5 rounded-lg bg-surface-container-lowest text-xs border border-tertiary/20">
                    <span className="font-bold text-tertiary block text-[10px] mb-0.5">기존 발송된 답변:</span>
                    <p className="text-on-surface">{selectedInquiry.reply}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="space-y-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="회원에게 전송할 카카오 알림톡 답변을 작성하세요..."
                      className="w-full p-2.5 rounded-xl bg-surface-container-lowest text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="w-full h-9 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-container disabled:opacity-40 transition-colors"
                    >
                      답변 전송 (카카오 알림톡 동시 발송)
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant">
            노쇼 1회 적발 시 30일 참가 정지(주의), 2회 누적 시 주민번호/전화번호 영구 블랙리스트로 자동 차단됩니다.
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL M-07: 영구 차단(Blacklist) 다이얼로그                 */}
      {/* ========================================================= */}
      {banTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
              <span className="material-symbols-outlined text-error text-[22px]">gavel</span>
              <h3 className="font-title-md text-base font-bold text-error">
                영구 블랙리스트 등록
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              대상 회원: <strong className="text-on-surface font-bold">{banTargetUser.name}</strong> (
              {banTargetUser.phone})
              <br />
              등록 시 계정이 영구 정지되며 향후 동일 번호/기기로 재가입이 차단됩니다.
            </p>

            <form onSubmit={handleBanSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  제재 사유 선택
                </label>
                <select
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none"
                >
                  <option value="당일 무단 노쇼 2회">당일 무단 노쇼 2회</option>
                  <option value="성희롱/연애 목적 변질">성희롱/연애 목적 변질</option>
                  <option value="언어폭력/분위기 훼손">언어폭력/분위기 훼손</option>
                  <option value="신원 도용/허위 정보">신원 도용/허위 정보</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  운영자 메모 (비공개 감사 기록)
                </label>
                <textarea
                  rows={2}
                  value={banNote}
                  onChange={(e) => setBanNote(e.target.value)}
                  placeholder="증빙 내역 또는 상담 메모를 남기세요."
                  className="w-full p-2.5 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setBanTargetUser(null)}
                  className="flex-1 h-9 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-error text-white text-xs font-bold shadow-md hover:bg-error-container hover:text-error transition-colors"
                >
                  영구 차단 실행
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
