import { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  KeyRound,
  X,
  Loader2,
} from 'lucide-react';
import { login } from '../../utils/auth.service';

/**
 * Modern SaaS Login Form Component
 *
 * Features:
 * - Enterprise-grade styling & accessibility (semantic form, autocomplete tags, enterkeyhint)
 * - Real-time validation & interaction-based feedback (avoids premature error prompts)
 * - Caps Lock active detector for password field
 * - Show / Hide password toggle with aria support
 * - Fast one-click demo credentials autofill for preview & review
 * - Single Sign-On (SSO) & Google Workspace identity options
 * - Dynamic loading spinners and success transition feedback
 */
export const LoginForm = ({
  onLoginSuccess,
  onForgotPassword,
  onSSOClick,
  isLoading: propIsLoading,
  errorMessage: propErrorMessage,
  isSuccess: propIsSuccess,
  defaultEmail = '',
  showSocialAuth = true,
  showDemoCredentials = true,
  className = '',
}) => {
  // Field values
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Field interaction states for validation
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Form submission states (can be locally managed or driven by props)
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState('');
  const [localIsSuccess, setLocalIsSuccess] = useState(false);

  const isLoading = propIsLoading !== undefined ? propIsLoading : localIsLoading;
  const errorMessage = propErrorMessage !== undefined ? propErrorMessage : localErrorMessage;
  const isSuccess = propIsSuccess !== undefined ? propIsSuccess : localIsSuccess;

  // Validation checks
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.trim() ? emailRegex.test(email.trim()) : true;
  const emailError = emailTouched && !email.trim()
    ? 'Email address is required.'
    : emailTouched && !isEmailValid
    ? 'Please enter a valid work email address.'
    : '';

  const passwordError = passwordTouched && !password
    ? 'Password is required.'
    : '';

  // Listen for Caps Lock state on password input
  const handlePasswordKeyActivity = (e) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // One-click Demo Credentials Autofil
  const handleQuickDemoFill = (e) => {
    e.preventDefault();
    setEmail('nikhilkumars12343@gmail.com');
    setPassword('admin12345');
    setEmailTouched(false);
    setPasswordTouched(false);
    setLocalErrorMessage('');
  };

  // Instant Demo Login (for offline/demo exploration)
  const handleInstantDemoLogin = (e) => {
    e.preventDefault();
    setLocalIsLoading(true);
    setLocalErrorMessage('');
    setTimeout(() => {
      setLocalIsLoading(false);
      setLocalIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess && onLoginSuccess({
          user: {
            id: 1,
            name: 'Sarah Jenkins',
            email: 'sarah.jenkins@apexcorp.com',
            role: 'super_admin',
          },
          token: 'demo-super-admin-session-token',
        });
      }, 400);
    }, 600);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setLocalErrorMessage('');

    // Pre-flight validation
    if (!email.trim()) {
      setLocalErrorMessage('Please enter your work email address.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setLocalErrorMessage('Please enter a valid email address (e.g., name@company.com).');
      return;
    }
    if (!password) {
      setLocalErrorMessage('Please enter your password.');
      return;
    }

    setLocalIsLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      // Verify response success flag if provided
      if (response && response.success === false) {
        throw new Error(response.message || 'Invalid email or password.');
      }

      setLocalIsLoading(false);
      setLocalIsSuccess(true);

      // Trigger success callback after smooth completion animation
      setTimeout(() => {
        onLoginSuccess && onLoginSuccess(response);
      }, 500);
    } catch (error) {
      setLocalIsLoading(false);

      // Extract accurate server error message
      const apiMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(' ')
          : null) ||
        error.message ||
        'Unable to authenticate. Please check your credentials and try again.';

      setLocalErrorMessage(apiMessage);
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ width: '100%' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          Sign in to your account
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            marginTop: '6px',
            marginBottom: 0,
            lineHeight: 1.5,
          }}
        >
          Enter your credentials to access the administrative workspace.
        </p>
      </div>

      {/* Demo Credentials Quick-Access Pill (Ideal for SaaS showcases & evaluation) */}
      {showDemoCredentials && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={14} />
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.3 }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Demo Mode:</span> Super Admin Access
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              disabled={isLoading || isSuccess}
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#4f46e5',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eef2ff';
                e.currentTarget.style.borderColor = '#c7d2fe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              title="Auto-fill form credentials"
            >
              Auto-fill
            </button>
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isLoading || isSuccess}
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#4f46e5',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
              title="Instant bypass login for demo preview"
            >
              Instant Demo
            </button>
          </div>
        </div>
      )}

      {/* Inline Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
          <div style={{ flex: 1, lineHeight: 1.45 }}>{errorMessage}</div>
          <button
            type="button"
            onClick={() => setLocalErrorMessage('')}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px',
              color: '#991b1b',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {isSuccess && (
        <div
          role="status"
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
          <div style={{ fontWeight: 500 }}>
            Authentication successful! Launching your workspace...
          </div>
        </div>
      )}

      {/* Core HTML5 Semantic Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address Field */}
        <div style={{ marginBottom: '18px' }}>
          <label
            htmlFor="login-email"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Work email <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Mail
              size={16}
              style={{
                position: 'absolute',
                left: '13px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: emailError ? '#ef4444' : '#94a3b8',
                pointerEvents: 'none',
                transition: 'color 0.15s ease',
              }}
            />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              enterKeyHint="next"
              value={email}
              disabled={isLoading || isSuccess}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setLocalErrorMessage('');
              }}
              onBlur={() => setEmailTouched(true)}
              placeholder="name@company.com"
              required
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '40px',
                paddingRight: email ? '36px' : '14px',
                fontSize: '14px',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                border: `1px solid ${emailError ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: '8px',
                outline: 'none',
                boxShadow: emailError
                  ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                  : '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
                transition: 'all 0.15s ease',
              }}
              onFocus={(e) => {
                if (!emailError) {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.14)';
                }
              }}
              onBlurCapture={(e) => {
                if (!emailError) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(16, 24, 40, 0.04)';
                }
              }}
            />
            {email && !isLoading && !isSuccess && (
              <button
                type="button"
                onClick={() => setEmail('')}
                aria-label="Clear email"
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {emailError && (
            <p
              style={{
                fontSize: '12px',
                color: '#dc2626',
                marginTop: '5px',
                marginBottom: 0,
                fontWeight: 500,
              }}
            >
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <label
              htmlFor="login-password"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#334155',
              }}
            >
              Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                disabled={isLoading || isSuccess}
                style={{
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#4f46e5',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3730a3')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4f46e5')}
              >
                Forgot password?
              </button>
            )}
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <Lock
              size={16}
              style={{
                position: 'absolute',
                left: '13px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: passwordError ? '#ef4444' : '#94a3b8',
                pointerEvents: 'none',
                transition: 'color 0.15s ease',
              }}
            />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              enterKeyHint="done"
              value={password}
              disabled={isLoading || isSuccess}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setLocalErrorMessage('');
              }}
              onKeyDown={handlePasswordKeyActivity}
              onKeyUp={handlePasswordKeyActivity}
              onBlur={() => setPasswordTouched(true)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '40px',
                paddingRight: '42px',
                fontSize: '14px',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                border: `1px solid ${passwordError ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: '8px',
                outline: 'none',
                boxShadow: passwordError
                  ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                  : '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
                transition: 'all 0.15s ease',
              }}
              onFocus={(e) => {
                if (!passwordError) {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.14)';
                }
              }}
              onBlurCapture={(e) => {
                if (!passwordError) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(16, 24, 40, 0.04)';
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || isSuccess}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Caps Lock Alert Pill */}
          {isCapsLockOn && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '11.5px',
                fontWeight: 500,
              }}
            >
              <span>⇪</span> Caps Lock is turned ON
            </div>
          )}

          {passwordError && (
            <p
              style={{
                fontSize: '12px',
                color: '#dc2626',
                marginTop: '5px',
                marginBottom: 0,
                fontWeight: 500,
              }}
            >
              {passwordError}
            </p>
          )}
        </div>

        {/* Remember Device Checkbox */}
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
              display: 'inline-flex',
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
              id="remember-me"
              name="remember"
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
            <span>Remember this device for 30 days</span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          aria-busy={isLoading}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: isSuccess ? '#059669' : '#0f172a',
            backgroundImage: isSuccess
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '14.5px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isLoading || isSuccess ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px 0 rgba(15, 23, 42, 0.15), 0 1px 2px -1px rgba(15, 23, 42, 0.1)',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isLoading ? 0.85 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !isSuccess) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 6px 12px -2px rgba(15, 23, 42, 0.2), 0 3px 6px -3px rgba(15, 23, 42, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !isSuccess) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 2px 4px 0 rgba(15, 23, 42, 0.15), 0 1px 2px -1px rgba(15, 23, 42, 0.1)';
            }
          }}
          onMouseDown={(e) => {
            if (!isLoading && !isSuccess) {
              e.currentTarget.style.transform = 'translateY(0) scale(0.99)';
            }
          }}
          onMouseUp={(e) => {
            if (!isLoading && !isSuccess) {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={17} />
              <span>Signed In</span>
            </>
          ) : (
            <>
              <span>Sign in to Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Alternative SSO / Enterprise Options */}
      {showSocialAuth && (
        <div style={{ marginTop: '24px' }}>
          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div style={{ height: '1px', flex: 1, backgroundColor: '#e2e8f0' }} />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Or corporate single sign-on
            </span>
            <div style={{ height: '1px', flex: 1, backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Social / SSO Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Google Workspace */}
            <button
              type="button"
              onClick={() => {
                if (onSSOClick) {
                  onSSOClick('google');
                } else {
                  setLocalErrorMessage('Google Workspace OAuth configured for company domains.');
                }
              }}
              disabled={isLoading || isSuccess}
              style={{
                height: '40px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {/* Official Google 'G' Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google SSO</span>
            </button>

            {/* Enterprise SAML / Okta */}
            <button
              type="button"
              onClick={() => {
                if (onSSOClick) {
                  onSSOClick('enterprise');
                } else {
                  setLocalErrorMessage('Enterprise SAML / Okta SSO is available for enterprise tenants.');
                }
              }}
              disabled={isLoading || isSuccess}
              style={{
                height: '40px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <KeyRound size={15} style={{ color: '#4f46e5' }} />
              <span>SAML / Okta</span>
            </button>
          </div>
        </div>
      )}

      {/* Security & Compliance Footer */}
      <div
        style={{
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#94a3b8',
        }}
      >
        <ShieldCheck size={14} style={{ color: '#10b981' }} />
        <span>Enterprise 256-bit TLS • SOC 2 Type II Certified</span>
      </div>
    </div>
  );
};

export default LoginForm;