import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();

  const [phone, setPhone] = useState('010-8492-3310');
  const [password, setPassword] = useState('1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('휴대폰 번호를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('비밀번호를 입력해주세요.');
      return;
    }

    // 간단한 로그인 처리
    setCurrentUser((prev) => ({
      ...prev,
      phone
    }));

    navigate('/');
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-4rem)] flex justify-center py-space-md px-margin sm:px-0">
      <div className="w-full max-w-[420px] bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-container">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-base font-bold text-on-surface">
              로그인
            </h1>
            <div className="w-9" />
          </div>

          <div className="text-center my-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mx-auto mb-3 shadow-xs">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant
              </span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">
              우연한 식탁
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              매주 목요일 저녁, 취향이 통하는 낯선 이들과의 따뜻한 식탁
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-3 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-1.5 animate-shake">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-on-surface mb-1">
                휴대폰 번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-primary w-4 h-4 rounded"
                />
                <span className="text-xs text-on-surface-variant font-medium">로그인 상태 유지</span>
              </label>

              <button
                type="button"
                onClick={() => alert('비밀번호 재설정을 위해 가입하신 번호로 인증번호를 전송합니다.')}
                className="text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-1"
            >
              <span>로그인</span>
              <span className="material-symbols-outlined text-base">login</span>
            </button>
          </form>
        </div>

        <div className="pt-6 space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-surface-container-high w-full" />
            <span className="bg-surface-container-lowest px-3 text-[11px] text-on-surface-variant absolute">
              또는
            </span>
          </div>

          <Link
            to="/signup"
            className="w-full h-12 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-primary">person_add</span>
            <span>새 계정으로 회원가입하기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
