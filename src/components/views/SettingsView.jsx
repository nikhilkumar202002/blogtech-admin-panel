import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Camera,
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

export const SettingsView = ({
  user = {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@apexcorp.com',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  onLogoutAll,
}) => {
  const { addToast } = useToast();

  // Simple Settings Navigation: 'profile' | 'security'
  const [activeSection, setActiveSection] = useState('profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user.name || 'Sarah Jenkins',
    email: user.email || 'sarah.jenkins@apexcorp.com',
    phone: user.phone || '+1 (555) 019-2834',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  });
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

  // Profile Photo Change Demo
  const handlePhotoUpload = () => {
    addToast({
      title: 'Photo Upload',
      message: 'Select an image file to update your profile photo.',
      type: 'info',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px' }} className="animate-fade-in">
      {/* HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Dashboard' }, { label: 'Settings' }]} />
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
          Manage your account preferences and security credentials.
        </p>
      </div>

      {/* SIMPLE SETTINGS NAVIGATION */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: '#ffffff',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          width: 'fit-content',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSection === 'profile' ? '#4f46e5' : 'transparent',
            color: activeSection === 'profile' ? '#ffffff' : '#64748b',
            fontSize: '13px',
            fontWeight: activeSection === 'profile' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <User size={15} />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSection === 'security' ? '#4f46e5' : 'transparent',
            color: activeSection === 'security' ? '#ffffff' : '#64748b',
            fontSize: '13px',
            fontWeight: activeSection === 'security' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Shield size={15} />
          Security
        </button>
      </div>

      {/* SECTION 1: PROFILE */}
      {activeSection === 'profile' && (
        <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Profile Details
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Profile Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e2e8f0',
                  }}
                />
                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Change Profile Photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Profile Photo</div>
                <div style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 8px 0' }}>
                  JPG or PNG, max size 5MB
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handlePhotoUpload}>
                  Change Photo
                </Button>
              </div>
            </div>

            {/* Admin Name */}
            <FormField label="Admin Name" required>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter admin name"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                }}
              />
            </FormField>

            {/* Email */}
            <FormField label="Email Address" required>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="admin@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                }}
              />
            </FormField>

            {/* Phone */}
            <FormField label="Phone Number">
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                }}
              />
            </FormField>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '8px' }}>
              <Button type="submit" variant="primary" isLoading={isSavingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: SECURITY */}
      {activeSection === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Change Password Card */}
          <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Change Password
            </h2>

            {passwordError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '13px',
                }}
              >
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Current Password */}
              <FormField label="Current Password" required>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      paddingRight: '40px',
                      fontSize: '14px',
                      color: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* New Password */}
              <FormField label="New Password" required helperText="Must be at least 8 characters long">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      paddingRight: '40px',
                      fontSize: '14px',
                      color: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* Confirm New Password */}
              <FormField label="Confirm New Password" required>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      paddingRight: '40px',
                      fontSize: '14px',
                      color: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '8px' }}>
                <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                  Change Password
                </Button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} />
                  Danger Zone
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
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
