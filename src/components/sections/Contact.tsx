import React, { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, Clock, AlertCircle } from 'lucide-react';
import { contactApi } from '../../api/client';   // ← only new import

const contactInfo = [
  {
    icon: Phone,
    label: "Call / WhatsApp",
    value: "+91 XXXXX XXXXX",
    href: "tel:+91XXXXX",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@learnfrenchatzenith.com",
    href: "mailto:hello@learnfrenchatzenith.com",
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 hours",
    href: null,
  },
];

const courses = [
  "A1 Beginner French",
  "A2 Elementary French",
  "B1 Intermediate French",
  "B2 Upper Intermediate",
  "DELF Exam Prep",
  "TEF / TCF Exam Prep",
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  course: string;
  message: string;
}

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', email: '', course: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please fill in your name, phone and email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await contactApi.submit(form);  // ← uses shared client (credentials:'include' + BASE_URL)
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <section
      id="contact"
      className="py-28 relative overflow-hidden"
      style={{ background: '#f5f0e8' }}
    >
      {/* Parchment paper texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(0,35,149,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 60% 80%, rgba(237,41,57,0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle diagonal line pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #8b7355 0px,
            #8b7355 1px,
            transparent 1px,
            transparent 12px
          )`,
        }}
      />

      {/* Faded Eiffel Tower watermark */}
      <div
        className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] pointer-events-none"
        style={{
          backgroundImage: `url(https://cdn-icons-png.flaticon.com/512/826/826904.png)`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.04,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-16 relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs tracking-[0.35em] uppercase font-semibold mb-4"
            style={{ color: '#002395' }}
          >
            Commençons ensemble
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#1a1a2e',
            }}
          >
            Ready to speak French?
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#002395]/30" />
            <span style={{ color: '#D4AF37', fontSize: 18 }}>✦</span>
            <div className="h-px w-12 bg-[#ED2939]/30" />
          </div>
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            Drop us a message and we'll get back to you within 24 hours with the best batch for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left — contact info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              const inner = (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(139,115,85,0.15)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,35,149,0.08)' }}
                  >
                    <Icon size={16} style={{ color: '#002395' }} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: '#8b7355' }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              );
              return item.href
                ? <a href={item.href} key={i} className="block">{inner}</a>
                : <div key={i}>{inner}</div>;
            })}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:opacity-95"
              style={{
                background: 'rgba(37,211,102,0.08)',
                border: '1px solid rgba(37,211,102,0.25)',
              }}
            >
              <MessageCircle size={17} style={{ color: '#25D366' }} />
              <span className="text-sm font-semibold" style={{ color: '#1a6e35' }}>
                Chat on WhatsApp
              </span>
            </a>

            {/* French quote */}
            <div
              className="mt-1 p-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(139,115,85,0.12)',
                borderLeft: '3px solid #D4AF37',
              }}
            >
              <p
                className="text-sm italic leading-relaxed"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#6b5c45',
                }}
              >
                "Une langue différente est une vision différente de la vie."
              </p>
              <p className="text-[11px] mt-2 tracking-wide" style={{ color: '#b09a7a' }}>
                — Federico Fellini
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 rounded-3xl p-8 md:p-10 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(139,115,85,0.18)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 40px rgba(139,115,85,0.1)',
            }}
          >
            {/* Gold glow */}
            <div
              className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)',
                transform: 'translate(30%, -30%)',
              }}
            />

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#8b7355' }}>
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                      className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#8b7355' }}>
                      Phone / WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)}
                      className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#8b7355' }}>
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="you@email.com"
                    type="email"
                    value={form.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
                    className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#8b7355' }}>
                    Course Interested In
                  </label>
                  <div className="relative">
                    <select
                      value={form.course}
                      onChange={(e) => handleChange('course', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors appearance-none bg-white border border-gray-200 text-gray-700 pr-10"
                    >
                      <option value="">Select a course...</option>
                      {courses.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#8b7355' }}>
                    Your Message
                  </label>
                  <Textarea
                    placeholder="Tell us your current level, goals, or any questions..."
                    value={form.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('message', e.target.value)}
                    className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-300 focus:border-blue-500 min-h-[110px]"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: 'rgba(237,41,57,0.06)', border: '1px solid rgba(237,41,57,0.2)' }}
                  >
                    <AlertCircle size={14} style={{ color: '#ED2939', flexShrink: 0 }} />
                    <p className="text-xs font-medium" style={{ color: '#c0392b' }}>{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-base font-semibold tracking-wide rounded-xl text-white transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #002395 0%, #1a3a8f 100%)' }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message →'
                  )}
                </button>

                <p className="text-center text-xs" style={{ color: '#b09a7a' }}>
                  We respond within 24 hours. No spam, ever.
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center gap-5 relative z-10"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(37,211,102,0.1)' }}
                >
                  <span className="text-3xl" style={{ color: '#25D366' }}>✓</span>
                </div>
                <h3
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: '#1a1a2e',
                  }}
                >
                  Message sent!
                </h3>
                <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#6b7280' }}>
                  Merci! We'll get back to you within 24 hours with the perfect batch recommendation.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;