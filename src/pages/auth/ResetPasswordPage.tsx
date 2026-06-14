// src/pages/auth/ResetPasswordPage.tsx
//
// ══════════════════════════════════════════════════════════════
//  RESET PASSWORD PAGE  —  /reset-password?token=<jwt>
// ══════════════════════════════════════════════════════════════
//
//  Flow:
//   Mount → validate token presence
//   User enters new password + confirm
//   POST /api/auth/reset-password  { token, password }
//   Success → redirect to /login with success message
//
// ══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { authApi } from '../../api/client';

const ResetPasswordPage: React.FC = () => {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token') || '';
  const navigate                = useNavigate();

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const inp = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-gray-400";
  const lbl = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";

  // ── No token in URL ───────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Invalid Link</h2>
          <p className="text-gray-400 text-sm mb-6">
            This reset link is missing or malformed. Please request a new one.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3 rounded-xl transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Submit new password ───────────────────────────────────────────────────
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
          <div className="text-sky-500 font-black text-xl uppercase tracking-widest">
            The Language Hunter
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Password Updated!</h3>
              <p className="text-gray-500 text-sm">
                Your password has been reset successfully. Redirecting you to login…
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3 rounded-xl transition-all"
              >
                Go to Login →
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Set New Password</h2>
              <p className="text-gray-400 text-xs mb-6">
                Choose a strong password that you haven't used before.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className={lbl}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Min. 8 characters"
                      className={`${inp} pr-11`}
                      required
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div>
                  <label className={lbl}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConf ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError(''); }}
                      placeholder="Re-enter new password"
                      className={`${inp} pr-11`}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm"
                >
                  {loading ? 'Updating…' : 'Reset Password →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;