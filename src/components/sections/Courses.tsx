import React, { useRef, useLayoutEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { courses } from '../../data/courseData';
import { CheckCircle2, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   BREAKPOINT STRATEGY  (mirrors Tutor & Testimonials exactly)
   < 768px  (mobile)   → stacked cards, normal scroll
   768–1023 (tablet)   → left image 50% | right cards 50%
   ≥ 1024px (desktop)  → original horizontal scroll, ZERO changes
───────────────────────────────────────────────────────────── */

const FRANCE_IMG =
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000';

/* ══════════════════════════════════════════════════════════════
   MOBILE  (<768px)
══════════════════════════════════════════════════════════════ */
const CoursesMobile: React.FC = () => {
  const navigate = useNavigate();
  const handleExplore = () => navigate('/courses');

  return (
    <section className="bg-white block md:hidden py-14 px-5">

      {/* Header */}
      <div className="mb-10">
        <p className="text-red-600 font-black text-xs tracking-[0.4em] uppercase mb-3">
          Nos Cours
        </p>
        <h2 className="text-4xl font-black text-gray-900 leading-tight uppercase">
          START YOUR <br />
          <span className="text-red-600">JOURNEY</span>
        </h2>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-12">
        {courses.map((course, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
            className="relative border-t-2 border-red-600 pt-6"
          >
            {/* Ghost level number */}
            <span className="absolute -top-5 right-0 text-7xl font-black opacity-[0.04] text-gray-900 select-none leading-none">
              {course.level}
            </span>

            {/* Level badge */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[2px] w-8 bg-red-600" />
              <span className="text-red-600 font-black text-xs tracking-widest uppercase">
                {course.level}
              </span>
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase leading-tight">
              {course.title}
            </h3>

            {course.description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {course.description}
              </p>
            )}

            <ul className="space-y-2 mb-6">
              {course.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-bold">
                  <CheckCircle2 className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleExplore}
              className="group flex items-center gap-2 font-black text-[10px] text-black uppercase tracking-[0.2em] border-b-2 border-red-600 pb-1 transition-all w-fit hover:text-red-600"
            >
              Explore Curriculum
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 pt-8 border-t border-gray-100 text-center">
        <button
          onClick={handleExplore}
          className="bg-red-600 text-white font-black text-xs tracking-widest uppercase px-8 py-4 rounded-full shadow-lg active:scale-95 transition-all"
        >
          View All Courses
        </button>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   TABLET  (768px → <1024px)
   Left: red sidebar strip + France image (50%)
   Right: scrollable course cards (50%)
══════════════════════════════════════════════════════════════ */
const CoursesTablet: React.FC = () => {
  const navigate = useNavigate();
  const handleExplore = () => navigate('/courses');

  return (
    <section className="bg-white hidden md:flex lg:hidden">

      {/* LEFT — image panel, sticky */}
      <div className="w-1/2 shrink-0 sticky top-0 h-screen overflow-hidden">
        <img
          src={FRANCE_IMG}
          alt="France"
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
        />

        {/* Red sidebar strip */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-red-600 z-10 flex items-center justify-center">
          <span className="-rotate-90 text-white font-black text-[9px] tracking-[0.4em] whitespace-nowrap opacity-40">
            COURSES
          </span>
        </div>

        {/* Overlay text */}
        <div className="relative z-20 flex flex-col justify-center h-full pl-14 pr-6">
          <p className="text-red-400 font-black text-xs tracking-[0.4em] uppercase mb-4">
            Nos Cours
          </p>
          <h2 className="text-white text-4xl font-black leading-[0.9] uppercase tracking-tighter">
            START YOUR <br />
            <span className="text-red-500">JOURNEY</span> <br />
            FROM A1
          </h2>
        </div>
      </div>

      {/* RIGHT — scrollable course cards */}
      <div className="w-1/2 bg-white overflow-y-auto">
        <div className="px-8 py-12 flex flex-col gap-12">

          {courses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: idx * 0.06, ease: 'easeOut' }}
              className="relative border-t-2 border-red-600 pt-6"
            >
              {/* Ghost level */}
              <span className="absolute -top-5 right-0 text-6xl font-black opacity-[0.04] text-gray-900 select-none leading-none">
                {course.level}
              </span>

              {/* Level badge */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[2px] w-8 bg-red-600" />
                <span className="text-red-600 font-black text-xs tracking-widest uppercase">
                  {course.level}
                </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3 uppercase leading-tight">
                {course.title}
              </h3>

              {course.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {course.description}
                </p>
              )}

              <ul className="space-y-2 mb-5">
                {course.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-bold">
                    <CheckCircle2 className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleExplore}
                className="group flex items-center gap-2 font-black text-[10px] text-black uppercase tracking-[0.2em] border-b-2 border-red-600 pb-1 transition-all w-fit hover:text-red-600"
              >
                Explore Curriculum
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}

          {/* Bottom CTA */}
          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={handleExplore}
              className="bg-red-600 text-white font-black text-xs tracking-widest uppercase px-8 py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              View All Courses
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   DESKTOP  (≥1024px) — original horizontal scroll, ZERO changes
══════════════════════════════════════════════════════════════ */
const CoursesDesktop: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const endMarkerRef = useRef<HTMLDivElement>(null);

  const [scrollDistance, setScrollDistance] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(3000);
  const [bgText, setBgText] = useState(courses[0]?.level || '');

  const handleExplore = () => navigate('/courses');

  useLayoutEffect(() => {
    const measure = () => {
      if (!endMarkerRef.current || !containerRef.current || !stripRef.current) return;

      stripRef.current.style.transform = 'translateX(0px)';

      requestAnimationFrame(() => {
        if (!endMarkerRef.current || !containerRef.current) return;
        const containerLeft = containerRef.current.getBoundingClientRect().left;
        const containerWidth = containerRef.current.offsetWidth;
        const lastCardRight = endMarkerRef.current.getBoundingClientRect().right;
        const dist = Math.max(0, lastCardRight - containerLeft - containerWidth);

        setScrollDistance(dist);
        setSectionHeight(dist + window.innerHeight * 2);
        if (stripRef.current) stripRef.current.style.transform = '';
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);
  const smoothX = useSpring(x, { stiffness: 100, damping: 20 });

  // ── Image animation — mirrors Testimonials exactly ──────────
  const coursesImgScale = useTransform(
    scrollYProgress, [0, 0.28, 0.72, 1], [1.25, 1.0, 1.0, 1.25]
  );
  const smoothImgScale = useSpring(coursesImgScale, { stiffness: 75, damping: 18 });
  const imgOpacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);
  // ────────────────────────────────────────────────────────────

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const index = Math.min(Math.floor(latest * courses.length), courses.length - 1);
    if (courses[index]) {
      const title = courses[index].title;
      let shortLevel = '';
      if (title.includes('A1 + A2')) shortLevel = 'A1 + A2';
      else if (title.includes('B1 + TEF')) shortLevel = 'B1 + TEF';
      else if (title.includes('B2 + TEF')) shortLevel = 'B2 + TEF';
      else if (title.includes('one-on-one')) shortLevel = 'one-on-one';
      else shortLevel = courses[index].level;
      setBgText(shortLevel);
    }
  });

  return (
    <section
      ref={sectionRef}
      id="courses"
      className="relative flex bg-white hidden lg:flex"
      style={{ height: sectionHeight }}
    >
      {/* 1. Red Side Bar */}
      <div className="sticky top-0 h-screen w-[15%] bg-red-600 flex items-center justify-center flex-shrink-0 z-30">
        <h2 className="-rotate-90 text-white font-black text-5xl tracking-[0.5em] whitespace-nowrap opacity-20 select-none">
          COURSES
        </h2>
      </div>

      {/* 2. Courses Image Visual */}
      <div className="sticky top-0 h-screen w-[35%] overflow-hidden flex-shrink-0 z-30">
        <motion.img
          src={FRANCE_IMG}
          style={{ scale: smoothImgScale, opacity: imgOpacity }}
          className="h-full w-full object-cover grayscale brightness-50 origin-center"
          alt="France"
        />
        <motion.div
          style={{ opacity: imgOpacity }}
          className="absolute inset-0 flex items-center justify-center p-12 bg-black/10"
        >
          <p className="text-white text-4xl font-black leading-tight">
            START YOUR <br /> <span className="text-red-500">JOURNEY</span> <br /> FROM A1
          </p>
        </motion.div>
      </div>

      {/* 3. Horizontal Content Area */}
      <div ref={containerRef} className="w-[50%] flex-shrink-0 relative z-20">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-white">

          {/* Dynamic background text */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-4 overflow-hidden">
              <motion.h2
                key={bgText}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 0.06, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="font-black text-gray-900 whitespace-nowrap uppercase select-none leading-none"
                style={{ fontSize: 'clamp(80px, 14vw, 200px)', letterSpacing: '-0.02em' }}
              >
                {bgText}
              </motion.h2>
            </div>
          </div>

          {/* Scrolling Cards Strip */}
          <motion.div
            ref={stripRef}
            style={{ x: smoothX, position: 'relative', zIndex: 10 }}
            className="flex gap-60 pl-32 pr-[100vw]"
          >
            {courses.map((course, idx) => (
              <div
                key={idx}
                className="w-[500px] flex-shrink-0 flex flex-col justify-center py-20"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[2px] w-12 bg-red-600" />
                  <span className="text-red-600 font-black text-sm tracking-widest uppercase">
                    {course.level}
                  </span>
                </div>

                <h3 className="text-6xl font-black text-gray-900 mb-6 leading-[0.9] uppercase tracking-tighter">
                  {course.title}
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                  {course.description}
                </p>

                <ul className="space-y-4 mb-12">
                  {course.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="text-red-500 flex-shrink-0 w-5 h-5 mt-1" />
                      <span className="text-base font-bold text-gray-800 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleExplore}
                  className="group flex items-center gap-3 font-black text-xs text-black uppercase tracking-[0.3em] hover:text-red-600 transition-all w-fit"
                >
                  Explore Curriculum
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            ))}
            <div ref={endMarkerRef} className="w-1 flex-shrink-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ── Default export ── */
const Courses: React.FC = () => (
  <>
    <CoursesMobile />
    <CoursesTablet />
    <CoursesDesktop />
  </>
);

export default Courses;