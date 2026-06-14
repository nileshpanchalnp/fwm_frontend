import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import TestimonialSlider from '../sliders/TestimonialSlider';

/* ─────────────────────────────────────────────────────────────
   BREAKPOINT STRATEGY  (mirrors Tutor exactly)
   < 768px  (mobile)   → stacked, normal scroll, whileInView
   768–1023 (tablet)   → left image 50% | right content 50%
   ≥ 1024px (desktop)  → original sticky parallax, ZERO changes
───────────────────────────────────────────────────────────── */

const PARIS_IMG =
  'https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=1000';

/* ── Shared stats data ── */
const STATS = [
  { value: '500', suffix: '+', label: 'Students Graduated', suffixColor: 'text-blue-600' },
  { value: '4.9', suffix: '★', label: 'Google Rating',      suffixColor: 'text-yellow-500' },
  { value: '100', suffix: '%', label: 'Success Result',     suffixColor: 'text-blue-600' },
];

/* ══════════════════════════════════════════════════════════════
   MOBILE  (<768px)  — stacked, normal scroll
══════════════════════════════════════════════════════════════ */
const TestimonialsMobile: React.FC = () => (
  <section className="bg-white block md:hidden">

    {/* Image panel */}
    <div className="relative w-full overflow-hidden" style={{ minHeight: '260px' }}>
      <img
        src={PARIS_IMG}
        alt="Paris"
        className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3]"
      />
      <div className="relative flex flex-col items-center justify-center py-14 gap-2 text-center px-6">
        <p className="text-blue-500 font-black text-xs tracking-[0.5em] uppercase">Wall of Fame</p>
        <h2 className="text-white text-4xl font-black leading-[0.9] uppercase tracking-tighter mt-2">
          THE <br />SUCCESS <br /><span className="text-blue-500">STORIES</span>
        </h2>
      </div>
    </div>

    {/* Content */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="px-6 py-10"
    >
      {/* Header label */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase whitespace-nowrap">
          Student Voice
        </span>
        <div className="h-[1px] flex-grow bg-gray-100" />
      </div>

      {/* Slider */}
      <div className="relative mb-10">
        <div className="absolute -left-2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-600 to-transparent opacity-50" />
        <TestimonialSlider />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-8">
        {STATS.map(({ value, suffix, label, suffixColor }) => (
          <div key={label} className="relative group">
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                {value}
              </span>
              <span className={`text-base font-black ${suffixColor}`}>{suffix}</span>
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 leading-tight">
              {label}
            </p>
            <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>
    </motion.div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   TABLET  (768px → <1024px)
   Left: blue sidebar strip + Paris image (50%)
   Right: content panel (50%)
══════════════════════════════════════════════════════════════ */
const TestimonialsTablet: React.FC = () => (
  <section className="bg-white hidden md:flex lg:hidden" style={{ minHeight: '100vh' }}>

    {/* LEFT — image panel */}
    <div className="w-1/2 shrink-0 relative overflow-hidden">
      <img
        src={PARIS_IMG}
        alt="Paris"
        className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3]"
      />

      {/* Blue sidebar strip — matches desktop sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-blue-600 z-10 flex items-center justify-center">
        <span className="-rotate-90 text-white font-black text-[9px] tracking-[0.4em] whitespace-nowrap opacity-40">
          TESTIMONIALS
        </span>
      </div>

      {/* Overlay text */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full pl-10 px-6 text-center gap-3">
        <p className="text-blue-500 font-black text-xs tracking-[0.5em] uppercase">Wall of Fame</p>
        <h2 className="text-white text-4xl font-black leading-[0.88] uppercase tracking-tighter">
          THE <br />SUCCESS <br /><span className="text-blue-500">STORIES</span>
        </h2>
      </div>
    </div>

    {/* RIGHT — content panel */}
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-1/2 flex flex-col justify-center px-8 py-10 overflow-y-auto bg-white relative"
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] select-none pointer-events-none overflow-hidden">
        <h2 className="text-[18vw] font-black whitespace-nowrap text-gray-900">REVIEWS</h2>
      </div>

      <div className="relative">
        {/* Header label */}
        <div className="flex items-center gap-4 mb-7">
          <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase whitespace-nowrap">
            Student Voice
          </span>
          <div className="h-[1px] flex-grow bg-gray-100" />
        </div>

        {/* Slider */}
        <div className="relative mb-8">
          <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-600 to-transparent opacity-50" />
          <TestimonialSlider />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
          {STATS.map(({ value, suffix, label, suffixColor }) => (
            <div key={label} className="relative group">
              <div className="flex items-baseline gap-0.5">
                <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors duration-500">
                  {value}
                </span>
                <span className={`text-lg font-black ${suffixColor}`}>{suffix}</span>
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 leading-tight">
                {label}
              </p>
              <div className="absolute -bottom-2 left-0 w-0 h-[3px] bg-blue-600 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   DESKTOP  (≥1024px) — original sticky parallax, ZERO changes
══════════════════════════════════════════════════════════════ */
const TestimonialsDesktop: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const testimonialsImgScale = useTransform(
    scrollYProgress, [0, 0.28, 0.72, 1], [1.25, 1.0, 1.0, 1.25]
  );
  const smoothImgScale = useSpring(testimonialsImgScale, { stiffness: 75, damping: 18 });
  const imgOpacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);

  const contentScale = useTransform(
    scrollYProgress, [0, 0.08, 0.28, 0.75, 1], [0.7, 0.75, 1.0, 1.0, 0.9]
  );
  const smoothContentScale = useSpring(contentScale, { stiffness: 65, damping: 16 });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.12, 0.78, 1], [0, 1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.25], [40, 0]);
  const smoothContentY = useSpring(contentY, { stiffness: 65, damping: 16 });

  const sidebarOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex bg-white overflow-hidden h-screen hidden lg:flex"
    >
      {/* 1. STICKY LEFT BLUE BAR */}
      <motion.div
        style={{ opacity: sidebarOpacity }}
        className="sticky top-0 h-screen w-[15%] bg-blue-600 flex items-center justify-center z-30"
      >
        <h2 className="-rotate-90 text-white font-black text-6xl tracking-[0.3em] whitespace-nowrap opacity-20 select-none">
          TESTIMONIALS
        </h2>
      </motion.div>

      {/* 2. STICKY IMAGE */}
      <div className="sticky top-0 h-screen w-[35%] overflow-hidden flex-shrink-0 z-30">
        <motion.img
          src={PARIS_IMG}
          style={{ scale: smoothImgScale, opacity: imgOpacity }}
          className="h-full w-full object-cover grayscale brightness-[0.3] origin-center"
          alt="Paris"
        />
        <motion.div
          style={{ opacity: imgOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center p-12"
        >
          <div className="space-y-0">
            <p className="text-blue-500 font-black text-sm tracking-[0.5em] mb-4 uppercase text-center">
              Wall of Fame
            </p>
            <h2 className="text-white text-6xl font-black leading-[0.85] uppercase tracking-tighter text-center">
              THE <br />SUCCESS <br /><span className="text-blue-500">STORIES</span>
            </h2>
          </div>
        </motion.div>
      </div>

      {/* 3. CONTENT AREA */}
      <motion.div
        style={{
          scale: smoothContentScale,
          opacity: contentOpacity,
          y: smoothContentY,
          transformOrigin: 'center center',
        }}
        className="w-[50%] relative flex items-center bg-white z-20"
      >
        <div className="relative z-10 w-full px-16 flex flex-col justify-center">

          {/* Header */}
          <div className="flex items-center gap-6 mb-10">
            <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase whitespace-nowrap">
              Student Voice
            </span>
            <div className="h-[1px] flex-grow bg-gray-100" />
          </div>

          {/* Slider */}
          <div className="relative mb-12">
            <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-600 to-transparent opacity-50" />
            <div className="bg-white p-2 border-none">
              <TestimonialSlider />
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 ml-10 pt-12 mb-10">
            {STATS.map(({ value, suffix, label, suffixColor }) => (
              <div key={label} className="relative group">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors duration-500">
                    {value}
                  </span>
                  <span className={`text-2xl font-black ${suffixColor}`}>{suffix}</span>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">
                  {label}
                </p>
                <div className="absolute -bottom-2 left-0 w-0 h-[3px] bg-blue-600 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>

        </div>
      </motion.div>
    </section>
  );
};

/* ── Default export ── */
const Testimonials: React.FC = () => (
  <>
    <TestimonialsMobile />
    <TestimonialsTablet />
    <TestimonialsDesktop />
  </>
);

export default Testimonials;