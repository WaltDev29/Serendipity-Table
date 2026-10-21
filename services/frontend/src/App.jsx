import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ModalProvider } from './context/ModalContext';

// Common Components
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import NotificationDrawer from './components/common/NotificationDrawer';
import EtiquetteModal from './components/common/EtiquetteModal';
import SplashScreen from './components/common/SplashScreen';
import PhoneFrame from './components/common/PhoneFrame';

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
import AdminPreferencesPage from './pages/admin/AdminPreferencesPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminExceptionsPage from './pages/admin/AdminExceptionsPage';
import AdminCustomerServicePage from './pages/admin/AdminCustomerServicePage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminFlowTestPage from './pages/admin/AdminFlowTestPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminReadmePage from './pages/admin/AdminReadmePage';

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
import InquiryChatPage from './pages/InquiryChatPage';
import NotificationsPage from './pages/NotificationsPage';

// 비로그인 사용자 보호 라우트 가드
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 관리자 권한 전용 라우트 가드
function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem('admin_token');
  let isAdmin = false;
  if (adminToken) {
    try {
      const savedUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      if (savedUser?.role === 'ROLE_ADMIN') {
        isAdmin = true;
      }
    } catch {
      isAdmin = false;
    }
  }

  if (!adminToken || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

// 라우트 전환 시 최신 데이터 자동 동기화 컴포넌트
function RouteSync() {
  const { pathname } = useLocation();
  const { refreshAppData } = useApp();
  const { refreshAdminData } = useAdmin();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken && refreshAdminData) {
        refreshAdminData();
      }
    } else {
      const token = localStorage.getItem('token');
      if (token && refreshAppData) {
        refreshAppData();
      }
    }
  }, [pathname, refreshAppData, refreshAdminData]);

  return null;
}

export default function App() {
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const [showSplash, setShowSplash] = React.useState(!isAdminPath);

  return (
    <BrowserRouter>
      <AppProvider>
        <AdminProvider>
          <ModalProvider>
            <RouteSync />
            <PhoneFrame>
            {showSplash && !window.location.pathname.startsWith('/admin') && (
              <SplashScreen onFinish={() => setShowSplash(false)} />
            )}
            <div className="h-full min-h-full bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col selection:bg-primary-fixed selection:text-primary">
              {/* Universal Sticky Header (Hidden on /admin) */}
              <Header />

            {/* Main View Router */}
            <main className="w-full flex-1 flex flex-col min-h-0">
              <Routes>
                {/* ========================================= */}
                {/* ADMIN CONSOLE ROUTES (/admin/*)           */}
                {/* ========================================= */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="slots" element={<AdminSlotsPage />} />
                  <Route path="applications" element={<AdminApplicationsPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="matching" element={<AdminMatchingOpsPage />} />
                  <Route path="venues" element={<AdminVenuesPage />} />
                  <Route path="chat-ops" element={<AdminChatOpsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="cs" element={<AdminCustomerServicePage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="analytics/preferences" element={<AdminPreferencesPage />} />
                  <Route path="analytics/reviews" element={<AdminReviewsPage />} />
                  <Route path="exceptions" element={<AdminExceptionsPage />} />
                  <Route path="readme" element={<AdminReadmePage />} />
                  <Route path="flow-test" element={<AdminFlowTestPage />} />
                </Route>

                {/* ========================================= */}
                {/* USER MOBILE WEB APP ROUTES                */}
                {/* ========================================= */}
                {/* 홈 */}
                <Route path="/" element={<div className="pt-14"><HomePage /></div>} />

                {/* 매칭 탭 (대기/확정식당/후기 등 상태 스마트 허브) */}
                <Route path="/matching" element={<ProtectedRoute><div className="pt-14"><MatchingHubPage /></div></ProtectedRoute>} />

                {/* 정보 입력 페이지 (회원가입 직후 설정 및 마이페이지 수정) */}
                <Route path="/information-input" element={<ProtectedRoute><div className="pt-14"><InformationInputPage /></div></ProtectedRoute>} />
                <Route path="/apply" element={<ProtectedRoute><div className="pt-14"><InformationInputPage /></div></ProtectedRoute>} />
                <Route path="/survey" element={<ProtectedRoute><div className="pt-14"><InformationInputPage /></div></ProtectedRoute>} />
                <Route path="/booking" element={<ProtectedRoute><div className="pt-14"><InformationInputPage /></div></ProtectedRoute>} />

                {/* 매칭 대기 현황 및 D-Day 타이머 */}
                <Route path="/matching-waiting" element={<ProtectedRoute><div className="pt-14"><MatchingWaitingPage /></div></ProtectedRoute>} />
                <Route path="/match/status" element={<ProtectedRoute><div className="pt-14"><MatchingWaitingPage /></div></ProtectedRoute>} />

                {/* P-07: 매칭 확정 & 식당 및 4인 익명 멤버 소개 */}
                <Route path="/match/result" element={<ProtectedRoute><div className="pt-14"><VenueMembersPage /></div></ProtectedRoute>} />

                {/* P-08: 실시간 단체 채팅방 (7대 메시지 타입) */}
                <Route path="/chat" element={<ProtectedRoute><GroupChatPage /></ProtectedRoute>} />
                <Route path="/chat/inquiry" element={<ProtectedRoute><InquiryChatPage /></ProtectedRoute>} />

                {/* P-13: 채팅 목록 */}
                <Route path="/chats" element={<ProtectedRoute><div className="pt-14"><ChatListPage /></div></ProtectedRoute>} />

                {/* P-10: 사후 3대 별점 피드백 & 1초 재신청 리텐션 카드 */}
                <Route path="/feedback" element={<ProtectedRoute><div className="pt-14"><FeedbackPage /></div></ProtectedRoute>} />

                {/* P-09: 매칭 실패 시 무료이월/환불 대안 선택 */}
                <Route path="/match/fallback" element={<ProtectedRoute><div className="pt-14"><FallbackPage /></div></ProtectedRoute>} />
                <Route path="/fallback" element={<ProtectedRoute><div className="pt-14"><FallbackPage /></div></ProtectedRoute>} />

                {/* P-11 ~ P-12: 마이페이지 프로필 & 1:1 고객센터 실시간 문의 */}
                <Route path="/mypage" element={<ProtectedRoute><div className="pt-14"><MyPageAndCS /></div></ProtectedRoute>} />
                <Route path="/my" element={<ProtectedRoute><div className="pt-14"><MyPageAndCS /></div></ProtectedRoute>} />

                {/* 신규 추가: 회원가입 및 로그인 (자체 풀스크린 레이아웃) */}
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* 신규 추가: 지난 식탁 다이어리 & 안심 차단 관리 & 고객센터 */}
                <Route path="/past-tables" element={<ProtectedRoute><div className="pt-14"><PastTablesPage /></div></ProtectedRoute>} />
                <Route path="/blocked-users" element={<ProtectedRoute><div className="pt-14"><BlockedUsersPage /></div></ProtectedRoute>} />
                <Route path="/cs" element={<ProtectedRoute><div className="pt-14"><CustomerServicePage /></div></ProtectedRoute>} />
                <Route path="/notifications" element={<div className="pt-14"><NotificationsPage /></div>} />

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Drawers & Modals */}
            <NotificationDrawer />
            <EtiquetteModal />

            {/* Mobile Bottom Navigation Bar (Hidden on /admin) */}
            <BottomNav />
          </div>
            </PhoneFrame>
          </ModalProvider>
        </AdminProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
