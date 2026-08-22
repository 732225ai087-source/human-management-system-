import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiOutlinePencil, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeAvatar } from '../../utils/avatar';
import type { ApiResponse, Profile } from '../../types/api';

export const ProfileView: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const profileUserId = userId || user?.id;

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', profileUserId],
    queryFn: async () => {
      const url = userId ? `/profile/${userId}` : '/profile/me';
      const res = await apiClient.get<ApiResponse<Profile & { user: { employeeId: string; email: string; role: string } }>>(url);
      return res.data.data;
    },
    enabled: !!profileUserId,
  });

  if (isLoading) return <PageLoader />;
  if (error || !profile) return <ErrorMessage message="Failed to load profile" onRetry={refetch} />;

  const isOwnProfile = !userId || userId === user?.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary-500 to-accent-500" />
        <div className="relative pt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
            <img
              src={getEmployeeAvatar(profile.user?.email, profile.profilePicUrl)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">{profile.firstName} {profile.lastName}</h1>
            <p className="text-surface-500">{profile.designation || 'Employee'} • {profile.department || 'Unassigned'}</p>
          </div>
          {(isOwnProfile || isAdmin) && (
            <Button
              variant="outline"
              icon={<HiOutlinePencil className="w-4 h-4" />}
              onClick={() => navigate(isOwnProfile ? '/profile/edit' : `/profile/${userId}/edit`)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <InfoItem icon={<HiOutlineMail />} label="Email" value={profile.user?.email || '—'} />
            <InfoItem icon={<HiOutlinePhone />} label="Phone" value={profile.phone || '—'} />
            <InfoItem icon={<HiOutlineLocationMarker />} label="Address" value={profile.address || '—'} />
            <InfoItem label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Job Details</h2>
          <div className="space-y-4">
            <InfoItem label="Employee ID" value={profile.user?.employeeId || '—'} />
            <InfoItem label="Department" value={profile.department || '—'} />
            <InfoItem label="Designation" value={profile.designation || '—'} />
            <InfoItem label="Date of Joining" value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : '—'} />
            <InfoItem label="Role" value={profile.user?.role || '—'} />
          </div>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Documents</h2>
        {profile.documents?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                  {doc.fileType.split('/')[1]?.toUpperCase()?.slice(0, 3) || 'DOC'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{doc.name}</p>
                  <p className="text-xs text-surface-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700">
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-500">No documents uploaded</p>
        )}
      </Card>
    </div>
  );
};

const InfoItem: React.FC<{ icon?: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    {icon && <div className="mt-0.5 text-surface-400">{icon}</div>}
    <div>
      <p className="text-xs text-surface-500">{label}</p>
      <p className="text-sm font-medium text-surface-900">{value}</p>
    </div>
  </div>
);
