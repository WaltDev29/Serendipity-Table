import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { updateUserByAdminApi, sendDirectMessageApi } from '../../api/admin';

export default function AdminUsersPage() {
  const { users, banUser, unbanUser, addStrikeUser, addAuditLog, refreshAdminData } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 우클릭 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState(null); // { x, y, user }

  // 1. 정보 수정 모달 상태 (전화번호, 비밀번호, 나이, 성별)
  const [editUser, setEditUser] = useState(null);
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('M');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // 2. 주의 사유 추가 모달 상태
  const [strikeTargetUser, setStrikeTargetUser] = useState(null);
  const [strikeReason, setStrikeReason] = useState('무단 지각 (30분 이상)');
  const [strikeNote, setStrikeNote] = useState('');

  // 3. 블랙리스트 설정 모달 상태
  const [banTargetUser, setBanTargetUser] = useState(null);
  const [banReason, setBanReason] = useState('당일 무단 노쇼');
  const [banNote, setBanNote] = useState('');

  // 4. 1:1 메시지 전송 모달 상태
  const [dmTargetUser, setDmTargetUser] = useState(null);
  const [dmTitle, setDmTitle] = useState('');
  const [dmContent, setDmContent] = useState('');
  const [isSendingDm, setIsSendingDm] = useState(false);

  // 우클릭 이벤트 핸들러
  const handleContextMenu = (e, u) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user: u
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // 모달 오픈 핸들러
  const openEditModal = (u) => {
    setEditUser(u);
    setEditPhone(u.phone && u.phone !== '-' ? u.phone : '');
    setEditPassword('');
    const currentAge = u.age || (u.birthYear ? (2026 - u.birthYear + 1) : 28);
    setEditAge(String(currentAge));
    setEditGender(u.gender === '여' || u.gender === 'F' ? 'F' : 'M');
    closeContextMenu();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      setIsUpdatingUser(true);
      const parsedAge = parseInt(editAge, 10);
      const birthYear = !isNaN(parsedAge) && parsedAge > 0 ? (2026 - parsedAge + 1) : editUser.birthYear;
      await updateUserByAdminApi(editUser.id, {
        phone: editPhone,
        password: editPassword.trim() ? editPassword.trim() : null,
        birthYear: birthYear,
        gender: editGender
      });
      await refreshAdminData();
      addAuditLog('USER_EDIT', '총괄관리자', `회원 ${editUser.name}(${editUser.id}) 정보 수정: 연락처=${editPhone}, 나이=${editAge}, 성별=${editGender}`);
      alert(`${editUser.name} 회원의 정보가 수정되었습니다.`);
      setEditUser(null);
    } catch (err) {
      console.error('Update user failed:', err);
      alert('회원 정보 수정 실패: ' + (err.message || '오류 발생'));
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const openDmModal = (u) => {
    setDmTargetUser(u);
    setDmTitle(`[우연한 식탁] ${u.name}님께 안내드립니다`);
    setDmContent('');
    closeContextMenu();
  };

  const handleDmSubmit = async (e) => {
    e.preventDefault();
    if (!dmTargetUser || !dmTitle.trim() || !dmContent.trim()) return;
    try {
      setIsSendingDm(true);
      await sendDirectMessageApi(dmTargetUser.id, dmTitle.trim(), dmContent.trim());
      await refreshAdminData();
      addAuditLog('DM_SENT', '총괄관리자', `회원 ${dmTargetUser.name}(${dmTargetUser.id})에게 1:1 메시지 전송: ${dmTitle.trim()}`);
      alert(`${dmTargetUser.name} 회원님께 1:1 메시지를 발송하였습니다.`);
      setDmTargetUser(null);
    } catch (err) {
      console.error('Send DM failed:', err);
      alert('메시지 전송 실패: ' + (err.message || '오류 발생'));
    } finally {
      setIsSendingDm(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterStatus !== 'ALL' && u.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      const matchInsta = (u.instagram || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchInsta;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg" onClick={closeContextMenu}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            회원목록
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            등록된 전체 회원을 조회하고 관리합니다. 행을 우클릭하여 정보 수정, 주의 사유 추가, 블랙리스트 설정/해제를 진행할 수 있습니다.
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

      {/* Main Full-Width Table */}
      <div className="space-y-3">
        {/* Filter Bar */}
        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface">상태:</span>
            {[
              { id: 'ALL', label: '전체' },
              { id: 'CLEAN', label: '정상 회원' },
              { id: 'WARNING', label: '주의 회원' },
              { id: 'BANNED', label: '영구 차단' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === st.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="이름, 연락처, 인스타 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-container text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Master User Grid with Separated Columns */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container">
                <tr>
                  <th className="py-3 px-3.5">회원 실명</th>
                  <th className="py-3 px-3">성별</th>
                  <th className="py-3 px-3">나이</th>
                  <th className="py-3 px-3.5">연락처</th>
                  <th className="py-3 px-3 text-center">모임 참여 횟수</th>
                  <th className="py-3 px-3 text-center">보유 참여권</th>
                  <th className="py-3 px-3.5 text-right">총 결제 금액</th>
                  <th className="py-3 px-3.5">매너온도</th>
                  <th className="py-3 px-3.5">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-on-surface-variant">
                      회원 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isWithdrawn = u.status === 'WITHDRAWN' || u.status === 'DELETED' || u.isWithdrawn;
                    const isBanned = u.status === 'BANNED';
                    const isWarning = u.status === 'WARNING';
                    return (
                      <tr
                        key={u.id}
                        onContextMenu={(e) => handleContextMenu(e, u)}
                        className="hover:bg-surface-container-low/60 transition-colors cursor-pointer select-none"
                      >
                        <td className="py-3.5 px-3.5">
                          <div className="font-bold text-on-surface">{u.name}</div>
                          <span className="text-[10px] text-primary font-mono">{u.instagram}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={u.gender === '여' ? 'text-primary font-bold' : 'text-blue-600 font-bold'}>
                            {u.gender}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-on-surface">
                          {u.age || (2026 - u.birthYear + 1)}세
                        </td>
                        <td className="py-3.5 px-3.5 font-mono text-[11px] text-on-surface-variant">
                          {u.phone}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-on-surface">
                          {u.attendanceCount}회
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container font-bold text-primary">
                            {u.remainingTickets}장
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-bold text-on-surface">
                          ₩{(u.totalSpend || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span
                            className={`font-bold text-xs ${
                              u.mannerTemp >= 37.5
                                ? 'text-secondary'
                                : u.mannerTemp >= 36.5
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
                              isWithdrawn
                                ? 'bg-outline-variant/30 text-outline'
                                : isBanned
                                ? 'bg-error-container text-error'
                                : isWarning
                                ? 'bg-secondary-fixed text-secondary'
                                : 'bg-tertiary-fixed text-tertiary'
                            }`}
                          >
                            {isWithdrawn
                              ? '탈퇴'
                              : isBanned
                              ? '영구 차단'
                              : isWarning
                              ? `주의 ${u.strikeCount}회`
                              : '정상 이용'}
                          </span>
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

      {/* 우클릭 컨텍스트 메뉴 팝업 */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-surface-container-lowest border border-surface-container rounded-xl shadow-2xl py-1.5 w-48 animate-fade-in text-xs"
        >
          <div className="px-3 py-1.5 text-[11px] text-outline font-bold border-b border-surface-container">
            {contextMenu.user.name} ({contextMenu.user.phone})
          </div>

          <button
            type="button"
            onClick={() => openEditModal(contextMenu.user)}
            className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">edit</span>
            <span>정보 수정</span>
          </button>

          <button
            type="button"
            onClick={() => openStrikeModal(contextMenu.user)}
            className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center gap-2 text-secondary"
          >
            <span className="material-symbols-outlined text-[15px]">warning</span>
            <span>주의 사유 추가</span>
          </button>

          {contextMenu.user.status === 'BANNED' ? (
            <button
              type="button"
              onClick={() => handleUnban(contextMenu.user)}
              className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center gap-2 text-tertiary font-bold"
            >
              <span className="material-symbols-outlined text-[15px]">lock_open</span>
              <span>블랙리스트 해제</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openBanModal(contextMenu.user)}
              className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center gap-2 text-error font-bold"
            >
              <span className="material-symbols-outlined text-[15px]">block</span>
              <span>블랙리스트 설정</span>
            </button>
          )}

          <div className="border-t border-surface-container my-1"></div>

          <button
            type="button"
            onClick={() => openDmModal(contextMenu.user)}
            className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center gap-2 text-on-surface"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
            <span>1:1 메시지 전송</span>
          </button>
        </div>
      )}

      {/* 1. 정보 수정 모달 */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <h3 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">edit</span>
              <span>{editUser.name} 회원 정보 수정</span>
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">전화번호</label>
                <input
                  type="text"
                  required
                  placeholder="01012345678"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">새 비밀번호 (미입력 시 기존 유지)</label>
                <input
                  type="password"
                  placeholder="새 비밀번호 입력"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-on-surface-variant block mb-1">나이 (만)</label>
                  <input
                    type="number"
                    min="19"
                    max="99"
                    required
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant block mb-1">성별</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                  >
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isUpdatingUser}
                  onClick={() => setEditUser(null)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50"
                >
                  {isUpdatingUser ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. 주의 사유 추가 모달 */}
      {strikeTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <h3 className="font-title-md text-sm font-bold text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>주의 부여 (현재 {strikeTargetUser.strikeCount}회)</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">{strikeTargetUser.name}</strong> 회원에게 주의 1회를 부여합니다.
              <br />주의 3회 누적 시 시스템에서 자동으로 영구 차단(블랙리스트) 처리됩니다.
            </p>
            <form onSubmit={handleStrikeSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">주의 사유 선택</label>
                <select
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                >
                  <option value="무단 지각 (30분 이상)">무단 지각 (30분 이상)</option>
                  <option value="대화 에티켓 불량">대화 에티켓 불량 (불쾌한 언행)</option>
                  <option value="사적 연락처 강요">과도한 사적 연락처 강요</option>
                  <option value="모임 분위기 저해">모임 분위기 저해 및 비협조</option>
                  <option value="기타 사유">기타 사유 (직접 입력)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">세부 메모 (선택)</label>
                <input
                  type="text"
                  placeholder="구체적인 상황을 입력하세요..."
                  value={strikeNote}
                  onChange={(e) => setStrikeNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStrikeTargetUser(null)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-secondary text-on-secondary text-xs font-bold"
                >
                  주의 부여
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. 블랙리스트 설정 모달 */}
      {banTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <h3 className="font-title-md text-sm font-bold text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">block</span>
              <span>블랙리스트 영구 차단</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">{banTargetUser.name}</strong>({banTargetUser.phone}) 회원을 영구 차단합니다.
            </p>
            <form onSubmit={handleBanSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">차단 사유 선택</label>
                <select
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                >
                  <option value="당일 무단 노쇼">당일 무단 노쇼</option>
                  <option value="주의 3회 누적">주의 3회 누적</option>
                  <option value="성희롱/부적절한 접촉">성희롱/부적절한 접촉</option>
                  <option value="과도한 사적 연락 강요 및 스토킹">과도한 사적 연락 강요 및 스토킹</option>
                  <option value="신원 도용 및 허위 정보">신원 도용 및 허위 정보</option>
                  <option value="영리/영업 목적 참가">영리/영업 목적 참가</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">관리자 메모 (선택)</label>
                <input
                  type="text"
                  placeholder="특이사항 메모..."
                  value={banNote}
                  onChange={(e) => setBanNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanTargetUser(null)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-error text-white text-xs font-bold"
                >
                  차단 확정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. 1:1 메시지 발송 모달 */}
      {dmTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <h3 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
              <span>1:1 메시지 전송 ({dmTargetUser.name})</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              해당 메시지는 회원의 1:1 문의/알림 내역에 답변 완료 형태로 전달됩니다.
            </p>
            <form onSubmit={handleDmSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">제목</label>
                <input
                  type="text"
                  required
                  value={dmTitle}
                  onChange={(e) => setDmTitle(e.target.value)}
                  placeholder="메시지 제목을 입력하세요"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container"
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">내용</label>
                <textarea
                  rows={5}
                  required
                  value={dmContent}
                  onChange={(e) => setDmContent(e.target.value)}
                  placeholder="전달할 메시지 내용을 입력하세요..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSendingDm}
                  onClick={() => setDmTargetUser(null)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSendingDm}
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  <span>{isSendingDm ? '발송 중...' : '메시지 발송'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
