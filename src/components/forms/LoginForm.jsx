import { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { login } from '../../utils/auth.service';

/**
 * Clean SaaS Login Form (Tailwind CSS)
 *
 * Uses Tailwind CSS utilities for responsive layout, typography, focus rings,
 * hover states, and animations. Connected directly to the actual /admin/login API.
 */
export const LoginForm = ({
  onLoginSuccess,
  onForgotPassword,
  isLoading: propIsLoading,
  errorMessage: propErrorMessage,
  isSuccess: propIsSuccess,
  defaultEmail = '',
  className = '',
}) => {
  // Field values
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Interaction & UI states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Form submission states
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState('');
  const [localIsSuccess, setLocalIsSuccess] = useState(false);

  const isLoading = propIsLoading !== undefined ? propIsLoading : localIsLoading;
  const errorMessage = propErrorMessage !== undefined ? propErrorMessage : localErrorMessage;
  const isSuccess = propIsSuccess !== undefined ? propIsSuccess : localIsSuccess;

  // Real-time validation checks
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.trim() ? emailRegex.test(email.trim()) : true;
  const emailError =
    emailTouched && !email.trim()
      ? 'Email address is required.'
      : emailTouched && !isEmailValid
      ? 'Please enter a valid email address.'
      : '';

  const passwordError = passwordTouched && !password ? 'Password is required.' : '';

  // Caps Lock detection on password input
  const handlePasswordKeyActivity = (e) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // Submit Handler: calls the ACTUAL /admin/login API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setLocalErrorMessage('');

    // Pre-flight validation
    if (!email.trim()) {
      setLocalErrorMessage('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setLocalErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setLocalErrorMessage('Please enter your password.');
      return;
    }

    setLocalIsLoading(true);

    try {
      // Call the actual authentication backend API
      const response = await login({
        email: email.trim(),
        password,
      });

      // Verify response status from backend
      if (response && response.success === false) {
        throw new Error(response.message || 'Invalid email or password.');
      }

      setLocalIsLoading(false);
      setLocalIsSuccess(true);

      // Trigger success callback to launch dashboard
      setTimeout(() => {
        onLoginSuccess && onLoginSuccess(response);
      }, 500);
    } catch (error) {
      setLocalIsLoading(false);

      // Extract error message from API response
      const apiMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(' ')
          : null) ||
        error.message ||
        'Invalid credentials. Please verify your email and password.';

      setLocalErrorMessage(apiMessage);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Form Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Enter your email and password to access the admin panel.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 mb-5 animate-fade-in"
        >
          <AlertCircle size={17} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-snug">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setLocalErrorMessage('')}
            aria-label="Dismiss error"
            className="text-red-500 hover:text-red-800 transition-colors p-0.5 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {isSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 mb-5 animate-pop-in"
        >
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <div className="font-medium">Authentication successful! Redirecting...</div>
        </div>
      )}

      {/* Semantic HTML5 Form with Tailwind */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Address Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Email Address <span className="text-red-600">*</span>
          </label>
          <div className="relative w-full">
            <Mail
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                emailError ? 'text-red-500' : 'text-slate-400'
              }`}
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
              className={`w-full h-11 pl-10 pr-9 text-sm text-slate-900 bg-white border rounded-lg outline-none transition-all duration-150 placeholder:text-slate-400 shadow-xs ${
                emailError
                  ? 'border-red-500 ring-2 ring-red-500/10'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
              }`}
            />
            {email && !isLoading && !isSuccess && (
              <button
                type="button"
                onClick={() => setEmail('')}
                aria-label="Clear email"
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {emailError && <p className="text-xs text-red-600 font-medium mt-1.5">{emailError}</p>}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Password <span className="text-red-600">*</span>
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                disabled={isLoading || isSuccess}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative w-full">
            <Lock
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                passwordError ? 'text-red-500' : 'text-slate-400'
              }`}
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
              className={`w-full h-11 pl-10 pr-10 text-sm text-slate-900 bg-white border rounded-lg outline-none transition-all duration-150 placeholder:text-slate-400 shadow-xs ${
                passwordError
                  ? 'border-red-500 ring-2 ring-red-500/10'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || isSuccess}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Caps Lock Alert */}
          {isCapsLockOn && (
            <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <span>⇪</span> Caps Lock is turned ON
            </div>
          )}

          {passwordError && (
            <p className="text-xs text-red-600 font-medium mt-1.5">{passwordError}</p>
          )}
        </div>

        {/* Remember Device Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="inline-flex items-center gap-2.5 text-sm text-slate-600 select-none cursor-pointer">
            <input
              type="checkbox"
              id="remember-me"
              name="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading || isSuccess}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Remember me</span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          aria-busy={isLoading}
          className={`w-full h-11 rounded-lg text-sm font-semibold text-white transition-all duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
            isSuccess
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99]'
          }`}
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
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;