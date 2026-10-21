import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 사용자 페이지를 스마트폰 화면 안에 가두는 래퍼.
 * 내부의 fixed 요소(Header/BottomNav/모달/드로어)는 .phone-screen의 transform 때문에
 * 뷰포트가 아닌 폰 화면 기준으로 배치된다. 이게 이 구조의 핵심이므로 transform을 제거하지 말 것.
 * 관리자 콘솔(/admin)은 프레임 없이 그대로 렌더링한다.
 */
export default function PhoneFrame({ children }) {
  const { pathname } = useLocation();
  const scrollRef = useRef(null);
  const isAdmin = pathname.startsWith('/admin');

  // 라우트 이동 시 폰 내부 스크롤을 맨 위로 (window 스크롤은 더 이상 사용되지 않음)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [pathname]);

  if (isAdmin) return children;

  return (
    <div className="phone-stage">
      <div className="phone-device">
        <div className="phone-island" aria-hidden="true" />
        <div className="phone-screen">
          <div className="phone-scroll" ref={scrollRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
