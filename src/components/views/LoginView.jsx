import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { LoginForm } from '../forms/LoginForm';

/**
 * Clean Login Page (Tailwind CSS)
 * Centered card layout containing the brand header and LoginForm.
 */
export const LoginView = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'forgot'
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handle Forgot Password submission
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetEmail.trim() || !emailRegex.test(resetEmail.trim())) {
      setResetError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSent(true);
      toast.success('Password reset link sent to your email.');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 font-sans">
      {/* Centered Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-8 sm:p-10 animate-pop-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img
            src="/MAIN-LOGO.png"
            alt="BLOGTECH Logo"
            className="h-10 w-auto object-contain mb-1.5"
          />
     
        </div>

        {/* View Switcher: Login | Forgot Password */}
        {viewMode === 'login' ? (
          <LoginForm
            onLoginSuccess={onLoginSuccess}
            onForgotPassword={() => {
              setViewMode('forgot');
              setResetSent(false);
              setResetError('');
            }}
          />
        ) : (
          <div className="animate-pop-in">
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to sign in</span>
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Reset your password
              </h2>
              <p className="text-sm text-slate-500 w-[200px] leading-relaxed">
                Enter your email address to receive password reset instructions.
              </p>
            </div>

            {resetSent ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center flex flex-col items-center gap-3 animate-pop-in">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-semibold text-emerald-900 m-0">
                  Reset Link Dispatched
                </h3>
                <p className="text-sm text-emerald-800 m-0 leading-relaxed">
                  We sent password reset instructions to <strong>{resetEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setResetSent(false);
                  }}
                  className="mt-3 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
                {resetError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative w-full">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (resetError) setResetError('');
                      }}
                      placeholder="name@company.com"
                      required
                      className="w-full h-11 pl-10 pr-4 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center"
                  >
                    {resetLoading ? 'Sending link...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="w-full h-10 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;
