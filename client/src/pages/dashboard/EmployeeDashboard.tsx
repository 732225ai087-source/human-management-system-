import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineUser, HiOutlineClock, HiOutlineCalendar, HiOutlineLogout } from 'react-icons/hi';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
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
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.profile?.firstName || 'there'}! 👋
        </h1>
        <p className="text-surface-500 mt-1">Here&apos;s what&apos;s happening today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glass className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full -translate-y-8 translate-x-8" />
          <p className="text-sm text-surface-500">Today&apos;s Status</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">
            {data?.todayAttendance ? '✅ Checked In' : '⏳ Not Checked In'}
          </p>
        </Card>
        <Card glass className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warning-500/10 rounded-full -translate-y-8 translate-x-8" />
          <p className="text-sm text-surface-500">Pending Leaves</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{data?.pendingLeaves || 0}</p>
        </Card>
        <Card glass className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/10 rounded-full -translate-y-8 translate-x-8" />
          <p className="text-sm text-surface-500">Notifications</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{data?.unreadNotifications || 0}</p>
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
