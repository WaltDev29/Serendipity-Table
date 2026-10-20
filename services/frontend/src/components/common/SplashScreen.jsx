import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function SplashScreen({ onFinish }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthInitialized, currentUser } = useApp();
  const [minTimerDone, setMinTimerDone] = useState(false);

  // 1.5초간 스플래시 화면을 유지
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 인증 상태 로드 완료 및 최소 타이머 경과 시 분기 처리
  useEffect(() => {
    if (minTimerDone && isAuthInitialized) {
      if (onFinish) {
        onFinish();
      }

      // 관리자 페이지 진입 중인 경우 제외
      if (location.pathname.startsWith('/admin')) {
        return;
      }

      // 토큰 및 현재 로그인 사용자 확인
      const token = localStorage.getItem('token');
      const hasAuth = !!token && !!currentUser;

      if (!hasAuth) {
        // 비로그인 상태: 로그인 화면으로 이동
        // 단, 이미 로그인 또는 회원가입 페이지에 있다면 해당 위치 유지
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/login', { replace: true });
        }
      } else {
        // 로그인 상태: 루트 접근 시 홈 화면으로 이동
        if (location.pathname === '/login' || location.pathname === '/splash') {
          navigate('/', { replace: true });
        }
      }
    }
  }, [minTimerDone, isAuthInitialized, currentUser, location.pathname, navigate, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7] select-none overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-[480px] h-full flex flex-col items-center justify-between p-8">
        <div className="w-full flex justify-center pt-8">
          {/* Subtle top decoration */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-wider uppercase">
            <span>Social Dining Experience</span>
          </div>
        </div>

        {/* Center Splash Image */}
        <div className="flex flex-col items-center justify-center w-full my-auto">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 transition-transform duration-700 ease-out scale-100 hover:scale-105">
            <img
              src="/splash.jpg"
              alt="우연한 식탁"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-center text-white drop-shadow-md">
              <span className="font-bold text-lg tracking-tight">우연한 식탁</span>
              <p className="text-xs text-white/85 mt-0.5">따뜻한 식탁에서 피어나는 우연한 인연</p>
            </div>
          </div>
        </div>

        {/* Bottom Loading Indicator */}
        <div className="w-full flex flex-col items-center pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" />
          </div>
          <span className="text-xs font-semibold text-on-surface-variant tracking-wide">
            식탁을 준비하고 있습니다...
          </span>
        </div>
      </div>
    </div>
  );
}
