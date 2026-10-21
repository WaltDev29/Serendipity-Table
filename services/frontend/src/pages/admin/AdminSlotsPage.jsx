import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { toggleRegionCloseApi, updateSlotStatusApi } from '../../api/admin';

export default function AdminSlotsPage() {
  const { events, setEvents, addAuditLog, refreshAdminData } = useAdmin();

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 신규 회차 생성 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState('2026-11-05');
  const [newTitle, setNewTitle] = useState('목요일 정기 모임');
  const [newRegions, setNewRegions] = useState({
    hongdae: true,
    jamsil: true,
    gangnam: true,
    euljiro: true
  });
  const [targetPerRegion, setTargetPerRegion] = useState(48);

  const formatTitle = (title) => {
    if (!title) return '목요일 정기 모임';
    return title.replace(/^\d{4}[-./]\d{1,2}[-./]\d{1,2}\s*/, '').replace(/^\d{4}년\s*(\d{1,2}월\s*)?(\d{1,2}주차\s*)?/, '').trim() || '목요일 정기 모임';
  };

  const formatEventDate = (dt) => {
    if (!dt) return '-';
    return dt.split(' ')[0];
  };

  // 현재 선택된 회차 슬롯 (선택된 ID가 유효하면 해당 슬롯, 아니면 첫 번째 슬롯)
  const currentSelectedId = selectedEventId && events.some((e) => e.id === selectedEventId)
    ? selectedEventId
    : events[0]?.id || '';

  const activeEvent = events.find((e) => e.id === currentSelectedId) || events[0] || {
    id: 'EVT-FALLBACK',
    regions: []
  };

  // 회차 슬롯 자체 상태 토글 (OPEN <-> CLOSED)
  const toggleSlotStatus = async (e, ev) => {
    e.stopPropagation();
    const nextStatus = ev.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      if (ev.slotId) {
        await updateSlotStatusApi(ev.slotId, nextStatus);
        await refreshAdminData();
      } else {
        setEvents((prev) =>
          prev.map((item) =>
            item.id === ev.id ? { ...item, status: nextStatus } : item
          )
        );
      }
      addAuditLog('SLOT_STATUS_UPDATE', '총괄관리자', `${ev.title || ev.id} 상태 변경 -> ${nextStatus}`);
    } catch (err) {
      console.error('Update slot status failed:', err);
      alert('슬롯 상태 변경 실패: ' + (err.message || '오류 발생'));
    }
  };

  // 권역 슬롯 상태 토글 (OPEN <-> CLOSED)
  const toggleRegionStatus = async (regionId, regionName, currentStatus) => {
    const nextClosed = currentStatus === 'OPEN';
    try {
      if (activeEvent.slotId) {
        await toggleRegionCloseApi(activeEvent.slotId, regionName || regionId, nextClosed);
        await refreshAdminData();
      } else {
        setEvents((prev) =>
          prev.map((ev) => {
            if (ev.id !== activeEvent.id) return ev;
            const updatedRegions = ev.regions.map((reg) =>
              reg.id === regionId
                ? { ...reg, status: nextClosed ? 'CLOSED' : 'OPEN' }
                : reg
            );
            return { ...ev, regions: updatedRegions };
          })
        );
      }
      addAuditLog('SLOT_STATUS_TOGGLE', '총괄관리자', `${activeEvent.id} ${regionName || regionId} 권역 ${nextClosed ? '마감' : '모집'}`);
    } catch (e) {
      console.error('Toggle region failed:', e);
      alert('권역 마감 상태 변경 실패: ' + (e.message || '오류 발생'));
    }
  };

  // 신규 회차 생성 제출
  const handleCreateEvent = (e) => {
    e.preventDefault();
    const newId = `EVT-${newEventDate.replace(/-/g, '')}-THU`;
    const selectedRegionKeys = Object.keys(newRegions).filter((k) => newRegions[k]);

    const regionNames = {
      hongdae: '홍대/합정',
      jamsil: '잠실/송파',
      gangnam: '강남/신논현',
      euljiro: '을지로/종로'
    };

    const createdEvent = {
      id: newId,
      title: newTitle,
      eventDate: `${newEventDate} 19:30:00`,
      deadline: `${newEventDate} 18:00:00`, // 행사 이틀 전 화요일 등
      totalApplicants: 0,
      targetCapacity: selectedRegionKeys.length * targetPerRegion,
      status: 'OPEN',
      regions: selectedRegionKeys.map((key) => ({
        id: key,
        name: regionNames[key],
        current: 0,
        target: targetPerRegion,
        status: 'OPEN',
        maleRatio: 50,
        femaleRatio: 50,
        ageGroup: '20대 중후반~30대'
      }))
    };

    setEvents((prev) => [createdEvent, ...prev]);
    setIsCreateModalOpen(false);
    setSelectedEventId(newId);
    addAuditLog('CREATE_EVENT', '운영자 김관리', `신규 회차 ${newId} (${newTitle}) 등록 완료`);
  };

  const filteredEvents = events.filter((ev) => {
    if (filterStatus !== 'ALL' && ev.status !== filterStatus) return false;
    if (searchTerm && !ev.title.includes(searchTerm) && !ev.id.includes(searchTerm)) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            회차 및 슬롯 관리 (Slot Operations)
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            매주 목요일 정기 회차를 발행하고 권역별 목표 정원 및 조기 마감을 제어합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>신규 회차 등록</span>
        </button>
      </div>

      {/* 1. 회차 마스터 테이블 */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
        {/* Table Header Filter */}
        <div className="p-4 border-b border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface">회차 상태 필터:</span>
            {['ALL', 'OPEN', 'MATCHING', 'CONFIRMED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === st
                    ? 'bg-primary text-white font-bold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {st === 'ALL' ? '전체' : st === 'OPEN' ? '모집 중' : st === 'MATCHING' ? '매칭 연산 중' : '확정 완료'}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="회차 코드, 제목 검색..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Master Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">회차 코드</th>
                <th className="py-3 px-4">회차 명칭</th>
                <th className="py-3 px-4">모임 일시</th>
                <th className="py-3 px-4">신청 마감 일시</th>
                <th className="py-3 px-4">누적 신청 / 목표</th>
                <th className="py-3 px-4">오픈 권역</th>
                <th className="py-3 px-4">진행 상태</th>
                <th className="py-3 px-4 text-center">슬롯 선택</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredEvents.map((ev) => {
                const isSelected = ev.id === activeEvent.id;
                return (
                  <tr
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`hover:bg-surface-container-low/60 transition-colors cursor-pointer ${
                      isSelected ? 'bg-primary/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{ev.id}</td>
                    <td className="py-3.5 px-4 font-bold text-on-surface">{formatTitle(ev.title)}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{formatEventDate(ev.eventDate)}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{ev.deadline}</td>
                    <td className="py-3.5 px-4 font-bold">
                      {ev.totalApplicants} / {ev.targetCapacity}명
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {(ev.regions || []).map((r) => (
                          <span
                            key={r.id}
                            className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] text-on-surface"
                          >
                            {r.name ? r.name.split('/')[0] : (r.id || '권역')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={(e) => toggleSlotStatus(e, ev)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          ev.status === 'OPEN'
                            ? 'bg-tertiary-fixed text-tertiary hover:bg-tertiary hover:text-white'
                            : 'bg-error-container text-error hover:bg-error hover:text-white'
                        }`}
                        title="클릭 시 모집 여부 전환"
                      >
                        {ev.status === 'OPEN' ? '🟢 모집 중' : '🔴 모집 마감'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventId(ev.id);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {isSelected ? '선택됨' : '슬롯 보기'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 권역별 세부 슬롯 카드 그리드 (선택된 회차의 4개 권역 슬롯) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div>
            <h2 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              <span>[{formatTitle(activeEvent.title)}] 세부 권역 슬롯 제어</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              각 권역의 조기 마감 토글 및 실시간 모객 달성 현황입니다.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-on-surface">
            총 {(activeEvent.regions || []).length}개 권역 오픈
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(activeEvent.regions || []).map((reg) => {
            const isClosed = reg.status === 'CLOSED';
            const pct = Math.min(100, Math.round((reg.current / reg.target) * 100));
            return (
              <div
                key={reg.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isClosed
                    ? 'bg-surface-container-low/80 border-surface-container-high opacity-85'
                    : 'bg-surface-container-lowest border-surface-container hover:border-primary/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-on-surface">{reg.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleRegionStatus(reg.id, reg.name, reg.status)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        isClosed
                          ? 'bg-error-container text-error hover:bg-error hover:text-white'
                          : 'bg-tertiary-fixed text-tertiary hover:bg-tertiary hover:text-white'
                      }`}
                      title="클릭 시 오픈/마감 상태 전환"
                    >
                      {isClosed ? '🔴 조기 마감됨' : '🟢 정상 모집 중'}
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <span className="text-on-surface-variant">모객 인원</span>
                    <span className="font-bold text-on-surface">
                      {reg.current} <span className="font-normal text-on-surface-variant">/ {reg.target}명</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct >= 100 ? 'bg-primary' : 'bg-tertiary'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant mt-1">
                    <span>달성률 {pct}%</span>
                    <span>최소 성원: 4명</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-container flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant">성비 현황</span>
                  <span className="font-bold text-on-surface">
                    남 {reg.maleRatio}% : 여 {reg.femaleRatio}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL M-01: 신규 회차 생성 모달                          */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-title-md text-base font-bold text-on-surface">
                신규 목요일 정기 회차 생성
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  모임 일자 (목요일 선택)
                </label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => {
                    setNewEventDate(e.target.value);
                    setNewTitle(`${e.target.value} 목요일 정기 모임`);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  회차 명칭
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  오픈 권역 선택
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'hongdae', label: '홍대 / 합정' },
                    { id: 'jamsil', label: '잠실 / 송파' },
                    { id: 'gangnam', label: '강남 / 신논현' },
                    { id: 'euljiro', label: '을지로 / 종로' }
                  ].map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newRegions[r.id]}
                        onChange={(e) =>
                          setNewRegions({ ...newRegions, [r.id]: e.target.checked })
                        }
                        className="accent-primary w-4 h-4 rounded"
                      />
                      <span className="font-semibold text-on-surface">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  권역당 목표 정원 (기본 48명 = 4인 12개 테이블)
                </label>
                <input
                  type="number"
                  value={targetPerRegion}
                  onChange={(e) => setTargetPerRegion(Number(e.target.value))}
                  step={4}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-colors"
                >
                  회차 등록 및 오픈
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
