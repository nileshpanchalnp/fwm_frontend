import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    text: "I took TEF French classes with Maitri and had a very positive experience. She has a great vibe and explains everything in a clear and simple way, which really helped me throughout my preparation. We worked on resources, study planning, and regular follow-ups.",
    author: "Harpreet Kaur",
  },
  {
    text: "I have been taking her classes for the last 3 months, and my experience has been really good. She understands her students very well and teaches according to their level. She also knows the TEF and TCF exam structure really well, which helps a lot in maximizing points. She is very flexible with scheduling, and her fees are much more reasonable compared to others. I highly recommend her as a French teacher. 5 stars from me!",
    author: "Akash Dewan",
  },
  {
    text: "Great teacher and very helpful online classes. The lessons were clear, engaging, and easy to follow. I learned a lot and had a very positive experience.",
    author: "Navjot Kumar",
  },
];

const TestimonialSlider = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="relative w-full text-left py-4 px-2">

      <Quote className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-200 mb-3" />

      {/* Fixed min-height so layout never jumps between short/long quotes */}
      <div className="w-full" style={{ minHeight: '120px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full"
          >
            <p
              className="
                italic text-gray-600 font-medium leading-relaxed
                text-sm
                sm:text-[15px]
                md:text-[15px]
                lg:text-base
                xl:text-[17px]
              "
            >
              "{testimonials[active].text}"
            </p>
            <h4 className="text-blue-600 font-bold tracking-wide mt-3 text-sm lg:text-base">
              — {testimonials[active].author}
            </h4>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-start gap-3 mt-5">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              active === i
                ? 'bg-blue-600 scale-125'
                : 'bg-blue-200 hover:bg-blue-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;