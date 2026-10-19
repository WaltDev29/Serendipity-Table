import React from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminAnalyticsPage() {
  const { downloadCsv, venues } = useAdmin();

  // 정산서 CSV 다운로드
  const handleDownloadSettlementCsv = () => {
    const headers = ['식당코드', '식당명', '권역', '배정인원', '1인단가', '총식사비용', '플랫폼정산수수료(10%)', '정산상태'];
    const rows = [
      ['V01', '연남 브리즈 다이닝', '홍대/합정', '12명 (3개조)', '₩25,000', '₩300,000', '₩30,000', '정산대기'],
      ['V02', '살롱 드 망원', '홍대/합정', '4명 (1개조)', '₩28,000', '₩112,000', '₩11,200', '정산대기'],
      ['V03', '송리단 테라스 키친', '잠실/송파', '8명 (2개조)', '₩24,000', '₩192,000', '₩19,200', '정산대기'],
      ['V04', '을지로 선셋 바이브', '을지로/종로', '2명 (인원미달)', '₩22,000', '₩44,000', '₩4,400', '보류']
    ];
    downloadCsv('우연한식탁_식당별정산명세서', headers, rows);
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            모임 사후 피드백 & 정산 통계 (Analytics & Finance)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            참가자 3대 만족도와 비공개 호감 매트릭스를 분석하고, 제휴 식당별 주간 정산서를 발행합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSettlementCsv}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>정산 명세서 CSV 추출</span>
        </button>
      </div>

      {/* 1. 3대 만족도 메트릭 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>테이블 분위기 만족도</span>
            <span className="material-symbols-outlined text-primary text-[18px]">sentiment_satisfied</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface font-headline-sm">4.8</span>
            <span className="text-xs text-on-surface-variant">/ 5.0</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div className="w-[96%] h-full bg-primary rounded-full" />
          </div>
          <span className="text-[11px] text-tertiary font-semibold block">매우 만족 92%</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>대화 소통 케미 만족도</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">forum</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface font-headline-sm">4.7</span>
            <span className="text-xs text-on-surface-variant">/ 5.0</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div className="w-[94%] h-full bg-secondary rounded-full" />
          </div>
          <span className="text-[11px] text-secondary font-semibold block">소통 원활 91%</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>식당 맛 & 서비스 만족도</span>
            <span className="material-symbols-outlined text-tertiary text-[18px]">restaurant</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface font-headline-sm">4.9</span>
            <span className="text-xs text-on-surface-variant">/ 5.0</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div className="w-[98%] h-full bg-tertiary rounded-full" />
          </div>
          <span className="text-[11px] text-tertiary font-semibold block">장소 호평 97%</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
            <span>다음 회차 재참여 희망률</span>
            <span className="material-symbols-outlined text-primary text-[18px]">repeat</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-primary font-headline-sm">94%</span>
            <span className="text-xs text-on-surface-variant">희망</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div className="w-[94%] h-full bg-primary rounded-full" />
          </div>
          <span className="text-[11px] text-primary font-semibold block">참여 의향 매우 높음</span>
        </div>
      </div>

      {/* 2. Secret Chemistry Matrix & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Left: 비공개 선호/회피 매트릭스 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div>
              <h2 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">diversity_1</span>
                <span>비공개 호감 & 회피 매트릭스 (Secret Chemistry)</span>
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                사후 피드백에서 지목된 결과가 AI 매칭 알고리즘의 네거티브 제약으로 자동 주입됩니다.
              </p>
            </div>
            <span className="text-[11px] text-outline font-semibold">자동 반영됨</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-tertiary/5 border border-tertiary/20 flex items-start justify-between">
              <div>
                <span className="font-bold text-tertiary flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-[15px]">favorite</span>
                  "다시 만나고 싶은 사람" 최다 지목 (매너온도 +0.5℃ 가산)
                </span>
                <p className="text-on-surface mt-1 font-semibold">
                  김서연(ENFP) · 이도현(INTJ) · 신예진(ENFJ)
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary text-[10px] font-bold">
                호감 3회 이상
              </span>
            </div>

            <div className="p-3 rounded-xl bg-error/5 border border-error/20 flex items-start justify-between">
              <div>
                <span className="font-bold text-error flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-[15px]">block</span>
                  "다시 만나기 싫은 사람" 상호 배제 등록 (동일 테이블 영구 제외)
                </span>
                <p className="text-on-surface mt-1 font-semibold">
                  배강석 ↔ 정유진 (향후 매칭 제외 룰셋 주입 완료)
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold">
                배제 적용됨
              </span>
            </div>
          </div>
        </div>

        {/* Right: 참가자 익명 한줄평 피드백 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <h2 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">rate_review</span>
              <span>실시간 사후 한줄 리뷰 피드</span>
            </h2>
            <span className="text-[11px] text-tertiary font-bold">최신 4건</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              {
                text: '어색할 줄 알았는데 스몰토크 질문 카드 덕분에 대화가 술술 풀렸어요! 음식도 최고였습니다.',
                table: '홍대-03 테이블',
                stars: '★★★★★'
              },
              {
                text: '성비도 딱 맞고 연령대도 비슷해서 오랜만에 진솔한 대화를 나눌 수 있었네요. 다음 주에도 신청할게요!',
                table: '홍대-04 테이블',
                stars: '★★★★★'
              },
              {
                text: '식당 분위기가 아늑해서 너무 좋았고, 와인 페어링도 훌륭했습니다.',
                table: '잠실-01 테이블',
                stars: '★★★★☆'
              }
            ].map((rev, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-surface-container-low">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary text-[11px]">{rev.table}</span>
                  <span className="text-secondary font-bold text-[11px]">{rev.stars}</span>
                </div>
                <p className="text-on-surface text-[11px] leading-relaxed">"{rev.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 식당별 정산서 테이블 */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden space-y-2">
        <div className="p-4 border-b border-surface-container flex items-center justify-between">
          <h2 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">table_restaurant</span>
            <span>금주 제휴 식당 정산 내역서 (Settlement Master Sheet)</span>
          </h2>
          <span className="text-xs text-on-surface-variant font-semibold">
            정산 주기: 매주 금요일 익일 정산
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">식당명</th>
                <th className="py-3 px-4">권역</th>
                <th className="py-3 px-4">배정 인원</th>
                <th className="py-3 px-4">1인 예상 단가</th>
                <th className="py-3 px-4">총 현장 결제 예상액</th>
                <th className="py-3 px-4">제휴 수수료 (10%)</th>
                <th className="py-3 px-4 text-center">정산 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {[
                { name: '연남 브리즈 다이닝', region: '홍대/합정', count: '12명 (3개조)', price: 25000, total: 300000, fee: 30000, status: '정산 대기' },
                { name: '살롱 드 망원', region: '홍대/합정', count: '4명 (1개조)', price: 28000, total: 112000, fee: 11200, status: '정산 대기' },
                { name: '송리단 테라스 키친', region: '잠실/송파', count: '8명 (2개조)', price: 24000, total: 192000, fee: 19200, status: '정산 대기' },
                { name: '을지로 선셋 바이브', region: '을지로/종로', count: '2명 (인원미달)', price: 22000, total: 44000, fee: 4400, status: '보류 (미달)' }
              ].map((s) => (
                <tr key={s.name} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-on-surface">{s.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{s.region}</td>
                  <td className="py-3 px-4 font-semibold">{s.count}</td>
                  <td className="py-3 px-4 text-on-surface-variant">₩{s.price.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-on-surface">₩{s.total.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-primary">₩{s.fee.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status.includes('보류')
                          ? 'bg-error-container text-error'
                          : 'bg-secondary-fixed text-secondary'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
