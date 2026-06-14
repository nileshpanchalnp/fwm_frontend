// src/pages/course/AllCoursesPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { courseApi, Course } from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const LEVEL_CONFIG: Record<string, {
  tag: string;
  color: string;
  accent: string;
  border: string;
  bg: string;
  dot: string;
}> = {
  Beginner: {
    tag: 'A1 → A2',
    color: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  Intermediate: {
    tag: 'B1 + TEF',
    color: 'from-blue-500 to-indigo-600',
    accent: 'text-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
  },
  Advanced: {
    tag: 'B2 + TEF',
    color: 'from-red-500 to-rose-600',
    accent: 'text-red-600',
    border: 'border-red-200',
    bg: 'bg-red-50',
    dot: 'bg-red-500',
  },
};

const DEFAULT_CONFIG = {
  tag: 'Standard',
  color: 'from-gray-500 to-gray-700',
  accent: 'text-gray-600',
  border: 'border-gray-200',
  bg: 'bg-gray-50',
  dot: 'bg-gray-500',
};

const AllCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  const fetchCourses = () => {
    setLoading(true);
    courseApi.getAll()
      .then(d => {
        if (d?.courses)       setCourses(d.courses);
        else if (Array.isArray(d)) setCourses(d);
      })
      .catch(err => console.error('Mobile Fetch Error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Loading Journey...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Shared Navbar ── */}
      <Navbar />

      {/* ── Hero Header — pt-24 clears the fixed Navbar ── */}
      <div className="bg-gray-950 text-white pb-12 pt-24 sm:pb-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-red-500 font-black text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4">
            Our Programs
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none mb-4 uppercase tracking-tighter">
            Choose Your<br />
            <span className="text-red-500">Journey</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl leading-relaxed">
            From absolute beginner to expert fluency. Structured curriculum designed for the TEF/TCF exams.
          </p>
        </div>
      </div>

      {/* ── Course Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-16">
        {courses.length === 0 ? (
          <div className="text-center py-20 px-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-bold mb-2">Connection Issue</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              We couldn't load the courses. Please check your internet or retry.
            </p>
            <button
              onClick={fetchCourses}
              className="bg-gray-900 text-white text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-widest active:scale-95 transition-all"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course, index) => {
              const levelKey = Object.keys(LEVEL_CONFIG).find(k => k.toLowerCase() === course.level?.toLowerCase()) || '';
              const cfg = LEVEL_CONFIG[levelKey] ?? DEFAULT_CONFIG;

              return (
                <div
                  key={course.slug}
                  onMouseEnter={() => setHovered(course.slug)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate(`/cours/${course.slug}`)}
                  className={`
                    group relative rounded-3xl border-2 transition-all duration-300 overflow-hidden cursor-pointer bg-white
                    ${hovered === course.slug
                      ? `${cfg.border} shadow-2xl shadow-gray-200 -translate-y-1`
                      : 'border-gray-100 shadow-sm'}
                  `}
                >
                  <div className={`h-2 w-full bg-gradient-to-r ${cfg.color}`} />

                  <div className="p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-[10px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.accent} border ${cfg.border}`}>
                        {cfg.tag}
                      </span>
                      <span className="text-2xl font-black text-gray-100 group-hover:text-gray-200 transition-colors select-none">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 uppercase leading-tight mb-3 tracking-tight group-hover:text-red-600 transition-colors">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-6">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {course.level} Level
                      </span>
                    </div>

                    <div className="border-t border-gray-100 mb-6" />

                    <ul className="space-y-3 mb-8">
                      {course.features?.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.accent}`} />
                          <span className="leading-snug font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`
                        w-full flex items-center justify-between px-5 py-4 rounded-2xl
                        font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-200
                        bg-gray-950 text-white group-hover:bg-gradient-to-r ${cfg.color}
                        shadow-lg active:scale-95
                      `}
                    >
                      Explore Curriculum
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Shared Footer (replaces the old inline bottom CTA) ── */}
      <Footer />
    </div>
  );
};

export default AllCoursesPage;