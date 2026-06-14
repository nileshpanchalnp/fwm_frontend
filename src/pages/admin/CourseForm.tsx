// src/pages/admin/CourseForm.tsx
import React, { useState, useEffect } from 'react';
import { courseApi, unitTestApi, Course, TestQuestion } from '../../api/client';
import {
  Plus, Trash2, ArrowLeft, ChevronDown, Save, BookOpen, Headphones,
  FileText, Youtube, HelpCircle, Volume2, Info, ExternalLink, RotateCcw,
} from 'lucide-react';

interface Topic {
  title: string;
  youtube_id: string;
  pdf_url: string;
  exercise_youtube_id: string;
}
interface Unit {
  unit_label: string;
  unit_title: string;
  topics: Topic[];
}
interface UnitTestDraft {
  title: string;
  questions: TestQuestion[];
}

interface CourseFormData {
  slug: string; title: string; subtitle: string; description: string; level: string;
  price: number | string; original_price: number | string;
  rating: number | string; students: number | string;
  hours: number | string; duration_days: number | string;
  revision_days: number | string | '';
  features: string[]; whatYouLearn: string[]; includes: string[];
  curriculum: Unit[];
  listeningCurriculum: Unit[];
  revisionCurriculum: Unit[];   // ← NEW
}

const blankTopic = (): Topic => ({ title: '', youtube_id: '', pdf_url: '', exercise_youtube_id: '' });
const blankUnit  = (): Unit  => ({ unit_label: '', unit_title: '', topics: [blankTopic()] });
const blankQ = (): TestQuestion => ({
  question: '', audio_url: '', option_a: '', option_b: '',
  option_c: '', option_d: '', correct: 'a',
});
const blankTest  = (): UnitTestDraft => ({ title: 'Unit Test', questions: [blankQ()] });
const defaultForm = (): CourseFormData => ({
  slug: '', title: '', subtitle: '', description: '', level: 'Beginner',
  price: '', original_price: '', rating: '', students: '', hours: '',
  duration_days: '30',
  revision_days: '',
  features: [''], whatYouLearn: [''], includes: [''],
  curriculum: [blankUnit()],
  listeningCurriculum: [blankUnit()],
  revisionCurriculum: [blankUnit()],   // ← NEW
});

function toDriveEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  return url;
}

function normalizeAudioUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
}

// ─── StringListEditor ─────────────────────────────────────────────
const StringListEditor: React.FC<{
  label: string; values: string[];
  onChange: (v: string[]) => void; placeholder?: string;
}> = ({ label, values, onChange, placeholder }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => onChange([...values, ''])}
        className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg">
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input value={v}
            onChange={e => { const n = [...values]; n[i] = e.target.value; onChange(n); }}
            placeholder={placeholder || `${label} ${i + 1}`}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white placeholder:text-gray-400 transition-all" />
          {values.length > 1 && (
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-red-400 hover:text-red-500 hover:bg-red-50 border border-red-200 px-2 rounded-xl">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ─── MCQ Test Editor ──────────────────────────────────────────────
const MCQTestEditor: React.FC<{
  test: UnitTestDraft; onChange: (t: UnitTestDraft) => void; isListening?: boolean;
}> = ({ test, onChange, isListening }) => {
  const setQ = (i: number, field: keyof TestQuestion, val: string) => {
    const qs = [...test.questions];
    qs[i] = { ...qs[i], [field]: val };
    onChange({ ...test, questions: qs });
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <input value={test.title} onChange={e => onChange({ ...test, title: e.target.value })}
            className="text-sm font-bold text-indigo-700 bg-transparent border-b border-indigo-300 outline-none focus:border-indigo-500 w-48"
            placeholder="Test title" />
        </div>
        <button type="button"
          onClick={() => onChange({ ...test, questions: [...test.questions, blankQ()] })}
          className="flex items-center gap-1 text-xs text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg">
          <Plus className="w-3 h-3" /> Add Question
        </button>
      </div>
      <div className="space-y-4">
        {test.questions.map((q, i) => (
          <div key={i} className="bg-white rounded-xl border border-indigo-100 p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase mt-1">Q{i + 1}</span>
              {test.questions.length > 1 && (
                <button type="button"
                  onClick={() => onChange({ ...test, questions: test.questions.filter((_, j) => j !== i) })}
                  className="text-red-400 hover:bg-red-50 p-1 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <textarea value={q.question} onChange={e => setQ(i, 'question', e.target.value)}
              rows={2} placeholder="Enter question..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 resize-none mb-3 placeholder:text-gray-400" />
            {isListening && (
              <div className="mb-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Audio URL
                </label>
                <input value={q.audio_url || ''}
                  onChange={e => setQ(i, 'audio_url', normalizeAudioUrl(e.target.value))}
                  placeholder="Paste any Google Drive share link..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 outline-none focus:border-indigo-400 placeholder:text-gray-400" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {(['a', 'b', 'c', 'd'] as const).map(opt => (
                <div key={opt} className="flex items-center gap-2">
                  <button type="button" onClick={() => setQ(i, 'correct', opt)}
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border-2 transition-all
                      ${q.correct === opt ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-400 hover:border-emerald-400'}`}>
                    {opt.toUpperCase()}
                  </button>
                  <input value={(q as any)[`option_${opt}`]}
                    onChange={e => setQ(i, `option_${opt}` as keyof TestQuestion, e.target.value)}
                    placeholder={`Option ${opt.toUpperCase()}`}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-indigo-400 placeholder:text-gray-400" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold">
              ✓ Correct: Option {(q.correct || 'a').toUpperCase()} — click circle to change
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DriveTip: React.FC = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700 space-y-1">
    <div className="flex items-center gap-1.5 font-bold mb-1">
      <Info className="w-3.5 h-3.5" /> How to add Google Drive PDF (view-only, no download)
    </div>
    <p>1. Upload your PDF to Google Drive.</p>
    <p>2. Right-click → <strong>Share</strong> → set to <strong>"Anyone with the link"</strong> (Viewer only).</p>
    <p>3. Copy the link. It looks like: <code className="bg-blue-100 px-1 rounded">https://drive.google.com/file/d/FILE_ID/view</code></p>
    <p>4. Paste it in the <strong>PDF URL</strong> field — it is auto-converted to an embed link.</p>
    <a href="https://drive.google.com" target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 underline mt-1">
      Open Google Drive <ExternalLink className="w-3 h-3" />
    </a>
  </div>
);

const AudioTip: React.FC = () => (
  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4 text-xs text-purple-700 space-y-1">
    <div className="flex items-center gap-1.5 font-bold mb-1">
      <Info className="w-3.5 h-3.5" /> How to add Audio for Listening questions
    </div>
    <p>1. Upload your MP3/WAV to Google Drive.</p>
    <p>2. Share it as <strong>"Anyone with the link"</strong> (Viewer).</p>
    <p>3. Paste the share URL in the Audio URL field — it is auto-converted.</p>
  </div>
);

// ─── Unit Editor ──────────────────────────────────────────────────
const UnitEditor: React.FC<{
  units: Unit[]; onChange: (units: Unit[]) => void;
  label: string; icon?: React.ReactNode; isListening?: boolean;
  unitTests: Record<number, UnitTestDraft | null>;
  onTestChange: (idx: number, t: UnitTestDraft | null) => void;
  accentColor?: 'sky' | 'purple' | 'amber';
}> = ({ units, onChange, label, icon, isListening, unitTests, onTestChange, accentColor = 'sky' }) => {
  const [openUnit, setOpenUnit] = useState<number | null>(0);
  const [showTest, setShowTest] = useState<Record<number, boolean>>({});

  const accent = {
    sky:    { badge: 'bg-sky-100 border-sky-200 text-sky-500',    btn: 'text-sky-500 hover:text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-200' },
    purple: { badge: 'bg-purple-100 border-purple-200 text-purple-500', btn: 'text-purple-500 hover:text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200' },
    amber:  { badge: 'bg-amber-100 border-amber-200 text-amber-600',  btn: 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200' },
  }[accentColor];

  const addUnit    = () => { onChange([...units, blankUnit()]); setOpenUnit(units.length); };
  const removeUnit = (i: number) => { onChange(units.filter((_, j) => j !== i)); setOpenUnit(null); };
  const updateUnit = (i: number, f: keyof Omit<Unit, 'topics'>, v: string) => {
    const n = [...units]; n[i] = { ...n[i], [f]: v }; onChange(n);
  };
  const addTopic    = (ui: number) => {
    const n = [...units]; n[ui] = { ...n[ui], topics: [...n[ui].topics, blankTopic()] }; onChange(n);
  };
  const removeTopic = (ui: number, ti: number) => {
    const n = [...units]; n[ui] = { ...n[ui], topics: n[ui].topics.filter((_, j) => j !== ti) }; onChange(n);
  };
  const updateTopic = (ui: number, ti: number, f: keyof Topic, v: string) => {
    const n = [...units];
    const ts = [...n[ui].topics]; ts[ti] = { ...ts[ti], [f]: v };
    n[ui] = { ...n[ui], topics: ts }; onChange(n);
  };

  const ic = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-xs outline-none focus:border-sky-400 focus:bg-white placeholder:text-gray-400 transition-all";

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-sm font-bold text-gray-800 uppercase tracking-widest">{label}</label>
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
            {units.length} unit{units.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button type="button" onClick={addUnit}
          className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg ${accent.btn}`}>
          <Plus className="w-3 h-3" /> Add Unit
        </button>
      </div>
      <div className="space-y-2">
        {units.map((unit, ui) => {
          const hasTest  = !!unitTests[ui];
          const testOpen = showTest[ui];
          return (
            <div key={ui} className="border border-gray-200 hover:border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => setOpenUnit(openUnit === ui ? null : ui)}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border ${accent.badge}`}>
                  <span className="text-[10px] font-bold">{ui + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-xs font-bold truncate">{unit.unit_title || `Unit ${ui + 1}`}</p>
                  {unit.unit_label && (
                    <p className="text-gray-400 text-[10px]">
                      {unit.unit_label} · {unit.topics.length} topic{unit.topics.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                  ${hasTest ? 'bg-indigo-50 text-indigo-500 border-indigo-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                  {hasTest ? 'Test ✓' : 'No Test'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openUnit === ui ? 'rotate-180' : ''}`} />
                <button type="button" onClick={e => { e.stopPropagation(); removeUnit(ui); }}
                  className="text-red-400 hover:bg-red-50 p-1 rounded-lg flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {openUnit === ui && (
                <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Unit Label</label>
                      <input value={unit.unit_label} onChange={e => updateUnit(ui, 'unit_label', e.target.value)} placeholder="e.g. A1 – Unit 1" className={ic} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">Unit Title</label>
                      <input value={unit.unit_title} onChange={e => updateUnit(ui, 'unit_title', e.target.value)} placeholder="e.g. Bonjour! First Steps" className={ic} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sub-units / Topics</p>
                      <button type="button" onClick={() => addTopic(ui)}
                        className="text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1 bg-sky-50 border border-sky-200 px-2 py-1 rounded-lg">
                        <Plus className="w-3 h-3" /> Add Topic
                      </button>
                    </div>
                    <DriveTip />
                    {isListening && <AudioTip />}
                    <div className="space-y-3">
                      {unit.topics.map((topic, ti) => (
                        <div key={ti} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-gray-400 font-bold w-5">{ti + 1}</span>
                            <input value={topic.title} onChange={e => updateTopic(ui, ti, 'title', e.target.value)} placeholder="Sub-unit title" className={`${ic} flex-1`} />
                            {unit.topics.length > 1 && (
                              <button type="button" onClick={() => removeTopic(ui, ti)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg border border-red-200"><Trash2 className="w-3 h-3" /></button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-2 ml-7">
                            <div className="flex items-start gap-2">
                              <FileText className="w-3 h-3 text-orange-400 flex-shrink-0 mt-2" />
                              <div className="flex-1">
                                <input value={topic.pdf_url} onChange={e => updateTopic(ui, ti, 'pdf_url', e.target.value)} placeholder="PDF URL — Google Drive share link or direct URL" className={`${ic} flex-1 font-mono text-[11px]`} />
                                {topic.pdf_url && (
                                  <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">✓ Will embed as: {toDriveEmbedUrl(topic.pdf_url).slice(0, 60)}…</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Youtube className="w-3 h-3 text-red-400 flex-shrink-0" />
                              <input value={topic.exercise_youtube_id} onChange={e => updateTopic(ui, ti, 'exercise_youtube_id', e.target.value)} placeholder="Exercise YouTube ID (e.g. dQw4w9WgXcQ)" className={`${ic} flex-1 font-mono`} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-gray-700">Unit Test (MCQ)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasTest && (
                          <button type="button" onClick={() => setShowTest(s => ({ ...s, [ui]: !testOpen }))}
                            className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <ChevronDown className={`w-3 h-3 transition-transform ${testOpen ? 'rotate-180' : ''}`} />
                            {testOpen ? 'Collapse' : 'Edit Test'}
                          </button>
                        )}
                        {!hasTest ? (
                          <button type="button" onClick={() => { onTestChange(ui, blankTest()); setShowTest(s => ({ ...s, [ui]: true })); }}
                            className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Test
                          </button>
                        ) : (
                          <button type="button" onClick={() => { onTestChange(ui, null); setShowTest(s => ({ ...s, [ui]: false })); }}
                            className="text-xs text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 px-2 py-1.5 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {hasTest && testOpen && unitTests[ui] && (
                      <MCQTestEditor test={unitTests[ui]!} onChange={t => onTestChange(ui, t)} isListening={isListening} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 shadow-sm">
    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">{title}</h2>
    {children}
  </div>
);

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-sky-400 focus:bg-white placeholder:text-gray-400 transition-all";
const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5";

// ─── Main CourseForm ──────────────────────────────────────────────
const CourseForm: React.FC<{
  course: Course | null;
  onSave: () => void;
  onCancel: () => void;
}> = ({ course, onSave, onCancel }) => {
  const [form, setForm]               = useState<CourseFormData>(defaultForm());
  const [loading, setLoading]         = useState(false);
  const [fetchingCourse, setFetching] = useState(false);
  const [error, setError]             = useState('');
  const [readingTests,   setReadingTests]   = useState<Record<number, UnitTestDraft | null>>({});
  const [listeningTests, setListeningTests] = useState<Record<number, UnitTestDraft | null>>({});
  const [revisionTests,  setRevisionTests]  = useState<Record<number, UnitTestDraft | null>>({});  // ← NEW

  useEffect(() => {
    if (!course) return;
    setFetching(true);
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${BASE}/courses/${(course as any).slug}`, { credentials: 'include' })
      .then(r => r.json())
      .then(async d => {
        const c = d.course;
        setForm({
          slug:          c.slug          ?? '',
          title:         c.title         ?? '',
          subtitle:      c.subtitle      ?? '',
          description:   c.description   ?? '',
          level:         c.level         ?? 'Beginner',
          price:         c.price         ?? '',
          original_price:c.original_price ?? '',
          rating:        c.rating        ?? '',
          students:      c.students      ?? '',
          hours:         c.hours         ?? '',
          duration_days: c.duration_days ?? '30',
          revision_days: c.revision_days ?? '',
          features:      c.features?.length    ? c.features    : [''],
          whatYouLearn:  c.whatYouLearn?.length ? c.whatYouLearn : [''],
          includes:      c.includes?.length    ? c.includes    : [''],
          curriculum: c.curriculum?.length
            ? c.curriculum.map((u: any) => ({
                unit_label: u.unit_label, unit_title: u.unit_title,
                topics: u.topics.map((t: any) => ({
                  title: t.title || '', youtube_id: t.youtube_id || '',
                  pdf_url: t.pdf_url || '', exercise_youtube_id: t.exercise_youtube_id || '',
                })),
              }))
            : [blankUnit()],
          listeningCurriculum: c.listeningCurriculum?.length
            ? c.listeningCurriculum.map((u: any) => ({
                unit_label: u.unit_label, unit_title: u.unit_title,
                topics: u.topics.map((t: any) => ({
                  title: t.title || '', youtube_id: t.youtube_id || '',
                  pdf_url: t.pdf_url || '', exercise_youtube_id: t.exercise_youtube_id || '',
                })),
              }))
            : [blankUnit()],
          // ← NEW: load revision curriculum
          revisionCurriculum: c.revisionCurriculum?.length
            ? c.revisionCurriculum.map((u: any) => ({
                unit_label: u.unit_label, unit_title: u.unit_title,
                topics: u.topics.map((t: any) => ({
                  title: t.title || '', youtube_id: t.youtube_id || '',
                  pdf_url: t.pdf_url || '', exercise_youtube_id: t.exercise_youtube_id || '',
                })),
              }))
            : [blankUnit()],
        });

        const loadTests = async (units: any[]): Promise<Record<number, UnitTestDraft | null>> => {
          const result: Record<number, UnitTestDraft | null> = {};
          await Promise.all(
            units.map(async (u: any, i: number) => {
              try {
                const res  = await unitTestApi.get(u.id);
                const test = res?.test ?? null;
                result[i]  = test && test.questions?.length
                  ? { title: test.title, questions: test.questions }
                  : null;
              } catch { result[i] = null; }
            })
          );
          return result;
        };

        const [rTests, lTests, revTests] = await Promise.all([
          loadTests(c.curriculum          || []),
          loadTests(c.listeningCurriculum || []),
          loadTests(c.revisionCurriculum  || []),   // ← NEW
        ]);
        setReadingTests(rTests);
        setListeningTests(lTests);
        setRevisionTests(revTests);  // ← NEW
      })
      .catch(() => setError('Failed to load course data.'))
      .finally(() => setFetching(false));
  }, [course]);

  const set = <K extends keyof CourseFormData>(field: K, value: CourseFormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.title.toString().trim()) { setError('Course title is required.'); return; }
    if (!form.slug.toString().trim())  { setError('Slug is required.');         return; }
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        price:          Number(form.price)          || 0,
        original_price: Number(form.original_price) || 0,
        rating:         Number(form.rating)         || 0,
        students:       Number(form.students)       || 0,
        hours:          Number(form.hours)          || 0,
        duration_days:  Number(form.duration_days)  || 30,
        revision_days:  form.revision_days !== '' && Number(form.revision_days) > 0
          ? Number(form.revision_days)
          : null,
        features:      form.features.filter(Boolean),
        whatYouLearn:  form.whatYouLearn.filter(Boolean),
        includes:      form.includes.filter(Boolean),
      };

      if (course) {
        await courseApi.update((course as any).id, payload);
      } else {
        await courseApi.create(payload);
      }

      // Save unit tests for all 3 curriculum types
      if (course) {
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const d = await fetch(`${BASE}/courses/${(course as any).slug}`, { credentials: 'include' }).then(r => r.json());
        const readingUnits   = d.course.curriculum          || [];
        const listeningUnits = d.course.listeningCurriculum || [];
        const revisionUnits  = d.course.revisionCurriculum  || [];   // ← NEW

        for (let i = 0; i < readingUnits.length; i++) {
          const t = readingTests[i];
          if (t) await unitTestApi.upsert(readingUnits[i].id, t).catch(() => {});
          else    await unitTestApi.delete(readingUnits[i].id).catch(() => {});
        }
        for (let i = 0; i < listeningUnits.length; i++) {
          const t = listeningTests[i];
          if (t) await unitTestApi.upsert(listeningUnits[i].id, t).catch(() => {});
          else    await unitTestApi.delete(listeningUnits[i].id).catch(() => {});
        }
        // ← NEW: save revision unit tests
        for (let i = 0; i < revisionUnits.length; i++) {
          const t = revisionTests[i];
          if (t) await unitTestApi.upsert(revisionUnits[i].id, t).catch(() => {});
          else    await unitTestApi.delete(revisionUnits[i].id).catch(() => {});
        }
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCourse) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm animate-pulse">Loading course data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{course ? 'Edit Course' : 'Add New Course'}</h1>
          {form.title && <p className="text-gray-400 text-xs">{form.title}</p>}
        </div>
        <div className="ml-auto flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 border border-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 disabled:opacity-50 shadow-sm">
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : course ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-5xl w-full mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-sm mb-5 flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <Section title="Basic Information">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Course Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="A1 + A2 Foundation Program" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug (URL) *</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="a1-a2-foundation" className={`${inputClass} font-mono`} />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Subtitle</label>
            <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Build your French from zero to conversational" className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the course in detail…" className={`${inputClass} resize-none`} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Level</label>
            <select value={form.level} onChange={e => set('level', e.target.value)} className={inputClass}>
              {['Beginner', 'Intermediate', 'Upper Intermediate', 'Advanced'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Price ($)</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} onFocus={e => e.target.select()} placeholder="0" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Original Price ($)</label>
              <input type="number" value={form.original_price} onChange={e => set('original_price', e.target.value)} onFocus={e => e.target.select()} placeholder="0" min="0" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className={labelClass}>Rating</label>
              <input type="number" value={form.rating} onChange={e => set('rating', e.target.value)} onFocus={e => e.target.select()} placeholder="4.8" min="0" max="5" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Students</label>
              <input type="number" value={form.students} onChange={e => set('students', e.target.value)} onFocus={e => e.target.select()} placeholder="0" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hours</label>
              <input type="number" value={form.hours} onChange={e => set('hours', e.target.value)} onFocus={e => e.target.select()} placeholder="0" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Duration (days)</label>
              <input type="number" value={form.duration_days} onChange={e => set('duration_days', e.target.value)} onFocus={e => e.target.select()} placeholder="30" min="1" className={inputClass} />
            </div>
          </div>

          {/* Revision Period */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <label className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Revision Period (days from enrollment start)
              </label>
            </div>
            <p className="text-xs text-amber-600 mb-3 leading-relaxed">
              Revision window is counted <strong>from enrollment start</strong>, independently of the course duration.
              For example: duration = 60 days, revision = 100 days → course expires day 60, revision ends day 100.
              During revision (day 60–100) students can only access <strong>Revision Units, Writing &amp; Certificates</strong>.
              Leave blank to disable revision.
            </p>
            <input
              type="number"
              value={form.revision_days}
              onChange={e => set('revision_days', e.target.value)}
              onFocus={e => e.target.select()}
              placeholder="e.g. 100  (leave blank to disable revision)"
              min="1"
              max="365"
              className={`${inputClass} max-w-xs`}
            />
            {form.revision_days !== '' && Number(form.revision_days) > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                ✓ Revision window: day 1 → day {form.revision_days} from enrollment
                {form.duration_days && Number(form.revision_days) > Number(form.duration_days)
                  ? ` (${Number(form.revision_days) - Number(form.duration_days)} revision-only day${Number(form.revision_days) - Number(form.duration_days) !== 1 ? 's' : ''} after course expiry)`
                  : ' — revision ends before or with course expiry (no visible revision phase)'}
              </p>
            )}
          </div>
        </Section>

        <Section title="Course Details">
          <StringListEditor label="Features"          values={form.features}     onChange={v => set('features', v)}     placeholder="e.g. Lifetime Access" />
          <StringListEditor label="What You'll Learn" values={form.whatYouLearn} onChange={v => set('whatYouLearn', v)} placeholder="e.g. Speak confidently in everyday situations" />
          <StringListEditor label="Course Includes"   values={form.includes}     onChange={v => set('includes', v)}     placeholder="e.g. 40+ hours of video content" />
        </Section>

        <Section title="Curriculum">
          {/* Reading */}
          <UnitEditor
            label="Reading Curriculum"
            icon={<BookOpen className="w-4 h-4 text-sky-500" />}
            units={form.curriculum}
            onChange={u => set('curriculum', u)}
            unitTests={readingTests}
            onTestChange={(i, t) => setReadingTests(p => ({ ...p, [i]: t }))}
            accentColor="sky"
          />
          <div className="border-t border-gray-100 my-6" />

          {/* Listening */}
          <UnitEditor
            label="Listening Curriculum"
            icon={<Headphones className="w-4 h-4 text-purple-500" />}
            units={form.listeningCurriculum}
            onChange={u => set('listeningCurriculum', u)}
            isListening
            unitTests={listeningTests}
            onTestChange={(i, t) => setListeningTests(p => ({ ...p, [i]: t }))}
            accentColor="purple"
          />
          <div className="border-t border-gray-100 my-6" />

          {/* ── NEW: Revision Curriculum ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Revision Curriculum</p>
            </div>
            <p className="text-xs text-amber-600 leading-relaxed">
              These units are shown <strong>only during the revision phase</strong> (after course expiry, within the revision window).
              Add PDFs, videos, or exercises students should review before re-enrolling or taking the exam again.
            </p>
          </div>
          <UnitEditor
            label="Revision Curriculum"
            icon={<RotateCcw className="w-4 h-4 text-amber-600" />}
            units={form.revisionCurriculum}
            onChange={u => set('revisionCurriculum', u)}
            unitTests={revisionTests}
            onTestChange={(i, t) => setRevisionTests(p => ({ ...p, [i]: t }))}
            accentColor="amber"
          />
        </Section>
        <div className="h-6" />
      </div>
    </div>
  );
};

export default CourseForm;