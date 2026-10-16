import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/ToastContext';
import { Breadcrumb } from '../ui/Breadcrumb';
import { Avatar } from '../ui/Avatar';

export const SettingsView = ({
  user = {
    id: 55,
    name: 'Nikhil Kumar',
    email: 'nikhilkumars12343@gmail.com',
    role: 'super_admin',
    status: 'active',
    created_at: '2026-10-16T06:01:51.000000Z',
    updated_at: '2026-10-16T06:01:51.000000Z',
  },
  onLogoutAll,
}) => {
  const { addToast } = useToast();

  // Settings Navigation: 'profile' | 'security'
  const [activeSection, setActiveSection] = useState('profile');

  // Profile Form State (strictly logged in data, no user image)
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Nikhil Kumar',
    email: user?.email || 'nikhilkumars12343@gmail.com',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || 'Nikhil Kumar',
        email: user.email || 'nikhilkumars12343@gmail.com',
      });
    }
  }, [user]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Logout Confirm Modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      addToast({
        title: 'Profile Updated',
        message: 'Your profile information has been saved successfully.',
        type: 'success',
      });
    }, 400);
  };

  // Change Password Handler
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!securityData.currentPassword) {
      setPasswordError('Please enter your current password.');
      addToast({ title: 'Validation Error', message: 'Please enter your current password.', type: 'error' });
      return;
    }
    if (!securityData.newPassword) {
      setPasswordError('Please enter a new password.');
      addToast({ title: 'Validation Error', message: 'Please enter a new password.', type: 'error' });
      return;
    }
    if (securityData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      addToast({ title: 'Validation Error', message: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      addToast({ title: 'Validation Error', message: 'New passwords do not match.', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast({
        title: 'Password Changed',
        message: 'Your admin account password was updated successfully.',
        type: 'success',
      });
    }, 400);
  };

  const formatRole = (role) => {
    if (!role || role === 'super_admin') return 'Super Admin';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      {/* HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Dashboard' }, { label: 'Settings' }]} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account preferences and security credentials.
        </p>
      </div>

      {/* SETTINGS NAVIGATION TABS */}
      <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeSection === 'profile'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User size={15} />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeSection === 'security'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield size={15} />
          Security
        </button>
      </div>

      {/* SECTION 1: PROFILE */}
      {activeSection === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 m-0">
            Profile Details
          </h2>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            {/* User Identity Avatar (Initials Only, No User Image) */}
            <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
              <Avatar
                name={profileData.name || 'Nikhil Kumar'}
                size="xl"
                status={user?.status || 'active'}
                showStatus={true}
              />

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">
                    {profileData.name || 'Nikhil Kumar'}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                    {formatRole(user?.role)}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {profileData.email || 'nikhilkumars12343@gmail.com'}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span>Admin ID: #{user?.id || 55}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 size={13} /> Active Account
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Name */}
            <FormField label="Admin Name" required>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter admin name"
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
              />
            </FormField>

            {/* Email Address */}
            <FormField label="Email Address" required>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="admin@example.com"
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
              />
            </FormField>

            {/* Save Button */}
            <div className="flex justify-start pt-2">
              <Button type="submit" variant="primary" isLoading={isSavingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: SECURITY */}
      {activeSection === 'security' && (
        <div className="flex flex-col gap-6">
          {/* Change Password Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 m-0">
              Change Password
            </h2>

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              {/* Current Password */}
              <FormField label="Current Password" required>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 pr-10 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* New Password */}
              <FormField label="New Password" required helperText="Must be at least 8 characters long">
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2 pr-10 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* Confirm New Password */}
              <FormField label="Confirm New Password" required>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 pr-10 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* Button */}
              <div className="flex justify-start pt-2">
                <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                  Change Password
                </Button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE */}
          <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-bold text-rose-600 m-0 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Danger Zone
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-0">
                  Logout from all active browser sessions and revoke access tokens.
                </p>
              </div>

              <Button
                variant="danger"
                icon={LogOut}
                onClick={() => setIsLogoutModalOpen(true)}
              >
                Logout from all sessions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM LOGOUT ALL SESSIONS DIALOG */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          if (onLogoutAll) {
            onLogoutAll();
          } else {
            addToast({
              title: 'Sessions Terminated',
              message: 'You have been logged out from all active sessions.',
              type: 'info',
            });
          }
        }}
        title="Logout from all sessions?"
        message="Are you sure you want to invalidate all active browser tokens and log out across all devices?"
        confirmLabel="Confirm Logout All"
        cancelLabel="Cancel"
        type="danger"
      />
    </div>
  );
};

export default SettingsView;
