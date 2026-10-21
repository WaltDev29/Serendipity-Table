import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { formatPhoneNumber } from '../../utils/formatters';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdmin();

  const [phone, setPhone] = useState('01000000000');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = async (e) => {
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
      await loginAdmin(cleanPhone, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || '관리자 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111215] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#1a1b1e] border border-[#2d2f36] rounded-2xl p-8 shadow-2xl text-white">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[28px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            우연한 식탁 관리자 센터
          </h1>
          <p className="text-sm text-neutral-400">
            Social Dining Back-Office Authentication
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              관리자 휴대폰 번호
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-500">
                smartphone
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                maxLength={13}
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#23252a] text-white text-sm border border-[#34373f] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-neutral-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              관리자 비밀번호
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-500">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#23252a] text-white text-sm border border-[#34373f] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-neutral-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>로그인 확인 중...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>관리자 로그인</span>
              </>
            )}
          </button>
        </form>

        {/* Test Credentials Helper */}
        <div className="mt-4 p-3 rounded-xl bg-surface-container-high/40 border border-neutral-700/50 text-[11px] text-neutral-400">
          <div className="flex items-center justify-between text-neutral-300 font-semibold mb-1">
            <span>테스트 관리자 계정</span>
            <button
              type="button"
              onClick={() => {
                setPhone('010-0000-0000');
                setPassword('password123');
              }}
              className="text-primary hover:underline text-[11px]"
            >
              자동 입력
            </button>
          </div>
          <p>번호: <span className="text-white font-mono">010-0000-0000</span> / 비밀번호: <span className="text-white font-mono">password123</span></p>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#2d2f36] flex items-center justify-between text-xs text-neutral-500">
          <span>권한: ROLE_ADMIN 전용</span>
          <a href="/" className="hover:text-neutral-300 flex items-center gap-1">
            <span>사용자 서비스 홈</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  );
}
