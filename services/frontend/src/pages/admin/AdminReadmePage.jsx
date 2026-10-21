import React, { useState } from 'react';

export default function AdminReadmePage() {
  const [activeTab, setActiveTab] = useState('all');

  const sections = [
    { id: 'overview', title: '1. 프로젝트 개요', icon: 'restaurant' },
    { id: 'arch', title: '2. 시스템 아키텍처', icon: 'hub' },
    { id: 'stack', title: '3. 기술 스택', icon: 'layers' },
    { id: 'features', title: '4. 핵심 기능 명세', icon: 'star' },
    { id: 'flow', title: '5. 사용자 여정 (User Journey)', icon: 'timeline' },
    { id: 'lifecycle', title: '6. 무중단 주간 라이프사이클', icon: 'autorenew' },
    { id: 'algorithm', title: '7. AI 매칭 알고리즘', icon: 'psychology' },
    { id: 'chat', title: '8. 실시간 단체 채팅 구조', icon: 'chat' },
    { id: 'admin', title: '9. 관리자 운영 콘솔', icon: 'admin_panel_settings' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-8 text-white shadow-xl border border-stone-700/60">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>SYSTEM SPECIFICATION & TECHNICAL DOCUMENTATION</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <span>🍽️ 우연한 식탁 (Serendipity Table)</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary text-white">v1.0.0</span>
          </h1>
          <p className="mt-2 text-stone-300 text-sm max-w-3xl leading-relaxed">
            취향과 온도가 맞는 사람들과 함께하는 특별한 저녁 식탁 —
            2030 프리미엄 소셜 다이닝 플랫폼의 전체 시스템 아키텍처, 주간 무중단 라이프사이클, AI 매칭 엔진 알고리즘 및 운영 콘솔 기술 명세서입니다.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Quick Section Navigation Bar */}
      <div className="bg-surface rounded-xl p-2 border border-surface-container shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'all'
            ? 'bg-stone-900 text-white shadow-sm'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
        >
          전체 보기
        </button>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveTab(sec.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${activeTab === sec.id
              ? 'bg-amber-500 text-white font-bold shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
          >
            <span className="material-symbols-outlined text-[15px]">{sec.icon}</span>
            <span>{sec.title}</span>
          </button>
        ))}
      </div>

      {/* Section 1: Overview */}
      {(activeTab === 'all' || activeTab === 'overview') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">restaurant</span>
            <h2 className="text-xl font-bold text-on-surface">1. 프로젝트 개요</h2>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            <strong>우연한 식탁</strong>은 매주 목요일 저녁 7시 30분, 서울 주요 4대 권역(홍대/합정, 잠실/송파, 강남/신논현, 을지로/종로)에서
            4~6인의 엄선된 밥친구들을 연결해 주는 소셜 다이닝 서비스입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <h3 className="text-sm font-bold text-stone-900">안심 소셜 다이닝</h3>
              <p className="text-xs text-stone-600 mt-1 leading-normal">
                연락처, SNS를 외부에 일체 노출하지 않고 닉네임과 취향 키워드로만 안전하게 소통합니다.
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-2">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <h3 className="text-sm font-bold text-stone-900">스마트 AI 매칭</h3>
              <p className="text-xs text-stone-600 mt-1 leading-normal">
                연령차, 성비 균형, 관심사, 식사 예산대, 소통 성향, 기피/차단 회원을 다각도로 분석하여 최적의 테이블을 성사합니다.
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">
                <span className="material-symbols-outlined text-[20px]">autorenew</span>
              </div>
              <h3 className="text-sm font-bold text-stone-900">자동화된 오퍼레이션</h3>
              <p className="text-xs text-stone-600 mt-1 leading-normal">
                모임 신청부터 3단계 재매칭, 제휴 식당 자동 예약, 단체 채팅방 개설, D-Day 리마인드 및 피드백까지 전 과정 무중단 자동화됩니다.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Architecture */}
      {(activeTab === 'all' || activeTab === 'arch') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-indigo-600 text-2xl">hub</span>
            <h2 className="text-xl font-bold text-on-surface">2. 전체 시스템 아키텍처</h2>
          </div>
          <p className="text-xs text-stone-600">
            Docker Compose 기반의 5계층 마이크로서비스로 구성되어 독립적이고 유기적으로 동작합니다.
          </p>
          <div className="bg-stone-900 rounded-xl p-5 text-stone-200 font-mono text-xs overflow-x-auto leading-relaxed border border-stone-800">
            <pre className="text-stone-300">
              {`                                [Client Browser / Mobile Web]
                                              │
                                              │ HTTP (Port 81) / WS (Port 81)
                                              ▼
                                    [Nginx Reverse Proxy]
                      ┌───────────────────────┼───────────────────────┐
                      │ /                     │ /api/*, /ws-chat/*    │ /ai/* (내부망)
                      ▼                       ▼                       ▼
           [serendipity-frontend]   [serendipity-backend]   [serendipity-ai-engine]
           - React 18 (Vite SPA)    - Spring Boot 3.3.x     - Python 3.11 (FastAPI)
           - Mobile PhoneFrame      - Security + JWT (KST)  - Hard/Soft Constraint 매칭
           - Vanilla CSS Design     - WebSocket STOMP       - 조합 최적화 & 스코어링
                                              │
                                              │ JDBC / Redis
                                   ┌──────────┴──────────┐
                                   ▼                     ▼
                        [serendipity-postgres]   [serendipity-redis]
                        - PostgreSQL 15 (KST)    - Redis 7.x
                        - JSONB, TEXT[] 배열     - 세션, 캐시, 분산락`}
            </pre>
          </div>
        </section>
      )}

      {/* Section 3: Tech Stack */}
      {(activeTab === 'all' || activeTab === 'stack') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-blue-600 text-2xl">layers</span>
            <h2 className="text-xl font-bold text-on-surface">3. 기술 스택</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <th className="py-2.5 px-3">계층</th>
                  <th className="py-2.5 px-3">주요 기술</th>
                  <th className="py-2.5 px-3">버전 및 특징</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Frontend Web</td>
                  <td className="py-2.5 px-3">React 18, Vite</td>
                  <td className="py-2.5 px-3">모바일 전용 PhoneFrame (390×844) 레이아웃, Context API 기반 실시간 상태 관리</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Styling</td>
                  <td className="py-2.5 px-3">Vanilla CSS (CSS3 Tokens)</td>
                  <td className="py-2.5 px-3">순수 CSS3 디자인 토큰 시스템, 글래스모피즘, 모바일 하단 sticky 입력창</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Backend API</td>
                  <td className="py-2.5 px-3">Java 17, Spring Boot 3.3.x</td>
                  <td className="py-2.5 px-3">Spring Data JPA, Hibernate 6, JWT 인증/인가, ZoneId Asia/Seoul(KST) 표준화</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Realtime Chat</td>
                  <td className="py-2.5 px-3">Spring WebSocket, STOMP</td>
                  <td className="py-2.5 px-3">4인 단체방 실시간 소통, 네트워크 순단 시 REST API 폴백 자동 전송 이중화</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Matching Engine</td>
                  <td className="py-2.5 px-3">Python 3.11, FastAPI, Pydantic</td>
                  <td className="py-2.5 px-3">itertools 기반 조합 탐색, 조기 가지치기(Early Pruning), 다차원 가중치 채점</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Database</td>
                  <td className="py-2.5 px-3">PostgreSQL 15</td>
                  <td className="py-2.5 px-3">Timezone Asia/Seoul KST, 관심사/성향 저장을 위한 TEXT[] 배열 및 JSONB 지원</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Cache / Queue</td>
                  <td className="py-2.5 px-3">Redis 7.x-alpine</td>
                  <td className="py-2.5 px-3">JWT 토큰 세션, STOMP 세션 캐시 및 임시 상태 동기화</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-900">Infra / Gateway</td>
                  <td className="py-2.5 px-3">Nginx, Docker Compose</td>
                  <td className="py-2.5 px-3">포트 81 단일 진입점, 웹소켓 업그레이드 프록시, 무중단 서비스 오케스트레이션</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Section 4: Key Features */}
      {(activeTab === 'all' || activeTab === 'features') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-amber-500 text-2xl">star</span>
            <h2 className="text-xl font-bold text-on-surface">4. 핵심 기능 명세 (Key Features)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 4.1 Matching */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-lg">psychology</span>
                4.1 AI 매칭 시스템
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-stone-700">
                <li>• <strong>다차원 성향 추천</strong>: 나이차(8세 이내), 관심사, 식사 예산대, 소통 성향 종합 채점</li>
                <li>• <strong>엄격한 성비 균형</strong>: 동성(4M/4F) 테이블 완전 배제, 남녀 각 2명 이상 필수(2:2, 3:2, 2:3)</li>
                <li>• <strong>3단계 순차 재매칭</strong>: 1차(월 12시) ➔ 2차(월 21시) ➔ 3차(화 08시), 미매칭 시 1회권 100% 자동 환불</li>
                <li>• <strong>차단/기피 회원 격리</strong>: 비매너 신고자 및 차단 회원은 동일 테이블 배치를 원천 차단</li>
              </ul>
            </div>

            {/* 4.2 Chat */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-lg">chat</span>
                4.2 실시간 단체 채팅 및 안심 소통
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-stone-700">
                <li>• <strong>라이프사이클 통제</strong>: 화요일 12:00 최종 확정 및 식당 예약 완료 시점에만 개설 허용</li>
                <li>• <strong>식당 예약 상태 연동</strong>: 예약 전에는 `식당 예약 전` 표시, 예약 완료 시 매장명/길찾기 연동</li>
                <li>• <strong>하이브리드 메시징</strong>: WebSocket 실시간 송수신 + 네트워크 단절 시 HTTP REST 폴백 전송</li>
                <li>• <strong>모바일 전용 레이아웃</strong>: 상하 공백 없는 100% 핏 및 입력창 최하단 밀착 고정 (sticky bottom-0)</li>
              </ul>
            </div>

            {/* 4.3 Admin */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-lg">admin_panel_settings</span>
                4.3 관리자 운영 콘솔 (Admin Operations)
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-stone-700">
                <li>• <strong>전체 흐름 테스트 (/admin/flow-test)</strong>: 참여권 지급/회수, 1~9단계 라이프사이클 원클릭 시뮬레이터</li>
                <li>• <strong>회차 및 슬롯 관리 (/admin/slots)</strong>: 권역별 신청/매칭/대기 실시간 집계 및 조기 마감 토글</li>
                <li>• <strong>매칭 관제 (/admin/matching)</strong>: 조별 상세 스펙 확인 및 관리자 수동 자리 맞바꾸기(Swap)</li>
                <li>• <strong>채팅 관제 (/admin/chat-ops)</strong>: 전체 대화방 모니터링 및 실시간 긴급 공지 브로드캐스트</li>
                <li>• <strong>식당 풀 & 예외 큐 (/admin/venues, /admin/exceptions)</strong>: 제휴 식당 DB 관리 및 식당 미배정 자동 감지</li>
              </ul>
            </div>

            {/* 4.4 Flow & Feedback */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-lg">thumb_up</span>
                4.4 참가 신청, 식당 배정 및 피드백
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-stone-700">
                <li>• <strong>원터치 모임 신청</strong>: 매주 목요일 정규 모임에 대해 희망 권역 선택 후 보유 참가권으로 신청</li>
                <li>• <strong>권역 매핑 자동 식당 예약</strong>: 테이블 권역에 일치하는 제휴 식당 풀에서 매장 자동 배정</li>
                <li>• <strong>도착 체크인</strong>: 당일 식당 도착 시 도착 체크인 버튼을 통해 동행자에게 착석 여부 공유</li>
                <li>• <strong>3대 별점 & 블라인드 피드백</strong>: 음식/분위기/매너 5점 척도 평가 및 비공개 재매칭/차단 설정</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Section 5: User Journey */}
      {(activeTab === 'all' || activeTab === 'flow') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-cyan-600 text-2xl">timeline</span>
            <h2 className="text-xl font-bold text-on-surface">5. 핵심 사용자 흐름 (User Journey)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px]">1</span>
                회원가입 & 온보딩
              </div>
              <p className="text-stone-600 leading-normal">
                성별, 출생연도, 직업, MBTI, 관심사(복수선택), 나의 성향 및 선호 성향, 식사 예산대 등록
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px]">2</span>
                참가권 신청 & 매칭
              </div>
              <p className="text-stone-600 leading-normal">
                목요일 정기 회차와 서울 4대 권역 중 선택하여 참가 신청 후 월요일 12:00 AI 매칭 가동
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px]">3</span>
                화요일 확정 & 채팅 오픈
              </div>
              <p className="text-stone-600 leading-normal">
                화요일 12:00 최종 확정 및 제휴 식당 자동 배정 완료 시 4인 단체 채팅방 공식 오픈
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px]">4</span>
                목요일 참석 & 금요일 후기
              </div>
              <p className="text-stone-600 leading-normal">
                목요일 19:30 식탁 참석 후 도착 체크인, 금요일 12:00 3대 별점 및 비공개 피드백 작성
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 6: Weekly Lifecycle */}
      {(activeTab === 'all' || activeTab === 'lifecycle') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-purple-600 text-2xl">autorenew</span>
            <h2 className="text-xl font-bold text-on-surface">6. 모임 주간 라이프사이클 (Zero-Touch Lifecycle)</h2>
          </div>
          <p className="text-xs text-stone-600">
            Spring Boot의 <code>@Scheduled(cron = &quot;...&quot;, zone = &quot;Asia/Seoul&quot;)</code> 스케줄러를 통해 한 주간의 모임 운영이 사람의 개입 없이 완전 자동화됩니다.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <th className="py-2.5 px-3">일시 (KST)</th>
                  <th className="py-2.5 px-3">단계명</th>
                  <th className="py-2.5 px-3">시스템 동작 상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 월요일 09:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">차주 회차 자동 생성</td>
                  <td className="py-2 px-3">차주 목요일(D+10) 정기 회차 슬롯 및 서울 4개 권역 슬롯 자동 등록</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 월요일 12:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">1차 AI 매칭 엔진 가동</td>
                  <td className="py-2 px-3">신청 마감자 대상 권역별 1차 AI 매칭 실행 및 배정자 멤버 리스트 발송</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 월요일 21:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">2차 AI 재매칭 가동</td>
                  <td className="py-2 px-3">1차 미매칭자 및 참가 취소자로 결원이 발생한 그룹 대상 2차 재매칭 실행</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 화요일 08:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">3차 최종 재매칭 & 실패 반환</td>
                  <td className="py-2 px-3">최종 3차 재매칭 실행. 최종 미매칭자에게 <strong>참가권 1회 자동 반환</strong> 및 알림 발송</td>
                </tr>
                <tr className="bg-amber-50/50">
                  <td className="py-2 px-3 font-bold text-amber-900 whitespace-nowrap">매주 화요일 12:00</td>
                  <td className="py-2 px-3 font-bold text-amber-700">최종 확정 & 식당 예약 & 채팅 개설</td>
                  <td className="py-2 px-3 font-medium text-amber-950">
                    매칭 테이블 CONFIRMED 전환, 권역별 제휴 식당 자동 배정, <strong>4인 단체 채팅방 공식 개설</strong>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 화요일 16:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">식당 미예약 예외 감지</td>
                  <td className="py-2 px-3">제휴 식당 예약 실패 테이블 감지 시 관리자 예외 큐(Exception Queue)로 자동 이관</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 목요일 12:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">모임 당일(D-Day) 리마인드</td>
                  <td className="py-2 px-3">당일 참석자 전원 및 채팅방에 식당 위치, 지도 링크, 집결 안내 푸시 발송</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 목요일 19:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">모임 30분 전 알림</td>
                  <td className="py-2 px-3">모임 30분 전 리마인드 발송 및 &quot;식당 도착 후 도착 체크인&quot; 안내</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 목요일 19:30</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">식탁 시작 환영 공지</td>
                  <td className="py-2 px-3">정규 모임 시작 안내 및 매너 수칙 리마인드 공지 자동 발송</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-stone-900 whitespace-nowrap">매주 금요일 12:00</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">사후 다이닝 피드백 요청</td>
                  <td className="py-2 px-3">어제 참석자 전원에게 3대 평점(음식/분위기/매너) 및 비공개 재매칭 평가 요청 발송</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Section 7: AI Algorithm */}
      {(activeTab === 'all' || activeTab === 'algorithm') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-rose-600 text-2xl">psychology</span>
            <h2 className="text-xl font-bold text-on-surface">7. AI 매칭 엔진 알고리즘 (Matching Algorithm)</h2>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900">7.1 하드 제약 조건 (Hard Constraints - 절대 타협 불가)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl">
                <div className="font-bold text-red-900">1. 인원수 제약</div>
                <div className="text-red-700 mt-1">한 테이블은 반드시 <strong>4인 ~ 6인</strong>으로만 구성</div>
              </div>
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl">
                <div className="font-bold text-red-900">2. 최대 연령 차이</div>
                <div className="text-red-700 mt-1">테이블 내 <strong>(최고 연령 - 최저 연령) ≤ 8세</strong> 엄수</div>
              </div>
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl">
                <div className="font-bold text-red-900">3. 성비 균형 강제 (동성 금지)</div>
                <div className="text-red-700 mt-1">
                  남성만(4M) 또는 여성만(4F) 있는 <strong>동성 테이블 절대 배제</strong>, 남녀 각각 <strong>최소 2인 이상</strong> 필수 (2:2, 3:2, 2:3, 3:3)
                </div>
              </div>
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl">
                <div className="font-bold text-red-900">4. 차단 및 기피 관계 격리</div>
                <div className="text-red-700 mt-1">
                  과거 비매너 신고자, 시스템 차단자(user_blocks), 상호 기피 회원은 동일 테이블 배치 절대 불가
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-stone-900 pt-2">7.2 소프트 가중치 스코어링 (Soft Scoring - 100점 만점)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <th className="py-2 px-3">평가 항목</th>
                    <th className="py-2 px-3">배점</th>
                    <th className="py-2 px-3">산출 공식 및 기준</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  <tr>
                    <td className="py-2 px-3 font-semibold">연령 점수 (S_age)</td>
                    <td className="py-2 px-3 font-bold text-indigo-700">25점</td>
                    <td className="py-2 px-3 font-mono">max(0, 25.0 - (age_diff × 2.5)) (동갑 25점, 8세 차이 시 5점)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">성비 점수 (S_ratio)</td>
                    <td className="py-2 px-3 font-bold text-indigo-700">30점</td>
                    <td className="py-2 px-3">남녀 2:2 / 3:3 완벽 균형 시 30.0점, 5인(3:2 / 2:3) 시 26.0점</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">관심사 점수 (S_interest)</td>
                    <td className="py-2 px-3 font-bold text-indigo-700">20점</td>
                    <td className="py-2 px-3 font-mono">min(20.0, len(common_interests) × 6.0 + 8.0)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">예산대 점수 (S_budget)</td>
                    <td className="py-2 px-3 font-bold text-indigo-700">15점</td>
                    <td className="py-2 px-3">구성원 전체가 교차 허용하는 식사 예산대 구간 일치 시 15.0점 (불일치 시 8.0점)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">소통 성향 점수 (S_tendency)</td>
                    <td className="py-2 px-3 font-bold text-indigo-700">10점</td>
                    <td className="py-2 px-3">나의 성향 키워드와 상대방 선호 성향 간의 적합도 평가 (기본 10.0점)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Section 8: Realtime Chat */}
      {(activeTab === 'all' || activeTab === 'chat') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-teal-600 text-2xl">chat</span>
            <h2 className="text-xl font-bold text-on-surface">8. 실시간 단체 채팅 및 공지 아키텍처</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
              <div className="font-bold text-stone-900 text-sm">개설 통제 및 식당 상태 안내</div>
              <p className="text-stone-700 leading-normal">
                • <strong>개설 시점 제어</strong>: 1~3단계 매칭 대기 중에는 개설되지 않으며, 4단계(화요일 정오 12:00) 최종 확정 및 식당 예약 완료 시점에만 안전하게 생성/입장 허용
              </p>
              <p className="text-stone-700 leading-normal">
                • <strong>식당 예약 전 표시</strong>: 식당 예약이 조율 중이거나 미완료된 경우 식당명 대신 <code>식당 예약 전</code>으로 안전하게 표시
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
              <div className="font-bold text-stone-900 text-sm">하이브리드 메시징 & 모바일 핏 UI</div>
              <p className="text-stone-700 leading-normal">
                • <strong>WebSocket STOMP + HTTP Fallback</strong>: <code>/ws-chat</code>을 통해 실시간 브로드캐스팅하며, 네트워크 불안정 시 <code>/api/v1/chat/rooms/{'{id}'}/messages</code>로 즉시 폴백 전송되어 유실을 방지합니다.
              </p>
              <p className="text-stone-700 leading-normal">
                • <strong>PhoneFrame 최적화</strong>: 상하 여백 없이 100% 핏되는 높이 구조와 최하단 밀착 고정 입력창(<code>sticky bottom-0 z-30</code>) 디자인 적용
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 9: Admin Console */}
      {(activeTab === 'all' || activeTab === 'admin') && (
        <section className="bg-surface rounded-2xl p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">admin_panel_settings</span>
            <h2 className="text-xl font-bold text-on-surface">9. 관리자 운영 콘솔 상세 (Admin Console)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900">전체 흐름 테스트 (/admin/flow-test)</div>
              <p className="text-stone-600 mt-1 leading-normal">
                1회권 결제 및 참여권 지급/회수 실 DB 연동, 1~9단계 라이프사이클 원클릭 시뮬레이션 및 데이터 일괄 리셋
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900">회차 및 슬롯 관리 (/admin/slots)</div>
              <p className="text-stone-600 mt-1 leading-normal">
                목요일 정기 회차 생성, 권역별 실시간 신청/매칭/대기 인원 집계 및 조기 마감 토글 제어
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900">매칭 운영 관제 (/admin/matching)</div>
              <p className="text-stone-600 mt-1 leading-normal">
                확정 테이블 목록 및 조별 구성원(나이, 직업, MBTI, 성비) 확인, 회원 간 수동 자리 맞바꾸기(Swap)
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900">제휴 식당 풀 관리 (/admin/venues)</div>
              <p className="text-stone-600 mt-1 leading-normal">
                서울 4대 권역별 실제 네이버 지도 플레이스 링크, 대표 메뉴 및 예약 수용 인원 연동 관리
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900">채팅 관제 & 긴급 공지 (/admin/chat-ops)</div>
              <p className="text-stone-600 mt-1 leading-normal">
                개설된 전체 단체 채팅방의 실시간 대화 모니터링 및 전체/권역 대상 운영자 긴급 공지 즉시 주입
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="font-bold text-stone-900">1:1 CS & 예외 큐 (/admin/cs, /exceptions)</div>
              <p className="text-stone-600 mt-1 leading-normal">
                1:1 문의 실시간 응대 및 식당 미배정, 인원 미달 등 시스템 이상 징후 자동 감지 및 조치 큐
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
