import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getEmployeeAvatar } from '../../utils/avatar';
import type { ApiResponse, LeaveRequest, User } from '../../types/api';

type LeaveWithUser = LeaveRequest & { user: User & { profile?: { firstName: string; lastName: string } } };

const statusStyles: Record<string, string> = {
  PENDING: 'bg-warning-50 text-warning-600',
  APPROVED: 'bg-success-50 text-success-600',
  REJECTED: 'bg-danger-50 text-danger-600',
};

export const LeaveApprovals: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedLeave, setSelectedLeave] = useState<LeaveWithUser | null>(null);
  const [remarks, setRemarks] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['all-leaves', statusFilter],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ items: LeaveWithUser[] }>>('/leave', { params: { status: statusFilter, limit: 50 } });
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/leave/${id}/approve`, { remarks }),
    onSuccess: () => { toast.success('Leave approved'); queryClient.invalidateQueries({ queryKey: ['all-leaves'] }); setSelectedLeave(null); setRemarks(''); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/leave/${id}/reject`, { remarks }),
    onSuccess: () => { toast.success('Leave rejected'); queryClient.invalidateQueries({ queryKey: ['all-leaves'] }); setSelectedLeave(null); setRemarks(''); },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Leave Approvals</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }]} />
        </div>

        {!data?.items?.length ? <EmptyState message={`No ${statusFilter.toLowerCase()} leave requests`} /> : (
          <div className="space-y-3">
            {data.items.map((l) => (
              <div key={l.id} className="p-4 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <img
                      src={getEmployeeAvatar(l.user?.email, l.user?.profile?.profilePicUrl)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/10 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-surface-900">{l.user?.profile?.firstName} {l.user?.profile?.lastName} <span className="text-surface-400 text-sm">({l.user?.employeeId})</span></p>
                      <p className="text-sm text-surface-600 mt-1">{l.leaveType} Leave — {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}</p>
                      {l.reason && <p className="text-sm text-surface-500 mt-1">Reason: {l.reason}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusStyles[l.status]}`}>{l.status}</span>
                    {l.status === 'PENDING' && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLeave(l)}>Review</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal isOpen={!!selectedLeave} onClose={() => setSelectedLeave(null)} title="Review Leave Request" size="md">
        {selectedLeave && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500">Employee:</span> <span className="font-medium">{selectedLeave.user?.profile?.firstName} {selectedLeave.user?.profile?.lastName}</span></div>
              <div><span className="text-surface-500">Type:</span> <span className="font-medium">{selectedLeave.leaveType}</span></div>
              <div><span className="text-surface-500">From:</span> <span className="font-medium">{new Date(selectedLeave.startDate).toLocaleDateString()}</span></div>
              <div><span className="text-surface-500">To:</span> <span className="font-medium">{new Date(selectedLeave.endDate).toLocaleDateString()}</span></div>
            </div>
            {selectedLeave.reason && <p className="text-sm"><span className="text-surface-500">Reason:</span> {selectedLeave.reason}</p>}
            <textarea className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm" rows={2} placeholder="Comments (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            <div className="flex gap-3">
              <Button onClick={() => approveMutation.mutate(selectedLeave.id)} loading={approveMutation.isPending}>Approve</Button>
              <Button variant="danger" onClick={() => rejectMutation.mutate(selectedLeave.id)} loading={rejectMutation.isPending}>Reject</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
