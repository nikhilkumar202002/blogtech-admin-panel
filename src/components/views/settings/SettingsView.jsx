import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Shield,
  Users,
  Key,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FormField } from '../../ui/FormField';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { useToast } from '../../ui/ToastContext';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { Avatar } from '../../ui/Avatar';
import {
  updateProfile,
  changePassword,
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getRoles,
  getPermissions,
} from '../../../utils/user.service';

export const SettingsView = ({
  user = null,
  onUserUpdated,
  onLogoutAll,
}) => {
  const { addToast } = useToast();
  const isSuperAdmin = user?.role === 'super_admin';

  // Navigation Tabs: 'profile' | 'security' | 'users' | 'roles'
  const [activeSection, setActiveSection] = useState('profile');

  // Enforce access control on section state
  useEffect(() => {
    if (!isSuperAdmin && (activeSection === 'users' || activeSection === 'roles')) {
      setActiveSection('profile');
    }
  }, [isSuperAdmin, activeSection]);

  // ==========================================
  // 1. PROFILE SECTION
  // ==========================================
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.email.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Name and email are required.',
        type: 'error',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateProfile({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      });

      const updated = res?.data || res?.user || { ...user, ...profileData };
      if (onUserUpdated) {
        onUserUpdated(updated);
      }

      addToast({
        title: 'Profile Updated',
        message: res?.message || 'Your profile has been saved successfully.',
        type: 'success',
      });
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        'Could not update profile details.';
      addToast({
        title: 'Profile Update Failed',
        message: errMsg,
        type: 'error',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ==========================================
  // 2. SECURITY SECTION
  // ==========================================
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!securityData.currentPassword) {
      setPasswordError('Please enter your current password.');
      addToast({ title: 'Validation Error', message: 'Current password is required.', type: 'error' });
      return;
    }
    if (!securityData.newPassword) {
      setPasswordError('Please enter a new password.');
      addToast({ title: 'Validation Error', message: 'New password is required.', type: 'error' });
      return;
    }
    if (securityData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      addToast({ title: 'Validation Error', message: 'Password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      addToast({ title: 'Validation Error', message: 'New passwords do not match.', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword({
        current_password: securityData.currentPassword,
        password: securityData.newPassword,
        password_confirmation: securityData.confirmPassword,
      });

      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast({
        title: 'Password Changed',
        message: res?.message || 'Your account password was updated successfully.',
        type: 'success',
      });
    } catch (err) {
      const errErrors = err?.response?.data?.errors;
      const specificMsg =
        errErrors?.current_password?.[0] ||
        errErrors?.password?.[0] ||
        err?.response?.data?.message ||
        'Failed to change password.';
      setPasswordError(specificMsg);
      addToast({
        title: 'Password Update Failed',
        message: specificMsg,
        type: 'error',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ==========================================
  // 3. ADMIN USERS SECTION (Super Admin Only)
  // ==========================================
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [addUserData, setAddUserData] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    password_confirmation: '',
    status: 'active',
  });
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: 'admin',
    status: 'active',
  });

  // Delete User Confirmation State
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await getUsers();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setUsersList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load admin users:', err?.message || err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'users' && isSuperAdmin) {
      fetchUsers();
    }
  }, [activeSection, isSuperAdmin]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchesSearch =
        !userSearch ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const matchesRole =
        userRoleFilter === 'all' ||
        (u.role && u.role.toLowerCase() === userRoleFilter.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, userRoleFilter]);

  // Create User Handler: POST /admin/users
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!addUserData.name.trim() || !addUserData.email.trim() || !addUserData.password) {
      addToast({
        title: 'Validation Error',
        message: 'Name, email, and password are required.',
        type: 'error',
      });
      return;
    }
    if (addUserData.password.length < 8) {
      addToast({
        title: 'Validation Error',
        message: 'Password must be at least 8 characters.',
        type: 'error',
      });
      return;
    }
    if (addUserData.password !== addUserData.password_confirmation) {
      addToast({
        title: 'Validation Error',
        message: 'Passwords do not match.',
        type: 'error',
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      await createUser({
        name: addUserData.name.trim(),
        email: addUserData.email.trim(),
        role: addUserData.role,
        password: addUserData.password,
        password_confirmation: addUserData.password_confirmation,
        status: addUserData.status,
      });

      addToast({
        title: 'Administrator Created',
        message: `Account for ${addUserData.name} created successfully.`,
        type: 'success',
      });
      setIsAddUserModalOpen(false);
      setAddUserData({
        name: '',
        email: '',
        role: 'admin',
        password: '',
        password_confirmation: '',
        status: 'active',
      });
      fetchUsers();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        'Failed to create administrator account.';
      addToast({
        title: 'Creation Failed',
        message: errMsg,
        type: 'error',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setEditUserData({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'admin',
      status: u.status || 'active',
    });
  };

  // Update User Handler: PUT /admin/users/:id
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdatingUser(true);
    try {
      await updateUser(editingUser.id, {
        name: editUserData.name.trim(),
        email: editUserData.email.trim(),
        role: editUserData.role,
        status: editUserData.status,
      });

      addToast({
        title: 'Administrator Updated',
        message: `User ${editUserData.name} updated successfully.`,
        type: 'success',
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        'Failed to update administrator.';
      addToast({
        title: 'Update Failed',
        message: errMsg,
        type: 'error',
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Toggle User Status: PATCH /admin/users/:id/status
  const handleToggleStatus = async (u) => {
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(u.id, nextStatus);
      addToast({
        title: 'Status Updated',
        message: `${u.name} is now ${nextStatus}.`,
        type: 'info',
      });
      setUsersList((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: nextStatus } : item))
      );
    } catch (err) {
      addToast({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || 'Could not update user status.',
        type: 'error',
      });
    }
  };

  // Delete User Handler: DELETE /admin/users/:id
  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeletingUser(true);
    try {
      await deleteUser(deletingUser.id);
      addToast({
        title: 'Administrator Deleted',
        message: `Account for ${deletingUser.name} has been permanently deleted.`,
        type: 'success',
      });
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete administrator.',
        type: 'error',
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  // ==========================================
  // 4. ROLES & PERMISSIONS SECTION (Super Admin)
  // ==========================================
  const [rolesList, setRolesList] = useState([]);
  const [permissionsData, setPermissionsData] = useState(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const fetchRolesAndPermissions = async () => {
    setIsLoadingRoles(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);
      setRolesList(rolesRes?.data || []);
      setPermissionsData(permsRes?.data || null);
    } catch (err) {
      console.warn('Could not load roles/permissions:', err?.message || err);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'roles' && isSuperAdmin) {
      fetchRolesAndPermissions();
    }
  }, [activeSection, isSuperAdmin]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    if (!permissionsData?.permissions) return {};
    const groups = {};
    permissionsData.permissions.forEach((perm) => {
      const mod = perm.module || 'General';
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(perm);
    });
    return groups;
  }, [permissionsData]);

  // Role Badge Styling Helper
  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'admin':
        return { label: 'Admin', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'editor':
        return { label: 'Editor', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: roleName || 'Role', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const formatRole = (role) => {
    if (!role || role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    if (role === 'editor') return 'Editor';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div
      className={`flex flex-col gap-6 animate-fade-in w-full ${
        activeSection === 'users' || activeSection === 'roles' ? 'max-w-6xl' : 'max-w-3xl'
      }`}
    >
      {/* HEADER & BREADCRUMB */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard' },
            { label: 'Settings' },
            {
              label:
                activeSection === 'profile'
                  ? 'Profile'
                  : activeSection === 'security'
                  ? 'Security'
                  : activeSection === 'users'
                  ? 'Admin Users'
                  : 'Roles & Permissions',
            },
          ]}
        />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
          Settings & Access Control
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials, security preferences, administrators, and role permissions.
        </p>
      </div>

      {/* SETTINGS NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-xs flex-wrap">
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeSection === 'security'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield size={15} />
          Security
        </button>

        {isSuperAdmin && (
          <>
            <button
              type="button"
              onClick={() => setActiveSection('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeSection === 'users'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users size={15} />
              Admin Users
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('roles')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeSection === 'roles'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Key size={15} />
              Roles & Permissions
            </button>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: PROFILE DETAILS (PUT /admin/profile) */}
      {/* ======================================================== */}
      {activeSection === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shadow-xs max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 m-0">
            Profile Details
          </h2>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            {/* Identity Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 pb-5 border-b border-slate-100">
              <Avatar
                name={profileData.name || user?.name || 'Admin'}
                size="xl"
                status={user?.status || 'active'}
                showStatus={true}
              />

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-slate-900">
                    {profileData.name || user?.name || 'Admin'}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                    {formatRole(user?.role)}
                  </span>
                </div>
                {profileData.email && (
                  <div className="text-xs text-slate-500">
                    {profileData.email}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  {user?.id && <span>Admin ID: #{user.id}</span>}
                  {user?.id && <span>•</span>}
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

      {/* ======================================================== */}
      {/* SECTION 2: SECURITY (PUT /admin/change-password) */}
      {/* ======================================================== */}
      {activeSection === 'security' && (
        <div className="flex flex-col gap-6 max-w-2xl">
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

              {/* Submit Button */}
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

      {/* ======================================================== */}
      {/* SECTION 3: ADMIN USERS (GET/POST/PUT/PATCH/DELETE /admin/users) */}
      {/* ======================================================== */}
      {activeSection === 'users' && isSuperAdmin && (
        <div className="flex flex-col gap-5">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search administrators by name or email..."
                  className="w-full pl-9 pr-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={fetchUsers}
                isLoading={isLoadingUsers}
              >
                Refresh
              </Button>

              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddUserModalOpen(true)}
              >
                Add Administrator
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <RefreshCw size={20} className="animate-spin inline-block mr-2" />
                        Loading administrators...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No administrator accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const badge = getRoleBadge(u.role);
                      const isCurrent = u.id === user?.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} size="sm" status={u.status} />
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <span>{u.name}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              disabled={isCurrent && u.role === 'super_admin'}
                              title={
                                isCurrent && u.role === 'super_admin'
                                  ? 'Cannot deactivate your own super admin account'
                                  : 'Click to toggle active/inactive status'
                              }
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                u.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              <span className="capitalize">{u.status || 'Active'}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Administrator"
                              >
                                <Edit2 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingUser(u)}
                                disabled={isCurrent}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={isCurrent ? 'Cannot delete your own account' : 'Delete Administrator'}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL: ADD ADMINISTRATOR (POST /admin/users) */}
          <Modal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            title="Create Administrator Account"
            subtitle="Grant administrative access to a new team member."
            maxWidth="500px"
          >
            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  value={addUserData.name}
                  onChange={(e) => setAddUserData({ ...addUserData, name: e.target.value })}
                  placeholder="e.g. Anjali Kumar"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </FormField>

              <FormField label="Email Address" required>
                <input
                  type="email"
                  value={addUserData.email}
                  onChange={(e) => setAddUserData({ ...addUserData, email: e.target.value })}
                  placeholder="e.g. anjali.kumar@example.com"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Assigned Role" required>
                  <select
                    value={addUserData.role}
                    onChange={(e) => setAddUserData({ ...addUserData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-600"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </FormField>

                <FormField label="Account Status" required>
                  <select
                    value={addUserData.status}
                    onChange={(e) => setAddUserData({ ...addUserData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-600"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Initial Password" required helperText="Minimum 8 characters">
                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    value={addUserData.password}
                    onChange={(e) => setAddUserData({ ...addUserData, password: e.target.value })}
                    placeholder="Enter secure password"
                    className="w-full px-3.5 py-2 pr-10 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password" required>
                <input
                  type={showAddPassword ? 'text' : 'password'}
                  value={addUserData.password_confirmation}
                  onChange={(e) =>
                    setAddUserData({ ...addUserData, password_confirmation: e.target.value })
                  }
                  placeholder="Repeat password"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </FormField>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="secondary"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={isCreatingUser}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isCreatingUser}>
                  Create Administrator
                </Button>
              </div>
            </form>
          </Modal>

          {/* MODAL: EDIT ADMINISTRATOR (PUT /admin/users/:id) */}
          <Modal
            isOpen={Boolean(editingUser)}
            onClose={() => setEditingUser(null)}
            title="Edit Administrator"
            subtitle={`Update account profile and role assignments for ${editingUser?.name || 'user'}.`}
            maxWidth="500px"
          >
            <form onSubmit={handleUpdateUser} className="p-6 flex flex-col gap-4">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </FormField>

              <FormField label="Email Address" required>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  placeholder="Email address"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Role Assignment" required>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-600"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </FormField>

                <FormField label="Account Status" required>
                  <select
                    value={editUserData.status}
                    onChange={(e) => setEditUserData({ ...editUserData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-600"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={isUpdatingUser}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isUpdatingUser}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>

          {/* CONFIRM DELETE ADMINISTRATOR DIALOG */}
          <ConfirmDialog
            isOpen={Boolean(deletingUser)}
            onClose={() => setDeletingUser(null)}
            onConfirm={handleConfirmDeleteUser}
            title="Delete Administrator Account?"
            message={`Are you sure you want to delete "${deletingUser?.name}" (${deletingUser?.email})? This action cannot be undone.`}
            confirmLabel="Delete Administrator"
            cancelLabel="Cancel"
            type="danger"
            isLoading={isDeletingUser}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: ROLES & PERMISSIONS (GET /admin/roles, /admin/permissions) */}
      {/* ======================================================== */}
      {activeSection === 'roles' && isSuperAdmin && (
        <div className="flex flex-col gap-6">
          {/* Header Refresh */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 m-0">
              System Roles & Capabilities
            </h2>
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={fetchRolesAndPermissions}
              isLoading={isLoadingRoles}
            >
              Refresh Roles
            </Button>
          </div>

          {/* Role Definition Cards (GET /admin/roles) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rolesList.map((r) => {
              const badge = getRoleBadge(r.name);
              return (
                <div
                  key={r.name}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${badge.bg}`}
                    >
                      {r.label || badge.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{r.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed m-0">
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Permissions Matrix Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                  <ShieldCheck size={17} className="text-indigo-600" />
                  Role-Based Access Control (RBAC) Matrix
                </h3>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Permissions enforced across API routes and administrative operations.
                </span>
              </div>
            </div>

            {/* Modules Accordion / Groups */}
            {isLoadingRoles ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw size={20} className="animate-spin inline-block mr-2" />
                Loading permission hierarchy...
              </div>
            ) : Object.keys(groupedPermissions).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No permissions loaded.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {Object.entries(groupedPermissions).map(([modName, perms]) => (
                  <div
                    key={modName}
                    className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50/40"
                  >
                    <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {modName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {perms.length} permission{perms.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white">
                      {perms.map((p) => (
                        <div
                          key={p.key}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-mono font-semibold text-slate-800">
                              {p.key}
                            </span>
                            <span className="text-xs text-slate-500">
                              {p.description}
                            </span>
                          </div>

                          {/* Role Badges with Access */}
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                            {['super_admin', 'admin', 'editor'].map((roleKey) => {
                              const hasAccess = p.roles?.includes(roleKey);
                              const roleBadge = getRoleBadge(roleKey);

                              return (
                                <span
                                  key={roleKey}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                                    hasAccess
                                      ? roleBadge.bg
                                      : 'bg-slate-50 text-slate-300 border-slate-100 line-through'
                                  }`}
                                  title={`${roleBadge.label}: ${hasAccess ? 'Allowed' : 'Denied'}`}
                                >
                                  {hasAccess ? (
                                    <Check size={11} className="stroke-[3]" />
                                  ) : (
                                    <Lock size={9} />
                                  )}
                                  {roleBadge.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
