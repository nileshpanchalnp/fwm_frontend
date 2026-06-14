import React from 'react';
import HeroSlider from '../sliders/HeroSlider';
import { motion } from 'framer-motion';

const highlights = [
  { emoji: "📋", text: "DELF · TEF · TCF prep" },
  { emoji: "👥", text: "Max 8 per batch" },
  { emoji: "🎯", text: "A1 to B2 all levels" },
];

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative">
      <HeroSlider />

      {/* ── Bottom highlight bar ── */}
      <div className="absolute bottom-0 w-full z-30
                      bg-[#1a1f6e]/90 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6
                        py-2 sm:py-3">
          <div className="flex flex-wrap items-center justify-center
                          gap-3 sm:gap-6 md:gap-10">
            {highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <span className="text-sm sm:text-base">{h.emoji}</span>
                <span className="text-white/85 text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap">
                  {h.text}
                </span>
                {i < highlights.length - 1 && (
                  <span className="hidden md:inline text-white/20 ml-3 sm:ml-4">|</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;