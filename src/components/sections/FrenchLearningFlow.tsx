// import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useSpring,
//   useMotionValueEvent,
// } from 'framer-motion';
// import { courses } from '../../data/courseData';
// import { CheckCircle2, ChevronRight } from 'lucide-react';
// import TestimonialSlider from '../sliders/TestimonialSlider';

// // ─────────────────────────────────────────────────────────────
// //  RESPONSIVE BREAKPOINTS
// // ─────────────────────────────────────────────────────────────

// const useWindowSize = () => {
//   const [size, setSize] = useState({
//     width: typeof window !== 'undefined' ? window.innerWidth : 1200,
//     height: typeof window !== 'undefined' ? window.innerHeight : 900,
//   });
//   useEffect(() => {
//     const handle = () => setSize({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', handle);
//     return () => window.removeEventListener('resize', handle);
//   }, []);
//   return size;
// };

// // ─────────────────────────────────────────────────────────────
// //  MOBILE / TABLET  — simple vertical layout
// // ─────────────────────────────────────────────────────────────
// const MobileLayout: React.FC = () => (
//   <div id="courses" className="w-full">

//     {/* ── COURSES section ───────────────────────────────────── */}
//     <div className="bg-white w-full">
//       <div className="bg-red-600 w-full py-6 px-6 flex items-center justify-between">
//         <h2 className="text-white font-black text-2xl tracking-[0.3em] uppercase">FRANÇAIS</h2>
//         <p className="text-white/70 font-bold text-xs tracking-widest uppercase">Courses</p>
//       </div>

//       <div className="relative w-full h-56 sm:h-72 overflow-hidden">
//         <img
//           src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000"
//           className="absolute inset-0 h-full w-full object-cover grayscale brightness-50"
//           alt="France"
//         />
//         <div className="absolute inset-0 flex items-center justify-center p-8">
//           <div className="text-center">
//             <p className="text-white/50 font-black text-xs tracking-[0.5em] uppercase mb-3">Commencez</p>
//             <p className="text-white text-3xl sm:text-4xl font-black leading-tight text-center">
//               START YOUR <br /> <span className="text-red-400">JOURNEY</span> <br /> FROM A1.
//             </p>
//             <div className="mt-4 w-8 h-[3px] bg-red-500 mx-auto" />
//           </div>
//         </div>
//       </div>

//       <div className="overflow-x-auto md:overflow-visible px-6 py-8">
//         <div className="flex gap-6 md:grid md:grid-cols-2 md:gap-8 pb-4 md:pb-0"
//              style={{ width: 'max-content' }}>
//           {courses.map((course, idx) => (
//             <div
//               key={idx}
//               className="flex-shrink-0 w-[85vw] sm:w-[75vw] md:w-auto bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
//             >
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="h-[2px] w-8 bg-red-600" />
//                 <span className="text-red-600 font-black text-xs tracking-widest uppercase">{course.level}</span>
//               </div>
//               <h3 className="text-3xl font-black text-gray-900 mb-3 leading-[0.9] uppercase tracking-tighter">
//                 {course.title}
//               </h3>
//               <p className="text-gray-500 text-sm leading-relaxed mb-5">{course.description}</p>
//               <ul className="space-y-3 mb-6">
//                 {course.features.map((f, i) => (
//                   <li key={i} className="flex items-start gap-3">
//                     <CheckCircle2 className="text-red-500 flex-shrink-0 w-4 h-4 mt-0.5" />
//                     <span className="text-sm font-bold text-gray-800 leading-snug">{f}</span>
//                   </li>
//                 ))}
//               </ul>
//               <button className="group flex items-center gap-2 font-black text-xs text-black uppercase tracking-[0.2em] hover:text-red-600 transition-colors">
//                 Explore Curriculum
//                 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>

//     {/* ── TUTOR section ─────────────────────────────────────── */}
//     <div className="bg-white border-t border-gray-100 w-full">
//       <div className="bg-white border-b border-gray-100 py-6 px-6 flex items-center justify-between shadow-sm">
//         <h2 className="text-gray-200 font-black text-2xl tracking-[0.3em] uppercase">INSTRUCTOR</h2>
//       </div>

//       <div className="flex flex-col md:flex-row">
//         <div className="relative w-full md:w-2/5 h-72 md:h-auto overflow-hidden">
//           <img
//             src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000"
//             className="absolute inset-0 h-full w-full object-cover grayscale brightness-50"
//             alt="France"
//           />
//           <div className="relative z-10 flex items-center justify-center h-full p-8">
//             <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30">
//               <img
//                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000"
//                 alt="Maitri"
//                 className="w-full h-full object-cover object-top"
//               />
//             </div>
//           </div>
//           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
//             <p className="text-white font-black text-lg">MAITRI TIWARI</p>
//             <p className="text-red-400 font-bold tracking-widest text-xs uppercase mt-1">Founder of the Method</p>
//           </div>
//         </div>

//         <div className="flex-1 px-6 py-8 md:px-10 md:py-12">
//           <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
//             Learning should <br /> be <span className="text-blue-600 italic">Cinematic.</span>
//           </h2>
//           <p className="text-base text-gray-500 leading-relaxed mt-5">
//             "I believe that learning a language should feel guided, not overwhelming.
//             Through small-group batches, I provide the clarity you need to succeed."
//           </p>
//           <div className="grid grid-cols-2 gap-6 pt-8">
//             <div>
//               <p className="text-2xl font-black text-blue-600">7+ Years</p>
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</p>
//             </div>
//             <div>
//               <p className="text-2xl font-black text-blue-600">DELF B2</p>
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Certified</p>
//             </div>
//           </div>
//           <div className="mt-8">
//             <button className="bg-black text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl">
//               View Full Journey
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* ── TESTIMONIALS section ──────────────────────────────── */}
//     <div className="bg-blue-600 w-full">
//       <div className="py-6 px-6 flex items-center justify-between">
//         <h2 className="text-white/20 font-black text-2xl tracking-[0.3em] uppercase">MERCI</h2>
//         <p className="text-white/70 font-bold text-xs tracking-widest uppercase">Wall of Fame</p>
//       </div>

//       <div className="flex flex-col md:flex-row">
//         <div className="relative w-full md:w-2/5 h-56 md:h-auto overflow-hidden">
//           <img
//             src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000"
//             className="absolute inset-0 h-full w-full object-cover grayscale brightness-50"
//             alt="France"
//           />
//           <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
//             <p className="text-blue-400 font-black text-xs tracking-[0.6em] uppercase mb-4 text-center">Wall of Fame</p>
//             <h2 className="text-white text-5xl font-black leading-[0.85] uppercase tracking-tighter text-center">
//               THE <br />SUCCESS <br /> <span className="text-blue-400">STORIES.</span>
//             </h2>
//             <div className="mt-5 w-8 h-[3px] bg-blue-500 mx-auto" />
//           </div>
//         </div>

//         <div className="flex-1 bg-white px-6 py-8 md:px-10 md:py-12">
//           <div className="flex items-center gap-4 mb-8">
//             <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase whitespace-nowrap">Student Voice</span>
//             <div className="h-[1px] flex-grow bg-gray-100" />
//           </div>
//           <div className="relative mb-10">
//             <div className="absolute -left-2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-600 to-transparent opacity-50" />
//             <div className="pl-4">
//               <TestimonialSlider />
//             </div>
//           </div>
//           <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-8">
//             <div className="flex flex-col items-center text-center group">
//               <div className="flex items-baseline gap-0.5">
//                 <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">500</span>
//                 <span className="text-lg font-black text-blue-600">+</span>
//               </div>
//               <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Students Graduated</p>
//             </div>
//             <div className="flex flex-col items-center text-center group">
//               <div className="flex items-baseline gap-0.5">
//                 <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">4.9</span>
//                 <span className="text-base font-black text-yellow-500">★</span>
//               </div>
//               <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Google Rating</p>
//             </div>
//             <div className="flex flex-col items-center text-center group">
//               <div className="flex items-baseline gap-0.5">
//                 <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">100</span>
//                 <span className="text-lg font-black text-blue-600">%</span>
//               </div>
//               <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Success Result</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // ─────────────────────────────────────────────────────────────
// //  DESKTOP  — sticky scroll with PARALLEL transitions
// //
// //  KEY TIMING DESIGN:
// //  ┌─────────────────────────────────────────────────────────┐
// //  │  0 ──────────── C_END ──────────── T_END ──────── 1.0  │
// //  │  [  COURSES horizontal scroll  ]                        │
// //  │                 [  C→T transition  ]                    │
// //  │                 ^ ALL 3 actions fire simultaneously:    │
// //  │                   • Right content fades out (up)        │
// //  │                   • Center image content crossfades     │
// //  │                   • Left flag red→white                 │
// //  │                   • Tutor right content flies IN        │
// //  │                          [  TUTOR visible  ]            │
// //  │                                    [  T→Testi trans ]   │
// //  │                                    ^ Same parallel:     │
// //  │                                      • Right fades out  │
// //  │                                      • Center crossfade │
// //  │                                      • Flag white→blue  │
// //  │                                      • Testi flies IN   │
// //  └─────────────────────────────────────────────────────────┘
// //
// //  TR = transition window (how fast parallel swap happens)
// //  Smaller TR = snappier swap, less scroll consumed
// // ─────────────────────────────────────────────────────────────
// const DesktopLayout: React.FC = () => {
//   const wrapperRef   = useRef<HTMLDivElement>(null);
//   const stripRef     = useRef<HTMLDivElement>(null);
//   const endMarkerRef = useRef<HTMLDivElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const [scrollDistance, setScrollDistance]             = useState(0);
//   const [coursesSectionHeight, setCoursesSectionHeight] = useState(3000);
//   const [bgText, setBgText]                             = useState(courses[0]?.level || '');

//   useLayoutEffect(() => {
//     const measure = () => {
//       if (!endMarkerRef.current || !containerRef.current || !stripRef.current) return;
//       stripRef.current.style.transform = 'translateX(0px)';
//       requestAnimationFrame(() => {
//         if (!endMarkerRef.current || !containerRef.current || !stripRef.current) return;
//         const stripWidth     = stripRef.current.scrollWidth;
//         const containerWidth = containerRef.current.offsetWidth;
//         const dist           = Math.max(0, stripWidth - containerWidth);
//         setScrollDistance(dist);
//         setCoursesSectionHeight(dist + window.innerHeight * 0.1);
//         stripRef.current.style.transform = '';
//       });
//     };
//     measure();
//     window.addEventListener('resize', measure);
//     return () => window.removeEventListener('resize', measure);
//   }, []);

//   const { scrollYProgress } = useScroll({
//     target: wrapperRef,
//     offset: ['start start', 'end end'],
//   });

//   // ── SECTION BOUNDARIES ──────────────────────────────────────
//   // C_END: where courses horizontal scroll ends → transition to tutor begins
//   // T_END: where tutor section ends → transition to testimonials begins
//   // TR: transition window — ALL parallel actions happen within this window
//   const C_END = 0.48;
//   const T_END = 0.72;
//   const TR    = 0.028; // tight window = parallel feel, less scroll consumed

//   // ── HORIZONTAL SCROLL (courses) ─────────────────────────────
//   const rawX    = useTransform(scrollYProgress, [0, C_END], [0, -scrollDistance]);
//   const smoothX = useSpring(rawX, { stiffness: 90, damping: 25 });

//   // Update background ghost text as cards scroll
//   useMotionValueEvent(smoothX, 'change', (latestX) => {
//     const progressX = Math.abs(latestX);
//     const cardWidth = 500 + 240;
//     const index = Math.min(Math.round(progressX / cardWidth), courses.length - 1);
//     if (courses[index]) {
//       const { title, level } = courses[index];
//       let short = level;
//       if      (title.includes('A1 + A2'))  short = 'A1 + A2';
//       else if (title.includes('B1 + TEF')) short = 'B1 + TEF';
//       else if (title.includes('B2 + TEF')) short = 'B2 + TEF';
//       if (bgText !== short) setBgText(short);
//     }
//   });

//   // ── LEFT FLAG — parallel color transition ───────────────────
//   // Courses→Tutor: red fades out, white fades in  — same TR window
//   const redOpacity   = useTransform(scrollYProgress, [C_END - TR, C_END + TR], [1, 0]);
//   const whiteOpacity = useTransform(scrollYProgress,
//     [C_END - TR, C_END + TR, T_END - TR, T_END + TR], [0, 1, 1, 0]);
//   const blueOpacity  = useTransform(scrollYProgress, [T_END - TR, T_END + TR], [0, 1]);

//   // ── CENTER IMAGE PANEL overlays — parallel ──────────────────
//   // Courses overlay: visible until C_END-TR, then fades out and stays 0 permanently
//   const coursesOverlayOpacity = useTransform(scrollYProgress,
//     [0, C_END - TR, C_END + TR], [1, 1, 0]);
//   const coursesOverlayScale = useTransform(scrollYProgress,
//     [C_END - TR, C_END + TR], [1, 0.85]);
//   const smoothCoursesScale = useSpring(coursesOverlayScale, { stiffness: 180, damping: 22 });

//   // Tutor photo: fades in at C_END, fades out at T_END — same TR window
//   const tutorPhotoOpacity = useTransform(scrollYProgress,
//     [C_END - TR, C_END + TR, T_END - TR, T_END + TR], [0, 1, 1, 0]);
//   const tutorPhotoScale = useTransform(scrollYProgress,
//     [C_END - TR, C_END + TR, T_END - TR, T_END + TR], [0.85, 1, 1, 0.85]);
//   const smoothTutorPhotoScale = useSpring(tutorPhotoScale, { stiffness: 180, damping: 22 });

//   // Tutor name badge: same window
//   const tutorNameOpacity = useTransform(scrollYProgress,
//     [C_END - TR * 0.5, C_END + TR, T_END - TR, T_END + TR], [0, 1, 1, 0]);
//   const tutorNameY = useTransform(scrollYProgress,
//     [C_END - TR * 0.5, C_END + TR], [16, 0]);
//   const smoothTutorNameY = useSpring(tutorNameY, { stiffness: 120, damping: 20 });

//   // Testimonials overlay: fades in at T_END and stays at full opacity — never returns to 0
//   // This prevents any bleed-back onto the courses image text
//   const testiOverlayOpacity = useTransform(scrollYProgress,
//     [T_END - TR, T_END + TR], [0, 1]);
//   const testiOverlayScale = useTransform(scrollYProgress,
//     [T_END - TR, T_END + TR], [0.85, 1]);
//   const smoothTestiScale = useSpring(testiOverlayScale, { stiffness: 180, damping: 22 });

//   // ── RIGHT CONTENT — parallel transitions ────────────────────
//   // COURSES right content: fades in at start, exits upward at C_END
//   const coursesContentOpacity = useTransform(scrollYProgress,
//     [0, 0.02, C_END - TR, C_END + TR], [0, 1, 1, 0]);
//   const coursesContentY = useTransform(scrollYProgress,
//     [0, 0.02, C_END - TR, C_END + TR], [20, 0, 0, -50]);
//   const smoothCoursesContentY = useSpring(coursesContentY, { stiffness: 100, damping: 22 });

//   // TUTOR right content:
//   //   • Enters from BOTTOM of screen traveling UP to position at C_END
//   //   • Exits upward at T_END
//   const VH = typeof window !== 'undefined' ? window.innerHeight : 900;

//   const tutorContentOpacity = useTransform(scrollYProgress,
//     [C_END - TR, C_END + TR, T_END - TR, T_END + TR], [0, 1, 1, 0]);
//   const tutorContentY = useTransform(scrollYProgress,
//     [C_END - TR, C_END + TR, T_END - TR, T_END + TR],
//     [VH * 0.4, 0, 0, -50]);
//   const smoothTutorContentY = useSpring(tutorContentY, { stiffness: 75, damping: 18 });

//   // TESTIMONIALS right content:
//   //   • Enters from BOTTOM of screen traveling UP to position at T_END
//   //   • Exits upward at end
//   const testiContentOpacity = useTransform(scrollYProgress,
//     [T_END - TR, T_END + TR, 0.97, 1.0], [0, 1, 1, 0]);
//   const testiContentY = useTransform(scrollYProgress,
//     [T_END - TR, T_END + TR, 0.97, 1.0],
//     [VH * 0.4, 0, 0, -50]);
//   const smoothTestiContentY = useSpring(testiContentY, { stiffness: 75, damping: 18 });

//   const totalHeight = coursesSectionHeight + window.innerHeight * 9.5;

//   return (
//     <div ref={wrapperRef} style={{ height: totalHeight }} id='courses' className="relative">
//       <div className="sticky top-0 h-screen flex overflow-hidden">

//         {/* LEFT SIDEBAR */}
//         <div className="relative w-[15%] h-screen flex-shrink-0 z-30">
//           <motion.div style={{ opacity: redOpacity }}
//             className="absolute inset-0 bg-red-600 flex items-center justify-center">
//             <h2 className="rotate-90 text-white font-black text-5xl tracking-[0.5em] whitespace-nowrap opacity-20 select-none">
//               FRANÇAIS
//             </h2>
//           </motion.div>
//           <motion.div id="tutor" style={{ opacity: whiteOpacity }}
//             className="absolute inset-0 bg-white border-r border-gray-100 flex items-center justify-center shadow-xl">
//             <h2 className="rotate-90 text-gray-100 font-black text-5xl tracking-[0.5em] whitespace-nowrap">
//               INSTRUCTOR
//             </h2>
//           </motion.div>
//           <motion.div style={{ opacity: blueOpacity }}
//             className="absolute inset-0 bg-blue-600 flex items-center justify-center">
//             <h2 className="rotate-90 text-white font-black text-6xl tracking-[0.3em] whitespace-nowrap opacity-20 select-none">
//               MERCI
//             </h2>
//           </motion.div>
//         </div>

//         {/* CENTRE IMAGE PANEL */}
//         <div className="relative w-[35%] h-screen flex-shrink-0 z-30 overflow-hidden">
//           <img
//             src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000"
//             className="absolute inset-0 h-full w-full object-cover grayscale brightness-50"
//             alt="France"
//           />

//           {/* Courses overlay — exits in parallel */}
//           <motion.div
//             style={{ opacity: coursesOverlayOpacity, scale: smoothCoursesScale }}
//             className="absolute inset-0 flex items-center justify-center p-12"
//           >
//             <div className="text-center">
//               <p className="text-white/50 font-black text-xs tracking-[0.5em] uppercase mb-5">Commencez</p>
//               <p className="text-white text-5xl font-black leading-tight text-center">
//                 START YOUR <br /> <span className="text-red-400">JOURNEY</span> <br /> FROM A1.
//               </p>
//               <div className="mt-6 w-10 h-[3px] bg-red-500 mx-auto" />
//             </div>
//           </motion.div>

//           {/* Tutor photo — enters in parallel */}
//           <motion.div
//             style={{ opacity: tutorPhotoOpacity, scale: smoothTutorPhotoScale }}
//             className="absolute inset-0 flex items-center justify-center z-10"
//           >
//             <div className="w-64 h-80 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] border-2 border-white/30">
//               <img
//                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000"
//                 alt="Maitri"
//                 className="w-full h-full object-cover object-top"
//               />
//             </div>
//           </motion.div>

//           {/* Tutor name badge */}
//           <motion.div
//             style={{ opacity: tutorNameOpacity, y: smoothTutorNameY }}
//             className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20"
//           >
//             <p className="text-white font-black text-2xl">MAITRI TIWARI</p>
//             <p className="text-red-400 font-bold tracking-widest text-xs uppercase mt-1">Founder of the Method</p>
//           </motion.div>

//           {/* Testimonials overlay — enters in parallel */}
//           <motion.div
//             style={{ opacity: testiOverlayOpacity, scale: smoothTestiScale }}
//             className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10"
//           >
//             <p className="text-blue-400 font-black text-xs tracking-[0.6em] uppercase mb-5 text-center">Wall of Fame</p>
//             <h2 className="text-white text-6xl font-black leading-[0.85] uppercase tracking-tighter text-center">
//               THE <br />SUCCESS <br /> <span className="text-blue-400">STORIES.</span>
//             </h2>
//             <div className="mt-6 w-10 h-[3px] bg-blue-500 mx-auto" />
//           </motion.div>
//         </div>

//         {/* RIGHT CONTENT AREA */}
//         <div className="relative w-[50%] h-screen flex-shrink-0 z-20 bg-white overflow-hidden">

//           {/* ── COURSES right content ── */}
//           <motion.div
//             style={{ opacity: coursesContentOpacity, y: smoothCoursesContentY }}
//             ref={containerRef}
//             className="absolute inset-0 flex items-center overflow-hidden"
//           >
//             {/* Ghost background text */}
//             <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
//               <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-4 overflow-hidden">
//                 <motion.h2
//                   key={bgText}
//                   initial={{ opacity: 0, y: 40 }}
//                   animate={{ opacity: 0.06, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.7, ease: 'easeOut' }}
//                   className="font-black text-gray-900 whitespace-nowrap uppercase select-none leading-none"
//                   style={{ fontSize: 'clamp(80px, 14vw, 200px)', letterSpacing: '-0.02em' }}
//                 >
//                   {bgText}
//                 </motion.h2>
//               </div>
//             </div>

//             <motion.div
//               ref={stripRef}
//               style={{ x: smoothX, position: 'relative', zIndex: 10 }}
//               className="flex gap-60 pl-32 pr-[27vw]"
//             >
//               {courses.map((course, idx) => (
//                 <div key={idx} className="w-[500px] flex-shrink-0 flex flex-col justify-center py-20">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="h-[2px] w-12 bg-red-600" />
//                     <span className="text-red-600 font-black text-sm tracking-widest uppercase">{course.level}</span>
//                   </div>
//                   <h3 className="text-6xl font-black text-gray-900 mb-6 leading-[0.9] uppercase tracking-tighter">
//                     {course.title}
//                   </h3>
//                   <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">{course.description}</p>
//                   <ul className="space-y-4 mb-12">
//                     {course.features.map((f, i) => (
//                       <li key={i} className="flex items-start gap-4">
//                         <CheckCircle2 className="text-red-500 flex-shrink-0 w-5 h-5 mt-1" />
//                         <span className="text-base font-bold text-gray-800 leading-snug">{f}</span>
//                       </li>
//                     ))}
//                   </ul>
//                   <button className="group flex items-center gap-3 font-black text-xs text-black uppercase tracking-[0.3em] hover:text-red-600 transition-colors">
//                     Explore Curriculum
//                     <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
//                   </button>
//                 </div>
//               ))}
//               <div ref={endMarkerRef} className="w-1 flex-shrink-0" />
//             </motion.div>
//           </motion.div>

//           {/* ── TUTOR right content ──
//                • Travels from bottom of screen upward into position at C_END
//                • Exits upward at T_END — pointer-events none to prevent overlap */}
//           <motion.div
//             style={{
//               opacity: tutorContentOpacity,
//               y: smoothTutorContentY,
//               pointerEvents: 'none',
//             }}
//             className="absolute inset-0 flex items-center px-20"
//           >
//             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
//               <h2 className="text-[14vw] font-black">MAITRI</h2>
//             </div>
//             <div className="relative w-full">
//               <h2 className="text-7xl font-black text-gray-900 leading-tight">
//                 Learning should <br /> be <span className="text-blue-600 italic">Cinematic.</span>
//               </h2>
//               <p className="text-xl text-gray-500 leading-relaxed max-w-xl mt-6">
//                 "I believe that learning a language should feel guided, not overwhelming.
//                 Through small-group batches, I provide the clarity you need to succeed."
//               </p>
//               <div className="grid grid-cols-2 gap-8 pt-10">
//                 <div>
//                   <p className="text-3xl font-black text-blue-600">7+ Years</p>
//                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</p>
//                 </div>
//                 <div>
//                   <p className="text-3xl font-black text-blue-600">DELF B2</p>
//                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Certified</p>
//                 </div>
//               </div>
//               <div className="mt-12">
//                 <button className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl">
//                   View Full Journey
//                 </button>
//               </div>
//             </div>
//           </motion.div>

//           {/* ── TESTIMONIALS right content ──
//                • Travels from bottom of screen upward into position at T_END
//                • Rendered above tutor layer via z-10 */}
//           <motion.div
//             style={{
//               opacity: testiContentOpacity,
//               y: smoothTestiContentY,
//             }}
//             className="absolute inset-0 flex items-center z-10"
//           >
//             <div className="relative z-10 w-full px-16 flex flex-col justify-center">
//               <div className="flex items-center gap-6 mb-10">
//                 <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase whitespace-nowrap">Student Voice</span>
//                 <div className="h-[1px] flex-grow bg-gray-100" />
//               </div>
//               <div className="relative mb-12">
//                 <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-600 to-transparent opacity-50" />
//                 <div className="p-2">
//                   <TestimonialSlider />
//                 </div>
//               </div>
//               <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-10">
//                 <div className="relative group flex flex-col items-center text-center">
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors duration-500">500</span>
//                     <span className="text-xl font-black text-blue-600">+</span>
//                   </div>
//                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Students Graduated</p>
//                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-blue-600 group-hover:w-full transition-all duration-500" />
//                 </div>
//                 <div className="relative group flex flex-col items-center text-center">
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors duration-500">4.9</span>
//                     <span className="text-lg font-black text-yellow-500">★</span>
//                   </div>
//                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Google Rating</p>
//                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-blue-600 group-hover:w-full transition-all duration-500" />
//                 </div>
//                 <div className="relative group flex flex-col items-center text-center">
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors duration-500">100</span>
//                     <span className="text-xl font-black text-blue-600">%</span>
//                   </div>
//                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Success Result</p>
//                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-blue-600 group-hover:w-full transition-all duration-500" />
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────
// //  ROOT COMPONENT — switches between layouts
// // ─────────────────────────────────────────────────────────────
// const SectionsWrapper: React.FC = () => {
//   const { width } = useWindowSize();
//   if (width >= 1024) return <DesktopLayout />;
//   return <MobileLayout />;
// };

// export default SectionsWrapper;





           {/* <motion.button
                className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl"
                whileHover={{
                  backgroundColor: '#2563eb',
                  scale: 1.06,
                  boxShadow: '0 20px 40px rgba(37,99,235,0.35)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                View Full Journey
              </motion.button> */}

                   {/* Stats (Cleaner Premium Look) */}
            {/* <div className="grid grid-cols-2 gap-8 pt-10">
              <motion.div style={{ y: smoothStat1Y, opacity: stat1Opacity }}>
                <p className="text-3xl font-black text-blue-600">7+ Years</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</p>
              </motion.div>
              <motion.div style={{ y: smoothStat2Y, opacity: stat2Opacity }}>
                <p className="text-3xl font-black text-blue-600">DELF B2</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Certified</p>
              </motion.div>
            </div> */}