import React from 'react';
import { useApp } from '../../context/AppContext';

export default function EtiquetteModal() {
  const { isEtiquetteOpen, setIsEtiquetteOpen } = useApp();

  if (!isEtiquetteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden border border-surface-container">
        {/* Accent Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-fixed text-primary">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </span>
            <h3 className="font-headline-sm text-lg text-on-surface font-bold">
              안전 식탁 & 에티켓 수칙
            </h3>
          </div>
          <button
            onClick={() => setIsEtiquetteOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Guidelines List */}
        <div className="flex flex-col gap-3 py-2 text-on-surface">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
              heart_broken
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-sm font-bold text-on-surface">
                연애/소개팅 목적 배제
              </span>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                ‘우연한 식탁’은 취향과 라이프스타일 대화를 위한 소셜 다이닝입니다. 과도한 사적 연락 및 이성 목적 접근은 영구 제재 대상입니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
            <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5 shrink-0">
              event_busy
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-sm font-bold text-on-surface">
                당일 노쇼(No-Show) 강력 제재
              </span>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                모임 2일 전 이후 취소 및 당일 무단 노쇼 시, 타 참가자 보호를 위해 영구적으로 서비스 재가입 및 신청이 제한됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0">
              handshake
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-sm font-bold text-on-surface">
                현장 더치페이 N분의 1 원칙
              </span>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                식사 비용은 모임 당일 식당에서 참가자 전원이 정산(카카오페이 송금 등)하며, 상호 배려하는 식사 문화를 지향합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsEtiquetteOpen(false)}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
}
