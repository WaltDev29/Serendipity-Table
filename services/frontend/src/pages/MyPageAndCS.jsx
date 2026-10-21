import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { getUpcomingSlotsApi } from '../api/slot';
import { checkoutOrderApi, applySlotApi, getMyApplicationsApi } from '../api/application';
import { withdrawApi } from '../api/auth';

export default function MyPageAndCS() {
  const navigate = useNavigate();
  const { currentUser, matchResult, refreshAppData, setUserState, logout } = useApp();
  const { showAlert, showConfirm } = useModal();

  // 모달 상태
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // 참가권 구매 선택
  const [buyTicketType, setBuyTicketType] = useState('1_TICKET'); // '1_TICKET' or '3_TICKETS'
  const [isBuying, setIsBuying] = useState(false);

  // 참가 신청 선택 및 기존 신청 내역
  const [slots, setSlots] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // 회차 목록 및 내 신청 내역 로드
  useEffect(() => {
    getUpcomingSlotsApi()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlots(data);
          setSelectedSlotId(data[0].id);
        }
      })
      .catch((err) => {
        console.warn('Failed to load slots:', err);
      });

    getMyApplicationsApi()
      .then((apps) => {
        if (Array.isArray(apps)) {
          setMyApplications(apps);
        }
      })
      .catch((err) => {
        console.warn('Failed to load my applications:', err);
      });
  }, []);

  // 사용자 프로필의 기본 권역(preferredRegions) 자동 선택
  useEffect(() => {
    const userPrefRegion = (currentUser?.preferredRegions && currentUser.preferredRegions.length > 0)
      ? currentUser.preferredRegions[0]
      : '홍대 / 합정';
    setSelectedRegion(userPrefRegion);
  }, [currentUser]);

  const ticketCount = currentUser?.ticketCount ?? currentUser?.tickets ?? 0;

  // 참가권 구매 처리
  const handleBuyTicket = async () => {
    const isThree = buyTicketType === '3_TICKETS';
    const itemName = isThree ? '우연한 식탁 3회 참가권 (₩15,000)' : '우연한 식탁 1회 참가권 (₩8,000)';
    const ok = await showConfirm(
      `${itemName}을(를) 결제하시겠습니까?`,
      '참가권 결제 확인'
    );
    if (!ok) {
      return;
    }

    try {
      setIsBuying(true);
      await checkoutOrderApi({
        ticketType: buyTicketType,
        ticketCount: isThree ? 3 : 1,
        amount: isThree ? 15000 : 8000,
        paymentMethod: 'CARD',
        itemName: isThree ? '우연한 식탁 3회 참가권' : '우연한 식탁 1회 참가권'
      });
      await refreshAppData();
      await showAlert(`참가권이 성공적으로 구매되었습니다! (보유: +${isThree ? 3 : 1}회)`, '구매 완료');
      setIsBuyModalOpen(false);
    } catch (err) {
      await showAlert('참가권 구매 실패: ' + (err.message || '오류가 발생했습니다.'), '오류');
    } finally {
      setIsBuying(false);
    }
  };

  // 신청하기 클릭 핸들러 (참가권 검증 후 모달 오픈)
  const handleOpenApplyModal = async () => {
    if (ticketCount <= 0) {
      const wantBuy = await showConfirm('보유하신 참가권이 없습니다. 참가권 구매 창으로 이동하시겠습니까?', '참가권 필요');
      if (wantBuy) {
        setIsBuyModalOpen(true);
      }
      return;
    }
    // 내 신청 내역 최신화
    try {
      const apps = await getMyApplicationsApi();
      if (Array.isArray(apps)) setMyApplications(apps);
    } catch (e) {}
    setIsApplyModalOpen(true);
  };

  // 실제 모임 참가 신청 처리
  const handleSubmitApply = async () => {
    if (!selectedSlotId) {
      await showAlert('신청하실 날짜(회차)를 선택해주세요.', '입력 필요');
      return;
    }
    if (!selectedRegion) {
      await showAlert('참여하실 권역을 선택해주세요.', '입력 필요');
      return;
    }

    // 중복 신청 방지 검증: 이미 신청한 슬롯인지 확인
    const alreadyApplied = myApplications.some(
      (app) => app.eventSlotId === selectedSlotId && app.status !== 'CANCELLED'
    );
    if (alreadyApplied) {
      await showAlert('이미 신청하신 모임(회차)입니다. 동일한 회차에는 중복으로 신청할 수 없습니다.', '중복 신청 불가');
      return;
    }

    const ok = await showConfirm('보유 참가권 1회를 사용하여 식탁 모임에 신청하시겠습니까?', '모임 신청');
    if (!ok) {
      return;
    }

    try {
      setIsApplying(true);
      await applySlotApi(selectedSlotId, [selectedRegion]);
      await refreshAppData();
      setUserState('WAITING');
      await showAlert('참가 신청이 성공적으로 완료되었습니다! 매칭 발표를 기다려주세요.', '신청 완료');
      setIsApplyModalOpen(false);
      navigate('/');
    } catch (err) {
      await showAlert('신청 처리 실패: ' + (err.message || '오류가 발생했습니다.'), '오류');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col w-full items-center justify-start py-space-md px-margin sm:px-0">
        <div className="w-full max-w-[450px] flex flex-col gap-space-md pb-24">
          
          {/* Header Bar ('내 계정 및 이용 현황' 텍스트 제거) */}
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <h1 className="font-headline-sm text-base font-bold text-on-surface">
              마이페이지
            </h1>
          </div>

          <div className="flex flex-col gap-space-md w-full">
            
            {/* 1. USER PROFILE CARD */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden border border-surface-container">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>
              
              {/* 상단 프로필 및 테이블 매너(온도만 우측 정렬) */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-space-md">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary-fixed/40 flex items-center justify-center shrink-0 shadow-sm ring-4 ring-surface-container-low">
                    {currentUser?.profileImageUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        src={currentUser.profileImageUrl}
                        alt="프로필"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[38px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        person
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {currentUser?.nickname || currentUser?.name || '회원'}
                      </h2>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                      {currentUser?.age || (currentUser?.birthYear ? 2026 - currentUser.birthYear : 28)}세 · {currentUser?.job || '직장인'} · {currentUser?.mbti || 'ENFP'}
                    </p>
                  </div>
                </div>

                {/* 테이블 매너: 한 칸 올려서 우측 정렬 (온도만 작성) */}
                <div className="flex items-center gap-1 bg-secondary-fixed/30 px-3 py-1.5 rounded-full text-secondary font-bold text-xs shadow-xs">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                  <span>{currentUser?.mannerTemp ? Number(currentUser.mannerTemp).toFixed(1) : '36.5'}°C</span>
                </div>
              </div>

              {/* Interest Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(currentUser?.interests && currentUser.interests.length > 0 ? currentUser.interests : ['맛집·카페 탐방', '전시·공연', '깊은 대화']).map((tag, idx) => (
                  <span key={idx} className="px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Edit Profile & Tastes Action Button */}
              <div className="pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => navigate('/information-input')}
                  className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[17px] text-primary">edit_note</span>
                  <span>회원정보 수정</span>
                </button>
              </div>
            </div>

            {/* 2. RESERVED OR APPLIED TABLE CARD */}
            {matchResult ? (
              <div
                onClick={() => navigate('/match/result')}
                className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-primary/20 flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                    <span className="material-symbols-outlined text-[18px]">restaurant</span>
                    <span>예약된 식탁</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-xs">
                    매칭 완료
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface">
                      {matchResult.tableName}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {matchResult.venue?.name} · {matchResult.eventDate}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center justify-between">
                  <span>4인 배정 완료 · 익명 멤버 프로필</span>
                  <span className="text-primary font-bold">확인하기 →</span>
                </div>
              </div>
            ) : myApplications.some((a) => a.status === 'APPLIED' || a.status === 'WAITING') ? (
              (() => {
                const activeApp = myApplications.find((a) => a.status === 'APPLIED' || a.status === 'WAITING');
                const regionName = (activeApp?.preferredRegions && activeApp.preferredRegions.length > 0)
                  ? activeApp.preferredRegions.join(', ')
                  : (activeApp?.region || '홍대 / 합정');
                const eventInfo = activeApp?.eventDate ? `${activeApp.eventDate} 19:30` : '이번 주 목요일 19:30';

                return (
                  <div
                    onClick={() => navigate('/matching-waiting')}
                    className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-secondary-fixed flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-secondary font-bold text-xs">
                        <span className="material-symbols-outlined text-[18px]">event_available</span>
                        <span>신청한 모임</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
                        매칭 대기 중
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h3 className="font-headline-sm text-base font-bold text-on-surface">
                          {regionName} 식탁 신청
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {eventInfo}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-outline">chevron_right</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center justify-between">
                      <span>AI 알고리즘이 4인 성향을 분석 중입니다</span>
                      <span className="text-secondary font-bold">대기 현황 확인 →</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div
                onClick={handleOpenApplyModal}
                className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">restaurant</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm font-bold text-on-surface">현재 예약된 식탁이 없어요</span>
                    <span className="text-xs text-on-surface-variant">목요일 밤 따뜻한 식탁에 참여해보세요</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenApplyModal();
                  }}
                  className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container"
                >
                  신청하기
                </button>
              </div>
            )}

            {/* 3. MY TICKET CARD */}
            {/* 프로그레스 바 삭제, '언제든 사용 가능'/'무제한 사용' 제거, 보유 참가권 우측 정렬로 개수 표시 ('0개'), 버튼 텍스트 '참가권 구매' */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg">
                  <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                  <span className="font-bold">보유 참가권</span>
                </div>
                <span className="font-headline-sm text-base font-bold text-primary">
                  {ticketCount}개
                </span>
              </div>

              <div className="flex items-center justify-between pt-space-xs">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-space-xs active:scale-95 font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>참가권 구매</span>
                </button>
              </div>
            </div>

            {/* 4. DEDICATED NAVIGATION BUTTONS (지난 식탁 & '차단 멤버' 수정) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/past-tables')}
                className="w-full p-4 rounded-2xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-all shadow-sm flex items-center justify-between text-xs font-bold text-on-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">지난 식탁 다이어리</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">내가 참여했던 따뜻한 식탁 목록</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/blocked-users')}
                className="w-full p-4 rounded-2xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-all shadow-sm flex items-center justify-between text-xs font-bold text-on-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">shield</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">차단 멤버</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">비매너 참가자 영구 배제 목록</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>
            </div>

            {/* 5. CUSTOMER SERVICE BUTTON */}
            <div className="pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => navigate('/cs')}
                className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between text-xs font-bold text-on-surface border border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold">고객센터 & FAQ</span>
                    <span className="text-[11px] text-on-surface-variant font-normal">자주 묻는 질문 및 1:1 실시간 문의하기</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>
            </div>

            {/* 6. LOGOUT & WITHDRAW BUTTON */}
            <div className="pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  const ok = await showConfirm('로그아웃 하시겠습니까?', '로그아웃');
                  if (ok) {
                    logout();
                    navigate('/login');
                  }
                }}
                className="w-full py-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-all flex items-center justify-center gap-2 text-xs font-semibold border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>로그아웃</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const ok = await showConfirm(
                    '정말 우연한 식탁을 탈퇴하시겠습니까?\n\n탈퇴 시 보유 중인 참가권 및 계정 이용이 제한되며, 서비스 악용 방지를 위해 기존 활동 이력은 보존됩니다.',
                    '회원 탈퇴 확인'
                  );
                  if (ok) {
                    try {
                      await withdrawApi();
                      await showAlert('회원 탈퇴 처리가 완료되었습니다. 그동안 우연한 식탁을 이용해 주셔서 감사합니다.', '탈퇴 완료');
                      logout();
                      navigate('/login');
                    } catch (err) {
                      await showAlert('탈퇴 처리 실패: ' + err.message, '오류');
                    }
                  }
                }}
                className="w-full py-2.5 rounded-2xl text-outline hover:text-error transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
              >
                <span className="material-symbols-outlined text-[15px]">person_off</span>
                <span>회원 탈퇴하기</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 참가권 구매 모달 창 */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-1.5 text-primary font-bold text-base">
                <span className="material-symbols-outlined text-xl">confirmation_number</span>
                <h3>참가권 구매</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              원하시는 참가권 옵션을 선택 후 모의 결제를 진행해주세요.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setBuyTicketType('1_TICKET')}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  buyTicketType === '1_TICKET'
                    ? 'border-primary bg-primary-fixed/40 text-primary font-bold shadow-xs'
                    : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                <div>
                  <span className="block text-sm font-bold">1회권</span>
                  <span className="text-[11px] text-on-surface-variant font-normal">1회 참가권</span>
                </div>
                <span className="text-sm font-extrabold">₩8,000</span>
              </button>

              <button
                type="button"
                onClick={() => setBuyTicketType('3_TICKETS')}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  buyTicketType === '3_TICKETS'
                    ? 'border-primary bg-primary-fixed/40 text-primary font-bold shadow-xs'
                    : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="block text-sm font-bold">3회권</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[10px] font-bold">인기</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-normal">회당 ₩5,000</span>
                </div>
                <span className="text-sm font-extrabold">₩15,000</span>
              </button>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isBuying}
                onClick={handleBuyTicket}
                className="flex-1 h-11 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-1"
              >
                {isBuying ? '결제 처리 중...' : '모의 결제하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 실제 참가 신청 모달 창 (날짜 DB 연동, 권역 자동 선택, 확인 절차) */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-1.5 text-primary font-bold text-base">
                <span className="material-symbols-outlined text-xl">restaurant</span>
                <h3>식탁 참가 신청</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              보유하신 참가권 1회를 사용하여 식탁 모임을 신청합니다.
            </p>

            {/* 1. 지역(권역) 선택 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span>1. 참석 희망 지역</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['홍대 / 합정', '잠실 / 송파', '강남 / 신논현', '을지로 / 종로'].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(reg);
                      const filtered = slots.filter((s) => {
                        if (!s.regions || s.regions.length === 0) return true;
                        const matched = s.regions.find((r) =>
                          r.region === reg ||
                          reg.includes(r.region) ||
                          (reg.split(' ')[0] && r.region.includes(reg.split(' ')[0]))
                        );
                        return matched ? !matched.isClosed : true;
                      });
                      if (filtered.length > 0 && !filtered.some((s) => s.id === selectedSlotId)) {
                        setSelectedSlotId(filtered[0].id);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedRegion === reg
                        ? 'border-primary bg-primary-fixed/40 text-primary font-bold shadow-xs'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 시간(모임 일정) 선택 (선택한 지역에 따라 모집 중인 모임 표시, '모집 중' 텍스트 제거) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                <span>2. 모임 일정 및 시간</span>
              </label>
              {(() => {
                const availableSlots = slots.filter((s) => {
                  if (!s.regions || s.regions.length === 0) return true;
                  const matched = s.regions.find((r) =>
                    r.region === selectedRegion ||
                    selectedRegion.includes(r.region) ||
                    (selectedRegion.split(' ')[0] && r.region.includes(selectedRegion.split(' ')[0]))
                  );
                  return matched ? !matched.isClosed : true;
                });

                if (availableSlots.length === 0) {
                  return (
                    <div className="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant text-center">
                      선택하신 권역에 현재 모집 중인 모임 일정이 없습니다.
                    </div>
                  );
                }

                return (
                  <select
                    value={selectedSlotId || ''}
                    onChange={(e) => setSelectedSlotId(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {availableSlots.map((s) => {
                      const isApplied = myApplications.some(
                        (app) => app.eventSlotId === s.id && app.status !== 'CANCELLED'
                      );
                      return (
                        <option key={s.id} value={s.id}>
                          {s.eventDate} ({s.eventTime ? s.eventTime.substring(0, 5) : '19:30'}){isApplied ? ' [신청 완료]' : ''}
                        </option>
                      );
                    })}
                  </select>
                );
              })()}
            </div>

            {/* 잔여 참가권 확인 안내 */}
            <div className="p-3 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant flex items-center justify-between">
              <span>차감 예정 참가권:</span>
              <span className="text-primary font-bold">1회 (잔여: {ticketCount}회 ➔ {ticketCount - 1}회)</span>
            </div>

            {/* 신청 버튼 & 취소 버튼 */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isApplying}
                onClick={handleSubmitApply}
                className="flex-1 h-11 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-1"
              >
                {isApplying ? '신청 처리 중...' : '참가권으로 신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

