import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPhoneNumber } from '../utils/formatters';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handlePhoneChange = (e) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('휴대폰 번호를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      await login(cleanPhone, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
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
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
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
                onClick={() => {
                  setForgotSent(false);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-1 disabled:opacity-60"
            >
              <span>{isLoading ? '로그인 중...' : '로그인'}</span>
              <span className="material-symbols-outlined text-base">login</span>
            </button>

            {/* 로그인 버튼 바로 하단에 회원가입 버튼 배치 */}
            <Link
              to="/signup"
              className="w-full h-12 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base text-primary">person_add</span>
              <span>새 계정으로 회원가입하기</span>
            </Link>
          </form>
        </div>
      </div>

      {/* 비밀번호 찾기 모달 */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-surface-container space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                <span>비밀번호 찾기</span>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-on-surface">
              {forgotSent ? (
                <div className="p-3 bg-secondary-fixed/40 text-on-secondary-fixed rounded-xl text-center">
                  <span className="material-symbols-outlined text-[28px] text-primary mb-1">mark_email_read</span>
                  <p className="font-bold text-sm text-primary">인증번호가 발송되었습니다</p>
                  <p className="mt-1 text-xs text-on-surface-variant">가입하신 휴대폰 번호의 문자메시지를 확인해주세요.</p>
                </div>
              ) : (
                <>
                  <p className="text-on-surface-variant leading-relaxed">
                    가입하신 휴대폰 번호로 임시 인증번호 및 비밀번호 재설정 링크를 전송해 드립니다.
                  </p>
                  <div>
                    <label className="block font-bold mb-1">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="010-1234-5678"
                      maxLength={13}
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="flex-1 h-10 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors"
              >
                닫기
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="flex-1 h-10 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-container transition-colors"
                >
                  인증번호 전송
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
