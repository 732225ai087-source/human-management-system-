import React from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeAvatar } from '../../utils/avatar';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-100">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}

        <div className="flex-1 lg:flex-none">
          <h2 className="text-lg font-semibold text-surface-900 hidden lg:block">
            Welcome back, {user?.profile?.firstName || 'User'} 👋
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button
            className="relative p-2 rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
            id="notification-bell"
          >
            <HiOutlineBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          {/* User avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-500/20">
            <img
              src={getEmployeeAvatar(user?.email, user?.profile?.profilePicUrl)}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
