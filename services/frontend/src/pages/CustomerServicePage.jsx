import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInquiryApi } from '../api/cs';

export default function CustomerServicePage() {
  const navigate = useNavigate();

  const [openedFaq, setOpenedFaq] = useState(null);
  const [inquiryText, setInquiryText] = useState('');
  const [category, setCategory] = useState('취소/환불');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqs = [
    {
      id: 'faq-1',
      q: '매칭 결과와 식당 안내는 언제 발표되나요?',
      a: '행사 이틀 전인 화요일 18:00에 AI 매칭이 확정되며, 카카오 알림톡과 앱 내 [매칭] 탭 및 [채팅] 탭을 통해 식당 위치와 테이블 멤버 카드가 공개됩니다.'
    },
    {
      id: 'faq-2',
      q: '갑작스러운 야근으로 참석이 어려워졌을 때 취소 및 환불 기준은 어떻게 되나요?',
      a: '매칭 확정 전(화요일 12:00 이전) 취소 시에는 100% 무료 취소 및 전액 환불/이월이 가능합니다. 단, 성비와 예약 안정성을 위해 화요일 12:00 이후 취소 시에는 환불이 불가합니다.'
    },
    {
      id: 'faq-3',
      q: '식사 비용 계산은 현장에서 어떻게 진행되나요?',
      a: '식사 및 음료 비용은 테이블 멤버 간 현장에서 정확히 1/N(엔빵) 정산합니다. 참가 신청 시 결제하신 8,000원은 AI 성향 매칭 및 프라이빗 룸 예약 대행 수수료입니다.'
    },
    {
      id: 'faq-4',
      q: '신청 인원이 4인 미만으로 모자란 경우 어떻게 되나요?',
      a: '4인 미만으로 성원되지 못할 경우, 다음 주 목요일 모임 무료 이월권이 자동 발급되거나 100% 자동 환불 중 원하시는 대안을 1초 만에 선택하실 수 있습니다.'
    }
  ];

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setIsSubmitted(true);
    try {
      await createInquiryApi(category, `[${category}] 고객 문의`, inquiryText);
      alert('문의가 백엔드 CS 시스템에 정상 접수되었습니다.\n운영자가 확인 후 신속히 답변을 전달해 드립니다.');
      setInquiryText('');
    } catch (err) {
      alert('문의 접수 실패: ' + err.message);
    } finally {
      setIsSubmitted(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-4rem)] flex justify-center py-space-md px-margin sm:px-0">
      <div className="w-full max-w-[450px] flex flex-col gap-space-md pb-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h1 className="font-headline-sm text-base font-bold text-on-surface">
            고객센터 & FAQ
          </h1>
          <div className="w-9" />
        </div>

        {/* 1:1 Live Inquiry Card */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-sm font-bold text-on-surface">
                1:1 실시간 문의하기
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                운영 시간: 평일 10:00 ~ 22:00 (목요일 야간 비상대응 운영)
              </p>
            </div>
          </div>

          <form onSubmit={handleSendInquiry} className="space-y-2.5 text-xs">
            <div>
              <label className="block font-bold text-on-surface mb-1">문의 유형</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none"
              >
                <option value="취소/환불">취소 및 환불 문의</option>
                <option value="매칭/식당">매칭 및 식당 안내 문의</option>
                <option value="에티켓/신고">비매너 참가자 신고</option>
                <option value="기타">기타 서비스 이용 문의</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">문의 내용</label>
              <textarea
                rows={3}
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                placeholder="궁금하신 점이나 불편하셨던 사항을 상세히 남겨주세요."
                className="w-full p-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitted || !inquiryText.trim()}
              className="w-full h-11 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>1:1 문의 접수하기</span>
            </button>
          </form>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-2">
          <h2 className="font-headline-sm text-sm font-bold text-on-surface px-1">
            자주 묻는 질문 (FAQ)
          </h2>

          <div className="space-y-2">
            {faqs.map((faq) => {
              const isOpen = openedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenedFaq(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-2 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-primary font-bold">Q.</span>
                      <span>{faq.q}</span>
                    </span>
                    <span className="material-symbols-outlined text-base text-outline transition-transform duration-200">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-surface-container text-xs text-on-surface-variant leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
