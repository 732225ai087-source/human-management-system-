import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineUsers, HiOutlineClock, HiOutlineCalendar, HiOutlineCurrencyDollar, HiSearch } from 'react-icons/hi';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiResponse, User } from '../../types/api';
import { getEmployeeAvatar } from '../../utils/avatar';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse>('/dashboard/admin');
      return res.data.data as { totalEmployees: number; presentToday: number; pendingLeaves: number; totalPayroll: number };
    },
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', search],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse>('/dashboard/employees', { params: { search, limit: 10 } });
      return res.data.data as { items: (User & { profile?: { firstName: string; lastName: string; department?: string; designation?: string; profilePicUrl?: string } })[]; total: number };
    },
  });

  if (statsLoading) return <PageLoader />;
  if (statsError) return <ErrorMessage message="Failed to load dashboard" onRetry={refetchStats} />;

  const statCards = [
    { icon: HiOutlineUsers, label: 'Total Employees', value: stats?.totalEmployees || 0, color: 'from-primary-500 to-primary-600' },
    { icon: HiOutlineClock, label: 'Present Today', value: stats?.presentToday || 0, color: 'from-success-500 to-success-600' },
    { icon: HiOutlineCalendar, label: 'Pending Leaves', value: stats?.pendingLeaves || 0, color: 'from-warning-500 to-warning-600' },
    { icon: HiOutlineCurrencyDollar, label: 'Monthly Payroll', value: `₹${(stats?.totalPayroll || 0).toLocaleString()}`, color: 'from-accent-500 to-accent-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-serif">Admin Dashboard</h1>
        <p className="text-surface-500 mt-1">Overview of your organization</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} glass className="relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0 text-white shadow-md`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-surface-500">{stat.label}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" size="lg" className="justify-start" onClick={() => navigate('/admin/attendance')}>
          <HiOutlineClock className="w-5 h-5 text-primary-600" /> View Attendance Records
        </Button>
        <Button variant="outline" size="lg" className="justify-start" onClick={() => navigate('/admin/leave')}>
          <HiOutlineCalendar className="w-5 h-5 text-primary-600" /> Manage Leave Requests
        </Button>
        <Button variant="outline" size="lg" className="justify-start" onClick={() => navigate('/admin/payroll')}>
          <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" /> Payroll Management
        </Button>
      </div>

      {/* Employee List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-900 font-serif">Employees</h2>
          <div className="w-64">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<HiSearch className="w-4 h-4 text-surface-400" />}
            />
          </div>
        </div>

        {employeesLoading ? (
          <PageLoader />
        ) : !employees?.items?.length ? (
          <EmptyState message="No employees found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.items.map((emp) => (
                  <tr key={emp.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-500/10">
                          <img
                            src={getEmployeeAvatar(emp.email, emp.profile?.profilePicUrl)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900 font-serif">
                            {emp.profile?.firstName} {emp.profile?.lastName}
                          </p>
                          <p className="text-xs text-surface-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-surface-600">{emp.employeeId}</td>
                    <td className="py-3 px-4 text-sm text-surface-600">{emp.profile?.department || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                        emp.role === 'ADMIN' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/profile/${emp.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
