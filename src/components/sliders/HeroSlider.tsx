import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const slides = [
  {
    id: 1,
    badge: "Now enrolling — New batch",
    title: "Parlez français",
    titleAccent: "with confidence.",
    subtitle: "De A1 à B2 — DELF, TEF & TCF ready",
    desc: "Expert-led French coaching in small batches. Real results, personal attention, no fluff.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1600",
    cta1: "Join a Batch",
    cta2: "Book Free Consultation",
  },
  {
    id: 2,
    badge: "A1 · A2 · B1 · B2 — all levels covered",
    title: "Small batches.",
    titleAccent: "Big breakthroughs.",
    subtitle: "Maximum 8 students per batch",
    desc: "Build strong foundations and develop real communication skills with a trainer who knows your name.",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d93e114?auto=format&fit=crop&q=80&w=1600",
    cta1: "Explore Batches",
    cta2: "See the Curriculum",
  },
  {
    id: 3,
    badge: "500+ students passed DELF / TEF / TCF",
    title: "Pass your exam.",
    titleAccent: "On the first try.",
    subtitle: "Proven exam strategy & mock tests",
    desc: "Structured prep for DELF, TEF, and TCF with timed practice, feedback, and exam-day tactics.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1600",
    cta1: "Start Exam Prep",
    cta2: "Talk to a Trainer",
  },
];

const trustItems = [
  { icon: "✦", label: "DELF certified trainer" },
  { icon: "✦", label: "Max 8 students / batch" },
  { icon: "✦", label: "500+ students passed" },
];

const stats = [
  { num: "500+", label: "Students Passed" },
  { num: "8",    label: "Max Batch Size" },
  { num: "A1–B2", label: "All Levels" },
];

const INTERVAL = 6000;

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCycle = () => {
    if (intervalRef.current)  clearInterval(intervalRef.current);
    if (progressRef.current)  clearInterval(progressRef.current);

    setProgress(0);
    const step = 100 / (INTERVAL / 50);

    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 50);

    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setProgress(0);
    }, INTERVAL);
  };

  useEffect(() => {
    startCycle();
    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current);
      if (progressRef.current)  clearInterval(progressRef.current);
    };
  }, []);

  const goTo = (i: number) => { setIndex(i); startCycle(); };
  const slide = slides[index];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0f]">

      {/* ── Background image ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/92 via-[#0a0a0f]/60 to-[#0a0a0f]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/75 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── French tricolor accent ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-30 flex">
        <div className="flex-1 bg-[#002395]" />
        <div className="flex-1 bg-white/80" />
        <div className="flex-1 bg-[#ED2939]" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-20 h-full flex flex-col justify-center
                      px-5 sm:px-10 md:px-16 lg:px-20
                      max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${index}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4 sm:mb-6
                         px-3 py-1 sm:px-4 sm:py-1.5
                         rounded-full border border-white/20 bg-white/8 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 text-[10px] sm:text-xs tracking-widest uppercase font-medium">
                {slide.badge}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="font-bold text-white leading-[1.1] mb-1"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
              }}
            >
              {slide.title}
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="font-bold leading-[1.1] mb-3 sm:mb-4"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                color: 'transparent',
                WebkitTextStroke: '1.5px rgba(255,255,255,0.55)',
              }}
            >
              {slide.titleAccent}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-xs sm:text-sm md:text-base text-white/55 italic mb-3 tracking-wide"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {slide.subtitle}
            </motion.p>

            {/* Rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
              className="origin-left w-16 sm:w-20 h-px bg-blue-500 mb-4 sm:mb-5"
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-white/75 mb-6 sm:mb-8
                         max-w-xs sm:max-w-sm md:max-w-md leading-relaxed"
            >
              {slide.desc}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 mb-7 sm:mb-10"
            >
              <Button variant="primary" size="lg">{slide.cta1} →</Button>
              <Button variant="outline" size="lg">{slide.cta2}</Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="flex flex-wrap gap-3 sm:gap-5"
            >
              {trustItems.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-white/50 text-xs sm:text-sm">
                  <span className="text-blue-400 text-[10px] sm:text-xs">{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Right stats panel — desktop only ── */}
      <div className="absolute right-6 xl:right-10 top-1/2 -translate-y-1/2 z-20
                      hidden lg:flex flex-col gap-3 xl:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.6 }}
            className="bg-white/7 backdrop-blur-md border border-white/15 rounded-xl
                       px-4 xl:px-5 py-3 xl:py-4 text-center min-w-[100px] xl:min-w-[110px]"
          >
            <div className="text-xl xl:text-2xl font-semibold text-white">{s.num}</div>
            <div className="text-[10px] xl:text-[11px] text-white/45 mt-1 leading-tight">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Stats row — mobile/tablet only (horizontal, inside content) ── */}
      <div className="absolute bottom-24 sm:bottom-28 left-5 sm:left-10 right-5 z-20
                      flex lg:hidden items-center justify-start gap-4 sm:gap-6">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-base sm:text-lg font-bold text-white">{s.num}</div>
            <div className="text-[9px] sm:text-[10px] text-white/40 leading-tight mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Slide dots + progress ── */}
      <div className="absolute bottom-6 sm:bottom-8 left-5 sm:left-10 md:left-20 z-30
                      flex items-center gap-2 sm:gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative h-[3px] rounded-full overflow-hidden transition-all duration-300"
            style={{
              width: index === i ? 40 : 14,
              background: 'rgba(255,255,255,0.25)',
            }}
          >
            {index === i && (
              <motion.div
                className="absolute inset-y-0 left-0 bg-white"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
        <span className="text-white/30 text-[10px] sm:text-xs ml-1 sm:ml-2 font-mono">
          0{index + 1} / 0{slides.length}
        </span>
      </div>
    </div>
  );
};

export default HeroSlider;