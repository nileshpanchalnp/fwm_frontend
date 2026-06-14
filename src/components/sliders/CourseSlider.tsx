// import React, { useRef } from 'react';
// import { motion } from 'framer-motion';
// import Card from '../ui/Card';
// import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
// // Make sure this import path is correct for your project
// import { courses, Course } from '../../data/courseData'; 

// const CourseSlider: React.FC = () => {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   // Manual Scroll Logic for Arrows
//   const scroll = (direction: 'left' | 'right') => {
//     if (scrollRef.current) {
//       const { scrollLeft, clientWidth } = scrollRef.current;
//       // Scroll by one full card width roughly
//       const scrollAmount = clientWidth * 0.8; 
//       const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      
//       scrollRef.current.scrollTo({
//         left: scrollTo,
//         behavior: 'smooth'
//       });
//     }
//   };

//   return (
//     <div className="relative group w-full px-4 md:px-0">
      
//       {/* --- Navigation Arrows --- */}
//       <div className="absolute top-1/2 -translate-y-1/2 left-[-20px] z-40 hidden md:block">
//         <button
//           onClick={() => scroll('left')}
//           className="bg-white text-gray-900 shadow-xl p-4 rounded-full border border-gray-100 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
//           aria-label="Previous"
//         >
//           <ChevronLeft size={24} />
//         </button>
//       </div>

//       <div className="absolute top-1/2 -translate-y-1/2 right-[-20px] z-40 hidden md:block">
//         <button
//           onClick={() => scroll('right')}
//           className="bg-white text-gray-900 shadow-xl p-4 rounded-full border border-gray-100 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
//           aria-label="Next"
//         >
//           <ChevronRight size={24} />
//         </button>
//       </div>

//       {/* --- Slider Container --- */}
//       <div
//         ref={scrollRef}
//         className="flex gap-8 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth"
//       >
//         {courses.map((course: Course, idx: number) => (
//           <motion.div
//             key={`${course.id}-${idx}`}
//             className="min-w-[320px] md:min-w-[420px] snap-center h-full"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: idx * 0.1, duration: 0.5 }}
//           >
//             <Card className="h-full border-t-8 border-t-blue-600 bg-white text-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col min-h-[520px] relative transition-all duration-500 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10">
              
//               {/* Level Badge */}
//               <div className="mb-6">
//                 <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border bg-blue-50 text-blue-600 border-blue-100 inline-block">
//                   {course.level}
//                 </span>
//               </div>

//               {/* Title & Description */}
//               <h3 className="text-3xl font-bold mb-4 leading-tight text-gray-900">
//                 {course.title}
//               </h3>

//               <p className="text-sm mb-8 flex-grow leading-relaxed text-gray-500">
//                 {course.description}
//               </p>

//               {/* Divider */}
//               <div className="h-[1px] w-full mb-8 bg-gray-100" />

//               {/* Features List */}
//               <ul className="space-y-4 mb-10">
//                 {course.features.map((feature, i) => (
//                   <li key={i} className="flex items-start gap-3 group/item">
//                     <div className="mt-1 rounded-full p-0.5 bg-green-50 transition-colors group-hover/item:bg-green-100">
//                       <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">
//                       {feature}
//                     </span>
//                   </li>
//                 ))}
//               </ul>

//               {/* CTA Button */}
//               <motion.button
//                 whileHover={{ x: 10 }}
//                 className="mt-auto inline-flex items-center gap-3 font-bold text-sm tracking-tight transition-colors text-blue-600 hover:text-blue-700"
//               >
//                 Explore Curriculum <ChevronRight size={18} />
//               </motion.button>
//             </Card>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CourseSlider;