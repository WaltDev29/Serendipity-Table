import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Common Components
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import NotificationDrawer from './components/common/NotificationDrawer';
import EtiquetteModal from './components/common/EtiquetteModal';
import DemoSwitcher from './components/common/DemoSwitcher';

// User Pages
import HomePage from './pages/HomePage';
import InformationInputPage from './pages/InformationInputPage';
import MatchingHubPage from './pages/MatchingHubPage';
import MatchingWaitingPage from './pages/MatchingWaitingPage';
import VenueMembersPage from './pages/VenueMembersPage';
import GroupChatPage from './pages/GroupChatPage';
import ChatListPage from './pages/ChatListPage';
import FeedbackPage from './pages/FeedbackPage';
import FallbackPage from './pages/FallbackPage';
import MyPageAndCS from './pages/MyPageAndCS';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col selection:bg-primary-fixed selection:text-primary">
          {/* Universal Sticky Header (Centered Mobile Webview Header) */}
          <Header />

          {/* Main View Router */}
          <main className="w-full pt-14 flex-1">
            <Routes>
              {/* 홈 */}
              <Route path="/" element={<HomePage />} />

              {/* 매칭 탭 (대기/확정식당/후기 등 상태 스마트 허브) */}
              <Route path="/matching" element={<MatchingHubPage />} />

              {/* 정보 입력 페이지 (회원가입 직후 설정 및 마이페이지 수정) */}
              <Route path="/information-input" element={<InformationInputPage />} />
              <Route path="/apply" element={<InformationInputPage />} />
              <Route path="/survey" element={<InformationInputPage />} />
              <Route path="/booking" element={<InformationInputPage />} />

              {/* 매칭 대기 현황 및 D-Day 타이머 */}
              <Route path="/matching-waiting" element={<MatchingWaitingPage />} />
              <Route path="/match/status" element={<MatchingWaitingPage />} />

              {/* P-07: 매칭 확정 & 식당 및 4인 익명 멤버 소개 */}
              <Route path="/match/result" element={<VenueMembersPage />} />

              {/* P-08: 실시간 단체 채팅방 (7대 메시지 타입) */}
              <Route path="/chat" element={<GroupChatPage />} />

              {/* P-13: 채팅 목록 */}
              <Route path="/chats" element={<ChatListPage />} />

              {/* P-10: 사후 3대 별점 피드백 & 1초 재신청 리텐션 카드 */}
              <Route path="/feedback" element={<FeedbackPage />} />

              {/* P-09: 매칭 실패 시 무료이월/환불 대안 선택 */}
              <Route path="/match/fallback" element={<FallbackPage />} />
              <Route path="/fallback" element={<FallbackPage />} />

              {/* P-11 ~ P-12: 마이페이지 프로필 & 1:1 고객센터 실시간 문의 */}
              <Route path="/mypage" element={<MyPageAndCS />} />
              <Route path="/my" element={<MyPageAndCS />} />

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Drawers & Modals */}
          <NotificationDrawer />
          <EtiquetteModal />

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav />

          {/* Fast QA / Demo Switcher for Evaluation */}
          <DemoSwitcher />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
