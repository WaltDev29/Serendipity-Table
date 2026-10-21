import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { signupApi } from '../api/auth';
import { formatPhoneNumber } from '../utils/formatters';

export default function SignupPage() {
  const navigate = useNavigate();
  const { refreshAppData } = useApp();
  const { showAlert, showConfirm } = useModal();

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthYear: '1995',
    gender: 'F',
    job: '직장인',
    agreeTerms: true,
    agreePrivacy: true
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'phone' ? formatPhoneNumber(value) : value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('이름(실명)을 입력해주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('휴대폰 번호를 입력해주세요.');
      return;
    }
    if (formData.password.length < 4) {
      setErrorMsg('비밀번호를 4자리 이상 입력해주세요.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!formData.agreeTerms || !formData.agreePrivacy) {
      setErrorMsg('필수 약관에 동의해주세요.');
      return;
    }

    const confirmed = await showConfirm('입력하신 정보로 회원가입을 진행하시겠습니까?', '회원가입 확인');
    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      const nickname = formData.nickname.trim() || formData.name;

      await signupApi({
        phone: cleanPhone,
        password: formData.password,
        name: formData.name,
        nickname,
        birthYear: parseInt(formData.birthYear, 10) || 1995,
        gender: formData.gender,
        job: formData.job || '직장인'
      });

      await refreshAppData();

      await showAlert(`🎉 ${formData.name}님, 회원가입이 완료되었습니다!\n이어서 나만의 취향과 성향 정보를 입력해주세요.`, '가입 완료');
      navigate('/information-input');
    } catch (err) {
      setErrorMsg(err.message || '회원가입에 실패했습니다.');
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
              회원가입
            </h1>
            <div className="w-9" />
          </div>

          <div className="text-center my-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mx-auto mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant
              </span>
            </div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              우연한 식탁에 오신 것을 환영해요
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              신뢰할 수 있는 소셜 다이닝을 위해 실명과 본인 번호로 가입해주세요.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-3 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-1.5 animate-shake">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3 text-xs">
            {/* 이름 */}
            <div>
              <label className="block font-bold text-on-surface mb-1">
                이름 (실명) <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* 휴대폰 번호 */}
            <div>
              <label className="block font-bold text-on-surface mb-1">
                휴대폰 번호 <span className="text-primary">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="010-1234-5678"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  비밀번호 <span className="text-primary">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="4자리 이상"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  비밀번호 확인 <span className="text-primary">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호 재입력"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* 성별 & 출생연도 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  성별
                </label>
                <div className="flex gap-1.5">
                  {[
                    { id: 'F', label: '여성' },
                    { id: 'M', label: '남성' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g.id })}
                      className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all ${
                        formData.gender === g.id
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  출생연도
                </label>
                <input
                  type="number"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  placeholder="예: 1995"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* 직업/분야 */}
            <div>
              <label className="block font-bold text-on-surface mb-1">
                직업 / 관심 분야
              </label>
              <input
                type="text"
                name="job"
                value={formData.job}
                onChange={handleChange}
                placeholder="예: 브랜드 디자이너, 개발자, 마케터 등"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 약관 동의 */}
            <div className="pt-2 border-t border-surface-container space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="accent-primary w-4 h-4 rounded"
                />
                <span className="text-[11px] text-on-surface">
                  [필수] 우연한 식탁 서비스 이용약관 및 식탁 에티켓 동의
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  className="accent-primary w-4 h-4 rounded"
                />
                <span className="text-[11px] text-on-surface">
                  [필수] 안전한 매칭을 위한 개인정보 수집 및 이용 동의
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-1 disabled:opacity-60"
            >
              <span>{isLoading ? '가입 처리 중...' : '회원가입'}</span>
              <span className="material-symbols-outlined text-base">person_add</span>
            </button>
          </form>
        </div>

        <div className="pt-4 text-center text-xs text-on-surface-variant">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
