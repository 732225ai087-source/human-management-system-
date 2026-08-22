import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthGuard } from './components/guards/AuthGuard';
import { RoleGuard } from './components/guards/AuthGuard';
import { AppLayout } from './components/layout/AppLayout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Dashboard
import { EmployeeDashboard } from './pages/dashboard/EmployeeDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';

// Profile
import { ProfileView } from './pages/profile/ProfileView';
import { ProfileEdit } from './pages/profile/ProfileEdit';

// Attendance
import { AttendanceView } from './pages/attendance/AttendanceView';
import { AttendanceAdmin } from './pages/attendance/AttendanceAdmin';

// Leave
import { LeaveApply } from './pages/leave/LeaveApply';
import { LeaveApprovals } from './pages/leave/LeaveApprovals';

// Payroll
import { PayrollView, PayrollAdmin } from './pages/payroll/PayrollView';

// Reports
import { ReportsAdmin } from './pages/reports/ReportsAdmin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/dashboard/admin' : '/dashboard'} replace />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Protected routes */}
            <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
              {/* Employee routes */}
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/profile/:userId" element={<ProfileView />} />
              <Route path="/profile/:userId/edit" element={<ProfileEdit />} />
              <Route path="/attendance" element={<AttendanceView />} />
              <Route path="/leave" element={<LeaveApply />} />
              <Route path="/payroll" element={<PayrollView />} />

              {/* Admin routes */}
              <Route path="/dashboard/admin" element={<RoleGuard allowedRoles={['ADMIN']}><AdminDashboard /></RoleGuard>} />
              <Route path="/admin/employees" element={<RoleGuard allowedRoles={['ADMIN']}><AdminDashboard /></RoleGuard>} />
              <Route path="/admin/attendance" element={<RoleGuard allowedRoles={['ADMIN']}><AttendanceAdmin /></RoleGuard>} />
              <Route path="/admin/leave" element={<RoleGuard allowedRoles={['ADMIN']}><LeaveApprovals /></RoleGuard>} />
              <Route path="/admin/payroll" element={<RoleGuard allowedRoles={['ADMIN']}><PayrollAdmin /></RoleGuard>} />
              <Route path="/admin/reports" element={<RoleGuard allowedRoles={['ADMIN']}><ReportsAdmin /></RoleGuard>} />
              <Route path="/admin/notifications" element={<RoleGuard allowedRoles={['ADMIN']}><EmployeeDashboard /></RoleGuard>} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
