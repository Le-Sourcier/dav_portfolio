import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const profile = useProfile();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.work'), href: '/#work' },
    { name: t('nav.about'), href: '/#about' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.contact'), href: '/#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      const id = href.split('#')[1];
      if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(href);
      }
    }
  };

  const handleLetsTalk = () => {
    if (location.pathname === '/') {
      const element = document.getElementById('booking');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#booking');
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'py-4 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm' : 'py-8 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Link 
            to="/" 
            className="text-2xl font-black tracking-tighter flex items-center gap-1 group"
          >
            <span className="group-hover:text-primary transition-colors">{profile.brand}</span>
            <span className="text-primary w-2 h-2 rounded-full bg-primary" />
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {link.href.startsWith('/#') ? (
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link.href);
                    }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors relative group block"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />
                  </a>
                ) : (
                  <Link 
                    to={link.href}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors relative group block ${location.pathname === link.href ? 'text-primary' : ''}`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all group-hover:w-full ${location.pathname === link.href ? 'w-full' : 'w-0'}`} />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center gap-4 border-l border-border pl-8">
            <ThemeToggle />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleLetsTalk}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center gap-2 group"
            >
              {t('nav.cta')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button 
            className="p-3 rounded-2xl bg-secondary border border-border"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background z-[90] md:hidden flex flex-col p-12"
          >
            <div className="flex justify-between items-center mb-16">
               <span className="text-2xl font-black tracking-tighter">MENU</span>
               <button onClick={() => setIsOpen(false)} className="p-3 rounded-2xl bg-secondary">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {link.href.startsWith('/#') ? (
                    <a 
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                      className="text-4xl font-black tracking-tighter hover:text-primary transition-colors block uppercase"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link 
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-4xl font-black tracking-tighter hover:text-primary transition-colors block uppercase ${location.pathname === link.href ? 'text-primary' : ''}`}
                    >
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleLetsTalk}
                className="text-4xl font-black tracking-tighter text-primary flex items-center gap-4 group text-left uppercase"
              >
                {t('nav.cta').toUpperCase()} <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
              </motion.button>
            </div>

            <div className="mt-auto">
              <p className="text-muted-foreground mb-6 font-bold uppercase tracking-widest text-[10px]">Socials</p>
              <div className="flex gap-8">
                {['TW', 'IG', 'LI', 'BE'].map(s => (
                  <a key={s} href="#" className="text-xl font-black hover:text-primary transition-colors">{s}</a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}