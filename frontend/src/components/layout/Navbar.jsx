import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to toggle navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B0F1A]/90 backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <span className="font-bold text-xl text-white">C</span>
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">
              Casino<span className="text-emerald-500">X</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {['Games', 'Live Casino', 'Features'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '')}`} 
                className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-sm font-semibold tracking-wide"
              >
                {item}
              </a>
            ))}
            
            <div className="h-6 w-px bg-white/10 mx-2"></div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-white hover:text-emerald-400 font-bold text-sm transition-colors">
                Login
              </Link>
              <Link 
                to="/register-player" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-300 p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0F1422] border-b border-white/10 absolute w-full left-0 top-20 shadow-2xl animate-fade-in-down">
          <div className="px-4 py-6 space-y-4">
            <Link to="/login" className="block text-center text-gray-300 hover:text-white py-3 border border-white/10 rounded-xl font-medium">Login</Link>
            <Link to="/register-player" className="block text-center bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20">Register Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}