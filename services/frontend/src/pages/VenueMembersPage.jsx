import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function VenueMembersPage() {
  const navigate = useNavigate();
  const { matchResult, currentUser } = useApp();
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterChat = () => {
    setIsEntering(true);
    setTimeout(() => {
      setIsEntering(false);
      navigate('/chat');
    }, 500);
  };

  if (!matchResult) {
    return (
      <div className="w-full bg-surface min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 text-center">
        <div className="max-w-sm bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">restaurant</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface">현재 확정된 식탁이 없습니다</h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              이번 주 목요일 저녁, 취향이 통하는 이들과의 따뜻한 식탁에 참여해보세요!
            </p>
          </div>
          <div className="w-full flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="w-full h-11 rounded-2xl bg-primary text-white font-bold text-sm shadow-sm hover:bg-primary-container transition-all"
            >
              목요일 식탁 신청하기
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full h-11 rounded-2xl bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-variant transition-colors"
            >
              홈 화면으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col w-full">
        {/* Centered Container */}
        <div className="w-full max-w-[460px] mx-auto px-margin pb-32 flex flex-col gap-space-lg">
          
          {/* Celebration Header & Confetti Glow */}
          <div className="relative pt-space-md flex flex-col items-center text-center overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-2 w-32 h-32 rounded-full bg-primary-fixed blur-2xl opacity-60 pointer-events-none -z-10"></div>
            
            {/* Celebration Icon */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-lowest shadow-md mb-space-sm transform hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                celebration
              </span>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-container"></span>
              </span>
            </div>

            <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm mb-space-xs">
              <span className="material-symbols-outlined text-xs text-secondary">verified</span>
              <span>목요일 밤의 우연한 식사 확정</span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
              우연한 식탁 매칭 완료! 🎉
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
              {matchResult.eventDate} <br />
              <span className="font-label-lg text-label-lg text-primary">{matchResult.tableName}</span> (총 4명 · 남 2, 여 2)
            </p>

            {/* Trust Mini Banner */}
            <div className="mt-space-md w-full py-space-xs px-space-sm rounded-xl bg-tertiary-fixed/30 flex items-center justify-center gap-space-xs text-on-tertiary-fixed-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span>100% 본인인증 완료 · 안전 매너 서약 서명 멤버</span>
            </div>
          </div>

          {/* Auto-Recommended Dining Venue Card */}
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="relative w-full h-52 overflow-hidden group">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                src={matchResult.venue.image}
                alt={matchResult.venue.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/20 to-transparent"></div>

              {/* Status Badge */}
              <div className="absolute top-space-md left-space-md">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm shadow-md">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                  <span>테이블 예약 완료 (예약자명: 우연한 식탁)</span>
                </div>
              </div>

              {/* Venue Name Overlay */}
              <div className="absolute bottom-space-md left-space-md right-space-md">
                <div className="flex items-center justify-between text-on-primary">
                  <div>
                    <p className="font-label-sm text-label-sm opacity-90 tracking-wide text-primary-fixed">{matchResult.venue.genre}</p>
                    <h2 className="font-headline-md text-headline-md text-on-primary font-bold drop-shadow-sm">{matchResult.venue.name}</h2>
                    <p className="font-body-sm text-body-sm text-surface-container-high">{matchResult.venue.address}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/20 backdrop-blur-md text-on-primary font-label-md text-label-md">
                      ★ {matchResult.venue.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="p-space-md flex flex-col gap-space-md">
              <div className="flex items-start gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-label-md text-label-md text-on-surface">{matchResult.venue.address}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{matchResult.venue.subway}</p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-label-md text-label-md text-on-surface">{matchResult.venue.menu}</p>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">{matchResult.venue.avgPrice}</p>
                </div>
              </div>

              {/* Atmosphere Tags */}
              <div className="flex flex-wrap gap-space-xs pt-space-xs">
                {matchResult.venue.atmosphere.map((tag, idx) => (
                  <span key={idx} className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Map Buttons */}
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => alert('카카오맵으로 ' + matchResult.venue.name + ' 길찾기를 연결합니다.')}
                  className="h-11 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center gap-space-xs font-label-md text-label-md hover:bg-secondary-fixed-dim transition-colors active:scale-95 duration-150"
                >
                  <span className="material-symbols-outlined text-base">near_me</span>
                  <span>카카오맵 길찾기</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('네이버지도로 ' + matchResult.venue.name + ' 매장 위치 및 리뷰를 확인합니다.')}
                  className="h-11 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md flex items-center justify-center gap-space-xs hover:bg-tertiary-fixed-dim transition-colors active:scale-95 duration-150"
                >
                  <span className="material-symbols-outlined text-base">map</span>
                  <span>네이버지도 보기</span>
                </button>
              </div>
            </div>
          </div>

          {/* Anonymous Table Members (4) */}
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">함께할 테이블 멤버 (4명)</h3>
              </div>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                인원 확정
              </span>
            </div>

            {/* 1-Column Member List (1열로 정렬) */}
            <div className="flex flex-col gap-space-sm">
              {(matchResult?.members || []).map((m, idx) => {
                const isHost = m.role === 'HOST' || idx === 0;
                const bgColors = ['bg-primary-fixed text-primary', 'bg-secondary-fixed text-secondary', 'bg-tertiary-fixed text-tertiary', 'bg-surface-container-high text-on-surface-variant'];
                const icons = ['sentiment_satisfied', 'palette', 'directions_run', 'auto_stories'];

                return (
                  <div key={m.id || idx} className="relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between overflow-hidden">
                    {isHost && (
                      <div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-[10px] px-2 py-0.5 rounded-bl-lg">
                        호스트/예약확인
                      </div>
                    )}
                    <div className="flex items-center gap-space-md min-w-0 flex-1">
                      <div className={`relative w-12 h-12 rounded-full ${bgColors[idx % 4]} flex items-center justify-center font-bold shrink-0`}>
                        <span className="material-symbols-outlined text-2xl">{icons[idx % 4]}</span>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-tertiary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[9px] text-on-tertiary font-bold">check</span>
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                            {m.nickname || m.name}
                          </span>
                          {m.isMe && (
                            <span className="text-[10px] text-primary bg-primary-fixed/50 px-1 py-0.2 rounded font-semibold">ME</span>
                          )}
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            · {m.ageGroup || `${m.age} · ${m.gender}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-medium">{m.job}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-surface-container text-primary font-medium">{m.mbti}</span>
                          <span className="text-xs text-on-surface-variant font-medium">매너온도 {m.mannerTemp ? Number(m.mannerTemp).toFixed(1) : '36.5'}℃</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="font-label-sm text-[11px] text-tertiary flex items-center gap-0.5 font-semibold">
                        <span className="material-symbols-outlined text-xs">verified_user</span> 인증 완료
                      </span>
                      <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">{m.status || '대화 선호'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy notice (현재 작성되어 있는 주의사항) */}
            <div className="p-space-sm rounded-xl bg-surface-container-high/60 flex items-start gap-space-xs mt-space-xs">
              <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0 mt-0.5">lock</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                개인정보 보호를 위해 실명, 연락처, SNS는 비공개되며 닉네임과 취향 키워드로만 소통합니다. 식탁에서의 편안하고 부담 없는 만남을 지향합니다.
              </p>
            </div>
          </div>

        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] py-space-sm px-margin">
          <div className="max-w-[460px] mx-auto flex flex-col gap-space-xs">
            <div className="flex items-center justify-center py-1 text-center">
              <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                대화방 4명 전원 입장 가능 당일 노쇼 방지 알림 발송됨
              </span>
            </div>
            <button
              id="enterChatBtn"
              type="button"
              onClick={handleEnterChat}
              disabled={isEntering}
              className="w-full h-[52px] rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md hover:bg-primary-container active:scale-[0.98] transition-all duration-150"
            >
              {isEntering ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  <span>입장하는 중...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                  <span>실시간 단체 채팅방 입장하기</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
