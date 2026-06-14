// src/pages/admin/tabs/AdminMockTestTab.tsx
import React, { useEffect, useState } from 'react';
import {
  FlaskConical, Plus, Trash2, ChevronRight, ChevronLeft,
  BookOpen, Award, Users, Clock, CheckCircle2,
  Headphones, PenLine, Save, X, Volume2, Info,
  Hourglass, ClipboardCheck,
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
interface CourseRow {
  id: number; slug: string; title: string; level: string; is_active: number;
  mock_test_id: number | null; mock_title: string | null;
  total_marks: number; pass_marks: number; max_attempts: number; duration_mins: number;
  mt_active: number | null; question_count: number; attempt_count: number;
  pending_review_count: number; cert_count: number;
}

interface Question {
  id?: number;
  section: 'reading' | 'listening' | 'writing';
  question_text: string;
  audio_url: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd' | 'text';
  model_answer: string;
  marks: number;
}

interface MockTestForm {
  title: string; description: string;
  total_marks: number; pass_marks: number;
  max_attempts: number; duration_mins: number;
  questions: Question[];
}

interface AttemptRow {
  id: number; user_name: string; user_email: string;
  attempt_number: number; score: number; total_marks: number;
  passed: number; status: string; completed_at: string;
  certificate_no: string | null; cert_issued_at: string | null;
}

// Writing grading types
interface WritingQuestion {
  id: number; question_text: string; marks: number; model_answer: string;
}
interface PendingAttempt {
  attempt_id: number; attempt_number: number;
  auto_score: number; total_marks: number; pass_marks: number;
  completed_at: string; writing_graded_at: string | null;
  user_id: number; user_name: string; user_email: string;
  mock_test_id: number; exam_title: string;
  course_id: number; course_title: string;
  answers_json: Record<string, string>;
  results_json: Record<string, { isCorrect: boolean; section: string; marks: number }>;
  writing_marks_json: Record<string, number>;
  writing_questions: WritingQuestion[];
}

const EMPTY_QUESTION = (): Question => ({
  section: 'reading', question_text: '', audio_url: '',
  option_a: '', option_b: '', option_c: '', option_d: '',
  correct_answer: 'a', model_answer: '', marks: 1,
});

const SECTION_ICONS: Record<string, React.ReactNode> = {
  reading:   <BookOpen className="w-3.5 h-3.5" />,
  listening: <Headphones className="w-3.5 h-3.5" />,
  writing:   <PenLine className="w-3.5 h-3.5" />,
};
const SECTION_COLORS: Record<string, string> = {
  reading:   'bg-sky-50 text-sky-600 border-sky-200',
  listening: 'bg-purple-50 text-purple-600 border-purple-200',
  writing:   'bg-emerald-50 text-emerald-600 border-emerald-200',
};

// ── Writing section explainer ─────────────────────────────────────
const WritingInfo: React.FC = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
    <div className="flex items-start gap-3">
      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-amber-700 mb-1">How Writing Questions Work (Updated)</p>
        <p className="text-xs text-amber-600 leading-relaxed">
          Writing questions are now <strong>manually graded by admin</strong>. When a student submits an exam with writing questions,
          the status becomes <strong>"Pending Review"</strong>. You will see a <strong>Writing Grading Queue</strong> tab below
          where you assign marks per writing question (0 to max marks). After you submit grades, the final score is calculated
          as Reading + Listening auto-score + your writing marks, and the certificate is issued if they pass.
          The "Model Answer / Keywords" field is shown to you during grading as reference.
        </p>
      </div>
    </div>
  </div>
);

// ── Question Editor ───────────────────────────────────────────────
const QuestionEditor: React.FC<{
  q: Question; idx: number;
  onChange: (idx: number, q: Question) => void;
  onDelete: (idx: number) => void;
}> = ({ q, idx, onChange, onDelete }) => {
  const isWriting = q.section === 'writing';
  const isListening = q.section === 'listening';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Q{idx + 1}</span>
          <select
            value={q.section}
            onChange={e => onChange(idx, { ...q, section: e.target.value as Question['section'], correct_answer: e.target.value === 'writing' ? 'text' : 'a' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer outline-none ${SECTION_COLORS[q.section]}`}
          >
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="writing">Writing</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-gray-400 font-bold">Marks</label>
          <input
            type="number" min={1} value={q.marks}
            onChange={e => onChange(idx, { ...q, marks: +e.target.value })}
            className="w-14 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-center outline-none focus:border-sky-400"
          />
          <button onClick={() => onDelete(idx)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Question</label>
          <textarea
            rows={2} value={q.question_text}
            onChange={e => onChange(idx, { ...q, question_text: e.target.value })}
            placeholder="Enter the question..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-400 resize-none"
          />
        </div>

        {isListening && (
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1 block">
              <Volume2 className="w-3 h-3" /> Audio URL
            </label>
            <input
              value={q.audio_url}
              onChange={e => onChange(idx, { ...q, audio_url: e.target.value })}
              placeholder="https://... (mp3, Google Drive link)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-400"
            />
          </div>
        )}

        {!isWriting && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(['a','b','c','d'] as const).map(opt => (
              <div key={opt} className={`flex items-center gap-2 p-2 rounded-xl border ${q.correct_answer === opt ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                <button
                  onClick={() => onChange(idx, { ...q, correct_answer: opt })}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-colors ${q.correct_answer === opt ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-300 text-gray-500'}`}
                >
                  {opt.toUpperCase()}
                </button>
                <input
                  value={q[`option_${opt}` as keyof Question] as string}
                  onChange={e => onChange(idx, { ...q, [`option_${opt}`]: e.target.value })}
                  placeholder={`Option ${opt.toUpperCase()}...`}
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {isWriting && (
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Model Answer / Marking Guide (shown to admin during grading)
            </label>
            <textarea
              rows={2}
              value={q.model_answer}
              onChange={e => onChange(idx, { ...q, model_answer: e.target.value })}
              placeholder="e.g. Correct answer: 'Je m'appelle...'. Key points: greeting (1 mark), name (2 marks), polite ending (2 marks)."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-400 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Writing Grading Panel ─────────────────────────────────────────
const WritingGradingPanel: React.FC<{
  attempt: PendingAttempt;
  onGraded: () => void;
  onBack: () => void;
}> = ({ attempt, onGraded, onBack }) => {
  const [marks, setMarks] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    attempt.writing_questions.forEach(q => {
      init[q.id] = attempt.writing_marks_json[q.id] ?? 0;
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-score (reading + listening)
  const autoScore = attempt.auto_score;
  const writingTotal = Object.values(marks).reduce((s, m) => s + m, 0);
  const writingMax = attempt.writing_questions.reduce((s, q) => s + q.marks, 0);
  const projectedTotal = autoScore + writingTotal;
  const willPass = projectedTotal >= attempt.pass_marks;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api(`/mock-tests/admin/grade-writing/${attempt.attempt_id}`, {
        method: 'POST',
        body: JSON.stringify({ writing_marks: marks }),
      });
      showToast('Writing graded! Final score saved.');
      setTimeout(() => onGraded(), 1500);
    } catch (e: any) {
      showToast('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Back */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-semibold">
          <ChevronLeft className="w-4 h-4" /> Back to Grading Queue
        </button>
      </div>

      {/* Student info + score summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800">{attempt.user_name}</h3>
            <p className="text-xs text-gray-400">{attempt.user_email}</p>
            <p className="text-xs text-gray-500 mt-1">{attempt.course_title} — {attempt.exam_title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Attempt #{attempt.attempt_number} · Submitted {new Date(attempt.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {/* Score preview */}
          <div className="flex items-center gap-3">
            <div className="text-center bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Auto Score</p>
              <p className="text-xl font-black text-sky-700">{autoScore}</p>
              <p className="text-[10px] text-sky-400">Reading + Listening</p>
            </div>
            <div className="text-gray-300 font-bold">+</div>
            <div className="text-center bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Writing</p>
              <p className="text-xl font-black text-emerald-700">{writingTotal}</p>
              <p className="text-[10px] text-emerald-400">/ {writingMax} max</p>
            </div>
            <div className="text-gray-300 font-bold">=</div>
            <div className={`text-center rounded-xl px-4 py-3 border ${willPass ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${willPass ? 'text-emerald-500' : 'text-red-400'}`}>Final Score</p>
              <p className={`text-xl font-black ${willPass ? 'text-emerald-700' : 'text-red-600'}`}>{projectedTotal}</p>
              <p className={`text-[10px] ${willPass ? 'text-emerald-600' : 'text-red-400'}`}>
                {willPass ? '✓ Will Pass' : `✗ Pass: ${attempt.pass_marks}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Writing questions with user answers */}
      <div className="space-y-4">
        {attempt.writing_questions.map((wq, i) => {
          const userAnswer = attempt.answers_json[wq.id] || '';
          const awarded = marks[wq.id] ?? 0;

          // ── CHANGED: clamp helper ──────────────────────────────
          const clamp = (v: number) => Math.min(wq.marks, Math.max(0, v));

          return (
            <div key={wq.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenLine className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Writing Question {i + 1}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
                  Max: {wq.marks} mark{wq.marks !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Question text */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Question</p>
                  <p className="text-sm font-semibold text-gray-900">{wq.question_text}</p>
                </div>

                {/* Model answer / marking guide */}
                {wq.model_answer && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Marking Guide
                    </p>
                    <p className="text-xs text-amber-800">{wq.model_answer}</p>
                  </div>
                )}

                {/* Student's answer */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student's Answer</p>
                  {userAnswer ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
                         style={{ fontFamily: "'Georgia', serif", lineHeight: 1.7, minHeight: 80, whiteSpace: 'pre-wrap' }}>
                      {userAnswer}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-400 italic">
                      No answer provided
                    </div>
                  )}
                </div>

                {/* ── CHANGED: Marks input — typed number field showing X / MAX ── */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-600 flex-shrink-0">Assign Marks:</label>

                  <div className="flex items-center gap-2">
                    {/* Decrement */}
                    <button
                      type="button"
                      onClick={() => setMarks(m => ({ ...m, [wq.id]: clamp(awarded - 1) }))}
                      disabled={awarded <= 0}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 font-black text-base flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      −
                    </button>

                    {/* Input */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <input
                        type="number"
                        min={0}
                        max={wq.marks}
                        value={awarded}
                        onChange={e => setMarks(m => ({ ...m, [wq.id]: clamp(parseInt(e.target.value) || 0) }))}
                        className={`w-14 text-center text-base font-black bg-transparent outline-none py-1.5 border-r border-gray-200
                          ${awarded === 0 ? 'text-red-500' : awarded === wq.marks ? 'text-emerald-600' : 'text-sky-600'}`}
                      />
                      <span className="px-3 text-sm font-bold text-gray-400 select-none">
                        / {wq.marks}
                      </span>
                    </div>

                    {/* Increment */}
                    <button
                      type="button"
                      onClick={() => setMarks(m => ({ ...m, [wq.id]: clamp(awarded + 1) }))}
                      disabled={awarded >= wq.marks}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 font-black text-base flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>

                    {/* Full-marks shortcut */}
                    <button
                      type="button"
                      onClick={() => setMarks(m => ({ ...m, [wq.id]: wq.marks }))}
                      className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                    >
                      Full
                    </button>

                    {/* Zero shortcut */}
                    <button
                      type="button"
                      onClick={() => setMarks(m => ({ ...m, [wq.id]: 0 }))}
                      className="text-[10px] font-bold text-red-400 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition"
                    >
                      Zero
                    </button>
                  </div>
                </div>
                {/* ── END CHANGED ── */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pb-8">
        <div className="text-sm text-gray-500">
          Final score will be: <strong className={`${willPass ? 'text-emerald-600' : 'text-red-500'}`}>{projectedTotal} / {attempt.total_marks}</strong>
          {willPass
            ? <span className="ml-2 text-emerald-600 font-bold">✓ Certificate will be issued</span>
            : <span className="ml-2 text-red-400 font-bold">✗ Did not pass</span>}
        </div>
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm">
          <ClipboardCheck className="w-4 h-4" /> {saving ? 'Saving…' : 'Submit Grades'}
        </button>
      </div>
    </div>
  );
};

// ── Writing Grading Queue ─────────────────────────────────────────
const WritingGradingQueue: React.FC = () => {
  const [attempts, setAttempts] = useState<PendingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingAttempt | null>(null);

  const load = () => {
    setLoading(true);
    api('/mock-tests/admin/pending-review')
      .then(d => setAttempts(d.attempts || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (selected) {
    return (
      <WritingGradingPanel
        attempt={selected}
        onGraded={() => { setSelected(null); load(); }}
        onBack={() => setSelected(null)}
      />
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400 text-sm animate-pulse">Loading queue…</div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-500" />
            Writing Grading Queue
            {attempts.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {attempts.length}
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400">Students waiting for writing marks to receive their final result</p>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">All caught up!</p>
            <p className="text-xs mt-1">No writing submissions pending review.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {attempts.map(a => {
              const writingMax = a.writing_questions.reduce((s, q) => s + q.marks, 0);
              const daysWaiting = Math.floor((Date.now() - new Date(a.completed_at).getTime()) / 86400000);

              return (
                <button
                  key={a.attempt_id}
                  onClick={() => setSelected(a)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PenLine className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.user_name}</p>
                      <p className="text-[10px] text-gray-400">{a.user_email}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{a.course_title} · Attempt #{a.attempt_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-full font-bold">
                          Auto: {a.auto_score}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                          Writing: ? / {writingMax}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {daysWaiting === 0 ? 'Today' : `${daysWaiting}d ago`} · Pass: {a.pass_marks}/{a.total_marks}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Hourglass className="w-3 h-3" /> Grade Now
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Mock Test Form Panel ──────────────────────────────────────────
const MockTestFormPanel: React.FC<{
  course: CourseRow;
  onBack: () => void;
}> = ({ course, onBack }) => {
  const [form, setForm] = useState<MockTestForm>({
    title: `${course.title} — Mock Test`,
    description: '', total_marks: 100, pass_marks: 80,
    max_attempts: 3, duration_mins: 60, questions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'reading' | 'listening' | 'writing'>('all');
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<AttemptRow[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api(`/mock-tests/admin/course/${course.id}`)
      .then(d => {
        if (d.mockTest) {
          const { questions, ...rest } = d.mockTest;
          setForm({
            title: rest.title, description: rest.description || '',
            total_marks: rest.total_marks, pass_marks: rest.pass_marks,
            max_attempts: rest.max_attempts, duration_mins: rest.duration_mins,
            questions: questions || [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [course.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addQuestion = () => {
    setForm(f => ({ ...f, questions: [...f.questions, EMPTY_QUESTION()] }));
  };

  const updateQuestion = (idx: number, q: Question) => {
    setForm(f => { const qs = [...f.questions]; qs[idx] = q; return { ...f, questions: qs }; });
  };

  const deleteQuestion = (idx: number) => {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api(`/mock-tests/admin/course/${course.id}`, {
        method: 'POST', body: JSON.stringify(form),
      });
      showToast('Mock test saved successfully!');
    } catch (e: any) {
      showToast('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete entire mock test for this course?')) return;
    await api(`/mock-tests/admin/course/${course.id}`, { method: 'DELETE' });
    onBack();
  };

  const loadStats = async () => {
    setStatsOpen(true);
    setStatsLoading(true);
    try {
      const d = await api(`/mock-tests/admin/stats/${course.mock_test_id}`);
      setStats(d.attempts || []);
    } finally {
      setStatsLoading(false);
    }
  };

  const filtered = (activeSection === 'all'
    ? form.questions
    : form.questions.filter(q => q.section === activeSection)
  ).slice().reverse();

  const sectionCounts = { reading: 0, listening: 0, writing: 0 };
  form.questions.forEach(q => sectionCounts[q.section]++);
  const totalCalc = form.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading…</div>
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-semibold">
          <ChevronLeft className="w-4 h-4" /> All Courses
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-xs font-bold text-gray-800 truncate">{course.title}</span>
      </div>

      {/* Settings card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-800">Exam Settings</h3>
          {course.mock_test_id && (
            <button onClick={loadStats} className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-semibold">
              <Users className="w-3.5 h-3.5" /> View Attempts
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Exam Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Description (optional)</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 resize-none" />
          </div>
          {[
            { label: 'Total Marks', key: 'total_marks', hint: `Calculated from questions: ${totalCalc}` },
            { label: 'Pass Marks (for Certificate)', key: 'pass_marks', hint: '' },
            { label: 'Max Attempts', key: 'max_attempts', hint: 'Min 1, Max 10' },
            { label: 'Duration (minutes)', key: 'duration_mins', hint: '' },
          ].map(({ label, key, hint }) => (
            <div key={key}>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
              <input type="number" min={1}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: +e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-400"
              />
              {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Questions</h3>
            <p className="text-xs text-gray-400">{form.questions.length} total · {totalCalc} marks
              {sectionCounts.writing > 0 && (
                <span className="ml-2 text-emerald-600 font-bold">(Writing: {sectionCounts.writing} questions, manually graded)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(['all','reading','listening','writing'] as const).map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all
                  ${activeSection === s ? 'bg-sky-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {s === 'all' ? `All (${form.questions.length})` : `${s} (${sectionCounts[s]})`}
              </button>
            ))}
            <button onClick={addQuestion}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">No questions yet</p>
              <p className="text-xs mt-1">Click "Add Question" to begin building the exam.</p>
            </div>
          ) : (
            <>
              {(activeSection === 'all' || activeSection === 'writing') && sectionCounts.writing > 0 && (
                <WritingInfo />
              )}
              {filtered.map(q => {
                const realIdx = form.questions.indexOf(q);
                return (
                  <QuestionEditor key={realIdx} q={q} idx={realIdx}
                    onChange={updateQuestion} onDelete={deleteQuestion} />
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-8">
        <button onClick={handleDelete} className="flex items-center gap-2 text-red-400 hover:text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-50 border border-red-200">
          <Trash2 className="w-3.5 h-3.5" /> Delete Mock Test
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Mock Test'}
        </button>
      </div>

      {/* Stats modal */}
      {statsOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Exam Attempts</h3>
                <p className="text-xs text-gray-400">{course.title}</p>
              </div>
              <button onClick={() => setStatsOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {statsLoading ? (
                <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
              ) : stats.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">No attempts yet</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['User','Attempt','Score','Status','Certificate','Date'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.map(a => (
                      <tr key={a.id}>
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-gray-800">{a.user_name}</p>
                          <p className="text-gray-400">{a.user_email}</p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">#{a.attempt_number}</td>
                        <td className="py-3 pr-4">
                          <span className={`font-bold ${a.passed ? 'text-emerald-600' : a.status === 'pending_review' ? 'text-amber-600' : 'text-red-400'}`}>
                            {a.status === 'pending_review' ? `${a.score}+? ` : `${a.score}/`}{a.total_marks}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                            ${a.status === 'pending_review'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : a.passed
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-red-50 text-red-400 border-red-200'}`}>
                            {a.status === 'pending_review' ? '⏳ Pending' : a.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {a.certificate_no
                            ? <span className="font-mono text-sky-600">{a.certificate_no}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 text-gray-400">
                          {a.completed_at ? new Date(a.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Course List ───────────────────────────────────────────────────
const AdminMockTestTab: React.FC<{
  // ── CHANGED: accept optional callback so parent can read pending count ──
  onPendingCount?: (n: number) => void;
}> = ({ onPendingCount }) => {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CourseRow | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'grading'>('courses');
  const [totalPending, setTotalPending] = useState(0);

  const load = () => {
    setLoading(true);
    api('/mock-tests/admin/courses')
      .then(d => {
        const rows: CourseRow[] = d.courses || [];
        setCourses(rows);
        const pending = rows.reduce((s, c) => s + (c.pending_review_count || 0), 0);
        setTotalPending(pending);
        // ── CHANGED: bubble count up to parent (AdminDashboard) ──
        onPendingCount?.(pending);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (selected) {
    return <MockTestFormPanel course={selected} onBack={() => { setSelected(null); load(); }} />;
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'courses' ? 'bg-sky-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Mock Tests by Course
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'grading' ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" /> Writing Grading Queue
          {totalPending > 0 && (
            <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center
              ${activeTab === 'grading' ? 'bg-white text-amber-600' : 'bg-red-500 text-white'}`}>
              {totalPending}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'grading' ? (
        <WritingGradingQueue />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">Mock Tests by Course</h2>
            <p className="text-xs text-gray-400">Click a course to add or manage its mock exam</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm animate-pulse">Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">No courses found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {courses.map(c => (
                <button key={c.id} onClick={() => setSelected(c)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {c.mock_test_id ? (
                      <>
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            <FlaskConical className="w-3 h-3" /> {c.question_count} Q
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            <Users className="w-3 h-3" /> {c.attempt_count}
                          </span>
                          {(c.pending_review_count || 0) > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-bold animate-pulse">
                              <Hourglass className="w-3 h-3" /> {c.pending_review_count} pending
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                            <Award className="w-3 h-3" /> {c.cert_count} certs
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> {c.duration_mins}m
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> {c.pass_marks}/{c.total_marks}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          ✓ Configured
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <Plus className="w-3 h-3" /> Add Mock Test
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMockTestTab;