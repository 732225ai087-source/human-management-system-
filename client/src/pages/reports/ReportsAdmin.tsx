import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import type { ApiResponse } from '../../types/api';

export const ReportsAdmin: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendanceReport, isLoading: attLoading } = useQuery({
    queryKey: ['attendance-report', startDate, endDate],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse>('/reports/attendance', { params: { startDate, endDate } });
      return res.data.data as { summary: { total: number; present: number; absent: number; halfDay: number; onLeave: number; attendanceRate: string } };
    },
  });

  const { data: leaveReport, isLoading: leaveLoading } = useQuery({
    queryKey: ['leave-report', startDate, endDate],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse>('/reports/leave', { params: { startDate, endDate } });
      return res.data.data as { summary: { total: number; approved: number; rejected: number; pending: number; byType: Record<string, number> } };
    },
  });

  const handleExportCSV = async () => {
    try {
      const res = await apiClient.get('/reports/attendance/export', { params: { startDate, endDate }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'attendance-report.csv';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const isLoading = attLoading || leaveLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Reports & Analytics</h1>
        <Button variant="outline" onClick={handleExportCSV}>📥 Export CSV</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {/* Attendance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Attendance Rate', value: `${attendanceReport?.summary?.attendanceRate || 0}%`, color: 'text-primary-600' },
              { label: 'Present', value: attendanceReport?.summary?.present || 0, color: 'text-success-600' },
              { label: 'Absent', value: attendanceReport?.summary?.absent || 0, color: 'text-danger-600' },
              { label: 'Half Day', value: attendanceReport?.summary?.halfDay || 0, color: 'text-warning-600' },
              { label: 'On Leave', value: attendanceReport?.summary?.onLeave || 0, color: 'text-primary-600' },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <p className="text-sm text-surface-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Leave Stats */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Leave Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-surface-500">Total Requests</p>
                <p className="text-2xl font-bold text-surface-900">{leaveReport?.summary?.total || 0}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Approved</p>
                <p className="text-2xl font-bold text-success-600">{leaveReport?.summary?.approved || 0}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Rejected</p>
                <p className="text-2xl font-bold text-danger-600">{leaveReport?.summary?.rejected || 0}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500">Pending</p>
                <p className="text-2xl font-bold text-warning-600">{leaveReport?.summary?.pending || 0}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {Object.entries(leaveReport?.summary?.byType || {}).map(([type, count]) => (
                <div key={type} className="p-3 rounded-xl bg-surface-50 text-center">
                  <p className="text-xs text-surface-500">{type}</p>
                  <p className="text-lg font-semibold">{count as number}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
