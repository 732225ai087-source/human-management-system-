import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import type { ApiResponse, Payroll } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';

export const PayrollView: React.FC = () => {
  const { isAdmin } = useAuth();

  const { data: records, isLoading } = useQuery({
    queryKey: ['my-payroll'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Payroll[]>>('/payroll/me');
      return res.data.data || [];
    },
  });

  const handleDownload = async (payrollId: string) => {
    try {
      const res = await apiClient.get(`/payroll/slip/${payrollId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `salary-slip-${payrollId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Salary slip downloaded');
    } catch {
      toast.error('Failed to download');
    }
  };

  if (isLoading) return <PageLoader />;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Payroll</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-4">{isAdmin ? 'My Payroll' : 'Salary History'}</h2>
        {!records?.length ? <EmptyState message="No payroll records" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Period</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Basic</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">HRA</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Allowances</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Deductions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Net Salary</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((p) => (
                  <tr key={p.id} className="border-b border-surface-50">
                    <td className="py-3 px-4 text-sm font-medium">{months[p.month - 1]} {p.year}</td>
                    <td className="py-3 px-4 text-sm text-right">₹{p.basicSalary.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right">₹{p.hra.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right">₹{p.allowances.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right text-danger-600">₹{p.deductions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold">₹{p.netSalary.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(p.id)}>📄 Slip</Button>
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

export const PayrollAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showStructure, setShowStructure] = useState(false);
  const [structureUserId, setStructureUserId] = useState('');
  const [structure, setStructure] = useState({ basicSalary: '', hra: '', allowances: '', deductions: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payroll'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ items: (Payroll & { user: { employeeId: string; profile?: { firstName: string; lastName: string } } })[] }>>('/payroll/all', { params: { limit: 50 } });
      return res.data.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => apiClient.post('/payroll/generate', { month, year }),
    onSuccess: (res) => { toast.success((res.data as ApiResponse).message || 'Payroll generated'); queryClient.invalidateQueries({ queryKey: ['admin-payroll'] }); setShowGenerate(false); },
    onError: () => toast.error('Failed to generate payroll'),
  });

  const structureMutation = useMutation({
    mutationFn: () => apiClient.put(`/payroll/salary-structure/${structureUserId}`, {
      basicSalary: parseFloat(structure.basicSalary),
      hra: parseFloat(structure.hra),
      allowances: parseFloat(structure.allowances),
      deductions: parseFloat(structure.deductions),
    }),
    onSuccess: () => { toast.success('Salary structure updated'); setShowStructure(false); },
  });

  if (isLoading) return <PageLoader />;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Payroll Management</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowStructure(true)}>Set Salary Structure</Button>
          <Button onClick={() => setShowGenerate(true)}>Generate Payroll</Button>
        </div>
      </div>

      <Card>
        {!data?.items?.length ? <EmptyState message="No payroll records" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Period</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="border-b border-surface-50">
                    <td className="py-3 px-4 text-sm">{p.user?.profile?.firstName} {p.user?.profile?.lastName} <span className="text-surface-400">({p.user?.employeeId})</span></td>
                    <td className="py-3 px-4 text-sm">{months[p.month - 1]} {p.year}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold">₹{p.netSalary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Payroll">
        <div className="space-y-4">
          <Input label="Month" type="number" min={1} max={12} value={String(month)} onChange={(e) => setMonth(parseInt(e.target.value))} />
          <Input label="Year" type="number" value={String(year)} onChange={(e) => setYear(parseInt(e.target.value))} />
          <Button onClick={() => generateMutation.mutate()} loading={generateMutation.isPending}>Generate</Button>
        </div>
      </Modal>

      <Modal isOpen={showStructure} onClose={() => setShowStructure(false)} title="Set Salary Structure">
        <div className="space-y-4">
          <Input label="Employee User ID" value={structureUserId} onChange={(e) => setStructureUserId(e.target.value)} placeholder="Paste user ID" />
          <Input label="Basic Salary" type="number" value={structure.basicSalary} onChange={(e) => setStructure({ ...structure, basicSalary: e.target.value })} />
          <Input label="HRA" type="number" value={structure.hra} onChange={(e) => setStructure({ ...structure, hra: e.target.value })} />
          <Input label="Allowances" type="number" value={structure.allowances} onChange={(e) => setStructure({ ...structure, allowances: e.target.value })} />
          <Input label="Deductions" type="number" value={structure.deductions} onChange={(e) => setStructure({ ...structure, deductions: e.target.value })} />
          <Button onClick={() => structureMutation.mutate()} loading={structureMutation.isPending}>Save Structure</Button>
        </div>
      </Modal>
    </div>
  );
};
