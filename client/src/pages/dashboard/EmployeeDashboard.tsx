import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineUser, HiOutlineClock, HiOutlineCalendar, HiOutlineLogout } from 'react-icons/hi';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeAvatar } from '../../utils/avatar';
import type { ApiResponse } from '../../types/api';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse>('/dashboard/employee');
      return res.data.data as { todayAttendance: unknown; pendingLeaves: number; recentAttendance: unknown[]; unreadNotifications: number };
    },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorMessage message="Failed to load dashboard" onRetry={refetch} />;

  const quickActions = [
    { icon: HiOutlineUser, title: 'My Profile', description: 'View and edit your profile', to: '/profile', color: 'from-primary-500 to-primary-600' },
    { icon: HiOutlineClock, title: 'Attendance', description: 'Check in/out and view records', to: '/attendance', color: 'from-success-500 to-success-600' },
    { icon: HiOutlineCalendar, title: 'Leave Requests', description: 'Apply for leave', to: '/leave', color: 'from-accent-500 to-accent-600' },
    { icon: HiOutlineLogout, title: 'Sign Out', description: 'Logout from Dayflow', to: '#', color: 'from-danger-500 to-danger-600', onClick: async () => { await logout(); navigate('/login'); } },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      <Card glass className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg flex-shrink-0">
            <img
              src={getEmployeeAvatar(user?.email, user?.profile?.profilePicUrl)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="inline-flex px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-2">
              {user?.role || 'Employee'} • ID: {user?.employeeId}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.profile?.firstName || 'there'}! 👋
            </h1>
            <p className="text-primary-100 text-sm mt-1">
              {user?.profile?.designation || 'Team Member'} {user?.profile?.department ? `• ${user.profile.department}` : ''}
            </p>
          </div>
        </div>
      </Card>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glass className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <HiOutlineClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Today&apos;s Status</p>
              <p className="text-base font-bold text-primary-700 mt-1">
                {data?.todayAttendance ? '✅ Checked In' : '⏳ Not Checked In'}
              </p>
            </div>
          </div>
        </Card>

        <Card glass className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <HiOutlineClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Present Days</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">
                {Array.isArray(data?.recentAttendance) ? data.recentAttendance.length : 18} Days
              </p>
            </div>
          </div>
        </Card>

        <Card glass className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-600 to-accent-800 flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <HiOutlineCalendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Leave Balance</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">14 Days</p>
            </div>
          </div>
        </Card>

        <Card glass className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <HiOutlineCalendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Pending Leaves</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{data?.pendingLeaves || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              hover
              onClick={action.onClick || (() => navigate(action.to))}
              className="group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-surface-900">{action.title}</h3>
              <p className="text-sm text-surface-500 mt-1">{action.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
