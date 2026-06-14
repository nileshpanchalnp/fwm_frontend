import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import logo from '/logo2.png';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/fwm/' },
    { name: 'Programs', href: '/fwm/courses' },
    { name: 'About', href: '#tutor' },
    { name: 'Resources', href: '#resources' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md py-2 shadow-md'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="w-full px-4 sm:px-8 lg:px-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0 min-w-0"
            onClick={() => navigate('/')}
          >
            <img
              src={logo}
              alt="The Language Hunter Logo"
              className="h-9 w-9 sm:h-11 sm:w-11 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              width={44}
              height={44}
            />
            <span
              className={`hidden min-[360px]:block font-black text-base sm:text-lg lg:text-xl tracking-tighter whitespace-nowrap transition-colors duration-500 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              THE <span className="text-red-500">LANGUAGE</span> HUNTER
            </span>
          </div>

          {/* Desktop Nav Links + Login */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <div className="flex items-center gap-4 lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-xs lg:text-sm font-bold tracking-wide uppercase transition-colors hover:text-blue-500 whitespace-nowrap ${
                    isScrolled ? 'text-gray-700' : 'text-white/90'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div
              className={`flex items-center gap-4 border-l pl-4 lg:pl-6 ${
                isScrolled ? 'border-gray-200' : 'border-white/20'
              }`}
            >
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-red-500 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors shadow-xl shadow-blue-500/20 active:scale-95 whitespace-nowrap"
              >
                Login
              </button>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/login')}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                isScrolled
                  ? 'text-gray-900 border-gray-300 hover:bg-gray-100'
                  : 'text-white border-white/30 hover:bg-white/10'
              }`}
            >
              Login
            </button>

            <button
              className="flex flex-col justify-center gap-[5px] p-2 flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <span className={`block w-6 h-0.5 rounded transition-colors ${isScrolled ? 'bg-gray-900' : 'bg-white'}`} />
              <span className={`block w-6 h-0.5 rounded transition-colors ${isScrolled ? 'bg-gray-900' : 'bg-white'}`} />
              <span className={`block w-4 h-0.5 rounded self-end transition-colors ${isScrolled ? 'bg-gray-900' : 'bg-white'}`} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
      />
    </>
  );
};

export default Navbar;