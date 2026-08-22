import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import type { ApiResponse, Attendance } from '../../types/api';

const statusStyles: Record<string, string> = {
  PRESENT: 'bg-success-50 text-success-600',
  ABSENT: 'bg-danger-50 text-danger-600',
  HALF_DAY: 'bg-warning-50 text-warning-600',
  ON_LEAVE: 'bg-primary-50 text-primary-600',
};

export const AttendanceView: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: today, isLoading: todayLoading } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Attendance>>('/attendance/today');
      return res.data.data;
    },
  });

  const { data: records, isLoading: recordsLoading, error, refetch } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await apiClient.get<ApiResponse<Attendance[]>>('/attendance/me', { params: { startDate: start, endDate: end } });
      return res.data.data || [];
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () => apiClient.post('/attendance/check-in'),
    onSuccess: () => { toast.success('Checked in!'); queryClient.invalidateQueries({ queryKey: ['attendance-today'] }); queryClient.invalidateQueries({ queryKey: ['my-attendance'] }); },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Check-in failed'),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => apiClient.post('/attendance/check-out'),
    onSuccess: () => { toast.success('Checked out!'); queryClient.invalidateQueries({ queryKey: ['attendance-today'] }); queryClient.invalidateQueries({ queryKey: ['my-attendance'] }); },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Check-out failed'),
  });

  if (todayLoading || recordsLoading) return <PageLoader />;
  if (error) return <ErrorMessage message="Failed to load attendance" onRetry={refetch} />;

  const hasCheckedIn = !!today?.checkIn;
  const hasCheckedOut = !!today?.checkOut;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>

      {/* Check-in/out Card */}
      <Card className="text-center">
        <p className="text-surface-500 mb-2">Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="flex items-center justify-center gap-4 mb-6">
          {hasCheckedIn && (
            <div className="text-center">
              <p className="text-xs text-surface-500">Check In</p>
              <p className="text-lg font-semibold text-success-600">{new Date(today!.checkIn!).toLocaleTimeString()}</p>
            </div>
          )}
          {hasCheckedOut && (
            <div className="text-center">
              <p className="text-xs text-surface-500">Check Out</p>
              <p className="text-lg font-semibold text-danger-600">{new Date(today!.checkOut!).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
        {!hasCheckedIn ? (
          <Button size="lg" onClick={() => checkInMutation.mutate()} loading={checkInMutation.isPending}>
            ☀️ Check In
          </Button>
        ) : !hasCheckedOut ? (
          <Button size="lg" variant="secondary" onClick={() => checkOutMutation.mutate()} loading={checkOutMutation.isPending}>
            🌙 Check Out
          </Button>
        ) : (
          <p className="text-success-600 font-medium">✅ You&apos;re done for the day!</p>
        )}
      </Card>

      {/* Records Table */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Recent Attendance</h2>
        {!records?.length ? (
          <EmptyState message="No attendance records yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Check In</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Check Out</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-surface-50">
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
