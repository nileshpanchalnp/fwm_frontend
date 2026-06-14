import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = "", hoverEffect = true }) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -10, transition: { duration: 0.3 } } : {}}
      className={`bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;