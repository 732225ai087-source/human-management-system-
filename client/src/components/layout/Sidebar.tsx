import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUsers,
} from 'react-icons/hi';

const employeeLinks = [
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
  { to: '/attendance', icon: HiOutlineClock, label: 'Attendance' },
  { to: '/leave', icon: HiOutlineCalendar, label: 'Leave' },
  { to: '/payroll', icon: HiOutlineCurrencyDollar, label: 'Payroll' },
];

const adminLinks = [
  { to: '/dashboard/admin', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/admin/employees', icon: HiOutlineUsers, label: 'Employees' },
  { to: '/admin/attendance', icon: HiOutlineClock, label: 'Attendance' },
  { to: '/admin/leave', icon: HiOutlineCalendar, label: 'Leave Approvals' },
  { to: '/admin/payroll', icon: HiOutlineCurrencyDollar, label: 'Payroll' },
  { to: '/admin/reports', icon: HiOutlineChartBar, label: 'Reports' },
  { to: '/admin/notifications', icon: HiOutlineBell, label: 'Notifications' },
];

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = isAdmin ? adminLinks : employeeLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-surface-100">
        <h1 className="text-2xl font-bold gradient-text">Dayflow</h1>
        <p className="text-xs text-surface-500 mt-1">HR Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/dashboard/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              }`
            }
            onClick={() => setIsMobileOpen(false)}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-surface-100">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700">
              {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">
              {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
            </p>
            <p className="text-xs text-surface-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-md border border-surface-100"
      >
        {isMobileOpen ? (
          <HiOutlineX className="w-5 h-5 text-surface-600" />
        ) : (
          <HiOutlineMenu className="w-5 h-5 text-surface-600" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-surface-100
          transform transition-transform duration-200 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
