import { useState } from 'react';
import {
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  ArrowLeft,
  Mail,
  HelpCircle,
  KeyRound,
  Building2,
} from 'lucide-react';
import { LoginForm } from '../forms/LoginForm';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

/**
 * Enterprise SaaS Login View
 *
 * Implements a split-screen brand experience:
 * - Left Showcase: Value proposition, real-time edge telemetry, trust signals & testimonials
 * - Right Container: Embeds the modular LoginForm, password recovery, and enterprise SSO flows
 */
export const LoginView = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'forgot' | 'sso'
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  // Enterprise SSO domain state
  const [ssoDomain, setSsoDomain] = useState('');
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoError, setSsoError] = useState('');

  // Handle Forgot Password submission
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetEmail.trim() || !emailRegex.test(resetEmail.trim())) {
      setResetError('Please enter a valid work email address.');
      return;
    }

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSent(true);
    }, 700);
  };

  // Handle Enterprise SSO submission
  const handleSSOSubmit = (e) => {
    e.preventDefault();
    setSsoError('');

    if (!ssoDomain.trim()) {
      setSsoError('Please enter your company work email or SSO domain.');
      return;
    }

    setSsoLoading(true);
    setTimeout(() => {
      setSsoLoading(false);
      // Simulate successful enterprise SSO callback
      onLoginSuccess &&
        onLoginSuccess({
          user: {
            id: 1,
            name: 'Sarah Jenkins',
            email: ssoDomain.includes('@') ? ssoDomain : `admin@${ssoDomain}.com`,
            role: 'super_admin',
          },
          token: 'enterprise-sso-saml-token',
        });
    }, 900);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* =========================================================================
          LEFT PANEL: High-Impact SaaS Showcase & Brand Experience
          Hidden automatically on tablet & mobile (< 960px) via .login-brand-panel CSS
          ========================================================================= */}
      <div
        className="login-brand-panel"
        style={{
          flex: '1.1',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Subtle Background Radial Mesh Accent Elements */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />

        {/* Top Brand Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/MAIN-LOGO.png"
              alt="BLOGTECH Logo"
              style={{
                height: '42px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(79, 70, 229, 0.3))',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  lineHeight: 1.1,
                }}
              >
                BLOG<span style={{ color: '#818cf8' }}>TECH</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Enterprise Platform
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '12px',
              fontWeight: 500,
              color: '#e2e8f0',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              className="pulse-live-dot"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block',
              }}
            />
            <span>Production v2.4</span>
          </div>
        </div>

        {/* Center Hero Value Proposition */}
        <div style={{ maxWidth: '540px', position: 'relative', zIndex: 2, margin: '40px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} style={{ color: '#818cf8' }} />
            <span>Unified Content, Publishing & Talent Cloud</span>
          </div>

          <h2
            style={{
              fontSize: '34px',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: '16px',
            }}
          >
            Modern editorial agility meets global edge performance.
          </h2>

          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#cbd5e1',
              marginBottom: '32px',
            }}
          >
            Centralize publication workflows, manage engineering job openings, and track customer
            enquiries with enterprise-grade security and sub-second edge deployment.
          </p>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(79, 70, 229, 0.25)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  Sub-50ms Global Edge Deployments
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
                  Synchronize articles and site assets worldwide with instant cache invalidation.
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  Multi-Author Editorial Pipeline
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
                  Draft approvals, rich formatting, scheduled posts, and role-based access control.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial / Telemetry Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '18px 22px',
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
              alt="Sarah Jenkins"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(129, 140, 248, 0.5)',
              }}
            />
            <div>
              <p
                style={{
                  fontSize: '13px',
                  color: '#e2e8f0',
                  margin: 0,
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                }}
              >
                "BLOGTECH gives our editorial team complete confidence from draft to edge release."
              </p>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>Sarah Jenkins</span> — Super Admin & Lead Editor
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: 'right',
              borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              paddingLeft: '16px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>99.99%</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Cluster Uptime</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Authentication Container & User Interaction Flow
          ========================================================================= */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px 32px',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          minHeight: '100vh',
        }}
      >
        {/* Top Utility Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          {/* Mobile Brand Header (< 960px) */}
          <div
            className="mobile-brand-header"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <img
              src="/MAIN-LOGO.png"
              alt="BLOGTECH Logo"
              style={{ height: '32px', width: 'auto' }}
            />
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              BLOG<span style={{ color: '#4f46e5' }}>TECH</span>
            </div>
          </div>

          <div style={{ display: 'none' }} className="login-brand-panel-spacer" />

          {/* Quick Help & Status links on right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <span>System Operational</span>
            </div>
            <a
              href="#help"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'BLOGTECH Help Desk:\nFor administrative account assistance or credentials reset, contact security@blogtech.internal'
                );
              }}
              style={{
                fontSize: '13px',
                color: '#64748b',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <HelpCircle size={15} />
              <span>Support</span>
            </a>
          </div>
        </div>

        {/* Center Card Content Area */}
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            margin: '0 auto',
            padding: '12px 0 32px 0',
          }}
        >
          {viewMode === 'login' ? (
            /* ==================== 1. Primary LoginForm ==================== */
            <div className="animate-pop-in">
              <LoginForm
                onLoginSuccess={onLoginSuccess}
                onForgotPassword={() => {
                  setViewMode('forgot');
                  setResetSent(false);
                  setResetError('');
                }}
                onSSOClick={(provider) => {
                  if (provider === 'enterprise') {
                    setViewMode('sso');
                    setSsoError('');
                  } else {
                    // Google Workspace direct mock trigger
                    onLoginSuccess &&
                      onLoginSuccess({
                        user: {
                          id: 1,
                          name: 'Sarah Jenkins',
                          email: 'sarah.jenkins@apexcorp.com',
                          role: 'super_admin',
                        },
                        token: 'google-workspace-oauth-token',
                      });
                  }
                }}
                showSocialAuth={true}
                showDemoCredentials={true}
              />
            </div>
          ) : viewMode === 'forgot' ? (
            /* ==================== 2. Forgot Password View ==================== */
            <div className="animate-pop-in">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#64748b',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  marginBottom: '20px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <ArrowLeft size={16} />
                <span>Back to sign in</span>
              </button>

              <div style={{ marginBottom: '24px' }}>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.025em',
                    margin: 0,
                  }}
                >
                  Reset your password
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', margin: 0 }}>
                  Enter your company email address to receive secure reset instructions.
                </p>
              </div>

              {resetSent ? (
                <div
                  style={{
                    padding: '24px',
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
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#047857', margin: 0 }}>
                    Instructions Dispatched
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#065f46', margin: 0, lineHeight: 1.5 }}>
                    We sent a secure password reset link to <strong>{resetEmail}</strong>. Please check your inbox and spam folder.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setViewMode('login');
                        setResetSent(false);
                      }}
                    >
                      Return to Sign In
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setResetSent(false);
                      }}
                    >
                      Resend Email
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} noValidate>
                  {resetError && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '13px',
                        marginBottom: '18px',
                      }}
                    >
                      {resetError}
                    </div>
                  )}

                  <FormField label="Work Email Address" required>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <Mail
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '13px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94a3b8',
                          pointerEvents: 'none',
                        }}
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
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '40px',
                          paddingRight: '14px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </FormField>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '22px' }}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={resetLoading}
                      fullWidth
                    >
                      Send Reset Link
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setViewMode('login')}
                      fullWidth
                    >
                      Cancel and return
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ==================== 3. Enterprise SSO View ==================== */
            <div className="animate-pop-in">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#64748b',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  marginBottom: '20px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <ArrowLeft size={16} />
                <span>Back to sign in</span>
              </button>

              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '12px',
                  }}
                >
                  <KeyRound size={14} />
                  <span>SAML 2.0 / Okta / Azure AD</span>
                </div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.025em',
                    margin: 0,
                  }}
                >
                  Enterprise Single Sign-On
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', margin: 0 }}>
                  Enter your company domain or email to route to your Identity Provider.
                </p>
              </div>

              <form onSubmit={handleSSOSubmit} noValidate>
                {ssoError && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      fontSize: '13px',
                      marginBottom: '18px',
                    }}
                  >
                    {ssoError}
                  </div>
                )}

                <FormField label="Corporate Domain or Email" required helperText="e.g. acme.com or jane@acme.com">
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Building2
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '13px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={ssoDomain}
                      onChange={(e) => {
                        setSsoDomain(e.target.value);
                        if (ssoError) setSsoError('');
                      }}
                      placeholder="acme.com or sarah@apexcorp.com"
                      required
                      style={{
                        width: '100%',
                        height: '42px',
                        paddingLeft: '40px',
                        paddingRight: '14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        outline: 'none',
                      }}
                    />
                  </div>
                </FormField>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '22px' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={ssoLoading}
                    fullWidth
                  >
                    Continue to Identity Provider
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setViewMode('login')}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12.5px',
            color: '#94a3b8',
          }}
        >
          <div>© {new Date().getFullYear()} BLOGTECH Inc. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              Terms of Service
            </a>
            <a
              href="#security"
              onClick={(e) => e.preventDefault()}
              style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              Security
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
