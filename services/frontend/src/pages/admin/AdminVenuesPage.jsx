import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminVenuesPage() {
  const { venues, setVenues, toggleVenueReservation, addAuditLog } = useAdmin();

  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 신규 등록 모달 상태 (M-05)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newRegion, setNewRegion] = useState('홍대/합정');
  const [newGenre, setNewGenre] = useState('');
  const [newTables, setNewTables] = useState('4인 프라이빗 룸 2개, 4인 테이블 3개');
  const [newBudget, setNewBudget] = useState(25000);
  const [newBenefits, setNewBenefits] = useState('웰컴 드링크 1잔 제공');
  const [newAddress, setNewAddress] = useState('');

  const handleRegisterVenue = (e) => {
    e.preventDefault();
    if (!newVenueName) return;

    const created = {
      id: `V0${venues.length + 1}`,
      name: newVenueName,
      region: newRegion,
      genre: newGenre || '캐주얼 다이닝 & 비스트로',
      tables: newTables,
      avgBudget: Number(newBudget),
      benefits: newBenefits,
      address: newAddress || '서울시 주요 권역',
      isReserved: false,
      assignedTables: [],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80'
    };

    setVenues((prev) => [created, ...prev]);
    setIsRegisterModalOpen(false);
    setNewVenueName('');
    addAuditLog('REGISTER_VENUE', '운영자 김관리', `신규 제휴 식당 [${newVenueName}] 등록 완료`);
  };

  const filteredVenues = venues.filter((v) => {
    if (selectedRegion !== 'ALL' && !v.region.includes(selectedRegion)) return false;
    if (searchTerm && !v.name.includes(searchTerm) && !v.genre.includes(searchTerm)) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            제휴 식당 POOL 및 장소 배정 (Venue Management)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            권역별 감성 다이닝 파트너사를 관리하고, 테이블 식이 제한/예산에 맞춘 1순위 추천 식당을 배정합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          <span>신규 제휴 식당 등록</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface">권역 필터:</span>
          {['ALL', '홍대/합정', '잠실/송파', '강남/신논현', '을지로/종로'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedRegion === r
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {r === 'ALL' ? '전체' : r.split('/')[0]}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="식당명, 장르 검색..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Venue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Photo & Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm text-[11px] font-bold">
                    {venue.region}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-primary/90 text-white backdrop-blur-sm text-[11px] font-bold">
                    {venue.genre}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={() => toggleVenueReservation(venue.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md ${
                      venue.isReserved
                        ? 'bg-tertiary text-white'
                        : 'bg-surface-container-lowest/90 text-on-surface hover:bg-surface-container-lowest'
                    }`}
                  >
                    {venue.isReserved ? '✓ 예약 확정 완료' : '예약 미완료 (체크)'}
                  </button>
                </div>
              </div>

              {/* Body Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-title-md text-base font-bold text-on-surface">
                    {venue.name}
                  </h3>
                  <span className="text-xs font-bold text-primary">
                    1인 약 ₩{(venue.avgBudget || 25000).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-outline">location_on</span>
                  <span>{venue.address}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded-xl bg-surface-container-low">
                    <span className="text-[10px] text-outline block">좌석 구성</span>
                    <span className="font-semibold text-on-surface">{venue.tables}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-container-low">
                    <span className="text-[10px] text-outline block">제휴 혜택</span>
                    <span className="font-semibold text-secondary">{venue.benefits}</span>
                  </div>
                </div>

                {/* Assigned Tables */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-outline font-semibold">금주 배정된 테이블:</span>
                  <div className="flex gap-1">
                    {(venue.assignedTables || []).length > 0 ? (
                      venue.assignedTables.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-outline text-[11px]">배정 대기 중</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 pt-2 border-t border-surface-container flex items-center justify-between text-xs">
              <span className="text-outline">캐치테이블/네이버 예약 제휴사</span>
              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(venue.name)}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary font-bold hover:underline flex items-center gap-0.5"
              >
                <span>지도 열기</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* MODAL M-05: 제휴 식당 신규 등록 모달                      */}
      {/* ========================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h3 className="font-title-md text-base font-bold text-on-surface">
                신규 제휴 식당 등록
              </h3>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterVenue} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  식당명
                </label>
                <input
                  type="text"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  placeholder="예: 연남 브리즈 다이닝"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    소속 권역
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none"
                  >
                    <option value="홍대/합정">홍대/합정</option>
                    <option value="잠실/송파">잠실/송파</option>
                    <option value="강남/신논현">강남/신논현</option>
                    <option value="을지로/종로">을지로/종로</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    1인 평균 예산
                  </label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    step={1000}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  음식 장르 & 분위기
                </label>
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="예: 이탈리안 & 내추럴와인"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  매장 주소
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="서울 마포구 동교로 ..."
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  제휴 혜택
                </label>
                <input
                  type="text"
                  value={newBenefits}
                  onChange={(e) => setNewBenefits(e.target.value)}
                  placeholder="웰컴 스파클링 1잔 제공"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-colors"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
