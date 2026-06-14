import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import ownerImg from '../../img/owner_img.jpeg';

/* ══════════════════════════════════════════════════════════════
   MOBILE  (<768px)  — stacked, normal scroll
══════════════════════════════════════════════════════════════ */
const TutorMobile: React.FC = () => (
  <section className="bg-white block md:hidden">
    <div className="relative bg-black w-full" style={{ minHeight: '300px' }}>
      <img
        src={ownerImg} alt="" aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 scale-110"
      />
      <div className="relative flex flex-col items-center justify-center py-10 gap-4">
        <img
          src={ownerImg} alt="Maitri Purohit"
          className="w-32 h-44 object-cover rounded-2xl shadow-2xl border-4 border-white/10"
        />
        <div className="text-center">
          <p className="text-white font-black tracking-wide text-lg">MAITRI PUROHIT</p>
          <p className="text-red-400 font-bold tracking-widest uppercase mt-1 text-[10px]">
            Founder of the Method
          </p>
        </div>
      </div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="px-6 py-10"
    >
      <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-[1.08]">
        Learning should be <span className="text-blue-600 italic">Cinematic.</span>
      </h2>
      <div className="mt-5 space-y-3 text-gray-500 text-sm leading-relaxed">
        <p className="border-l-2 border-blue-600 pl-4">I'm Maitri, a passionate French language instructor guiding students from A1 to B2 with focus on DELF, TEF, and TCF exams.</p>
        <p className="border-l-2 border-gray-200 pl-4">My approach blends structured learning with real communication and exam strategies for consistent progress.</p>
        <p className="border-l-2 border-gray-200 pl-4">Whether you're starting or preparing for certification, you'll follow a clear roadmap with continuous support.</p>
      </div>
      <div className="grid grid-cols-1 gap-y-3 mt-7">
        {['Build a strong grammatical foundation','Improve speaking fluency and confidence','Develop clear and structured writing','Perform effectively in exams'].map((p) => (
          <div key={p} className="flex items-start gap-3">
            <span className="mt-[5px] w-2 h-2 shrink-0 rounded-full bg-red-500" />
            <p className="text-[13px] text-gray-600">{p}</p>
          </div>
        ))}
      </div>
      <motion.button
        className="mt-7 bg-black text-white w-full px-10 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl"
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.22 }}
      >
        Join a Batch
      </motion.button>
    </motion.div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   TABLET  (768px → <1024px)
   FIX 1: left panel = 50% (was 40%)
   FIX 2: accent strip = WHITE bg + gray text (was red)
══════════════════════════════════════════════════════════════ */
const TutorTablet: React.FC = () => (
  <section className="bg-white hidden md:flex lg:hidden" style={{ minHeight: '100vh' }}>

    {/* LEFT — 50% image panel */}
    <div className="w-1/2 shrink-0 relative bg-black overflow-hidden">
      {/* blurred bg */}
      <img
        src={ownerImg} alt="" aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 scale-110"
      />

      {/* WHITE sidebar strip — matches original desktop sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-white z-10 border-r border-gray-100 flex items-center justify-center">
        <span className="-rotate-90 text-gray-200 font-black text-[9px] tracking-[0.4em] whitespace-nowrap">
          INSTRUCTOR
        </span>
      </div>

      {/* portrait + name */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full gap-4 pl-10">
        <img
          src={ownerImg} alt="Maitri Purohit"
          className="w-40 h-52 object-cover rounded-2xl shadow-2xl border-4 border-white/10"
        />
        <div className="text-center px-2">
          <p className="text-white font-black tracking-wide text-base">MAITRI PUROHIT</p>
          <p className="text-red-400 font-bold tracking-widest uppercase mt-1 text-[9px]">
            Founder of the Method
          </p>
        </div>
      </div>
    </div>

    {/* RIGHT — 50% text panel */}
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-1/2 flex flex-col justify-center px-8 py-10 overflow-y-auto relative bg-white"
    >
      {/* watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none overflow-hidden">
        <h2 className="text-[18vw] font-black whitespace-nowrap">MAITRI</h2>
      </div>

      <div className="relative">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-[1.08]">
          Learning should <br />
          be <span className="text-blue-600 italic">Cinematic.</span>
        </h2>

        <div className="mt-6 space-y-4 text-gray-500 text-[14px] leading-relaxed">
          <p className="border-l-2 border-blue-600 pl-4">I'm Maitri, a passionate French language instructor guiding students from A1 to B2 with focus on DELF, TEF, and TCF exams.</p>
          <p className="border-l-2 border-gray-200 pl-4">My approach blends structured learning with real communication and exam strategies for consistent progress.</p>
          <p className="border-l-2 border-gray-200 pl-4">Whether you're starting or preparing for certification, you'll follow a clear roadmap with continuous support.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-7">
          {['Build a strong grammatical foundation','Improve speaking fluency and confidence','Develop clear and structured writing','Perform effectively in exams'].map((p) => (
            <div key={p} className="flex items-start gap-2">
              <span className="mt-[5px] w-2 h-2 shrink-0 rounded-full bg-red-500" />
              <p className="text-[12px] text-gray-600">{p}</p>
            </div>
          ))}
        </div>

        <motion.button
          className="mt-7 bg-black text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl w-full"
          whileHover={{ scale: 1.04, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
          whileTap={{ scale: 0.97 }} transition={{ duration: 0.22 }}
        >
          Join a Batch
        </motion.button>
      </div>
    </motion.div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   DESKTOP  (≥1024px) — original sticky parallax, ZERO changes
══════════════════════════════════════════════════════════════ */
const TutorDesktop: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });

  const scale        = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1.3, 1, 1, 1.2]);
  const smoothScale  = useSpring(scale, { stiffness: 80, damping: 20 });
  const opacity      = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const headingY       = useTransform(scrollYProgress, [0.05, 0.35, 0.75, 1], [80, 0, 0, -60]);
  const headingOpacity = useTransform(scrollYProgress, [0.05, 0.3,  0.75, 1], [0, 1, 1, 0]);
  const smoothHeadingY = useSpring(headingY, { stiffness: 70, damping: 18 });

  const cinematicX       = useTransform(scrollYProgress, [0.12, 0.4], [60, 0]);
  const cinematicOpacity = useTransform(scrollYProgress, [0.12, 0.4], [0, 1]);
  const smoothCinematicX = useSpring(cinematicX, { stiffness: 60, damping: 16 });

  const quoteX       = useTransform(scrollYProgress, [0.18, 0.45], [-60, 0]);
  const quoteOpacity = useTransform(scrollYProgress, [0.18, 0.45], [0, 1]);
  const smoothQuoteX = useSpring(quoteX, { stiffness: 60, damping: 18 });

  const watermarkY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={sectionRef} className="relative bg-white hidden lg:block" style={{ height: '200vh' }}>
      <motion.div style={{ opacity }} className="sticky top-0 h-screen flex overflow-hidden">

        {/* Sidebar */}
        <div className="w-[15%] bg-white border-r border-gray-100 flex items-center justify-center z-30 shrink-0">
          <h2 className="-rotate-90 text-gray-200 font-black text-5xl tracking-[0.5em] whitespace-nowrap">INSTRUCTOR</h2>
        </div>

        {/* Image */}
        <div className="w-[35%] h-full relative overflow-hidden z-30 bg-black shrink-0">
          <motion.div style={{ scale: smoothScale }} className="absolute inset-0">
            <img src={ownerImg} alt="" aria-hidden="true" className="w-full h-full object-cover grayscale opacity-30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src={ownerImg} alt="Maitri Purohit" className="lg:w-52 lg:h-64 xl:w-60 xl:h-72 2xl:w-64 2xl:h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/10" />
              <div className="mt-4 text-center">
                <p className="text-white font-black lg:text-xl xl:text-2xl">MAITRI PUROHIT</p>
                <p className="text-red-400 font-bold tracking-widest text-xs uppercase mt-1">Founder of the Method</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right text */}
        <div className="w-[50%] lg:px-12 xl:px-16 2xl:px-20 flex flex-col justify-center bg-white relative z-20 overflow-hidden">
          <motion.div style={{ y: watermarkY }} className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
            <h2 className="text-[14vw] font-black">MAITRI</h2>
          </motion.div>

          <div className="relative w-full max-w-[640px]">
            <motion.h2 style={{ y: smoothHeadingY, opacity: headingOpacity }} className="lg:text-5xl xl:text-6xl font-black text-gray-900 leading-[1.05] tracking-tight">
              Learning should <br />be{' '}
              <motion.span style={{ x: smoothCinematicX, opacity: cinematicOpacity, display: 'inline-block' }} className="text-blue-600 italic">
                Cinematic.
              </motion.span>
            </motion.h2>

            <motion.div style={{ x: smoothQuoteX, opacity: quoteOpacity }} className="mt-8 space-y-5 text-gray-500 text-[17px] leading-relaxed">
              <p className="border-l-2 border-blue-600 pl-4">I'm Maitri, a passionate French language instructor guiding students from A1 to B2 with focus on DELF, TEF, and TCF exams.</p>
              <p className="border-l-2 border-gray-200 pl-4">My approach blends structured learning with real communication and exam strategies for consistent progress.</p>
              <p className="border-l-2 border-gray-200 pl-4">Whether you're starting or preparing for certification, you'll follow a clear roadmap with continuous support.</p>
            </motion.div>

            <motion.div style={{ opacity: quoteOpacity }} className="grid grid-cols-2 gap-x-10 gap-y-5 mt-12 pb-10">
              {['Build a strong grammatical foundation','Improve speaking fluency and confidence','Develop clear and structured writing','Perform effectively in exams'].map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <span className="mt-[6px] w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-[15px] text-gray-600">{p}</p>
                </div>
              ))}
            </motion.div>

            <motion.button
              className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl"
              whileHover={{ scale: 1.06, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
              whileTap={{ scale: 0.97 }} transition={{ duration: 0.22 }}
            >
              Join a Batch
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Tutor: React.FC = () => (
  <div id="tutor">
    <TutorMobile />
    <TutorTablet />
    <TutorDesktop />
  </div>
);

export default Tutor;