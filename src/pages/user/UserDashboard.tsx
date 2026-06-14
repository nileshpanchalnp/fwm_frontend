// src/pages/user/UserDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  enrollmentApi, Enrollment, Faq, faqApi,
  CourseUnit,
} from '../../api/client';
import {
  computeAccessInfo, AccessPhase, CERT_GRACE_DAYS,
} from '../../api/client';
import {
  BookOpen, Headphones, Bell, Shield, Clock,
  Menu, X, HelpCircle, PenLine, FlaskConical,
  ChevronDown, ChevronUp, LogOut, Award, CheckCircle2,
  XCircle, AlertTriangle, RefreshCw, Info, Smartphone,
  Monitor, ExternalLink, RotateCcw,
} from 'lucide-react';
import Company_Logo from '../../img/sattvion_logo_two.png';

import ReadingTab from './tabs/ReadingTab';
import ListeningTab from './tabs/ListeningTab';
import WritingTab from './tabs/WritingTab';
import MockTestTab from './tabs/MockTestTab';
import CertificatesTab from './tabs/CertificatesTab';
import RevisionTab from './tabs/RevisionTab';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const formatDate = (dateStr: string | Date) => {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ═══════════════════════════════════════════════════════════════
   MOBILE POPUP
═══════════════════════════════════════════════════════════════ */
const MobileExperiencePopup: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <AnimatePresence>
    <motion.div
      key="mob-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(5px)' }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
        <div className="px-6 py-7 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center"><Smartphone className="w-6 h-6 text-sky-500" /></div>
            <span className="text-gray-300 text-lg font-light">→</span>
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center"><Monitor className="w-6 h-6 text-indigo-500" /></div>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Best on a Larger Screen</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            For the best learning experience, we recommend opening this portal on a{' '}
            <span className="font-semibold text-gray-700">desktop or tablet</span>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">Some features like PDF viewing and video playback may be limited on mobile browsers.</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <a href={window.location.href} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm">
              <ExternalLink className="w-4 h-4" /> Open in Browser
            </a>
            <button onClick={onDismiss} className="w-full text-gray-400 hover:text-gray-600 font-medium text-sm py-3 rounded-xl transition-colors">
              Continue Anyway
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════════
   TERMS POPUP
═══════════════════════════════════════════════════════════════ */
const TermsPopup: React.FC<{ courseName: string; onClose: () => void }> = ({ courseName, onClose }) => {
  const terms = [
    { title: 'Course Access Duration', body: 'Your access is valid for the number of days specified at enrollment. After expiry, all course content becomes inaccessible until you renew.' },
    { title: 'Early Certification & Grace', body: `If you pass the mock test and earn your certificate before the enrollment end date, your course access ends exactly ${CERT_GRACE_DAYS} days after the certificate issue date. This grace period lets you review materials post-certification.` },
    { title: 'Revision Window', body: 'Some courses include a revision period counted from your enrollment start date. During revision, regular reading and listening content is locked but you can still access Revision Units, Writing and Certificates.' },
    { title: 'Content Protection', body: 'All course content is strictly protected. Downloading, screen-recording, or redistribution is prohibited.' },
    { title: 'Mock Test Rules', body: 'Each course has a fixed number of mock test attempts. The timer cannot be paused once started.' },
    { title: 'Certificate Validity', body: 'A certificate is issued only upon achieving the minimum passing score. Each certificate is non-transferable.' },
    { title: 'Renewal Policy', body: 'Expired enrollments can be renewed via a new transaction ID. Renewal is subject to admin approval within 24 hours.' },
    { title: 'No Refund Policy', body: 'Course fees are non-refundable once your enrollment has been approved.' },
    { title: 'Account Responsibility', body: 'Keep your credentials secure. Sharing access may result in permanent account termination.' },
  ];
  return (
    <AnimatePresence>
      <motion.div key="terms-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
        <motion.div initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center"><Info className="w-4 h-4 text-sky-500" /></div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Terms & Conditions</h2>
                <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{courseName}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {terms.map((term, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-sky-600">{i + 1}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">{term.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{term.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button onClick={onClose} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3 rounded-xl transition-all">I Understand</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CERT GRACE BANNER
═══════════════════════════════════════════════════════════════ */
const CertGraceBanner: React.FC<{ certIssuedAt: string; enrollmentExpiresAt: string }> = ({ certIssuedAt, enrollmentExpiresAt }) => {
  const graceEnd = new Date(certIssuedAt);
  graceEnd.setDate(graceEnd.getDate() + CERT_GRACE_DAYS);
  const now = new Date();
  const originalExpiry = new Date(enrollmentExpiresAt);
  if (graceEnd >= originalExpiry) return null;
  if (graceEnd <= now) return null;
  const daysLeft = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return (
    <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2.5">
      <div className="flex items-center gap-2.5">
        <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          🎉 Certificate earned! Access extended by <span className="font-bold">{CERT_GRACE_DAYS} days</span> from cert date —
          expires in <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
          {' '}on <span className="font-bold">{formatDate(graceEnd)}</span>.
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   REVISION BANNER (top of course view during revision)
═══════════════════════════════════════════════════════════════ */
const RevisionBanner: React.FC<{ daysLeft: number | null; endsAt: Date | null }> = ({ daysLeft, endsAt }) => (
  <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2.5">
    <div className="flex items-center gap-2.5">
      <RotateCcw className="w-4 h-4 text-amber-500 flex-shrink-0" />
      <p className="text-xs text-amber-700 font-medium">
        📚 Revision mode — reading &amp; listening locked.
        {daysLeft != null && endsAt && (
          <> <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span> until {formatDate(endsAt)}.</>
        )}
        {' '}Revision units, Writing &amp; Certificates remain accessible.
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   FAQ PANEL
═══════════════════════════════════════════════════════════════ */
const FaqPanel: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => { faqApi.getAll().then(d => { setFaqs(d.faqs); setLoading(false); }); }, []);
  if (loading) return <div className="text-center py-16 text-gray-400 text-sm animate-pulse">Loading FAQs…</div>;
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <HelpCircle className="w-10 h-10 mx-auto mb-3 text-sky-400" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">Help & FAQ</h2>
        <p className="text-gray-400 text-sm">Everything you need to know about using this portal.</p>
      </div>
      {faqs.map((faq, i) => (
        <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors" onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-sky-500 flex-shrink-0">{i + 1}</span>
              <span className="text-sm font-semibold text-gray-800">{faq.question}</span>
            </div>
            {open === i ? <ChevronUp className="w-4 h-4 text-sky-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </button>
          {open === i && (
            <div className="px-6 pb-5 border-t border-gray-50">
              <p className="text-sm text-gray-500 leading-relaxed mt-3 ml-9">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EXPIRED COURSE SCREEN
═══════════════════════════════════════════════════════════════ */
const ExpiredCourseScreen: React.FC<{
  enrollment: Enrollment;
  onBrowse: () => void;
}> = ({ enrollment, onBrowse }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="max-w-sm w-full">
        <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mb-5 mx-auto">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Course Access Expired</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Your access to <span className="font-semibold text-gray-800">{enrollment.title}</span> has ended.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">How to renew?</p>
              <p className="text-xs text-gray-500 leading-relaxed">Contact your admin or purchase a new enrollment. Once approved, your access will be restored.</p>
            </div>
          </div>
        </div>

        <button onClick={onBrowse} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm">
          Browse Other Courses
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ENROLLMENT CARD (sidebar)
═══════════════════════════════════════════════════════════════ */
interface EnrollmentCardProps {
  enrollment: Enrollment;
  certIssuedAt?: string | null;
  isActive: boolean;
  onClick: () => void;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ enrollment, certIssuedAt, isActive, onClick }) => {
  // Pass enrolled_at so revision window is computed from enrollment start
  const info = computeAccessInfo(
    enrollment.expires_at,
    certIssuedAt ?? null,
    enrollment.revision_days ?? null,
    enrollment.enrolled_at,
  );
  const isFullyExpired = info.phase === 'expired';
  const isRevision = info.phase === 'revision';

  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
        ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
        ${isFullyExpired ? 'opacity-60' : ''}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
        ${isFullyExpired ? 'bg-red-500/70' : isRevision ? 'bg-amber-500' : 'bg-sky-500'}`}>
        {isFullyExpired
          ? <XCircle className="w-3.5 h-3.5 text-white" />
          : isRevision
            ? <RotateCcw className="w-3.5 h-3.5 text-white" />
            : <BookOpen className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold truncate">{enrollment.title}</p>
        <p className={`text-[10px] font-medium mt-0.5 ${isFullyExpired ? 'text-red-400' : isRevision ? 'text-amber-400' : 'text-sky-400'}`}>
          {enrollment.level}
        </p>
        {info.phaseEndsAt && (
          <p className={`text-[10px] font-semibold mt-0.5
            ${isFullyExpired ? 'text-red-400' : isRevision ? 'text-amber-400' : 'text-slate-500'}`}>
            {isFullyExpired
              ? `Expired ${formatDate(info.phaseEndsAt)}`
              : isRevision
                ? `Revision · ${info.daysLeft}d left`
                : `Expires ${formatDate(info.phaseEndsAt)}`}
          </p>
        )}
      </div>
      {isFullyExpired && (
        <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">EXP</span>
      )}
      {isRevision && (
        <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">REV</span>
      )}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COURSE OVERVIEW (my courses page)
═══════════════════════════════════════════════════════════════ */
const CourseOverview: React.FC<{
  approvedEnrollments: Enrollment[];
  pendingEnrollments: Enrollment[];
  certMap: Record<number, string>;
  onSelectCourse: (e: Enrollment) => void;
  onBrowse: () => void;
}> = ({ approvedEnrollments, pendingEnrollments, certMap, onSelectCourse, onBrowse }) => {
  const getInfo = (e: Enrollment) =>
    computeAccessInfo(e.expires_at, certMap[e.course_id] ?? null, e.revision_days ?? null, e.enrolled_at);

  const active = approvedEnrollments.filter(e => getInfo(e).phase !== 'expired');
  const expired = approvedEnrollments.filter(e => getInfo(e).phase === 'expired');

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6">
      {approvedEnrollments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{approvedEnrollments.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Enrolled</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{active.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Active</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{expired.length}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Expired</p>
          </div>
        </div>
      )}

      {/* Active courses */}
      {active.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Active Courses</p>
          <div className="space-y-3">
            {active.map(enrollment => {
              const info = getInfo(enrollment);
              const certAt = certMap[enrollment.course_id] ?? null;
              const isRev = info.phase === 'revision';
              return (
                <button key={enrollment.id} onClick={() => onSelectCourse(enrollment)}
                  className={`w-full rounded-2xl border shadow-sm p-5 text-left hover:shadow-md transition-all group
                    ${isRev ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-white border-gray-100 hover:border-sky-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                        ${isRev ? 'bg-amber-400 group-hover:bg-amber-500' : 'bg-sky-500 group-hover:bg-sky-600'}`}>
                        {isRev ? <RotateCcw className="w-6 h-6 text-white" /> : <BookOpen className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{enrollment.title}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${isRev ? 'text-amber-600' : 'text-sky-500'}`}>{enrollment.level}</p>
                        {info.phaseEndsAt && (
                          <p className={`text-[11px] font-semibold mt-1 ${info.daysLeft != null && info.daysLeft <= 7 ? 'text-amber-500' : 'text-gray-400'}`}>
                            {isRev ? `Revision ends ${formatDate(info.phaseEndsAt)}` : `Expires ${formatDate(info.phaseEndsAt)}`}
                            {certAt && !isRev && <span className="ml-1 text-[10px] text-sky-400 font-bold">(cert +{CERT_GRACE_DAYS}d)</span>}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0
                      ${isRev ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                      {isRev ? <><RotateCcw className="w-3 h-3" /> Revision</> : <><CheckCircle2 className="w-3 h-3" /> Active</>}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className={`text-xs font-semibold ${isRev ? 'text-amber-600' : 'text-sky-600 group-hover:text-sky-700'}`}>
                      {isRev ? 'Open Revision →' : 'Continue Learning →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Expired */}
      {expired.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Expired Courses</p>
          <div className="space-y-3">
            {expired.map(enrollment => {
              const info = getInfo(enrollment);
              return (
                <div key={enrollment.id} className="w-full bg-white rounded-2xl border border-red-100 shadow-sm p-5 text-left opacity-70">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><XCircle className="w-6 h-6 text-red-400" /></div>
                      <div>
                        <p className="font-bold text-gray-700 text-sm">{enrollment.title}</p>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">{enrollment.level}</p>
                        {info.phaseEndsAt && <p className="text-[11px] font-semibold text-red-500 mt-1">Expired {formatDate(info.phaseEndsAt)}</p>}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0">
                      <XCircle className="w-3 h-3" /> Expired
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending */}
      {pendingEnrollments.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Pending Approval</p>
          <div className="space-y-3">
            {pendingEnrollments.map(enrollment => (
              <div key={enrollment.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0"><Clock className="w-6 h-6 text-amber-500" /></div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{enrollment.title}</p>
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">{enrollment.level}</p>
                    <p className="text-[11px] text-amber-500 font-medium mt-1">Under review — approved within 24 hours</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvedEnrollments.length === 0 && pendingEnrollments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-4 mx-auto"><BookOpen className="w-8 h-8 text-sky-400" /></div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Courses Yet</h2>
          <p className="text-gray-400 text-sm mb-6">Enroll in a course to start your learning journey.</p>
          <button onClick={onBrowse} className="bg-sky-500 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:bg-sky-600 shadow-lg shadow-sky-200">Browse Courses</button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN USER DASHBOARD
═══════════════════════════════════════════════════════════════ */
type DashTab = 'reading' | 'listening' | 'writing' | 'mocktest' | 'certificates' | 'revision';
type MainView = 'overview' | 'course' | 'faq';

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null);
  const [courseDetail, setCourseDetail] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const [certMap, setCertMap] = useState<Record<number, string>>({});

  // Revision curriculum for the active course (unit_type = 'revision')
  const [revisionCurriculum, setRevisionCurriculum] = useState<CourseUnit[]>([]);

  const [mainView, setMainView] = useState<MainView>('overview');
  const [activeTab, setActiveTab] = useState<DashTab>('reading');
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showMobilePopup, setShowMobilePopup] = useState(false);

  const approvedEnrollments = enrollments.filter(e => e.status === 'approved');
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');

  const certFor = (courseId: number): string | null => certMap[courseId] ?? null;

  // Compute access info for active enrollment — pass enrolled_at for correct revision window
  const activeInfo = activeEnrollment
    ? computeAccessInfo(
      activeEnrollment.expires_at,
      certFor(activeEnrollment.course_id),
      activeEnrollment.revision_days ?? null,
      activeEnrollment.enrolled_at,   // ← NEW: revision from enrollment start
    )
    : null;

  // Sidebar partition by phase
  const getInfo = (e: Enrollment) =>
    computeAccessInfo(e.expires_at, certFor(e.course_id), e.revision_days ?? null, e.enrolled_at);

  const activeApproved = approvedEnrollments.filter(e => getInfo(e).phase !== 'expired');
  const expiredApproved = approvedEnrollments.filter(e => getInfo(e).phase === 'expired');

  // Detect mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile && !sessionStorage.getItem('mob-popup-dismissed')) setShowMobilePopup(true);
  }, []);

  // Load certificates
  useEffect(() => {
    const loadCerts = async () => {
      try {
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${BASE}/mock-tests/certificates`, { credentials: 'include' });
        const data = await res.json();
        const map: Record<number, string> = {};
        (data.certificates || []).forEach((cert: any) => {
          if (cert.course_id !== undefined) {
            if (!map[cert.course_id] || new Date(cert.issued_at) > new Date(map[cert.course_id])) {
              map[cert.course_id] = cert.issued_at;
            }
          }
        });
        setCertMap(map);
      } catch (_) { /* non-critical */ }
    };
    loadCerts();
  }, []);

  // Load enrollments — auto-open if exactly one active course
  useEffect(() => {
    enrollmentApi.my().then(d => {
      setEnrollments(d.enrollments);
      const approved = d.enrollments.filter((e: any) => e.status === 'approved');
      const active = approved.filter((e: any) => {
        const info = computeAccessInfo(e.expires_at, null, e.revision_days ?? null, e.enrolled_at);
        return info.phase === 'active' || info.phase === 'cert_grace';
      });
      if (active.length === 1) loadCourse(active[0]);
    });
  }, []);

  const loadCourse = async (enrollment: Enrollment) => {
    setActiveEnrollment(enrollment);
    setMainView('course');
    setSidebarOpen(false);
    setRevisionCurriculum([]);  // reset while loading

    const certAt = certFor(enrollment.course_id);
    const info = computeAccessInfo(
      enrollment.expires_at,
      certAt,
      enrollment.revision_days ?? null,
      enrollment.enrolled_at,
    );

    // Set default tab by phase
    if (info.phase === 'revision') {
      setActiveTab('revision');
    } else if (info.phase === 'expired') {
      setActiveTab('writing');
    } else {
      setActiveTab('reading');
    }

    // Don't fetch course content if fully expired
    if (info.phase === 'expired') {
      setCourseDetail(null);
      return;
    }

    setCourseLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE}/courses/${enrollment.slug}`, { credentials: 'include' });
      const data = await res.json();
      setCourseDetail(data.course);

      // Store revision curriculum from course detail
      setRevisionCurriculum(data.course?.revisionCurriculum || []);

      // Load progress only when content is accessible
      if (info.canAccessContent) {
        const prog = await enrollmentApi.getProgress(enrollment.course_id);
        const map: Record<number, boolean> = {};
        prog.progress.forEach((p: any) => { map[p.topic_id] = !!p.completed; });
        setProgress(map);
      }
    } catch (err) {
      console.error('Failed to load course', err);
    } finally {
      setCourseLoading(false);
    }
  };

  const handleMarkDone = async (topicId: number, done: boolean) => {
    await enrollmentApi.markProgress(topicId, done);
    setProgress(prev => ({ ...prev, [topicId]: done }));
  };

  const handleCertEarned = (courseId: number, issuedAt: string) => {
    setCertMap(prev => ({ ...prev, [courseId]: issuedAt }));
  };

  // Build tabs based on access phase
  const buildTabs = (phase: AccessPhase | undefined): { id: DashTab; label: string; icon: JSX.Element }[] => {
    if (phase === 'revision') {
      return [
        { id: 'revision', label: 'Revision', icon: <RotateCcw className="w-4 h-4" /> },
      ];
    }
    if (phase === 'expired') return [];
    // active / cert_grace — full tab set
    return [
      { id: 'reading', label: 'Reading', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'listening', label: 'Listening', icon: <Headphones className="w-4 h-4" /> },
      { id: 'writing', label: 'Writing', icon: <PenLine className="w-4 h-4" /> },
      { id: 'mocktest', label: 'Mock Test', icon: <FlaskConical className="w-4 h-4" /> },
      { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    ];
  };

  const tabs = buildTabs(activeInfo?.phase);

  /* ── SIDEBAR ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-none truncate">{user?.name}</p>
          <p className="text-slate-400 text-[10px] mt-0.5">Learning Portal</p>
        </div>
        <button onClick={async () => { await logout(); navigate('/'); }} title="Sign Out"
          className="flex-shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
        <div>
          <p className="text-slate-500 text-[10px] font-bold tracking-widest px-3 mb-1.5">MAIN</p>
          <div className="space-y-0.5">
            <button onClick={() => { setMainView('overview'); setActiveEnrollment(null); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${mainView === 'overview' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <BookOpen className={`w-4 h-4 ${mainView === 'overview' ? 'text-white' : 'text-slate-500'}`} />
              <span className="flex-1">My Courses</span>
              {approvedEnrollments.length > 0 && (
                <span className="bg-sky-500/20 text-sky-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-sky-500/30">{approvedEnrollments.length}</span>
              )}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium text-left">
              <Bell className="w-4 h-4 text-slate-500" /> Notifications
              {pendingEnrollments.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{pendingEnrollments.length}</span>
              )}
            </button>
            <button onClick={() => { setMainView('faq'); setActiveEnrollment(null); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${mainView === 'faq' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <HelpCircle className={`w-4 h-4 ${mainView === 'faq' ? 'text-white' : 'text-slate-500'}`} /> Help & FAQ
            </button>
          </div>
        </div>

        {activeApproved.length > 0 && (
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest px-3 mb-1.5">MY COURSES</p>
            <div className="space-y-0.5">
              {activeApproved.map(e => (
                <EnrollmentCard key={e.id} enrollment={e} certIssuedAt={certFor(e.course_id)}
                  isActive={mainView === 'course' && activeEnrollment?.id === e.id}
                  onClick={() => loadCourse(e)} />
              ))}
            </div>
          </div>
        )}

        {expiredApproved.length > 0 && (
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest px-3 mb-1.5">EXPIRED</p>
            <div className="space-y-0.5">
              {expiredApproved.map(e => (
                <EnrollmentCard key={e.id} enrollment={e} certIssuedAt={certFor(e.course_id)}
                  isActive={mainView === 'course' && activeEnrollment?.id === e.id}
                  onClick={() => loadCourse(e)} />
              ))}
            </div>
          </div>
        )}

        {pendingEnrollments.length > 0 && (
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest px-3 mb-1.5">PENDING</p>
            {pendingEnrollments.map(e => (
              <div key={e.id} className="mx-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 text-[10px] font-bold uppercase">Pending Approval</span>
                </div>
                <p className="text-slate-300 text-[11px] truncate">{e.title}</p>
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-center text-slate-500 text-[10px] leading-relaxed px-1">
          Powered by&nbsp;
          <a href="https://digi.sattvion.com/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-slate-300 hover:text-sky-400 transition-colors">
            Sattvion Digi Solutions
            <motion.img src={Company_Logo} alt="Sattvion" className="h-4 w-auto object-contain"
              animate={{ scale: [1, 1.25, 1, 1.2, 1] }}
              transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, times: [0, 0.14, 0.28, 0.42, 0.56] }} />
          </a>
        </p>
      </div>
    </div>
  );

  /* ── RENDER ── */
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {showMobilePopup && (
        <MobileExperiencePopup onDismiss={() => { sessionStorage.setItem('mob-popup-dismissed', '1'); setShowMobilePopup(false); }} />
      )}
      {showTerms && activeEnrollment && (
        <TermsPopup courseName={activeEnrollment.title} onClose={() => setShowTerms(false)} />
      )}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className="hidden lg:flex w-56 flex-col flex-shrink-0" style={{ background: '#1a2332' }}>
        <SidebarContent />
      </aside>
      <aside className={`fixed top-0 left-0 h-full w-56 flex flex-col z-30 shadow-2xl transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: '#1a2332' }}>
        <div className="flex justify-end px-4 pt-4"><button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button></div>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">

        {/* ── FAQ ── */}
        {mainView === 'faq' && (
          <>
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center gap-3 shadow-sm">
              <button className="lg:hidden text-gray-500 p-1.5" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <h1 className="text-sm font-bold text-gray-900">Help & FAQ</h1>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"><FaqPanel /></div>
          </>
        )}

        {/* ── OVERVIEW ── */}
        {mainView === 'overview' && (
          <>
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button className="lg:hidden text-gray-500 p-1.5" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">My Courses</h1>
                  <p className="text-[10px] text-gray-400">
                    {activeApproved.length} active · {expiredApproved.length} expired · {pendingEnrollments.length} pending
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/courses')} className="text-xs font-semibold text-sky-500 hover:text-sky-600 border border-sky-200 bg-sky-50 px-3 py-2 rounded-xl">+ Enroll More</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <CourseOverview approvedEnrollments={approvedEnrollments} pendingEnrollments={pendingEnrollments}
                certMap={certMap} onSelectCourse={loadCourse} onBrowse={() => navigate('/')} />
            </div>
          </>
        )}

        {/* ── COURSE VIEW ── */}
        {mainView === 'course' && activeEnrollment && activeInfo && (
          <>
            {/* Course header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 -ml-1" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
                <button onClick={() => { setMainView('overview'); setActiveEnrollment(null); setCourseDetail(null); setRevisionCurriculum([]); }}
                  className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mr-1">
                  ← Courses
                </button>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h1 className="text-sm font-bold text-gray-900 truncate">{activeEnrollment.title}</h1>
                    <button onClick={() => setShowTerms(true)} title="Terms & Conditions"
                      className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 hover:bg-sky-100 border border-gray-200 hover:border-sky-300 flex items-center justify-center transition-colors group">
                      <Info className="w-3 h-3 text-gray-400 group-hover:text-sky-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{activeEnrollment.level}</p>
                    {activeInfo.phase === 'expired' && (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <XCircle className="w-2.5 h-2.5" /> Expired
                      </span>
                    )}
                    {activeInfo.phase === 'revision' && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <RotateCcw className="w-2.5 h-2.5" /> Revision
                        {activeInfo.daysLeft != null && ` · ${activeInfo.daysLeft}d`}
                      </span>
                    )}
                    {(activeInfo.phase === 'active' || activeInfo.phase === 'cert_grace') && activeInfo.daysLeft != null && activeInfo.daysLeft <= 7 && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <AlertTriangle className="w-2.5 h-2.5" /> Expires Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {activeInfo.phase !== 'expired' && (
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <Shield className="w-3.5 h-3.5 text-gray-300" />
                  <span className="hidden md:inline text-xs text-gray-400 font-medium">Content Protected</span>
                </div>
              )}
            </div>

            {/* Cert grace banner */}
            {activeInfo.phase === 'cert_grace' && certFor(activeEnrollment.course_id) && activeEnrollment.expires_at && (
              <CertGraceBanner certIssuedAt={certFor(activeEnrollment.course_id)!} enrollmentExpiresAt={activeEnrollment.expires_at} />
            )}

            {/* Revision banner */}
            {activeInfo.phase === 'revision' && (
              <RevisionBanner daysLeft={activeInfo.daysLeft} endsAt={activeInfo.phaseEndsAt} />
            )}

            {/* EXPIRED */}
            {activeInfo.phase === 'expired' ? (
              <ExpiredCourseScreen enrollment={activeEnrollment} onBrowse={() => navigate('/fwm/courses')} />

            ) : courseLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading course…</p>
                </div>
              </div>

            ) : (
              <>
                {/* Tab bar */}
                {tabs.length > 0 && (
                  <div className="flex-shrink-0 bg-blue-50 border-b border-gray-200 overflow-x-auto">
                    <div className="flex px-4 sm:px-8">
                      {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center justify-center gap-2 px-5 py-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap
                            ${activeTab === tab.id
                              ? (tab.id === 'revision' ? 'border-amber-500 text-amber-600' : 'border-sky-500 text-sky-600')
                              : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                          {tab.icon} {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">

                  {/* REVISION phase → RevisionTab with revision curriculum */}
                  {activeInfo.phase === 'revision' && (
                    <RevisionTab
                      daysLeft={activeInfo.daysLeft}
                      revisionEndsAt={activeInfo.phaseEndsAt}
                      revisionCurriculum={revisionCurriculum}
                      progress={progress}
                    />
                  )}

                  {/* ACTIVE / CERT_GRACE → normal tabs */}
                  {(activeInfo.phase === 'active' || activeInfo.phase === 'cert_grace') && courseDetail && (
                    <>
                      {activeTab === 'reading' && <ReadingTab courseDetail={courseDetail} progress={progress} onMarkDone={handleMarkDone} />}
                      {activeTab === 'listening' && <ListeningTab courseDetail={courseDetail} progress={progress} onMarkDone={handleMarkDone} />}
                      {activeTab === 'writing' && <WritingTab />}
                      {activeTab === 'certificates' && <CertificatesTab />}
                      {activeTab === 'mocktest' && (
                        <MockTestTab
                          courseDetail={courseDetail}
                          onCertEarned={(issuedAt: string) => handleCertEarned(activeEnrollment.course_id, issuedAt)}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;