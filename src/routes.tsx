// src/router.tsx

import { createBrowserRouter, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import CourseDetailPage from './pages/course/CourseDetailPage';
import AllCoursesPage from './pages/course/AllCoursesPage';
import UserDashboard from './pages/user/UserDashboard';
import AuthPage from './pages/auth/AuthPage';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Import the two new pages here
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Only blocks unauthenticated users from /dashboard
const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) {
    return (
      <Navigate
        to={`/fwm/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Outlet />;
};

// Only blocks non-admins from /admin
const RequireAdmin = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const AuthLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export const router = createBrowserRouter(
  [
    {
      element: <AuthLayout />,
      children: [
        // ✅ PUBLIC — no auth needed
        { path: '/', element: <Home /> },
        { path: '/courses', element: <AllCoursesPage /> },
        { path: '/cours/:slug', element: <CourseDetailPage /> },
        // ✅ NEW LEGAL ROUTES ADDED HERE
        { path: '/terms', element: <TermsAndConditions /> },
        { path: '/privacy', element: <PrivacyPolicy /> },

        // ✅ LOGIN — no wrapper needed.
        //    LoginPage itself calls authApi.me() on mount:
        //      • token valid   → redirects to /dashboard (or ?redirect= param)
        //      • no token/401  → shows the login form
        //    Putting RedirectIfLoggedIn here caused a race condition between
        //    AuthContext loading state and the page's own session check.
        { path: '/login', element: <LoginPage /> },

        // ✅ REGISTER / ENROLLMENT — no wrapper here intentionally.
        //    AuthPage handles all three cases itself:
        //      • token valid (approved user)  → skips signup, goes to payment ✅
        //      • token invalid / 401/403       → shows signup form            ✅
        //      • no token                      → shows signup form            ✅
        //
        //    Wrapping this in RedirectIfLoggedIn was the main bug —
        //    logged-in users clicking "Enroll Now" on a new course were
        //    being bounced to /dashboard instead of seeing the payment step.
        { path: '/register', element: <AuthPage /> },
        { path: '/reset-password', element: <ResetPasswordPage /> },

        // ✅ PROTECTED — must be a logged-in user (non-admin)
        {
          element: <RequireAuth />,
          children: [
            { path: '/dashboard', element: <UserDashboard /> },
          ],
        },

        // ✅ PROTECTED — must be admin
        {
          element: <RequireAdmin />,
          children: [
            { path: '/admin', element: <AdminDashboard /> },
          ],
        },

        // ✅ Fallback
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename: '/fwm' }
);