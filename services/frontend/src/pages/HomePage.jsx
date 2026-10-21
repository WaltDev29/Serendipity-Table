import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getHomeStatsApi } from '../api/slot';
import ApplyModal from '../components/common/ApplyModal';

export default function HomePage() {
  const navigate = useNavigate();
  const { userState, matchResult } = useApp();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [stats, setStats] = useState({
    cumulativeParticipants: 1700,
    averageRating: 4.8,
    repurchaseRate: 94
  });

  useEffect(() => {
    getHomeStatsApi()
      .then((data) => {
        if (data) {
          setStats({
            cumulativeParticipants: data.cumulativeParticipants || 1700,
            averageRating: data.averageRating || 4.8,
            repurchaseRate: data.repurchaseRate || 94
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch home stats:', err);
      });
  }, []);

  return (
    <div className="w-full flex justify-center py-4 sm:py-6 px-3 sm:px-4">
      {/* Mobile Container (Max 480px on Desktop for authentic app feel) */}
      <div className="w-full max-w-[480px] flex flex-col gap-5 pb-24 relative">
        
        {/* Conditional Active Status Quick Banner: 클릭 시 매칭 페이지(/matching)로 연결 */}
        {userState === 'WAITING' && (
          <div
            onClick={() => navigate('/matching')}
            className="w-full bg-gradient-to-r from-primary-fixed via-secondary-fixed to-surface-container-low rounded-2xl p-4 shadow-sm border border-primary-fixed/50 animate-fade-in cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-md text-[13px] text-primary font-bold">신청 완료!</span>
                    <span className="font-body-sm text-[13px] text-on-surface truncate">
                      목요일 매칭 발표를 기다리고 있어요
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
                    AI 매칭 알고리즘이 최적의 4인 식탁을 구성 중입니다
                  </span>
                </div>
              </div>
              <div className="shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-full bg-surface-container-lowest text-primary font-label-sm text-[12px] font-bold shadow-xs">
                <span>매칭 현황</span>
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              </div>
            </div>
          </div>
        )}

        {userState === 'CONFIRMED' && (
          <div
            onClick={() => navigate('/matching')}
            className="w-full bg-gradient-to-r from-secondary-fixed via-primary-fixed to-surface-container-low rounded-2xl p-4 shadow-sm border border-secondary-fixed animate-fade-in cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">celebration</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-md text-[13px] text-secondary font-bold">매칭 확정!</span>
                    <span className="font-body-sm text-[13px] text-on-surface truncate">
                      {matchResult?.tableName ? `${matchResult.tableName} ` : ''}<strong className="text-primary font-bold">{matchResult?.venue?.name || '배정 식당'}</strong>
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
                    {matchResult?.eventDate || '목요일 19:30'} · 4명 테이블 확정됨
                  </span>
                </div>
              </div>
              <div className="shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-[12px] font-bold shadow-xs">
                <span>식당 확인</span>
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative w-full rounded-3xl overflow-hidden bg-surface-container-lowest shadow-md flex flex-col border border-surface-container-high">
          <div
            className="relative w-full h-56 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrUBsWWXJkzky3xk3sCFpjhYTX3xVBMfIy8vD2w1F5z3MwKOg9IF8Mm8BZieocf4JALLdK1x9lRPyM3A6rlI-7MpG4UtwQYsd50sR7mY7qyr7G39htZE3VXxm9Kj31gikWbfbWPPPcbKSRMa-5TOceHUSDlpRfHtZrvFIor23PzSMWeDEbhhthpK4FOI1eP0DxgJSCZ8dO6tJP7cbMJEgnN3NBBwRiOcrEl9ksG4qg1YnZgHCo5Qg')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/85 via-on-background/40 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-[11px] font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                매주 목요일 저녁 7:30
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-on-primary flex flex-col gap-1">
              <span className="font-label-sm text-[11px] tracking-widest text-primary-fixed uppercase font-semibold">
                Curated Social Dining
              </span>
              <h1 className="font-headline-md text-[21px] font-bold leading-snug drop-shadow-sm text-on-primary">
                매주 목요일 저녁,<br />취향이 통하는 낯선 이들과의 따뜻한 식탁
              </h1>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex items-start gap-2.5 bg-surface-container-low p-3 rounded-xl border border-surface-container">
              <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">연애 목적은 정중히 사양합니다.</strong><br />
                라이프스타일과 대화가 통하는 4~6인 프라이빗 소셜 다이닝으로 직장·일상의 새로운 활력을 더해보세요.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Metrics Bento Section (DB 연동: 누적 참가자 +1700, 평점, 재참여율) */}
        <section className="grid grid-cols-3 gap-2 w-full">
          <div className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high flex flex-col items-center text-center">
            <span className="font-headline-md text-xl font-bold text-primary">
              {stats.cumulativeParticipants.toLocaleString()}+
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">누적 참가자</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high flex flex-col items-center text-center">
            <div className="flex items-center gap-0.5">
              <span className="font-headline-md text-xl font-bold text-secondary">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">모임 만족도</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high flex flex-col items-center text-center">
            <span className="font-headline-md text-xl font-bold text-tertiary">
              {stats.repurchaseRate}%
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">재참여 희망률</span>
          </div>
        </section>



        {/* 신청 전(userState === 'NONE') 사용자 대상 모임 신청 CTA 버튼 */}
        {userState === 'NONE' && (
          <div className="w-full">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
              <span>이번 주 목요일 모임 신청하기</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}

        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />

        {/* 3 Safe Promises Banner */}
        <section className="p-4 rounded-3xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
          <h3 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            우연한 식탁의 3가지 안심 시스템
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>실명 본인 확인 & 인스타그램 기반 검증 완료 멤버만 배정</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>연령차 8세 이내 & 성비 밸런스(남2:여2 또는 동수) 자동 보장</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>무단 노쇼 및 비매너 시 2진 아웃 영구 차단 원칙</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
