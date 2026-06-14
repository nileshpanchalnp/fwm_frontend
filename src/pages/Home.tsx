import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

// Layout Components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/floating/WhatsAppButton';

// Section Components
import Hero from '../components/sections/Hero';
import Tutor from '../components/sections/Tutor';
import Courses from '../components/sections/Courses';
import Resources from '../components/sections/Resources';
import Testimonials from '../components/sections/Testimonials';
import Contact from '../components/sections/Contact';
import CTA from '../components/sections/CTA';


const Home: React.FC = () => {
  // Cinematic scroll progress bar at the very top
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative antialiased font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Cinematic Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[100]" 
        style={{ scaleX }} 
      />

      {/* Persistent Navigation */}
      <Navbar />

      {/* Main Content Flow */}
      <main>
        <Hero />
        
        {/* We use motion.div here to create staggered entry animations 
            as the user scrolls down the page */}
        <div className="space-y-0">
           <Courses />
          <Tutor />
          <Testimonials /> 
          {/* <SectionsWrapper/> */}
          <Resources />
          <CTA />
          <Contact />
        </div>
      </main>

      {/* Floating Elements */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;