import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MyPageAndCS() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useApp();

  const initialTab = searchParams.get('tab') === 'cs' ? 'cs' : 'mypage';
  const [activeTab, setActiveTab] = useState(initialTab); // 'mypage' or 'cs'
  const [openedFaq, setOpenedFaq] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 'b-1', name: '민우', date: '2026.09.28', reason: '대화 매너 부적합' }
  ]);

  const toggleFaq = (faqId) => {
    setOpenedFaq(openedFaq === faqId ? null : faqId);
  };

  const handleUnblock = (id) => {
    setBlockedUsers(blockedUsers.filter(u => u.id !== id));
    alert('차단이 해제되었습니다. 향후 매칭에 다시 포함될 수 있습니다.');
  };

  const handleLiveChatRequest = () => {
    alert('👩‍💼 상담원 직접 연결이 요청되었습니다. 잠시 후 상담창이 열립니다.');
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col w-full items-center justify-start py-space-md px-margin sm:px-0">
        <div className="w-full max-w-[450px] flex flex-col gap-space-lg pb-24">
          
          {/* Top Mode Segmented Pill */}
          <div className="w-full bg-surface-container-high p-space-xs rounded-full flex items-center justify-between shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('mypage')}
              className={`flex-1 py-space-xs text-center font-label-md text-label-md rounded-full transition-all duration-200 flex items-center justify-center gap-space-xs ${
                activeTab === 'mypage'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">person</span>
              <span>내 정보 & 이용권</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cs')}
              className={`flex-1 py-space-xs text-center font-label-md text-label-md rounded-full transition-all duration-200 flex items-center justify-center gap-space-xs ${
                activeTab === 'cs'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">support_agent</span>
              <span>고객센터 & FAQ</span>
            </button>
          </div>

          {/* ============================================== */}
          {/* SECTION 1: P-12 MY PAGE (PROFILE & TICKETS)    */}
          {/* ============================================== */}
          {activeTab === 'mypage' ? (
            <div className="flex flex-col gap-space-md w-full">
              
              {/* 1. USER PROFILE CARD */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-space-md">
                    <div className="relative">
                      <img
                        className="w-16 h-16 rounded-full object-cover shadow-sm ring-4 ring-surface-container-low"
                        src={currentUser.avatar}
                        alt="프로필"
                      />
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[12px] font-bold">verified_user</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{currentUser.nickname}</h2>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">({currentUser.name})</span>
                      </div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                        {currentUser.age}세 · {currentUser.job} · {currentUser.mbti}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/information-input')}
                    className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                    title="프로필 및 취향 정보 수정"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>

                {/* Badges & Manners */}
                <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                  <div className="bg-tertiary-fixed/30 rounded-xl p-space-sm flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">신원 인증</span>
                      <span className="font-label-md text-label-md text-tertiary font-bold">본인인증 완료</span>
                    </div>
                  </div>
                  <div className="bg-secondary-fixed/30 rounded-xl p-space-sm flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      local_fire_department
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">테이블 매너</span>
                      <span className="font-label-md text-label-md text-secondary font-bold">{currentUser.mannerTemp}°C 온화함</span>
                    </div>
                  </div>
                </div>

                {/* Interest Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentUser.interests.map((tag, idx) => (
                    <span key={idx} className="px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                      #{tag}
                    </span>
                  ))}
                  <span className="px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                    #목요일소셜
                  </span>
                </div>

                {/* Edit Profile & Tastes Action Button */}
                <div className="pt-2 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => navigate('/information-input')}
                    className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[17px] text-primary">edit_note</span>
                    <span>내 정보 및 취향 수정하기</span>
                  </button>
                </div>
              </div>

              {/* 2. MY TICKET CARD */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg">
                    <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                    <span className="font-bold">보유 참가권</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                    D-DAY 2
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-xl text-headline-xl text-on-surface font-bold">{currentUser.tickets}</span>
                    <span className="font-body-md text-body-md text-on-surface-variant">회 남음 / 총 3회권</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">유효기간 2026.12.31까지</span>
                </div>

                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '66.6%' }}></div>
                </div>

                <div className="flex items-center justify-between pt-space-xs">
                  <button
                    type="button"
                    onClick={() => navigate('/booking')}
                    className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-space-xs active:scale-95 font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    <span>참가권 추가 충전 / 구매</span>
                  </button>
                </div>
              </div>

              {/* 3. PAST DINING HISTORY */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">지난 식탁 다이어리</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">총 5회 참석</span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  {/* Item 1 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">2026.10.15 (목) 19:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                        참석 완료
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">을지로 레트로 다이닝</span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      내추럴 와인과 모던 한식 타파스 · 4인 테이블
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">2026.10.08 (목) 19:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                        참석 완료
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">강남 모던 프렌치 비스트로</span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      가을 제철 코스와 캐주얼 페어링 · 5인 테이블
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. BLOCK & SAFETY SETTINGS */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">shield</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">안심 모임 &amp; 차단 관리</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-bold">
                    {blockedUsers.length}명 차단 중
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  차단한 사용자는 향후 모든 목요일 다이닝 매칭 시 같은 테이블로 절대 배정되지 않습니다.
                </p>

                {blockedUsers.length > 0 ? (
                  blockedUsers.map(user => (
                    <div key={user.id} className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold">
                          {user.name.slice(0, 1)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            {user.name} (차단일 {user.date})
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">사유: {user.reason}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblock(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-outline-variant text-on-surface font-label-sm text-label-sm transition-all active:scale-95"
                      >
                        차단 해제
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-sm text-on-surface-variant">현재 차단된 사용자가 없습니다.</p>
                )}
              </div>

            </div>
          ) : (
            /* ============================================== */
            /* SECTION 2: P-11 CS SUPPORT & BOT CONCIERGE     */
            /* ============================================== */
            <div className="flex flex-col gap-space-md w-full">
              
              {/* CS Hero Header Status */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md font-bold">
                    <span className="material-symbols-outlined text-[20px]">mark_chat_unread</span>
                    <span>우연한 식탁 고객센터</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                    <span>AI 봇 실시간 응대 중</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">무엇을 도와드릴까요?</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    테이블 예약, 일정 변경, 참가자 매너 등 궁금한 점을 즉시 해결해 드려요.
                  </p>
                </div>

                {/* Quick Bot Dialogue Box */}
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm border-l-4 border-primary">
                  <div className="flex items-center gap-space-xs text-on-surface font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                    <span>식탁 지킴이 봇</span>
                    <span className="text-on-surface-variant font-normal">방금 전</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    "안녕하세요 서연님! 이번 주 목요일 모임 관련 문의신가요? 아래 빠른 FAQ를 확인하시거나 언제든 상담원 연결을 요청하세요."
                  </p>
                </div>
              </div>

              {/* Quick FAQ Accordions */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">자주 묻는 질문 (FAQ)</h3>
                
                <div className="flex flex-col gap-space-xs">
                  {/* FAQ 1 */}
                  <div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => toggleFaq('faq-1')}
                      className="w-full p-space-md text-left flex items-center justify-between hover:bg-surface-container"
                    >
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Q. 매칭 취소는 언제까지 가능한가요?
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform">
                        {openedFaq === 'faq-1' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {openedFaq === 'faq-1' && (
                      <div className="px-space-md pb-space-md pt-1 font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container leading-relaxed">
                        매칭 확정 전(화요일 18:00 이전)에는 100% 무료 취소 및 이용권 환불이 가능합니다. 화요일 18:00 이후에는 타 참가자의 매칭에 영향을 미쳐 참가권 1회가 자동 차감됩니다.
                      </div>
                    )}
                  </div>

                  {/* FAQ 2 */}
                  <div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => toggleFaq('faq-2')}
                      className="w-full p-space-md text-left flex items-center justify-between hover:bg-surface-container"
                    >
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Q. 당일 늦게 도착할 것 같아요.
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform">
                        {openedFaq === 'faq-2' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {openedFaq === 'faq-2' && (
                      <div className="px-space-md pb-space-md pt-1 font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container leading-relaxed">
                        15분 이상 지각이 예상될 경우 배정된 '단체 채팅방'에 미리 알려주세요. 모임은 정시에 시작되며, 30분 이상 무단 지각 시 노쇼로 기록될 수 있습니다.
                      </div>
                    )}
                  </div>

                  {/* FAQ 3 */}
                  <div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => toggleFaq('faq-3')}
                      className="w-full p-space-md text-left flex items-center justify-between hover:bg-surface-container"
                    >
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Q. 비매너 참가자가 있어요.
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform">
                        {openedFaq === 'faq-3' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {openedFaq === 'faq-3' && (
                      <div className="px-space-md pb-space-md pt-1 font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container leading-relaxed">
                        모임 종료 후 피드백 및 마이페이지 내 [차단] 기능을 이용하시면 이후 어떤 모임에서도 매칭되지 않습니다. 과도한 음주나 불쾌한 행동은 '즉시 신고하기'를 통해 운영팀의 영구 이용 정지 처리가 진행됩니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Human Agent Connection */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">headset_mic</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">전문 상담원 연결</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  운영 시간: 평일 10:00 ~ 19:00 (목요일은 모임 지원으로 21:30까지 연장 운영)
                </p>
                <button
                  type="button"
                  onClick={handleLiveChatRequest}
                  className="w-full py-3.5 rounded-xl bg-surface-container-high hover:bg-secondary-fixed text-on-surface font-label-lg text-label-lg transition-all flex items-center justify-center gap-space-xs active:scale-98 font-bold"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
                  <span>상담원 직접 연결 요청</span>
                </button>
              </div>

              {/* 1:1 Inquiry History Log */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">나의 문의 내역</h4>
                <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      식이 알레르기 사전 전달 건 (오이/날생선)
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">2026.10.12 · 답변 완료</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                    해결됨
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Floating Action Mini Banner */}
          <div className="w-full p-space-md rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[20px]">dinner_dining</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-primary-fixed">이번 주 목요일 식탁</span>
                <span className="font-label-md text-label-md font-bold">홍대/합정 식탁 참석 예정</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/match/result')}
              className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold shadow-sm"
            >
              식탁 보기
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
