import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, subtitle, align = 'center', light = false }) => {
  return (
    <div className={`mb-12 space-y-4 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`text-3xl md:text-5xl font-bold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`max-w-2xl text-lg ${align === 'center' ? 'mx-auto' : ''} ${light ? 'text-blue-100' : 'text-gray-600'}`}
        >
          {subtitle}
        </motion.p>
      )}
      <div className={`h-1.5 w-20 bg-blue-600 rounded-full ${align === 'center' ? 'mx-auto' : ''}`} />
    </div>
  );
};

export default SectionHeading;