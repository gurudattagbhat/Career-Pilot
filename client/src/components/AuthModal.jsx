import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ShieldCheck, 
  KeyRound, 
  Sparkles,
  IndianRupee,
  Check
} from 'lucide-react';
import { SecurityShieldGraphic, CareerRocketGraphic, ResetKeyGraphic } from './AuthGraphics';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login', 
  onAuthSuccess 
}) {
  // Modes: 'login', 'signup', 'verify_otp', 'forgot_password', 'reset_otp'
  const [mode, setMode] = useState(initialMode);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [currentCtc, setCurrentCtc] = useState('');
  const [expectedCtc, setExpectedCtc] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State (6 separate box digits)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Passwordless login toggle
  const [loginWithOtp, setLoginWithOtp] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if ((mode === 'verify_otp' || mode === 'reset_otp') && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpCountdown]);

  if (!isOpen) return null;

  // Password Strength Calculation
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 9) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'var(--accent-rose)' };
    if (score <= 4) return { score: 66, label: 'Moderate', color: 'var(--accent-amber)' };
    return { score: 100, label: 'Strong', color: 'var(--accent-emerald)' };
  };

  const strength = calculatePasswordStrength(password);

  // Handle OTP digit box input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextFocus = Math.min(pasted.length, 5);
        otpInputRefs.current[nextFocus]?.focus();
      }
      return;
    }

    const cleanDigit = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);

    // Auto-advance to next box if digit entered
    if (cleanDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 1. SUBMIT SIGNUP
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          targetRole,
          currentCtc,
          expectedCtc
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      setSuccessMsg(data.message);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setCanResend(false);
      setMode('verify_otp');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. SUBMIT VERIFY SIGNUP OTP
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: fullOtp
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');

      setSuccessMsg('Account verified successfully!');
      if (data.token && data.user) {
        localStorage.setItem('jobfinder_auth_token', data.token);
        localStorage.setItem('jobfinder_auth_user', JSON.stringify(data.user));
        if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. SUBMIT LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // If user chose passwordless OTP login
      if (loginWithOtp) {
        const res = await fetch('/api/auth/send-login-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to dispatch login OTP');

        setSuccessMsg(data.message);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpCountdown(60);
        setCanResend(false);
        setMode('verify_otp');
        return;
      }

      // Password login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        // Check if pending OTP verification
        if (data.requiresOtpVerification) {
          setSuccessMsg(data.message);
          setOtpDigits(['', '', '', '', '', '']);
          setOtpCountdown(60);
          setCanResend(false);
          setMode('verify_otp');
          return;
        }
        throw new Error(data.error || 'Sign in failed');
      }

      setSuccessMsg('Signed in successfully!');
      if (data.token && data.user) {
        localStorage.setItem('jobfinder_auth_token', data.token);
        localStorage.setItem('jobfinder_auth_user', JSON.stringify(data.user));
        if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      }
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. RESEND OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const type = mode === 'reset_otp' ? 'reset' : 'signup';
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');

      setSuccessMsg(data.message);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setCanResend(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. FORGOT PASSWORD: Send Reset OTP
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');

      setSuccessMsg(data.message);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setCanResend(false);
      setMode('reset_otp');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. RESET PASSWORD WITH OTP
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit reset code.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: fullOtp,
          newPassword: password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');

      setSuccessMsg(data.message);
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setOtpDigits(['', '', '', '', '', '']);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(10, 13, 16, 0.82)',
      backdropFilter: 'blur(14px)',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div 
        className="card animate-fade-in auth-modal-dialog"
        style={{
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.1)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            zIndex: 10,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* LEFT BRAND & GRAPHIC SHOWCASE COLUMN */}
        <div className="auth-graphic-col">
          {/* Subtle Background Glow Accent */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />

          {/* Top Logo / Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px var(--accent-emerald-glow)'
              }}>
                <Briefcase size={18} strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                CareerPilot <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>PRO</span>
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              India Tech Career & ATS Intelligence Platform
            </p>
          </div>

          {/* Dynamic Graphic based on Mode */}
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            {mode === 'signup' && <CareerRocketGraphic size={150} />}
            {(mode === 'login' || mode === 'verify_otp') && <SecurityShieldGraphic size={150} />}
            {(mode === 'forgot_password' || mode === 'reset_otp') && <ResetKeyGraphic size={150} />}

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {mode === 'signup' && 'Launch Your Indian Tech Career'}
                {mode === 'login' && 'Secure 2FA Protected Access'}
                {mode === 'verify_otp' && 'Verify with One-Time Code'}
                {mode === 'forgot_password' && 'Instant Password Recovery'}
                {mode === 'reset_otp' && 'Set New Encrypted Password'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {mode === 'signup' && 'Get live scraped jobs, ATS resume scoring, and direct application links across Indian unicorns.'}
                {mode === 'login' && 'Bank-grade encrypted authentication powered by MongoDB and real-time OTP.'}
                {mode === 'verify_otp' && 'Ensure account security with 6-digit cryptographic verification.'}
                {(mode === 'forgot_password' || mode === 'reset_otp') && 'Reset your password in under 60 seconds with verified OTP token.'}
              </p>
            </div>
          </div>

          {/* Bottom Security / Trust Badge */}
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Verified Indian Tech Network</strong>
              Naukri • LinkedIn India • Instahyre direct feeds
            </div>
          </div>
        </div>

        {/* RIGHT INTERACTIVE FORM COLUMN */}
        <div className="auth-form-col">
          {/* Alerts */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-rose-soft)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: '18px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-emerald-soft)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-emerald)',
              fontSize: '0.85rem',
              marginBottom: '18px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}


          {/* ========================================================================= */}
          {/* VIEW 1: SIGN IN */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
                  Welcome Back
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Sign in to access your matched jobs, live applications, and ATS doctor.
                </p>
              </div>

              {/* Login Method Toggle: Password vs OTP */}
              <div style={{
                display: 'flex',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => setLoginWithOtp(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: !loginWithOtp ? 'var(--bg-card)' : 'transparent',
                    color: !loginWithOtp ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    boxShadow: !loginWithOtp ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Password Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setLoginWithOtp(true)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: loginWithOtp ? 'var(--bg-card)' : 'transparent',
                    color: loginWithOtp ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    boxShadow: loginWithOtp ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  One-Time Code (OTP)
                </button>
              </div>

              <form onSubmit={handleLoginSubmit}>
                {/* Email Address */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={17} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Password (if not OTP login) */}
                {!loginWithOtp && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot_password');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-emerald)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock size={17} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 42px 12px 42px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin-animation" />
                      <span>{loginWithOtp ? 'Sending OTP Code...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{loginWithOtp ? 'Send OTP Code' : 'Sign In to Job Finder'}</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switch to Sign Up */}
              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-emerald)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Create an account
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: SIGN UP */}
          {/* ========================================================================= */}
          {mode === 'signup' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
                  Create Your Account
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Join thousands of software engineers tracking tech openings in India.
                </p>
              </div>

              <form onSubmit={handleSignupSubmit}>
                {/* Full Name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <User size={16} style={{ position: 'absolute', left: '13px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Email Address & Mobile Grid */}
                <div className="auth-2col-row">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '13px', color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        required
                        placeholder="aarav@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.86rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Phone (for SMS OTP)
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Phone size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 36px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.86rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Target Role & CTC Grid */}
                <div className="auth-2col-row">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Target Role / Domain
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Briefcase size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Developer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 36px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.86rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Expected CTC (₹ LPA)
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <IndianRupee size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={expectedCtc}
                        onChange={(e) => setExpectedCtc(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 36px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.86rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Strength Meter */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '13px', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 40px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {password && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${strength.score}%`, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: strength.color, marginTop: '3px' }}>
                        <span>Strength: {strength.label}</span>
                        <span>Use numbers & symbols</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Signup Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin-animation" />
                      <span>Sending OTP Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Send OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switch to Sign In */}
              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-emerald)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: OTP VERIFICATION */}
          {/* ========================================================================= */}
          {mode === 'verify_otp' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-emerald-soft)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto'
                }}>
                  <ShieldCheck size={28} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
                  Enter Verification Code
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto' }}>
                  We sent a 6-digit one-time password to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifySignupOtp}>
                {/* 6 Discrete Digit Boxes */}
                <div className="otp-boxes-container">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="otp-digit-box"
                      style={{
                        border: digit ? '2px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
                        boxShadow: digit ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none'
                      }}
                    />
                  ))}
                </div>

                {/* Submit Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length < 6}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin-animation" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Resend & Timer */}
              <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-emerald)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>Resend OTP Code</span>
                  </button>
                ) : (
                  <span>
                    Resend code in <strong style={{ color: 'var(--text-primary)' }}>{otpCountdown}s</strong>
                  </span>
                )}
              </div>

              {/* Back to sign in */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: FORGOT PASSWORD */}
          {/* ========================================================================= */}
          {mode === 'forgot_password' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: '6px' }}>
                  Reset Your Password
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Enter your registered email address. We will dispatch a 6-digit OTP code to verify your identity.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={17} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin-animation" />
                      <span>Sending Reset Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset OTP</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: RESET PASSWORD WITH OTP */}
          {/* ========================================================================= */}
          {mode === 'reset_otp' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
                  Create New Password
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Enter the 6-digit reset code sent to <strong>{email}</strong> and your new password.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit}>
                {/* 6 Digit OTP input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        style={{
                          width: '42px',
                          height: '48px',
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--bg-input)',
                          border: digit ? '2px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* New Password */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    New Password (min 6 characters)
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '13px', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 38px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '13px', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin-animation" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password & Sign In</span>
                      <Check size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Link */}
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-emerald)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span>Resend code in {otpCountdown}s</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
