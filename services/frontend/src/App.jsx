import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AdminProvider } from './context/AdminContext';

// Common Components
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import NotificationDrawer from './components/common/NotificationDrawer';
import EtiquetteModal from './components/common/EtiquetteModal';
import DemoSwitcher from './components/common/DemoSwitcher';

// Admin Layout & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSlotsPage from './pages/admin/AdminSlotsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminMatchingOpsPage from './pages/admin/AdminMatchingOpsPage';
import AdminVenuesPage from './pages/admin/AdminVenuesPage';
import AdminChatOpsPage from './pages/admin/AdminChatOpsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminExceptionsPage from './pages/admin/AdminExceptionsPage';

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
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import PastTablesPage from './pages/PastTablesPage';
import BlockedUsersPage from './pages/BlockedUsersPage';
import CustomerServicePage from './pages/CustomerServicePage';

export default function App() {
  return (
    <AppProvider>
      <AdminProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col selection:bg-primary-fixed selection:text-primary">
            {/* Universal Sticky Header (Hidden on /admin) */}
            <Header />

            {/* Main View Router */}
            <main className="w-full flex-1">
              <Routes>
                {/* ========================================= */}
                {/* ADMIN CONSOLE ROUTES (/admin/*)           */}
                {/* ========================================= */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="slots" element={<AdminSlotsPage />} />
                  <Route path="applications" element={<AdminApplicationsPage />} />
                  <Route path="matching" element={<AdminMatchingOpsPage />} />
                  <Route path="venues" element={<AdminVenuesPage />} />
                  <Route path="chat-ops" element={<AdminChatOpsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="exceptions" element={<AdminExceptionsPage />} />
                </Route>

                {/* ========================================= */}
                {/* USER MOBILE WEB APP ROUTES                */}
                {/* ========================================= */}
                {/* 홈 */}
                <Route path="/" element={<div className="pt-14"><HomePage /></div>} />

                {/* 매칭 탭 (대기/확정식당/후기 등 상태 스마트 허브) */}
                <Route path="/matching" element={<div className="pt-14"><MatchingHubPage /></div>} />

                {/* 정보 입력 페이지 (회원가입 직후 설정 및 마이페이지 수정) */}
                <Route path="/information-input" element={<div className="pt-14"><InformationInputPage /></div>} />
                <Route path="/apply" element={<div className="pt-14"><InformationInputPage /></div>} />
                <Route path="/survey" element={<div className="pt-14"><InformationInputPage /></div>} />
                <Route path="/booking" element={<div className="pt-14"><InformationInputPage /></div>} />

                {/* 매칭 대기 현황 및 D-Day 타이머 */}
                <Route path="/matching-waiting" element={<div className="pt-14"><MatchingWaitingPage /></div>} />
                <Route path="/match/status" element={<div className="pt-14"><MatchingWaitingPage /></div>} />

                {/* P-07: 매칭 확정 & 식당 및 4인 익명 멤버 소개 */}
                <Route path="/match/result" element={<div className="pt-14"><VenueMembersPage /></div>} />

                {/* P-08: 실시간 단체 채팅방 (7대 메시지 타입) */}
                <Route path="/chat" element={<div className="pt-14"><GroupChatPage /></div>} />

                {/* P-13: 채팅 목록 */}
                <Route path="/chats" element={<div className="pt-14"><ChatListPage /></div>} />

                {/* P-10: 사후 3대 별점 피드백 & 1초 재신청 리텐션 카드 */}
                <Route path="/feedback" element={<div className="pt-14"><FeedbackPage /></div>} />

                {/* P-09: 매칭 실패 시 무료이월/환불 대안 선택 */}
                <Route path="/match/fallback" element={<div className="pt-14"><FallbackPage /></div>} />
                <Route path="/fallback" element={<div className="pt-14"><FallbackPage /></div>} />

                {/* P-11 ~ P-12: 마이페이지 프로필 & 1:1 고객센터 실시간 문의 */}
                <Route path="/mypage" element={<div className="pt-14"><MyPageAndCS /></div>} />
                <Route path="/my" element={<div className="pt-14"><MyPageAndCS /></div>} />

                {/* 신규 추가: 회원가입 및 로그인 */}
                <Route path="/signup" element={<div className="pt-14"><SignupPage /></div>} />
                <Route path="/login" element={<div className="pt-14"><LoginPage /></div>} />

                {/* 신규 추가: 지난 식탁 다이어리 & 안심 차단 관리 & 고객센터 */}
                <Route path="/past-tables" element={<div className="pt-14"><PastTablesPage /></div>} />
                <Route path="/blocked-users" element={<div className="pt-14"><BlockedUsersPage /></div>} />
                <Route path="/cs" element={<div className="pt-14"><CustomerServicePage /></div>} />

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Drawers & Modals */}
            <NotificationDrawer />
            <EtiquetteModal />

            {/* Mobile Bottom Navigation Bar (Hidden on /admin) */}
            <BottomNav />

            {/* Fast QA / Demo Switcher for Evaluation */}
            <DemoSwitcher />
          </div>
        </BrowserRouter>
      </AdminProvider>
    </AppProvider>
  );
}
