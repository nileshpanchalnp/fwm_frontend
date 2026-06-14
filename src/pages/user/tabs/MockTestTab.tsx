// src/pages/user/tabs/MockTestTab.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  FlaskConical, Clock, Award, AlertCircle, CheckCircle2,
  ChevronRight, Shield, Volume2, PenLine, BookOpen, Headphones,
  X, Hourglass,
} from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Types ─────────────────────────────────────────────────────────
interface MockTestInfo {
  id: number; title: string; description: string;
  total_marks: number; pass_marks: number;
  max_attempts: number; duration_mins: number;
}
interface AttemptInfo {
  id: number; attempt_number: number; score: number;
  total_marks: number; passed: number; status: string;
  completed_at: string; writing_graded_at?: string;
}
interface Question {
  id: number; section: 'reading' | 'listening' | 'writing';
  question_text: string; audio_url: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: string; marks: number;
}
interface ExamResult {
  score?: number;
  autoScore?: number;
  nonWritingMaxMarks?: number;
  writingMaxMarks?: number;
  total_marks: number; pass_marks: number; passed: boolean;
  total_questions: number; correct_count: number; wrong_count: number;
  section_stats: Record<string, { correct: number; wrong: number }>;
  certificate: CertData | null;
  pendingWritingReview: boolean;
  writing_question_count?: number;
}
interface CertData {
  certificate_no: string; score: number; total_marks: number;
  course_title: string; course_level: string; user_name: string;
  issued_at: string; exam_title: string;
}

export function normalizeAudioUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
}

const SECTION_COLORS: Record<string, string> = {
  reading:   'bg-sky-50 border-sky-200 text-sky-700',
  listening: 'bg-purple-50 border-purple-200 text-purple-700',
  writing:   'bg-emerald-50 border-emerald-200 text-emerald-700',
};
const SECTION_ICONS: Record<string, React.ReactNode> = {
  reading:   <BookOpen className="w-3.5 h-3.5" />,
  listening: <Headphones className="w-3.5 h-3.5" />,
  writing:   <PenLine className="w-3.5 h-3.5" />,
};

// ─────────────────────────────────────────────────────────────────
// MINI FRENCH KEYBOARD (inline, compact for exam use)
// ─────────────────────────────────────────────────────────────────
const ACCENT_KEYS = [
  'é','è','ê','ë','à','â','ä','ù','û','ü','ç','î','ï','ô','ö','œ','æ','ÿ',
  'É','È','Ê','Ë','À','Â','Ä','Ù','Û','Ü','Ç','Î','Ï','Ô','Ö','Œ','Æ','«','»','€','…','–','—',
];

const MiniKeyboard: React.FC<{
  onInsert: (char: string) => void;
  onBackspace: () => void;
}> = ({ onInsert, onBackspace }) => {
  const [showUpper, setShowUpper] = useState(false);
  const lower = ACCENT_KEYS.filter(c => c === c.toLowerCase() || !c.match(/[a-zA-Z]/));
  const upper = ACCENT_KEYS.filter(c => c === c.toUpperCase() || !c.match(/[a-zA-Z]/));
  const visible = showUpper ? upper : lower;

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
          French Accent Keys
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowUpper(s => !s)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors
              ${showUpper ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-300'}`}
          >
            {showUpper ? '⇧ ON' : '⇧ OFF'}
          </button>
          <button
            type="button"
            onClick={onBackspace}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-500 border border-red-200 hover:bg-red-200"
          >
            ⌫
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {visible.map((ch, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onInsert(ch)}
            className="w-8 h-7 bg-white border border-emerald-200 rounded text-sm font-bold text-emerald-700
                       hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// WRITING ANSWER INPUT with embedded keyboard
// ─────────────────────────────────────────────────────────────────
const WritingAnswerInput: React.FC<{
  questionId: number;
  marks: number;
  value: string;
  onChange: (val: string) => void;
}> = ({ questionId, marks, value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertChar = useCallback((char: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const next = value.slice(0, s) + char + value.slice(e);
    onChange(next);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = s + char.length;
      el.focus();
    }, 0);
  }, [value, onChange]);

  const handleBackspace = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    let next: string;
    if (s !== e) {
      next = value.slice(0, s) + value.slice(e);
    } else if (s > 0) {
      next = value.slice(0, s - 1) + value.slice(s);
    } else return;
    onChange(next);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = Math.max(0, s !== e ? s : s - 1);
      el.focus();
    }, 0);
  }, [value, onChange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Answer</p>
        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
          {marks} mark{marks !== 1 ? 's' : ''}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        rows={5}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Type your answer here… or use the accent keys below for French characters."
        className="w-full bg-gray-50 border-2 border-emerald-200 focus:border-emerald-400 rounded-xl
                   px-4 py-3 text-sm text-gray-800 outline-none resize-none transition-colors"
        style={{ fontFamily: "'Georgia', serif", lineHeight: 1.7 }}
      />
      <MiniKeyboard onInsert={insertChar} onBackspace={handleBackspace} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// TIMER
// ─────────────────────────────────────────────────────────────────
const useTimer = (durationSecs: number, onExpire: () => void) => {
  const [remaining, setRemaining] = useState(durationSecs);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current!); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, []);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  return { display: `${mins}:${secs}`, remaining, pct: (remaining / durationSecs) * 100 };
};

// ─────────────────────────────────────────────────────────────────
// EXAM PANEL
// ─────────────────────────────────────────────────────────────────
const ExamPanel: React.FC<{
  attemptId: number;
  questions: Question[];
  durationMins: number;
  onComplete: (result: ExamResult) => void;
}> = ({ attemptId, questions, durationMins, onComplete }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const warningCount = useRef(0);

  const sections = ['reading', 'listening', 'writing'] as const;
  const grouped: Record<string, Question[]> = { reading: [], listening: [], writing: [] };
  questions.forEach(q => grouped[q.section].push(q));

  const submitExam = useCallback(async (abandoned = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const endpoint = abandoned
        ? `/mock-tests/attempt/${attemptId}/abandon`
        : `/mock-tests/attempt/${attemptId}/submit`;
      const result = await api(endpoint, { method: 'POST', body: JSON.stringify({ answers }) });
      if (!abandoned) onComplete(result);
    } catch {
      setSubmitting(false);
    }
  }, [answers, attemptId, submitting]);

  useEffect(() => {
    const handleBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName === 'IFRAME') return;
        warningCount.current++;
        if (warningCount.current === 1) {
          setWarning('⚠ Warning: Do not switch tabs or windows during the exam!');
          setTimeout(() => setWarning(null), 4000);
        } else {
          submitExam(true);
        }
      }, 50);
    };
    const handleVisibility = () => {
      if (document.hidden) {
        warningCount.current++;
        if (warningCount.current === 1) {
          setWarning('⚠ Warning: Do not switch tabs or windows during the exam!');
          setTimeout(() => setWarning(null), 4000);
        } else {
          submitExam(true);
        }
      }
    };
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [submitExam]);

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      submitExam(true);
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [submitExam]);

  const { display: timerDisplay, remaining, pct } = useTimer(
    durationMins * 60,
    () => submitExam(false)
  );

  const q = questions[current];
  const answered = Object.keys(answers).length;

  const examContent = (
    <div
      className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", zIndex: 9999 }}
    >
      {warning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-3 text-sm font-semibold shadow-lg">
          {warning} (Next violation will auto-submit your exam)
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Mock Exam in Progress</p>
            <p className="text-[10px] text-gray-400">{answered}/{questions.length} answered</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Shield className="w-3.5 h-3.5 text-gray-300" />
          Do not switch tabs or close this window
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm
          ${remaining < 300 ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
          <Clock className="w-4 h-4" />
          {timerDisplay}
        </div>
      </div>

      <div className="h-1 bg-gray-200 flex-shrink-0">
        <div className="h-1 bg-indigo-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigator */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          {sections.map(sec => {
            const qs = grouped[sec];
            if (!qs.length) return null;
            return (
              <div key={sec} className="mb-4">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5 ${SECTION_COLORS[sec].split(' ')[2]}`}>
                  {SECTION_ICONS[sec]} {sec}
                  {sec === 'writing' && (
                    <span className="ml-1 text-emerald-500 text-[9px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      Manual grade
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {qs.map(qItem => {
                    const realIdx = questions.indexOf(qItem);
                    const isAnswered = answers[qItem.id] !== undefined;
                    const isCurrent = realIdx === current;
                    return (
                      <button key={qItem.id} onClick={() => setCurrent(realIdx)}
                        className={`w-full aspect-square rounded-lg text-[10px] font-bold transition-all
                          ${isCurrent ? 'bg-indigo-500 text-white' :
                            isAnswered
                              ? sec === 'writing'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {realIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Writing notice in sidebar */}
          {grouped.writing.length > 0 && (
            <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <PenLine className="w-3 h-3" /> Writing Section
              </p>
              <p className="text-[10px] text-emerald-700 leading-relaxed">
                Writing answers are reviewed and marked by your instructor. Results shown after grading.
              </p>
            </div>
          )}

          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Security
            </p>
            <ul className="text-[10px] text-red-500 space-y-1 leading-relaxed">
              <li>• Do not switch browser tabs</li>
              <li>• Do not close this window</li>
              <li>• 2nd violation = auto-submit</li>
            </ul>
          </div>
        </aside>

        {/* Main question */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${SECTION_COLORS[q.section]}`}>
              {SECTION_ICONS[q.section]}
              {q.section.charAt(0).toUpperCase() + q.section.slice(1)}
              {' · '}Q{current + 1} of {questions.length}
              {q.section === 'writing' && (
                <span className="ml-1 text-[10px] font-bold text-emerald-600">— Manually graded by instructor</span>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              {/* Listening audio */}
              {q.section === 'listening' && q.audio_url && (
                <div className="mb-5 bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> Audio — Listen carefully
                  </p>
                  <iframe
                    src={normalizeAudioUrl(q.audio_url)}
                    width="100%" height="80"
                    allow="autoplay"
                    className="rounded-lg"
                    style={{ border: 'none' }}
                  />
                </div>
              )}

              {/* Writing notice banner */}
              {q.section === 'writing' && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <Hourglass className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <strong>Writing question ({q.marks} marks):</strong> Your answer will be reviewed and marked by your instructor after you submit.
                  </p>
                </div>
              )}

              <p className="text-base font-semibold text-gray-900 mb-6 leading-relaxed">{q.question_text}</p>

              {/* MCQ options */}
              {q.section !== 'writing' ? (
                <div className="space-y-3">
                  {(['a','b','c','d'] as const).map(opt => {
                    const label = q[`option_${opt}` as keyof Question] as string;
                    if (!label) return null;
                    const selected = answers[q.id] === opt;
                    return (
                      <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                          ${selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0
                          ${selected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {opt.toUpperCase()}
                        </span>
                        <span className={`text-sm font-medium ${selected ? 'text-indigo-800' : 'text-gray-700'}`}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Writing with embedded French keyboard
                <WritingAnswerInput
                  questionId={q.id}
                  marks={q.marks}
                  value={answers[q.id] || ''}
                  onChange={val => setAnswers(a => ({ ...a, [q.id]: val }))}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">
                ← Previous
              </button>
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl">
                  Next →
                </button>
              ) : (
                <button onClick={() => {
                  const unanswered = questions.length - answered;
                  if (unanswered > 0) {
                    if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
                  }
                  submitExam(false);
                }}
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 rounded-xl shadow-sm">
                  {submitting ? 'Submitting…' : '✓ Submit Exam'}
                </button>
              )}
            </div>

            {/* Mobile nav grid */}
            <div className="lg:hidden">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Questions</p>
              <div className="grid grid-cols-8 gap-1.5">
                {questions.map((qItem, idx) => {
                  const isAnswered = answers[qItem.id] !== undefined;
                  return (
                    <button key={qItem.id} onClick={() => setCurrent(idx)}
                      className={`aspect-square rounded-lg text-[10px] font-bold transition-all
                        ${idx === current ? 'bg-indigo-500 text-white' :
                          isAnswered ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-500'}`}>
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3" /> Exam Security Active
                </p>
                <p className="text-[10px] text-red-500">Switching tabs or closing the window will auto-submit your exam.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return ReactDOM.createPortal(examContent, document.body);
};

// ─────────────────────────────────────────────────────────────────
// RESULT SCREEN — handles both instant results and pending-review
// ─────────────────────────────────────────────────────────────────
const ResultScreen: React.FC<{
  result: ExamResult;
  onCertificate: (cert: CertData) => void;
  onClose: () => void;
}> = ({ result, onCertificate, onClose }) => {
  const isPending = result.pendingWritingReview;
  const displayScore = result.score ?? result.autoScore ?? 0;
  const pct = Math.round((displayScore / result.total_marks) * 100);

  const content = (
    <div
      className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif", zIndex: 9999 }}
    >
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">

        {/* Header */}
        <div className={`px-8 py-8 text-center ${
          isPending ? 'bg-amber-500' : result.passed ? 'bg-emerald-500' : 'bg-red-400'
        }`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isPending
              ? <Hourglass className="w-8 h-8 text-white" />
              : result.passed
                ? <Award className="w-8 h-8 text-white" />
                : <X className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-2xl font-black text-white mb-1">
            {isPending ? 'Exam Submitted!' : result.passed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h2>
          <p className="text-white/80 text-sm">
            {isPending
              ? 'Your writing section is pending instructor review.'
              : result.passed
                ? 'You passed the mock exam!'
                : 'You did not reach the passing score.'}
          </p>
        </div>

        {/* Pending writing review explanation */}
        {isPending && (
          <div className="px-8 py-5 bg-amber-50 border-b border-amber-100">
            <div className="flex items-start gap-3">
              <Hourglass className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-bold">What happens next?</p>
                <p>Your instructor will review your writing answers and assign marks. Once graded, your final score and result will be updated.</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white border border-amber-200 rounded-lg p-2">
                    <p className="text-amber-500 font-bold">Reading + Listening</p>
                    <p className="font-black text-gray-800 text-lg">{result.autoScore ?? 0} / {result.nonWritingMaxMarks ?? 0}</p>
                    <p className="text-gray-400">Auto-graded ✓</p>
                  </div>
                  <div className="bg-white border border-amber-200 rounded-lg p-2">
                    <p className="text-amber-500 font-bold">Writing</p>
                    <p className="font-black text-gray-800 text-lg">? / {result.writingMaxMarks ?? 0}</p>
                    <p className="text-amber-600">Pending review ⏳</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score (only for non-pending) */}
        {!isPending && (
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Your Score</span>
              <span className={`text-2xl font-black ${result.passed ? 'text-emerald-600' : 'text-red-400'}`}>
                {displayScore} / {result.total_marks}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${result.passed ? 'bg-emerald-500' : 'bg-red-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0</span>
              <span className="text-amber-600 font-bold">Pass: {result.pass_marks}</span>
              <span>{result.total_marks}</span>
            </div>
          </div>
        )}

        {/* Stats (for non-pending) */}
        {!isPending && (
          <div className="px-8 py-5 grid grid-cols-3 gap-4 border-b border-gray-100">
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{result.total_questions}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Total</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-emerald-600">{result.correct_count}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-red-400">{result.wrong_count}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Wrong</p>
            </div>
          </div>
        )}

        {/* Section breakdown (for non-pending) */}
        {!isPending && Object.keys(result.section_stats || {}).length > 0 && (
          <div className="px-8 py-5 border-b border-gray-100 space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">By Section</p>
            {Object.entries(result.section_stats).map(([sec, s]) => (
              <div key={sec} className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${SECTION_COLORS[sec]}`}>
                  {SECTION_ICONS[sec]} {sec}
                </div>
                <span className="text-xs text-gray-600">
                  <span className="text-emerald-600 font-bold">{s.correct} ✓</span>
                  {' · '}
                  <span className="text-red-400 font-bold">{s.wrong} ✗</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="px-8 py-6 space-y-3">
          {!isPending && result.passed && result.certificate && (
            <button onClick={() => onCertificate(result.certificate!)}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-sm">
              <Award className="w-4 h-4" /> View & Download Certificate
            </button>
          )}
          <button onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">
            {isPending ? 'OK, Got It' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

// ─────────────────────────────────────────────────────────────────
// CERTIFICATE VIEW
// ─────────────────────────────────────────────────────────────────
const CertificateView: React.FC<{ cert: CertData; onClose: () => void }> = ({ cert, onClose }) => {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const el = certRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Certificate - ${cert.certificate_no}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;600;700&display=swap');
        body { margin: 0; background: #fff; }
        .cert { width: 900px; min-height: 640px; margin: 0 auto; padding: 60px; box-sizing: border-box;
          background: linear-gradient(135deg, #f0f9ff 0%, #fefce8 50%, #f0fdf4 100%);
          border: 8px double #c9a84c; font-family: 'DM Sans', sans-serif; }
        .inner { border: 2px solid #c9a84c40; padding: 40px; min-height: 520px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        h1 { font-family: 'Playfair Display', serif; font-size: 42px; color: #1e293b; margin: 0 0 4px; }
        .sub { color: #64748b; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 32px; }
        .name { font-family: 'Playfair Display', serif; font-size: 36px; color: #0ea5e9; font-weight: 700; margin-bottom: 8px; }
        .course { font-family: 'Playfair Display', serif; font-size: 22px; color: #1e293b; font-weight: 700; }
        .score-box { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 32px; border-radius: 50px; font-size: 15px; font-weight: 700; margin: 16px 0; }
        .footer { margin-top: auto; display: flex; justify-content: space-between; width: 100%; padding-top: 32px; border-top: 1px solid #e2e8f0; }
        .seal { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #c9a84c, #f59e0b); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; text-align: center; line-height: 1.3; }
      </style></head>
      <body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const pct = Math.round((cert.score / cert.total_marks) * 100);

  const content = (
    <div
      className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center p-4 overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif", zIndex: 9999 }}
    >
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1.5">
            ← Back
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm">
            ⬇ Download Certificate
          </button>
        </div>

        <div ref={certRef} style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #fefce8 50%, #f0fdf4 100%)',
          border: '8px double #c9a84c', padding: '60px', borderRadius: '24px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ border: '2px solid rgba(201,168,76,0.25)', padding: '40px', borderRadius: '16px', minHeight: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: '#0ea5e9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'white', fontSize: 24, fontWeight: 900 }}>LH</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, color: '#1e293b', margin: '0 0 4px' }}>Certificate of Achievement</h1>
            <p style={{ color: '#64748b', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 32 }}>Language Hunter Academy</p>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>This certifies that</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#0ea5e9', fontWeight: 700, marginBottom: 8, borderBottom: '2px solid rgba(14,165,233,0.18)', paddingBottom: 12 }}>{cert.user_name}</p>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: '16px 0 8px', maxWidth: 600 }}>has successfully completed the mock examination for</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1e293b', fontWeight: 700, marginBottom: 8 }}>{cert.course_title}</p>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>{cert.exam_title}</p>
            <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', padding: '12px 32px', borderRadius: 50, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              Score: {cert.score} / {cert.total_marks} ({pct}%)
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: 32, borderTop: '1px solid #e2e8f0', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>Certificate No.</p>
                <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, marginTop: 4, fontFamily: 'monospace' }}>{cert.certificate_no}</p>
              </div>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>OFFICIAL<br/>SEAL</div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>Date Issued</p>
                <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, marginTop: 4 }}>
                  {new Date(cert.issued_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

// ─────────────────────────────────────────────────────────────────
// EXAM INFO MODAL
// ─────────────────────────────────────────────────────────────────
const ExamInfoModal: React.FC<{
  info: MockTestInfo;
  attempts: AttemptInfo[];
  attemptsLeft: number;
  hasPassed: boolean;
  onStart: () => void;
  onClose: () => void;
}> = ({ info, attempts, attemptsLeft, hasPassed, onStart, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-indigo-600 px-8 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-5 h-5 text-indigo-200" />
                <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Mock Examination</span>
              </div>
              <h2 className="text-xl font-black">{info.title}</h2>
              {info.description && <p className="text-indigo-200 text-sm mt-1">{info.description}</p>}
            </div>
            <button onClick={onClose} className="text-indigo-300 hover:text-white p-1 mt-1"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Marks', val: info.total_marks, color: 'bg-sky-50 text-sky-700' },
              { label: 'Pass Marks', val: `${info.pass_marks} (for certificate)`, color: 'bg-amber-50 text-amber-700' },
              { label: 'Duration', val: `${info.duration_mins} minutes`, color: 'bg-purple-50 text-purple-700' },
              { label: 'Max Attempts', val: info.max_attempts, color: 'bg-gray-50 text-gray-700' },
            ].map(({ label, val, color }) => (
              <div key={label} className={`${color} rounded-xl p-3`}>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
                <p className="text-sm font-bold mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Attempt status */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your Attempts</p>
            {attempts.length === 0 ? (
              <p className="text-sm text-gray-500">No attempts yet.</p>
            ) : (
              <div className="space-y-2">
                {attempts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-semibold">Attempt #{a.attempt_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">
                        {a.status === 'pending_review' ? '? ' : `${a.score}/`}{a.total_marks}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                        ${a.status === 'pending_review'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : a.passed
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-red-50 text-red-400 border-red-200'}`}>
                        {a.status === 'pending_review' ? '⏳ Under Review' : a.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">Attempts remaining</span>
              <span className={`text-sm font-black ${attemptsLeft > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                {attemptsLeft} / {info.max_attempts}
              </span>
            </div>
          </div>

          {/* Writing section notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <PenLine className="w-3.5 h-3.5" /> Writing Section Note
            </p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Writing answers are manually reviewed by your instructor. After submitting, your reading and listening score is shown immediately. Your writing marks will be added by the instructor, and your final result will be updated.
            </p>
          </div>

          {/* Security rules */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Exam Rules & Security
            </p>
            <ul className="text-xs text-red-600 space-y-1.5">
              <li>• Do not switch browser tabs during the exam</li>
              <li>• Do not minimize or close the window</li>
              <li>• If you switch tabs twice, your exam is auto-submitted</li>
              <li>• Clicking the audio player is safe and will not trigger a warning</li>
              <li>• Writing answers are typed in the writing area with the French accent keyboard</li>
            </ul>
          </div>

          {attemptsLeft > 0 && !hasPassed && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-indigo-500" />
              <span className="text-xs text-gray-600">
                I have read and agree to the exam rules. I understand writing answers will be graded by my instructor.
              </span>
            </label>
          )}

          {hasPassed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-700">You have already passed this exam!</p>
              <p className="text-xs text-emerald-600 mt-1">Your certificate is available in the Certificates tab.</p>
            </div>
          ) : attemptsLeft <= 0 ? (
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600">No attempts remaining</p>
              <p className="text-xs text-gray-400 mt-1">You have used all {info.max_attempts} attempts.</p>
            </div>
          ) : (
            <button onClick={onStart} disabled={!agreed}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm shadow-sm transition-colors">
              <ChevronRight className="w-4 h-4" /> Start Exam — Attempt {attempts.length + 1} of {info.max_attempts}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN MockTestTab
// ─────────────────────────────────────────────────────────────────
interface Props {
  courseDetail: { id: number; title: string };
}

type View = 'idle' | 'modal' | 'exam' | 'result' | 'certificate';

const MockTestTab: React.FC<Props> = ({ courseDetail }) => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<MockTestInfo | null>(null);
  const [attempts, setAttempts] = useState<AttemptInfo[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [hasPassed, setHasPassed] = useState(false);
  const [view, setView] = useState<View>('idle');
  const [examData, setExamData] = useState<{ attemptId: number; questions: Question[]; durationMins: number } | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [certData, setCertData] = useState<CertData | null>(null);

  const load = () => {
    setLoading(true);
    api(`/mock-tests/course/${courseDetail.id}`)
      .then(d => {
        setInfo(d.mockTest);
        setAttempts(d.attempts || []);
        setAttemptsLeft(d.attempts_left ?? 0);
        setHasPassed(d.has_passed || false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [courseDetail.id]);

  const handleStart = async () => {
    if (!info) return;
    setView('exam');
    const d = await api(`/mock-tests/${info.id}/start`, { method: 'POST' });
    setExamData({ attemptId: d.attemptId, questions: d.questions, durationMins: d.test.duration_mins });
  };

  const handleExamComplete = (res: ExamResult) => {
    setResult(res);
    setView('result');
    load();
  };

  const pendingReviewAttempts = attempts.filter(a => a.status === 'pending_review');

  return (
    <>
      {view === 'exam' && examData && (
        <ExamPanel
          attemptId={examData.attemptId}
          questions={examData.questions}
          durationMins={examData.durationMins}
          onComplete={handleExamComplete}
        />
      )}
      {view === 'result' && result && (
        <ResultScreen
          result={result}
          onCertificate={cert => { setCertData(cert); setView('certificate'); }}
          onClose={() => setView('idle')}
        />
      )}
      {view === 'certificate' && certData && (
        <CertificateView cert={certData} onClose={() => setView('idle')} />
      )}

      <div className="flex flex-col items-center justify-center py-16 text-center">
        {view === 'modal' && info && (
          <ExamInfoModal
            info={info}
            attempts={attempts}
            attemptsLeft={attemptsLeft}
            hasPassed={hasPassed}
            onStart={() => { setView('idle'); handleStart(); }}
            onClose={() => setView('idle')}
          />
        )}

        {loading ? (
          <div className="animate-pulse text-gray-400 text-sm">Loading mock test…</div>
        ) : !info ? (
          <>
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <FlaskConical className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Mock Test</h2>
            <p className="text-gray-400 text-sm max-w-sm">No mock test has been configured for this course yet. Please check back later.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <FlaskConical className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{info.title}</h2>
            {info.description && <p className="text-gray-500 text-sm mb-4 max-w-sm">{info.description}</p>}

            <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-full font-semibold">
                <Clock className="w-3.5 h-3.5" /> {info.duration_mins} min
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-semibold">
                <Award className="w-3.5 h-3.5" /> Pass: {info.pass_marks}/{info.total_marks}
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full font-semibold">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left
              </span>
            </div>

            {/* Pending review notice */}
            {pendingReviewAttempts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-2">
                  <Hourglass className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-amber-800">Writing Review Pending</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Attempt #{pendingReviewAttempts[0].attempt_number} is being reviewed by your instructor.
                      Your final result will appear here once grading is complete.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Past attempts */}
            {attempts.length > 0 && (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-6 w-full max-w-sm text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Past Attempts</p>
                {attempts.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-xs text-gray-600">Attempt #{a.attempt_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">
                        {a.status === 'pending_review' ? '?' : a.score}/{a.total_marks}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                        ${a.status === 'pending_review'
                          ? 'bg-amber-50 text-amber-600'
                          : a.passed
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-400'}`}>
                        {a.status === 'pending_review' ? '⏳' : a.passed ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasPassed ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 max-w-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-700">You've already passed!</p>
                <p className="text-xs text-emerald-600 mt-1">Your certificate is in the Certificates tab.</p>
              </div>
            ) : attemptsLeft <= 0 ? (
              <div className="bg-gray-100 rounded-2xl p-5 max-w-sm">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-600">No attempts remaining</p>
              </div>
            ) : pendingReviewAttempts.length > 0 ? null : (
              <button onClick={() => setView('modal')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-200 text-sm">
                <FlaskConical className="w-4 h-4" /> Begin Mock Test
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MockTestTab;