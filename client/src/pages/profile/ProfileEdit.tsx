import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { ApiResponse, Profile } from '../../types/api';

export const ProfileEdit: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      const url = userId ? `/profile/${userId}` : '/profile/me';
      const res = await apiClient.get<ApiResponse<Profile>>(url);
      return res.data.data;
    },
  });

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', address: '',
    dateOfBirth: '', department: '', designation: '', dateOfJoining: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        department: profile.department || '',
        designation: profile.designation || '',
        dateOfJoining: profile.dateOfJoining ? profile.dateOfJoining.split('T')[0] : '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const url = userId ? `/profile/${userId}` : '/profile/me';
      return apiClient.put(url, data);
    },
    onSuccess: () => {
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate(userId ? `/profile/${userId}` : '/profile');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const pictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const url = userId ? `/profile/${userId}/picture` : '/profile/me/picture';
      return apiClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast.success('Profile picture updated');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const documentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      const url = userId ? `/profile/${userId}/documents` : '/profile/me/documents';
      return apiClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast.success('Document uploaded');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  if (isLoading) return <PageLoader />;

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Edit Profile</h1>
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
      </div>

      {/* Profile Picture */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center overflow-hidden">
            {profile?.profilePicUrl ? (
              <img src={profile.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary-600">{profile?.firstName?.[0]}</span>
            )}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pictureMutation.mutate(e.target.files[0])} />
            <span className="inline-flex px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors">
              Change Photo
            </span>
          </label>
        </div>
      </Card>

      {/* Personal Info */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          {isAdmin && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={handleChange('firstName')} />
              <Input label="Last Name" value={form.lastName} onChange={handleChange('lastName')} />
            </div>
          )}
          <Input label="Phone" value={form.phone} onChange={handleChange('phone')} />
          <Input label="Address" value={form.address} onChange={handleChange('address')} />
          {isAdmin && (
            <>
              <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} />
              <Input label="Department" value={form.department} onChange={handleChange('department')} />
              <Input label="Designation" value={form.designation} onChange={handleChange('designation')} />
              <Input label="Date of Joining" type="date" value={form.dateOfJoining} onChange={handleChange('dateOfJoining')} />
            </>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>

      {/* Document Upload */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
        <label className="cursor-pointer block border-2 border-dashed border-surface-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => e.target.files?.[0] && documentMutation.mutate(e.target.files[0])} />
          <p className="text-surface-500">Click to upload a document (PDF, JPG, PNG)</p>
          <p className="text-xs text-surface-400 mt-1">Max 5MB</p>
        </label>
      </Card>
    </div>
  );
};
