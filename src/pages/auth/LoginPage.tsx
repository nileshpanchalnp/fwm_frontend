// src/pages/auth/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/client';
import { Eye, EyeOff, ArrowLeft, X, Mail, CheckCircle } from 'lucide-react';

// ── Forgot Password Modal ─────────────────────────────────────────────────────
interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [sent, setSent]         = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-gray-400";
  const lbl = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Check your inbox</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              If an account exists for <span className="font-semibold text-gray-700">{email}</span>,
              we've sent a password reset link. It expires in <strong>15 minutes</strong>.
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3 rounded-xl transition-all"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Forgot password?</h3>
                <p className="text-xs text-gray-400">We'll send a reset link to your email.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={lbl}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className={inp}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all"
              >
                {loading ? 'Sending…' : 'Send Reset Link →'}
              </button>
            </form>

            <button
              onClick={onClose}
              className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel, go back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Login Page ─────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [checking, setChecking]         = useState(true);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showForgot, setShowForgot]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // ── Session detect ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await authApi.me();
        if (data?.user?.id) {
          navigate(redirectTo, { replace: true });
          return;
        }
      } catch {
        // No valid session — show form
      }
      setChecking(false);
    })();
  }, []);

  // ── Login submit ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-gray-400";
  const lbl = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";

  // ── Session-detect spinner ────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Checking your session…</p>
        </div>
      </div>
    );
  }

  // ── Login form ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Forgot Password Modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="text-sky-500 font-black text-xl uppercase tracking-widest">
            The Language Hunter
          </div>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-xs mb-6">
            Enter your credentials to access your courses.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className={lbl}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className={inp}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={lbl} style={{ marginBottom: 0 }}>Password</label>
                {/* Forgot Password trigger */}
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-sky-500 hover:text-sky-600 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className={`${inp} pr-11`}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-500 text-sm">{error}</p>
                {error.toLowerCase().includes('pending') && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    Your account is under admin review. You can still{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/courses')}
                      className="underline font-bold hover:text-amber-700"
                    >
                      browse courses
                    </button>{' '}
                    and submit payment while waiting for approval.
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/courses')}
              className="text-sky-500 hover:text-sky-600 font-semibold transition-colors"
            >
              Browse courses to enroll
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;