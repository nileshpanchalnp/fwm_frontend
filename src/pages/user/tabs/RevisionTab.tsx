// src/pages/user/tabs/RevisionTab.tsx
//
// Shown ONLY during the 'revision' access phase.
//
// Tabs:
//   1. Revision Units  — admin-defined revision curriculum (reading/PDFs/videos)
//   2. Writing         — always accessible
//   3. Certificates    — always accessible
//
import React, { useState } from 'react';
import {
  PenLine, Award, RotateCcw, Clock, 
  FileText, Youtube, ChevronDown, 
  Lock, CheckCircle2, PlayCircle, Shield,
} from 'lucide-react';
import WritingTab      from './WritingTab';
import CertificatesTab from './CertificatesTab';
import VideoPopup, { toDriveEmbedUrl } from './VideoPopup';
import { CourseUnit }  from '../../../api/client';

type RevisionSubTab = 'units' | 'writing' | 'certificates';

interface RevisionTabProps {
  /** Days remaining in revision window (0 = last day). */
  daysLeft: number | null;
  /** When the revision window ends. */
  revisionEndsAt: Date | null;
  /** Admin-configured revision curriculum units. May be empty. */
  revisionCurriculum?: CourseUnit[];
  /** Progress map: topic_id → completed */
  progress?: Record<number, boolean>;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/* ── Secure PDF Viewer ── */
const SecurePdfViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  // Fix: Convert raw Google Drive link to preview embed format safely
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

/* ── Revision unit viewer ────────────────────────────────────────── */
const RevisionUnitList: React.FC<{
  units: CourseUnit[];
  progress: Record<number, boolean>;
  onPlayVideo: (youtubeId: string, title: string) => void;
}> = ({ units, progress, onPlayVideo }) => {
  const [openUnit, setOpenUnit] = useState<number | null>(units.length > 0 ? 0 : null);
  const [activeTopic, setActiveTopic] = useState<{ unit: number; topic: number } | null>(null);

  if (units.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-3 mx-auto">
          <RotateCcw className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No Revision Units</p>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
          Your admin hasn't added any revision materials for this course yet.
          Check back later or contact support.
        </p>
      </div>
    );
  }

  // Calculate metrics across all topics in the revision section
  // const allTopicIds = new Set(units.flatMap(u => u.topics.map(t => t.id)));
  // const totalTopics = units.reduce((a, u) => a + u.topics.length, 0);
  // const doneTopics = Object.entries(progress)
  //   .filter(([id, done]) => done && allTopicIds.has(Number(id)))
  //   .length;
  // const pct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <div>
      {/* Progress Metric Bar */}
      {/* <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-500 font-medium">{doneTopics}/{totalTopics} revision milestones done</span>
        <span className="font-bold text-amber-500">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-6">
        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div> */}

      <div className="space-y-3">
        {units.map((unit, ui) => {
          const isUnitOpen = openUnit === ui;
          const unitTotal = unit.topics.length;
          const unitDone = unit.topics.filter(t => progress[t.id]).length;

          return (
            <div key={unit.id} className="border border-amber-200 rounded-xl overflow-hidden shadow-sm bg-white">
              {/* Unit header */}
              <button
                type="button"
                className="w-full flex items-center justify-between bg-amber-50/60 hover:bg-amber-50 px-5 py-4 text-left transition-colors"
                onClick={() => setOpenUnit(isUnitOpen ? null : ui)}
              >
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">{unit.unit_label || `Revision Block ${ui + 1}`}</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{unit.unit_title || 'Untitled Unit'}</p>
                  {unitTotal > 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      {unitTotal} topic{unitTotal !== 1 ? 's' : ''}
                      {unitDone > 0 && <span className="ml-1 text-emerald-600 font-semibold">({unitDone}/{unitTotal} completed)</span>}
                    </p>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${isUnitOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Topics block */}
              {isUnitOpen && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {unit.topics.map((topic, ti) => {
                    const isActive = activeTopic?.unit === ui && activeTopic?.topic === ti;
                    const isDone = progress[topic.id] || false;
                    const pdfUrl = topic.pdf_url;
                    const youtubeId = topic.exercise_youtube_id;
                    const hasPdf = !!pdfUrl;
                    const hasExVid = !!youtubeId;

                    return (
                      <div key={topic.id} className="px-4 py-3 bg-gray-50/30">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                              ${isDone ? 'bg-emerald-100' : isActive ? 'bg-amber-500' : 'bg-amber-100 hover:bg-amber-200'}`}
                            onClick={() => setActiveTopic(isActive ? null : { unit: ui, topic: ti })}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <PlayCircle className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                            )}
                          </button>

                          <span
                            className={`text-sm font-medium flex-1 cursor-pointer truncate
                              ${isDone ? 'text-emerald-500 line-through opacity-60' : isActive ? 'text-amber-700' : 'text-gray-600'}`}
                            onClick={() => setActiveTopic(isActive ? null : { unit: ui, topic: ti })}
                          >
                            {topic.title}
                          </span>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {hasPdf && <FileText className="w-3.5 h-3.5 text-orange-400" />}
                            {hasExVid && <Youtube className="w-3.5 h-3.5 text-red-400" />}
                          </div>

                          {hasExVid && (
                            <button
                              type="button"
                              onClick={() => youtubeId && onPlayVideo(youtubeId, `${topic.title} — Review Session`)}
                              className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Youtube className="w-3 h-3" />
                              Review Video
                            </button>
                          )}
                        </div>

                        {/* Dropdown Material Viewer */}
                        {isActive && (
                          <div className="mt-4 ml-9 space-y-4">
                            {hasPdf ? (
                              <SecurePdfViewer pdfUrl={pdfUrl!} />
                            ) : (
                              <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-xl text-sm text-gray-400 border border-dashed border-gray-200">
                                <FileText className="w-4 h-4" />
                                <span>No companion script or document attached.</span>
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
          );
        })}
      </div>
    </div>
  );
};

/* ── Main RevisionTab ────────────────────────────────────────────── */
const RevisionTab: React.FC<RevisionTabProps> = ({
  daysLeft,
  revisionEndsAt,
  revisionCurriculum = [],
  progress = {},
}) => {
  const [sub, setSub] = useState<RevisionSubTab>('units');
  const [videoPopup, setVideoPopup] = useState<{ id: string; title: string } | null>(null);

  const subTabs: { id: RevisionSubTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'units',
      label: 'Revision Units',
      icon: <RotateCcw className="w-4 h-4" />,
      badge: revisionCurriculum.length > 0 ? String(revisionCurriculum.length) : undefined,
    },
    { id: 'writing',      label: 'Writing',      icon: <PenLine className="w-4 h-4" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award   className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">

      {/* ── Revision status banner ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">Revision Mode Active</p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              Your course duration block has completed. You are now running inside your <strong>revision window</strong> — 
              regular core tabs are locked down. Use these standalone sets to review materials or look up records.
            </p>
            {revisionEndsAt && (
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-700">
                  {daysLeft != null && daysLeft > 0
                    ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                    : 'Last operating day'}{' '}
                  · Completes entirely {formatDate(revisionEndsAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Locked content notice */}
        <div className="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <p className="text-[11px] text-amber-600">
            <span className="font-bold">Reading &amp; Listening</span> tracks are locked during revision window processing.
          </p>
        </div>
      </div>

      {/* ── Tab panel ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Sub-tab strip */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSub(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap
                ${sub === tab.id
                  ? 'border-amber-500 text-amber-600 bg-amber-50'
                  : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 bg-amber-100 text-amber-600 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-6">
          {sub === 'units' && (
            <RevisionUnitList
              units={revisionCurriculum}
              progress={progress}
              onPlayVideo={(id, title) => setVideoPopup({ id, title })}
            />
          )}
          {sub === 'writing'      && <WritingTab />}
          {sub === 'certificates' && <CertificatesTab />}
        </div>
      </div>

      {/* Persistent global window draggable video container */}
      {videoPopup && (
        <VideoPopup
          youtubeId={videoPopup.id}
          title={videoPopup.title}
          onClose={() => setVideoPopup(null)}
        />
      )}
    </div>
  );
};

export default RevisionTab;