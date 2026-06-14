import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, Phone, MapPin, MessageCircle, ArrowRight } from 'lucide-react';
import logo from '/logo2.png';
import Company_Logo from '../../img/sattvion_logo_one.png';

const navLinks = [
  { label: "Home", href: "/fwm" },
  { label: "Our Programs", href: "/fwm/courses" },
  { label: "Resources", href: "#resources" },
  { label: "Meet Maitri", href: "#tutor" },
  { label: "Contact", href: "#contact" },
];

const programs = [
  { label: "A1 Beginner French", href: "/fwm/courses" },
  { label: "A2 Elementary French", href: "/fwm/courses" },
  { label: "B1 Intermediate", href: "/fwm/courses" },
];

const Footer: React.FC = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-white border-t border-gray-100 relative overflow-hidden">
      {/* French tricolor top line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex z-10">
        <div className="flex-1 bg-[#002395]" />
        <div className="flex-1 bg-gray-200" />
        <div className="flex-1 bg-[#ED2939]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* Main grid layout */}
        <div className="pt-16 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-100">
          
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <img src={logo} alt="The Language Hunter Logo" className="w-16 h-16" />
              <span className="text-gray-900 font-bold text-base tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                The Language Hunter
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Expert French coaching for DELF, TEF & TCF. Small batches, real results.
            </p>
            <div className="flex gap-2 pt-1">
              {[
                { href: '#', icon: <Instagram size={14} />, color: 'hover:text-pink-500 hover:border-pink-200' },
                { href: 'https://wa.me/91XXXXXXXXXX', icon: <MessageCircle size={14} />, color: 'hover:text-green-500 hover:border-green-200' },
                { href: 'mailto:hello@learnfrenchatzenith.com', icon: <Mail size={14} />, color: 'hover:text-blue-500 hover:border-blue-200' },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  whileHover={{ y: -2 }}
                  className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 transition-colors duration-200 ${s.color}`}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Navigation</h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Programs Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Programs</h4>
            <ul className="space-y-2.5">
              {programs.map((p) => (
                <li key={p.label}>
                  <a href={p.href}
                    className="text-sm text-gray-500 hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200">
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-1.5">
              <a
                href="/fwm/courses"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
              >
                Explore More 
                <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Contact</h4>
            <div className="space-y-3">
              {[
                { icon: <Phone size={13} />, text: '+91 XXXXX XXXXX', href: 'tel:+91XXXXX' },
                { icon: <Mail size={13} />, text: 'hello@learnfrenchatzenith.com', href: 'mailto:hello@learnfrenchatzenith.com' },
                { icon: <MapPin size={13} />, text: 'Online · Worldwide', href: null },
              ].map((item, i) => (
                item.href ? (
                  <a key={i} href={item.href}
                    className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200 group">
                    <span className="text-gray-300 group-hover:text-blue-400 transition-colors">{item.icon}</span>
                    {item.text}
                  </a>
                ) : (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <span className="text-gray-300">{item.icon}</span>
                    {item.text}
                  </div>
                )
              ))}
            </div>

            <p className="text-xs italic text-gray-300 leading-relaxed pt-1 border-l-2 border-gray-100 pl-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              "Apprendre une langue, c'est vivre deux vies."
            </p>
          </motion.div>
        </div>

        {/* Bottom copyright sub-bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.button
            whileHover={{ y: -2 }}
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors duration-200 font-bold"
          >
            Top ↑
          </motion.button>

          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            © {new Date().getFullYear()} The Language Hunter &nbsp; | &nbsp; Powered by &nbsp;
              <a
                href="https://digi.sattvion.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold transition-colors"
              >
                Sattvion Digi Solutions
                <motion.img
                  src={Company_Logo}
                  alt="Sattvion"
                  className="h-6 w-auto object-contain"
                  animate={{ scale: [1, 1.25, 1, 1.2, 1] }}
                  transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, times: [0, 0.14, 0.28, 0.42, 0.56] }}
                />
              </a>
          </p>
      
          <div className="flex gap-5">
            <a href="/fwm/privacy"
              className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors duration-200 font-bold">
              Privacy Policy
            </a>
            <a href="/fwm/terms"
              className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors duration-200 font-bold">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;