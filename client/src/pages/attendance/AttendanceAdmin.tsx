import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiResponse, Attendance, User } from '../../types/api';

const statusStyles: Record<string, string> = {
  PRESENT: 'bg-success-50 text-success-600',
  ABSENT: 'bg-danger-50 text-danger-600',
  HALF_DAY: 'bg-warning-50 text-warning-600',
  ON_LEAVE: 'bg-primary-50 text-primary-600',
};

type AttendanceWithUser = Attendance & { user: User & { profile?: { firstName: string; lastName: string } } };

export const AttendanceAdmin: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-attendance', startDate, endDate],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ items: AttendanceWithUser[]; total: number }>>('/attendance/all', { params: { startDate, endDate, limit: 100 } });
      return res.data.data;
    },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorMessage message="Failed to load attendance" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Attendance Records</h1>

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        {!data?.items?.length ? (
          <EmptyState message="No attendance records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Check In</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Check Out</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} className="border-b border-surface-50 hover:bg-surface-50">
                    <td className="py-3 px-4 text-sm font-medium">
                      {r.user?.profile?.firstName} {r.user?.profile?.lastName}
                      <span className="text-xs text-surface-400 ml-1">({r.user?.employeeId})</span>
                    </td>
                    <td className="py-3 px-4 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</td>
                    <td className="py-3 px-4 text-sm">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusStyles[r.status] || ''}`}>
                        {r.status.replace('_', ' ')}
                      </span>
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
