import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import type { ApiResponse, LeaveRequest } from '../../types/api';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-warning-50 text-warning-600',
  APPROVED: 'bg-success-50 text-success-600',
  REJECTED: 'bg-danger-50 text-danger-600',
};

export const LeaveApply: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ leaveType: 'PAID', startDate: '', endDate: '', reason: '' });

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<LeaveRequest[]>>('/leave/me');
      return res.data.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => apiClient.post('/leave', data),
    onSuccess: () => { toast.success('Leave request submitted'); queryClient.invalidateQueries({ queryKey: ['my-leaves'] }); setForm({ leaveType: 'PAID', startDate: '', endDate: '', reason: '' }); },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Failed to submit'),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Leave Management</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <Select label="Leave Type" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            options={[{ value: 'PAID', label: 'Paid Leave' }, { value: 'SICK', label: 'Sick Leave' }, { value: 'UNPAID', label: 'Unpaid Leave' }]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Reason</label>
            <textarea className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" rows={3}
              value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason for leave..." />
          </div>
          <Button type="submit" loading={mutation.isPending}>Submit Request</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Leave History</h2>
        {isLoading ? <PageLoader /> : !leaves?.length ? <EmptyState message="No leave requests" /> : (
          <div className="space-y-3">
            {leaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors cursor-pointer" onClick={() => navigate(`/leave/${l.id}`)}>
                <div>
                  <p className="font-medium text-surface-900">{l.leaveType} Leave</p>
                  <p className="text-sm text-surface-500">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusStyles[l.status]}`}>{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
