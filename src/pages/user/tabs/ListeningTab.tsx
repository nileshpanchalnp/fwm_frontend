// src/pages/user/tabs/ListeningTab.tsx
import React, { useState } from 'react';
import {
  ChevronDown, CheckCircle2, PlayCircle, FileText, Youtube,
  HelpCircle, Volume2, X, Shield, RotateCcw, XCircle, CheckCircle,
} from 'lucide-react';
import { unitTestApi } from '../../../api/client';
import VideoPopup, { normalizeAudioUrl, toDriveEmbedUrl } from './VideoPopup';

/* ── Secure PDF Viewer ── */
const SecurePdfViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  const embedUrl = toDriveEmbedUrl(pdfUrl);
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
      style={{ height: 520 }} onContextMenu={e => e.preventDefault()}>
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Course PDF"
      />
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-t border-gray-200">
        <Shield className="w-3 h-3 text-gray-400" />
        <span className="text-[10px] text-gray-400">View only — download disabled</span>
      </div>
    </div>
  );
};

/* ── Unit Test Panel ── */
interface UnitTestPanelProps {
  unitId: number;
  isListening?: boolean;
  onClose: () => void;
}
const UnitTestPanel: React.FC<UnitTestPanelProps> = ({ unitId, isListening, onClose }) => {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<any>(null);
  const [score, setScore] = useState<{ s: number; t: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    unitTestApi.get(unitId).then((d: any) => { setTest(d.test); setLoading(false); });
  }, [unitId]);

  const handleSubmit = async () => {
    if (!test) return;
    setSubmitting(true);
    try {
      const r = await unitTestApi.submit(unitId, answers);
      setResults(r.results);
      setScore({ s: r.score, t: r.total });
    } catch { }
    setSubmitting(false);
  };

  const reset = () => { setAnswers({}); setResults(null); setScore(null); };
  const pct = score ? Math.round((score.s / score.t) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-gray-900 text-sm">{test?.title || 'Unit Test'}</h2>
            {isListening && (
              <span className="text-[10px] bg-purple-50 text-purple-500 border border-purple-200 px-2 py-0.5 rounded-full font-bold">LISTENING</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm animate-pulse">Loading test…</div>
          ) : !test ? (
            <div className="text-center py-12 text-gray-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No test available for this unit yet.</p>
            </div>
          ) : score ? (
            <div className="text-center py-4">
              <div className={`w-24 h-24 rounded-full border-4 mx-auto flex flex-col items-center justify-center mb-4
                ${pct >= 70 ? 'border-emerald-400 bg-emerald-50' : 'border-amber-400 bg-amber-50'}`}>
                <span className={`text-2xl font-black ${pct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</span>
                <span className="text-[10px] font-bold text-gray-400">{score.s}/{score.t}</span>
              </div>
              <h3 className={`text-lg font-bold mb-1 ${pct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {pct >= 70 ? '🎉 Great work!' : '📚 Keep practising!'}
              </h3>
              <p className="text-gray-400 text-sm mb-6">You scored {score.s} out of {score.t} questions.</p>
              <div className="space-y-3 text-left">
                {test.questions.map((q: any, i: number) => {
                  const r = results?.[q.id];
                  const correct = r?.isCorrect;
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {correct
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                        <p className="text-sm text-gray-700 font-medium">{q.question}</p>
                      </div>
                      {q.audio_url && (
                        <iframe src={normalizeAudioUrl(q.audio_url || '')} width="100%" height="40" allow="autoplay"
                          className="rounded-lg mb-2" style={{ border: 'none' }}
                          sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" />
                      )}
                      <div className="ml-6 text-xs space-y-1">
                        {!correct && <p className="text-red-500">Your answer: Option {r?.userAnswer?.toUpperCase() || '—'}</p>}
                        <p className="text-emerald-600 font-semibold">Correct: Option {r?.correct?.toUpperCase()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={reset}
                className="mt-6 flex items-center gap-2 mx-auto bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {test.questions.map((q: any, i: number) => (
                <div key={q.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    <span className="text-[10px] bg-indigo-100 text-indigo-500 font-bold px-1.5 py-0.5 rounded mr-2">Q{i + 1}</span>
                    {q.question}
                  </p>
                  {q.audio_url && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] text-purple-400 font-bold uppercase">Audio</span>
                      </div>
                      <iframe src={normalizeAudioUrl(q.audio_url || '')} width="100%" height="40" allow="autoplay"
                        className="rounded-lg border border-purple-100" style={{ border: 'none' }}
                        sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    {(['a', 'b', 'c', 'd'] as const).map(opt => {
                      const optText = (q as any)[`option_${opt}`];
                      const selected = answers[q.id] === opt;
                      return (
                        <button key={opt}
                          onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all text-sm
                            ${selected
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                          <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold border-2
                            ${selected ? 'border-white text-white' : 'border-gray-300 text-gray-400'}`}>
                            {opt.toUpperCase()}
                          </span>
                          {optText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {test && !score && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <p className="text-xs text-gray-400">{Object.keys(answers).length}/{test.questions.length} answered</p>
            <button onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < test.questions.length}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-bold px-6 py-2.5 rounded-xl">
              {submitting ? 'Submitting…' : 'Submit Test'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Curriculum Panel ── */
interface CurriculumPanelProps {
  units: any[];
  courseId: number;
  progress: Record<number, boolean>;
  onMarkDone: (topicId: number, done: boolean) => void;
  isListening?: boolean;
}

const CurriculumPanel: React.FC<CurriculumPanelProps> = ({
  units, courseId, progress, onMarkDone, isListening,
}) => {
  const [openUnit, setOpenUnit] = useState<number | null>(0);
  const [activeTopic, setActiveTopic] = useState<{ unit: number; topic: number } | null>(null);
  const [videoPopup, setVideoPopup] = useState<{ id: string; title: string } | null>(null);
  const [activeTest, setActiveTest] = useState<{ unitId: number } | null>(null);

  // ✅ Only count topics belonging to this tab's own units
  const allTopicIds = new Set(units.flatMap(u => u.topics.map((t: any) => t.id)));
  const totalTopics = units.reduce((a, u) => a + u.topics.length, 0);
  const doneTopics = Object.entries(progress)
    .filter(([id, done]) => done && allTopicIds.has(Number(id)))
    .length;
  const pct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-500 font-medium">{doneTopics}/{totalTopics} lessons completed</span>
        <span className="font-bold text-sky-500">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-6">
        <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-2">
        {units.map((unit, ui) => (
          <div key={ui} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="flex items-center bg-white hover:bg-gray-50 transition-colors">
              <button
                className="flex-1 flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenUnit(openUnit === ui ? null : ui)}
              >
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-sky-500 uppercase">{unit.unit_label}</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{unit.unit_title}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform mr-3 ${openUnit === ui ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => setActiveTest({ unitId: unit.id })}
                className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-lg mr-4 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <HelpCircle className="w-3 h-3" />
                Unit Test
              </button>
            </div>

            {openUnit === ui && (
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {unit.topics.map((topic: any, ti: number) => {
                  const isActive = activeTopic?.unit === ui && activeTopic?.topic === ti;
                  const isDone = progress[topic.id] || false;
                  const hasPdf = !!topic.pdf_url;
                  const hasExVid = !!topic.exercise_youtube_id;

                  return (
                    <div key={ti} className="px-4 py-3 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <button
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                            ${isDone ? 'bg-emerald-100' : isActive ? 'bg-sky-500' : 'bg-sky-100 hover:bg-sky-200'}`}
                          onClick={() => setActiveTopic(isActive ? null : { unit: ui, topic: ti })}
                        >
                          {isDone
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            : <PlayCircle className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-sky-500'}`} />}
                        </button>
                        <span
                          className={`text-sm font-medium flex-1 cursor-pointer truncate
                            ${isDone ? 'text-emerald-500 line-through opacity-60' : isActive ? 'text-sky-600' : 'text-gray-600'}`}
                          onClick={() => setActiveTopic(isActive ? null : { unit: ui, topic: ti })}
                        >
                          {topic.title}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {hasPdf && <FileText className="w-3.5 h-3.5 text-orange-400" title="PDF lesson" />}
                          {hasExVid && <Youtube className="w-3.5 h-3.5 text-red-400" title="Exercise video" />}
                        </div>
                        {hasExVid && (
                          <button
                            onClick={() => setVideoPopup({
                              id: topic.exercise_youtube_id,
                              title: `${topic.title} — ${isListening ? 'Listening' : 'Exercise'}`,
                            })}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Youtube className="w-3 h-3" />
                            {isListening ? 'Listen' : 'Exercise'}
                          </button>
                        )}
                        {isActive && (
                          <button
                            onClick={() => onMarkDone(topic.id, !isDone)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0
                              ${isDone ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                          >
                            {isDone ? 'Undo' : '✓ Done'}
                          </button>
                        )}
                      </div>

                      {isActive && (
                        <div className="mt-4 ml-9 space-y-4">
                          {hasPdf ? (
                            <SecurePdfViewer pdfUrl={topic.pdf_url} />
                          ) : (
                            <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-xl text-sm text-gray-400 border border-dashed border-gray-200">
                              <FileText className="w-4 h-4" />
                              <span>No PDF lesson for this topic yet.</span>
                            </div>
                          )}
                          {isListening && hasExVid && (
                            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
                              <Volume2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <span className="text-xs text-purple-600 font-medium flex-1">Listening exercise available</span>
                              <button
                                onClick={() => setVideoPopup({
                                  id: topic.exercise_youtube_id,
                                  title: `${topic.title} — Listening`,
                                })}
                                className="text-[10px] font-bold text-purple-600 bg-purple-100 hover:bg-purple-200 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                              >
                                <PlayCircle className="w-3 h-3" /> Play
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {videoPopup && (
        <VideoPopup youtubeId={videoPopup.id} title={videoPopup.title} onClose={() => setVideoPopup(null)} />
      )}
      {activeTest && (
        <UnitTestPanel unitId={activeTest.unitId} isListening={isListening} onClose={() => setActiveTest(null)} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LISTENING TAB
═══════════════════════════════════════════════════════════════ */
interface ListeningTabProps {
  courseDetail: any;
  progress: Record<number, boolean>;
  onMarkDone: (topicId: number, done: boolean) => void;
}

const ListeningTab: React.FC<ListeningTabProps> = ({ courseDetail, progress, onMarkDone }) => {
  return (
    <>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
        {courseDetail.title} — Listening
      </h2>
      <CurriculumPanel
        units={courseDetail.listeningCurriculum || []}
        courseId={courseDetail.id}
        progress={progress}
        onMarkDone={onMarkDone}
        isListening
      />
    </>
  );
};

export default ListeningTab;