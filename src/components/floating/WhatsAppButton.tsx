import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  // Configuration
  const phoneNumber = "919898471043"; // Replace with client's actual number
  const message = encodeURIComponent("Bonjour! I'm interested in learning French with The Language Hunter. Could you share more details?");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 2 // Delay appearing so the user sees the hero content first
      }}
      className="fixed bottom-6 right-6 z-[999] group"
    >
      {/* Tooltip */}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-100">
        Chat with Us
      </span>

      {/* Pulse Effect Rings */}
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
      
      {/* Main Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all duration-300"
      >
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 fill-current" />
      </a>
    </motion.div>
  );
};

export default WhatsAppButton;