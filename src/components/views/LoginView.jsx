import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

export const LoginView = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('sarah.jenkins@apexcorp.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Interaction states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'forgot'

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Validation & Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address (e.g., name@company.com).');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Simulate Authentication API Call
    setIsLoading(true);

    setTimeout(() => {
      // Simulate credential verification
      if (email.toLowerCase() === 'error@test.com') {
        setIsLoading(false);
        setErrorMessage('Invalid credentials. Please verify your email and password.');
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);

      // Transition to admin dashboard after short success feedback
      setTimeout(() => {
        onLoginSuccess && onLoginSuccess({ email, rememberMe });
      }, 600);
    }, 1000);
  };

  // Forgot Password Submit Handler
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(16, 24, 40, 0.08), 0 4px 6px -4px rgba(16, 24, 40, 0.03)',
          padding: '40px 32px',
        }}
        className="animate-pop-in"
      >
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)',
            }}
          >
            <Layers size={20} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Apex<span style={{ color: '#4f46e5' }}>CMS</span>
          </div>
        </div>

        {/* View Switcher: Login or Forgot Password */}
        {viewMode === 'login' ? (
          <div>
            {/* Title & Subtitle */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Welcome back
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                Sign in to access the admin panel.
              </p>
            </div>

            {/* Inline Error Alert */}
            {errorMessage && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '20px',
                }}
                className="animate-fade-in"
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ lineHeight: 1.4 }}>{errorMessage}</span>
              </div>
            )}

            {/* Successful Login Alert */}
            {isSuccess && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#047857',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                }}
                className="animate-fade-in"
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>Authentication successful! Redirecting...</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Email Address */}
              <FormField label="Email Address" required>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your email"
                    disabled={isLoading || isSuccess}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      paddingRight: '12px',
                      height: '42px',
                      fontSize: '14px',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      border: errorMessage ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      if (!errorMessage) {
                        e.target.style.borderColor = '#4f46e5';
                        e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.12)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errorMessage) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = '0 1px 2px 0 rgba(16, 24, 40, 0.04)';
                      }
                    }}
                  />
                </div>
              </FormField>

              {/* Password */}
              <FormField label="Password" required>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your password"
                    disabled={isLoading || isSuccess}
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      paddingRight: '40px',
                      height: '42px',
                      fontSize: '14px',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      border: errorMessage ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      if (!errorMessage) {
                        e.target.style.borderColor = '#4f46e5';
                        e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.12)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errorMessage) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = '0 1px 2px 0 rgba(16, 24, 40, 0.04)';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSuccess}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* Remember Me Checkbox */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#475569',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading || isSuccess}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#4f46e5',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Primary Login Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                isDisabled={isSuccess}
                icon={!isLoading && !isSuccess ? ArrowRight : null}
                iconPosition="right"
              >
                {isSuccess ? 'Signed In' : 'Login'}
              </Button>

              {/* Below link: Forgot password */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot');
                    setErrorMessage('');
                    setResetEmail(email);
                  }}
                  disabled={isLoading || isSuccess}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Forgot Password View */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Reset password
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                Enter your work email address to receive password reset instructions.
              </p>
            </div>

            {resetSent ? (
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
                className="animate-pop-in"
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#047857', margin: 0 }}>
                  Reset Instructions Sent
                </h3>
                <p style={{ fontSize: '12.5px', color: '#065f46', margin: 0, lineHeight: 1.5 }}>
                  We sent a secure password reset link to <strong>{resetEmail}</strong>.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setViewMode('login');
                    setResetSent(false);
                  }}
                  style={{ marginTop: '8px' }}
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                {errorMessage && (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fca5a5',
                      color: '#b91c1c',
                      fontSize: '12.5px',
                      marginBottom: '16px',
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <FormField label="Email Address" required>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      style={{
                        width: '100%',
                        paddingLeft: '38px',
                        height: '42px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        outline: 'none',
                      }}
                    />
                  </div>
                </FormField>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                  <Button type="submit" variant="primary" size="lg" isLoading={isLoading} fullWidth>
                    Send Reset Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setViewMode('login');
                      setErrorMessage('');
                    }}
                    fullWidth
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
