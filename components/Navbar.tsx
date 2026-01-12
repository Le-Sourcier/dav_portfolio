
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, Search, Terminal, BookOpen, Cpu, ChevronRight, Command } from 'lucide-react';
import { PortfolioData } from '../types/index';

interface NavbarProps {
  currentView: string;
  setView: (v: any) => void;
  isScrolled: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  data: PortfolioData;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isScrolled, isDark, toggleTheme, data }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { label: 'Projets', view: 'home', hash: '#projects' },
    { label: 'Expérience', view: 'home', hash: '#experience' },
    { label: 'Blog', view: 'blog', hash: '' }
  ];

  const handleNav = (link: typeof navLinks[0]) => {
    setMobileMenuOpen(false);
    if (link.view !== currentView) {
      setView(link.view);
      if (link.hash) setTimeout(() => document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (link.hash) {
      document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/5' : 'py-6 bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg transition-all">DL</div>
          <span className="font-bold text-lg dark:text-white uppercase tracking-tight hidden sm:block">David Logan</span>
        </button>
        
        <div className="hidden md:flex gap-8 items-center text-sm font-semibold">
          {navLinks.map((link) => (
            <button 
              key={link.label} 
              onClick={() => handleNav(link)}
              className={`transition-colors ${currentView === link.view ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              {link.label}
            </button>
          ))}
          <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-2" />
          <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => { setView('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
          >
            Contact
          </button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400">
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 dark:text-gray-400">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-black border-b border-black/5 dark:border-white/5 py-8 px-6 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-6 items-center">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => handleNav(link)} className="text-xl font-bold dark:text-white">
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
