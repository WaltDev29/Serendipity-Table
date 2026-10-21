import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getUpcomingSlotsApi } from '../../api/slot';
import { getMyApplicationsApi, applySlotApi, checkoutOrderApi } from '../../api/application';
import { useModal } from '../../context/ModalContext';

export default function ApplyModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser, ticketCount: ctxTicketCount, refreshAppData, setUserState } = useApp();
  const { showAlert, showConfirm } = useModal();

  const ticketCount = currentUser?.ticketCount ?? currentUser?.tickets ?? ctxTicketCount ?? 0;

  const [slots, setSlots] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('홍대 / 합정');
  const [isApplying, setIsApplying] = useState(false);

  // 구매 모달 상태
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyTicketType, setBuyTicketType] = useState('1_TICKET');
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

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

    const userPrefRegion = (currentUser?.preferredRegions && currentUser.preferredRegions.length > 0)
      ? currentUser.preferredRegions[0]
      : '홍대 / 합정';
    setSelectedRegion(userPrefRegion);
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // 참가권 구매 처리
  const handleBuyTicket = async () => {
    const isThree = buyTicketType === '3_TICKETS';
    const itemName = isThree ? '우연한 식탁 3회 참가권 (₩15,000)' : '우연한 식탁 1회 참가권 (₩8,000)';
    const ok = await showConfirm(
      `${itemName}을(를) 결제하시겠습니까?`,
      '참가권 결제 확인'
    );
    if (!ok) return;

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
      setIsBuyModalOpen(false);
      await showAlert('참가권 구매가 완료되었습니다!', '결제 완료');
    } catch (e) {
      await showAlert('참가권 결제 중 오류가 발생했습니다: ' + (e.message || '서버 오류'), '결제 실패');
    } finally {
      setIsBuying(false);
    }
  };

  // 모임 참가 신청 처리
  const handleSubmitApply = async () => {
    if (ticketCount <= 0) {
      const wantBuy = await showConfirm('보유하신 참가권이 없습니다. 참가권을 구매하시겠습니까?', '참가권 필요');
      if (wantBuy) {
        setIsBuyModalOpen(true);
      }
      return;
    }

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
    if (!ok) return;

    try {
      setIsApplying(true);
      await applySlotApi(selectedSlotId, [selectedRegion]);
      await refreshAppData();
      setUserState('WAITING');
      await showAlert('참가 신청이 성공적으로 완료되었습니다! 매칭 발표를 기다려주세요.', '신청 완료');
      onClose();
      navigate('/');
    } catch (err) {
      await showAlert('신청 처리 중 오류가 발생했습니다: ' + (err.message || '서버 오류'), '신청 오류');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
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

            <p className="text-xs text-on-surface-variant leading-relaxed">
              모임 신청 시 1회가 차감됩니다. 매칭 실패 시 참가권은 100% 자동 반환됩니다.
            </p>

            <div className="flex flex-col gap-2.5">
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

      {/* 실제 참가 신청 모달 창 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-1.5 text-primary font-bold text-base">
              <span className="material-symbols-outlined text-xl">restaurant</span>
              <h3>식탁 참가 신청</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
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

          {/* 2. 시간(모임 일정) 선택 */}
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
            <span className="text-primary font-bold">1회 (잔여: {ticketCount}회 ➔ {Math.max(0, ticketCount - 1)}회)</span>
          </div>

          {/* 신청 버튼 & 취소 버튼 */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
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
    </>
  );
}
