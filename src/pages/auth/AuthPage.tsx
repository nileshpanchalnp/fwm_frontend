// src/pages/auth/AuthPage.tsx
//
// ══════════════════════════════════════════════════════════════
//  FLOW OVERVIEW
// ══════════════════════════════════════════════════════════════
//
//  URL: /register?courseId=X&title=Y&price=Z
//
//  STEP MACHINE
//  ─────────────────────────────────────────────────
//  'detect'   Spinner on mount while checking authApi.me()
//  'signup'   New user — fill name / email / password
//  'login'    Existing user — enter email + password
//  'payment'  resolvedUser is set → show UPI / bank details
//  'waiting'  Enrollment submitted → pending admin approval
//
//  FLOW A — Token present (already logged in, ANY approval status)
//  ───────────────────────────────────────────────────────────────
//  authApi.me() returns 200 only for APPROVED users.
//  So if me() succeeds → user is approved → skip to payment.
//  If me() throws 403 (pending/rejected) → fall through to signup.
//  If me() throws 401 (no token) → fall through to signup.
//
//  FLOW B — No token, NEW user
//  ────────────────────────────────────────────
//  signup → register() → resolvedUser set → payment
//
//  FLOW C — No token, EXISTING user (email already registered)
//  ────────────────────────────────────────────────────────────
//  signup → register() throws 409 → show "Sign in instead →" button
//         → step = 'login' (email pre-filled)
//         → authApi.login() directly (NOT AuthContext.login)
//           because pending users can still submit payment,
//           and AuthContext.login calls me() which blocks pending users
//         → resolvedUser set → payment
//
//  KEY RULES
//  ──────────────────────────────────────────────────────────────
//  1. resolvedUser is ALWAYS set from the direct API response.
//     NEVER from authApi.me() after login — me() returns 403 for pending users.
//
//  2. authApi.login() returns { user } for APPROVED users only (server enforces).
//     But we use it directly here so we can read the user object without me().
//     Actually: our server returns { user } for ANY user on login.
//     So a pending user CAN login here and get to payment. ✅
//
//  3. The /login standalone page uses AuthContext.login() (correct for dashboard).
//     This enrollment page uses authApi.login() directly so pending users
//     can still submit payment after logging in. ✅
//
//  4. Multi-course purchase with token:
//     - User already logged in → me() succeeds → step = 'payment' immediately
//     - resolvedUser set from me() response → they see payment for NEW course ✅
//     - "Switch account" button lets them log out and use a different account ✅
//
// ══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { enrollmentApi, authApi } from '../../api/client';
import {
  Eye, EyeOff, ArrowLeft, Copy, CheckCircle2,
  Clock, ArrowRight, LogOut,
} from 'lucide-react';

type Step = 'detect' | 'signup' | 'login' | 'payment' | 'waiting';

interface ResolvedUser {
  id: number;
  name: string;
  email: string;
}

const AuthPage: React.FC = () => {
  const [step, setStep] = useState<Step>('detect');
  const [resolvedUser, setResolvedUser] = useState<ResolvedUser | null>(null);

  // ── Signup fields ──────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [cameFromLogin, setCameFromLogin] = useState(false);

  // ── Login fields ───────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Payment fields ─────────────────────────────────────────────────────
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // We use register() from AuthContext (it just calls authApi.register).
  // We use logout() from AuthContext so it clears global user state too.
  // We do NOT use login() from AuthContext here — see KEY RULES above.
  const { register, logout, user } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseId = Number(searchParams.get('courseId'));
  const courseTitle = searchParams.get('title') || 'Course';
  const price = searchParams.get('price') || '0';

  // ── Payment details ─────────────────────────────────────────────────────
  const UPI_ID = 'languagehunter@upi';
  const BANK_NAME = 'HDFC Bank';
  const ACCOUNT_NO = 'XXXX XXXX XXXX 1234';
  const IFSC = 'HDFC0001234';
  const ACCOUNT_NAME = 'The Language Hunter';

  // ══════════════════════════════════════════════════════════════
  //  DETECT — check for an existing valid session on mount
  // ══════════════════════════════════════════════════════════════
  //
  //  authApi.me() returns:
  //    200  → approved user with valid token  → skip straight to payment ✅
  //    401  → no token at all                 → show signup form ✅
  //    403  → pending/rejected user           → show signup form ✅
  //           (pending user re-registers OR uses "Sign in" to go to login step)
  //
  useEffect(() => {
    if (!courseId) { navigate('/'); return; }

    (async () => {
      try {
        const data = await authApi.me();
        // me() only succeeds (200) for approved users.
        // If we get here, the user is logged in and approved.
        if (data?.user?.id) {
          setResolvedUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
          });
            setCameFromLogin(true);   // ← ADD THIS LINE
          setStep('payment');   // ← Skip signup/login entirely ✅
          return;
        }
      } catch {
        // 401 = no token, 403 = pending/rejected — both go to signup
      }
      setStep('signup');
    })();
  }, [courseId]);

  // ══════════════════════════════════════════════════════════════
  //  SIGNUP
  // ══════════════════════════════════════════════════════════════
  //
  //  Server returns { user: { id, name, email, status:'pending' } } on success.
  //  We use that directly — no me() call needed.
  //
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);
    try {
      const res: any = await register(name, email, password);
      const u = res?.user;
      if (u?.id) {
        setResolvedUser({ id: u.id, name: u.name, email: u.email });
        setStep('payment');
      } else {
        setSignupError('Account created but something went wrong. Please try signing in.');
      }
    } catch (err: any) {
      setSignupError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  //  LOGIN
  // ══════════════════════════════════════════════════════════════
  //
  //  IMPORTANT: We call authApi.login() directly — NOT AuthContext.login().
  //
  //  Why? AuthContext.login() works fine for the dashboard, but here we need
  //  to allow PENDING users to also proceed to payment. The server's /auth/login
  //  endpoint returns { user } for any valid-credential user (approved or pending).
  //  We grab that user directly.
  //
  //  AuthContext.login() internally calls authApi.me() to sync global state,
  //  and me() returns 403 for pending users — which would block them here.
  //
  //  By calling authApi.login() directly, we:
  //    ✅ Set the session cookie (server sets it on login)
  //    ✅ Get the user object from the login response
  //    ✅ Allow pending users to proceed to payment
  //    ✅ Allow approved users to proceed to payment
  //
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      // authApi.login POSTs to /auth/login and returns { user: { id, name, email, role, status } }
      // The server sets an HTTP-only session cookie on success.
      const res: any = await authApi.login({ email: loginEmail, password: loginPassword });
      const u = res?.user;
      if (u?.id) {
        setResolvedUser({ id: u.id, name: u.name, email: u.email });
        setStep('payment');
         // If user is APPROVED, also sync AuthContext so dashboard works without refresh
  if (u.status === 'approved') {
    setCameFromLogin(true);  // approved users have valid session → dashboard works
  }
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } catch (err: any) {
      // Server error messages: "Invalid credentials.", "Account pending approval.", etc.
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  //  PAYMENT SUBMISSION
  // ══════════════════════════════════════════════════════════════
  //
  //  enrollmentApi.submit() sends user_id in the body.
  //  This works even for pending users (no JWT required on this endpoint
  //  IF your server accepts user_id from body — verify this with your backend).
  //
  const handlePayment = async () => {
    if (!resolvedUser) {
      setPaymentError('Session expired. Please refresh the page.');
      return;
    }
    if (!transactionId.trim()) {
      setPaymentError('Please enter your Transaction / UPI Reference ID.');
      return;
    }
    setPaymentLoading(true);
    setPaymentError('');
    try {
      await enrollmentApi.submit(courseId, transactionId.trim(), resolvedUser.id);
      setStep('waiting');
    } catch (err: any) {
      setPaymentError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ── Switch account ─────────────────────────────────────────────────────
  //  Logout (clears cookie + AuthContext user state) → back to signup form
  const handleSwitchAccount = async () => {
    try { await logout(); } catch { /* ignore errors */ }
    setResolvedUser(null);
    setName(''); setEmail(''); setPassword('');
    setLoginEmail(''); setLoginPassword('');
    setSignupError(''); setLoginError('');
    setStep('signup');
  };

  // ── Go to login step (in-page, no redirect — preserves course params) ──
  const goToLogin = (prefillEmail?: string) => {
    setLoginEmail(prefillEmail ?? email);
    setLoginError('');
    setLoginPassword('');
    setStep('login');
  };

  // ── Copy UPI ID ───────────────────────────────────────────────────────
  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Step indicator ────────────────────────────────────────────────────
  const stepLabels = ['Account', 'Payment', 'Approval', 'Dashboard'];
  const activeIndex =
    step === 'signup' || step === 'login' ? 0 :
      step === 'payment' ? 1 :
        step === 'waiting' ? 2 : 0;

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {stepLabels.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < activeIndex
                ? 'bg-sky-500 text-white'
                : i === activeIndex
                  ? 'bg-sky-500 text-white ring-4 ring-sky-500/20'
                  : 'bg-gray-100 text-gray-400'}`}
            >
              {i < activeIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold ${i <= activeIndex ? 'text-sky-500' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < stepLabels.length - 1 && (
            <div className={`w-8 h-px mb-5 ${i < activeIndex ? 'bg-sky-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const inp = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-gray-400";
  const lbl = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2";
  const font = { fontFamily: "'DM Sans', sans-serif" };

  // ══════════════════════════════════════════════════════════════
  //  RENDER: DETECT (spinner)
  // ══════════════════════════════════════════════════════════════
  if (step === 'detect') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={font}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-medium">Checking your session…</p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  //  RENDER: WAITING
  // ══════════════════════════════════════════════════════════════
  if (step === 'waiting') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={font}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-sky-500 font-black text-lg uppercase tracking-widest">The Language Hunter</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <StepIndicator />
          <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Approval</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-1">
            Your payment has been submitted for{' '}
            <span className="font-semibold text-gray-800">{courseTitle}</span>.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed mb-6">
            Admin will verify your transaction within{' '}
            <span className="text-amber-500 font-bold">24 hours</span>.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 inline-block">
            <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
            <p className="text-gray-900 font-bold text-sm font-mono">{transactionId}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-8 text-left">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">What happens next?</p>
            <ul className="space-y-2">
              {[
                'Admin reviews your transaction ID',
                'Enrollment gets approved within 24 hours',
                'Access your course from the dashboard',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => {
              // resolvedUser came from signup/login (no token) → go to login page
              // resolvedUser came from authApi.me() (token valid) → go straight to dashboard
              // We detect this by checking AuthContext user (set only when token exists)
              navigate(cameFromLogin ? '/dashboard' : '/fwm/login?redirect=/dashboard');
            }}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-sm"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-gray-400 text-xs mt-3">Check enrollment status in My Courses</p>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  //  RENDER: PAYMENT
  // ══════════════════════════════════════════════════════════════
  if (step === 'payment') return (
    <div className="min-h-screen bg-gray-50 px-4 py-8" style={font}>
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-sky-500 font-black text-lg uppercase tracking-widest mb-1">The Language Hunter</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Complete Payment</h1>
        <p className="text-gray-400 text-sm mb-6">{courseTitle} — ${price}</p>

        <StepIndicator />

        {/* ── Who is paying ── */}
        {resolvedUser && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {resolvedUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{resolvedUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{resolvedUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleSwitchAccount}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3 h-3" /> Switch
            </button>
          </div>
        )}

        {/* ── UPI / QR ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-5">Scan & Pay via UPI</h2>
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-48 h-48 bg-white border border-gray-200 rounded-2xl flex items-center justify-center p-2 shadow-sm">
              {/*
                Replace this placeholder with your real QR code:
                <img src="/qr.png" className="w-full h-full object-contain" alt="UPI QR Code" />
              */}
              <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium text-center leading-relaxed">
                QR Code<br />Replace with<br />real QR image
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">UPI ID</p>
                <p className="text-gray-900 font-bold text-sm truncate">{UPI_ID}</p>
              </div>
              <button
                onClick={copyUPI}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600 font-semibold"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-semibold">OR BANK TRANSFER</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-2">
            {[
              { label: 'Account Name', value: ACCOUNT_NAME },
              { label: 'Bank', value: BANK_NAME },
              { label: 'Account No.', value: ACCOUNT_NO },
              { label: 'IFSC Code', value: IFSC },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-400 text-xs">{label}</span>
                <span className="text-gray-800 font-semibold text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction confirm ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs text-sky-700 font-medium">
              You are enrolling in:{' '}
              <span className="font-bold">{courseTitle}</span> — ${price}
            </p>
          </div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Confirm Your Payment</h2>
          <p className="text-gray-400 text-xs mb-5 leading-relaxed font-medium">
            After paying, enter your UPI Transaction ID or bank reference number below.
          </p>
          <label className={lbl}>Transaction / UPI Reference ID</label>
          <input
            value={transactionId}
            onChange={e => { setTransactionId(e.target.value); setPaymentError(''); }}
            placeholder="e.g. 123456789012"
            className={`${inp} mb-4`}
          />
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-xs mb-4">
              {paymentError}
            </div>
          )}
          <button
            onClick={handlePayment}
            disabled={paymentLoading || !transactionId.trim()}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm"
          >
            {paymentLoading ? 'Submitting…' : 'Submit for Approval →'}
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  //  RENDER: LOGIN
  // ══════════════════════════════════════════════════════════════
  if (step === 'login') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={font}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={() => setStep('signup')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Signup
          </button>
          <div className="text-sky-500 font-black text-xl uppercase tracking-widest">The Language Hunter</div>
          <p className="text-gray-400 text-sm mt-1">Sign in to your existing account</p>
        </div>

        <StepIndicator />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
            <p className="text-xs text-sky-700 font-semibold truncate">
              Enrolling in: {courseTitle} — ${price}
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-xs mb-6">Sign in to continue to payment.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={lbl}>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                placeholder="you@example.com"
                className={inp}
                required
              />
            </div>
            <div>
              <label className={lbl}>Password</label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                  placeholder="••••••••"
                  className={`${inp} pr-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-500 text-sm">{loginError}</p>
                {loginError.toLowerCase().includes('pending') && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    Your account is under review. You can still submit payment — admin will approve it shortly.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm"
            >
              {loginLoading ? 'Signing in…' : 'Sign In & Continue →'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => setStep('signup')}
              className="text-sky-500 hover:text-sky-600 font-semibold transition-colors"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  //  RENDER: SIGNUP (default)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={font}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-sky-500 font-black text-xl uppercase tracking-widest">The Language Hunter</div>
          <p className="text-gray-400 text-sm mt-1">Create your account to enroll</p>
        </div>

        <StepIndicator />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
            <p className="text-xs text-sky-700 font-semibold truncate">
              Enrolling in: {courseTitle} — ${price}
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-400 text-xs mb-6">New here? Fill in your details to get started.</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className={lbl}>Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className={inp}
                required
              />
              {/* Certificate clarification text added below */}
              <p className="mt-1 text-xs text-blue-500">
                Please enter your full, official name. This name will be printed exactly as written on your official completion certificate.
              </p>
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setSignupError(''); }}
                placeholder="you@example.com"
                className={inp}
                required
              />
            </div>
            <div>
              <label className={lbl}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inp} pr-11`}
                  required
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

           {signupError && (
  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
    <p className="text-red-500 text-sm font-semibold">{signupError}</p>

    {(signupError.toLowerCase().includes('already') ||
      signupError.toLowerCase().includes('registered') ||
      signupError.toLowerCase().includes('exist')) && (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-gray-600 leading-relaxed">
          👋 Looks like you already have an account with us! This happens if you've
          purchased a course before.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Just sign in with your existing credentials to continue enrolling
          in <span className="font-semibold text-gray-700">{courseTitle}</span>.
          Your previous courses won't be affected.
        </p>
        <button
          type="button"
          onClick={() => goToLogin(email)}
          className="mt-1 inline-flex items-center gap-1.5 text-sky-600 font-bold text-xs underline underline-offset-2 hover:text-sky-700"
        >
          Sign in with your existing account →
        </button>
      </div>
    )}
  </div>
)}

            <button
              type="submit"
              disabled={signupLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm"
            >
              {signupLoading ? 'Please wait…' : 'Next: Complete Payment →'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-md mt-6">
            Already have an account?{' '}
            <button
              onClick={() => goToLogin(email)}
              className="text-sky-500 hover:text-sky-600 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;