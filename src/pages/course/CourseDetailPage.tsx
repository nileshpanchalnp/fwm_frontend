// src/pages/course/CourseDetailPage.tsx
//
// ENROLLMENT BUTTON LOGIC:
//  user logged in + approved  → "Continue Learning" → /dashboard
//  user logged in + pending   → "Pending Approval" box
//  user logged in + expired   → "Renew Access" → /register (AuthPage skips signup)
//  user logged in + null      → "Enroll Now" → /register (AuthPage skips signup)
//  user NOT logged in         → "Enroll Now" → /register (AuthPage shows signup)

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi, enrollmentApi, CourseDetail } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2, PlayCircle, ChevronDown, ChevronRight,
  Star, Users, Clock, Shield,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const SecureVideoPlayer: React.FC<{ youtubeId: string; title: string }> = ({ youtubeId, title }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden bg-black relative select-none"
      style={{ aspectRatio: '16/9', userSelect: 'none' }}
      onContextMenu={e => e.preventDefault()}
    >
      {!playing ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer bg-gradient-to-br from-gray-900 to-black"
          onClick={() => setPlaying(true)}
        >
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <PlayCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-sm font-bold opacity-80">{title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" /><span>Protected Content</span>
          </div>
        </div>
      ) : (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
        />
      )}
    </div>
  );
};

const CurriculumSection: React.FC<{ units: any[] }> = ({ units }) => {
  const [openUnit, setOpenUnit] = useState<number | null>(0);
  const [activeTopic, setActiveTopic] = useState<{ unit: number; topic: number } | null>(null);
  return (
    <div className="space-y-3">
      {units.map((unit, ui) => (
        <div key={ui} className="border border-gray-100 rounded-2xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-red-50 transition-colors text-left"
            onClick={() => setOpenUnit(openUnit === ui ? null : ui)}
          >
            <div>
              <p className="text-xs font-black tracking-widest text-red-600 uppercase">{unit.unit_label}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{unit.unit_title}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openUnit === ui ? 'rotate-180' : ''}`} />
          </button>
          {openUnit === ui && (
            <div className="divide-y divide-gray-50">
              {unit.topics.map((topic: any, ti: number) => {
                const isActive = activeTopic?.unit === ui && activeTopic?.topic === ti;
                return (
                  <div key={ti} className="px-5 py-3">
                    <button
                      className="w-full flex items-center gap-3 text-left group"
                      onClick={() => setActiveTopic(isActive ? null : { unit: ui, topic: ti })}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'bg-red-600' : 'bg-gray-100 group-hover:bg-red-100'}`}>
                        <PlayCircle className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`} />
                      </div>
                      <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-red-600' : 'text-gray-700 group-hover:text-red-500'}`}>
                        {topic.title}
                      </span>
                    </button>
                    {isActive && topic.youtube_id && (
                      <div className="mt-3 ml-11">
                        <SecureVideoPlayer youtubeId={topic.youtube_id} title={topic.title} />
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
  );
};

const CourseDetailPage: React.FC = () => {
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [course, setCourse]                 = useState<CourseDetail | null>(null);
  const [loading, setLoading]               = useState(true);
  const [enrollStatus, setEnrollStatus]     = useState<string | null>(null);
  const [enrollChecking, setEnrollChecking] = useState(false);

  useEffect(() => {
    if (!slug) return;
    courseApi.getBySlug(slug)
      .then(d => { setCourse(d.course); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user || !course) { setEnrollStatus(null); return; }
    setEnrollChecking(true);
    enrollmentApi.check(course.id)
      .then(d => {
        if (d.enrolled)                  setEnrollStatus('approved');
        else if (d.status === 'pending') setEnrollStatus('pending');
        else if (d.status === 'expired') setEnrollStatus('expired');
        else                             setEnrollStatus(null);
      })
      .catch(() => setEnrollStatus(null))
      .finally(() => setEnrollChecking(false));
  }, [user, course]);

  const goToEnroll = () => {
    if (!course) return;
    navigate(`/register?courseId=${course.id}&title=${encodeURIComponent(course.title)}&price=${course.price}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-4xl font-black text-gray-900 mb-4">Course Not Found</p>
        <button onClick={() => navigate('/')} className="text-red-600 font-bold underline">Back to Home</button>
      </div>
    </div>
  );

  const formatPrice = (p: number) => `$${p.toLocaleString()}`;
  const discount = course.original_price ? Math.round((1 - course.price / course.original_price) * 100) : 0;

  const renderEnrollButton = () => {
    if (user && enrollChecking) {
      return <div className="w-full py-4 flex justify-center"><div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
    }
    if (enrollStatus === 'approved') {
      return (
        <button onClick={() => navigate('/dashboard')} className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm uppercase py-4 rounded-xl transition-colors">
          ✓ Continue Learning →
        </button>
      );
    }
    if (enrollStatus === 'pending') {
      return (
        <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl py-4 text-center">
          <p className="text-yellow-700 font-bold text-sm">⏳ Approval Pending</p>
          <p className="text-yellow-600 text-xs mt-1">Admin will approve within 24 hours</p>
        </div>
      );
    }
    if (enrollStatus === 'expired') {
      return (
        <button onClick={goToEnroll} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-sm uppercase py-4 rounded-xl transition-colors">
          🔄 Renew Access
        </button>
      );
    }
    return (
      <button onClick={goToEnroll} className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase py-4 rounded-xl transition-colors shadow-lg shadow-red-200">
        Enroll Now
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Shared Navbar (replaces the old inline dark nav bar) ── */}
      <Navbar />

      {/* ── Hero Header — kept dark, but now sits below the fixed Navbar ── */}
      {/* pt-24 gives clearance for the fixed Navbar (~80px tall) */}
      <div className="bg-gray-950 text-white pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-black tracking-[0.4em] text-red-500 uppercase">{course.level}</span>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-400">{course.title}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-3 leading-tight">{course.title}</h1>
            <p className="text-lg text-gray-300 mb-5">{course.subtitle}</p>
            <div className="flex flex-wrap gap-5 text-sm text-gray-300 mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white">{course.rating}</span>
                <span className="text-gray-400">rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-green-400" />
                <span>{course.hours}+ hours of content</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2">
          <p className="text-gray-600 leading-relaxed mb-10">{course.description}</p>

          {course.whatYouLearn?.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-black text-gray-900 mb-5 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1 h-5 bg-red-600 rounded-full inline-block" /> What You'll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.whatYouLearn.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                    <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {course.includes?.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-black text-gray-900 mb-5 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1 h-5 bg-red-600 rounded-full inline-block" /> Course Includes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.includes.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-2xl px-4 py-3 hover:border-red-200 hover:bg-red-50 transition-colors">
                    <span className="text-xl">📦</span>
                    <span className="text-sm font-semibold text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum accordion — shown only when units data is available */}
          {course.units?.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-black text-gray-900 mb-5 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1 h-5 bg-red-600 rounded-full inline-block" /> Curriculum
              </h2>
              <CurriculumSection units={course.units} />
            </div>
          )}

          <div className="mb-10">
            <h2 className="text-lg font-black text-gray-900 mb-5 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" /> Course Details
            </h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {[
                { label: 'Level',    value: course.level },
                { label: 'Duration', value: `${course.hours}+ hours` },
                { label: 'Students', value: course.students.toLocaleString() },
                { label: 'Rating',   value: `${course.rating} / 5` },
              ].filter(r => r.value).map((row, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{row.label}</span>
                  <span className="text-sm font-bold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Enrollment Card ── */}
        <div className="lg:sticky lg:top-24">
          <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-xl bg-white">

            {/* Preview thumbnail — gradient placeholder instead of external image */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-950 aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <PlayCircle className="w-7 h-7 text-white opacity-80" />
                </div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">
                  {course.level} · French
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-black text-gray-900">{formatPrice(course.price)}</span>
                {course.original_price > course.price && (
                  <span className="text-lg text-gray-400 line-through">{formatPrice(course.original_price)}</span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-black text-white bg-red-600 px-2 py-0.5 rounded-full">{discount}% OFF</span>
                )}
              </div>
              <p className="text-xs text-red-600 font-bold mb-5">⏰ Limited Time Offer</p>
              {renderEnrollButton()}
              {user && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Logged in as <span className="font-bold text-gray-600">{user.email}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Shared Footer ── */}
      <Footer />
    </div>
  );
};

export default CourseDetailPage;