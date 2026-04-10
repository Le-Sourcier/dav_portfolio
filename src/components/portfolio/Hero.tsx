import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, PlayCircle, Twitter } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';

export function Hero() {
  const profile = useProfile();
  const { t } = useTranslation();
  const [firstName] = profile.name.split(' ');

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent_70%)]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/80 backdrop-blur-md border border-border text-xs font-black uppercase tracking-[0.2em] text-primary">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t('hero.available')}
            </span>
          </motion.div>

          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-12"
            >
              {t('hero.title1')}<br />
              <span className="relative inline-block">
                {t('hero.title2')}
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-3 md:h-6 bg-primary/10 -z-10"
                />
              </span><br />
              <span className="text-muted-foreground/30 italic font-light">{t('hero.title3')}</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
          >
            {t('hero.intro', { name: firstName, location: profile.location })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
          >
            <a href="#work" className="group relative px-10 py-5 bg-primary text-primary-foreground rounded-xl font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl">
              <span className="relative z-10 flex items-center gap-3">
                {t('hero.projects')} <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            <button className="flex items-center gap-3 px-10 py-5 bg-secondary text-secondary-foreground rounded-xl font-black text-lg hover:bg-secondary/80 transition-all border border-border">
              {t('hero.showreel')} <PlayCircle className="w-6 h-6" />
            </button>
          </motion.div>

          {/* Scrolling Socials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="flex items-center gap-12 text-muted-foreground/60"
          >
            <motion.a href={profile.github} target="_blank" rel="noopener noreferrer" whileHover={{ y: -5, color: 'var(--primary)' }} className="transition-all"><Github className="w-6 h-6" /></motion.a>
            <motion.a href={profile.linkedin} target="_blank" rel="noopener noreferrer" whileHover={{ y: -5, color: 'var(--primary)' }} className="transition-all"><Linkedin className="w-6 h-6" /></motion.a>
            <motion.a href={`mailto:${profile.email}`} whileHover={{ y: -5, color: 'var(--primary)' }} className="transition-all"><Mail className="w-6 h-6" /></motion.a>
            <motion.a href="#" whileHover={{ y: -5, color: 'var(--primary)' }} className="transition-all"><Twitter className="w-6 h-6" /></motion.a>
          </motion.div>
        </div>
      </div>

      {/* Side Progress Decoration */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-8">
        <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-border to-transparent" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/50">{t('hero.explore')}</span>
        <div className="w-[1px] h-32 bg-gradient-to-t from-transparent via-border to-transparent" />
      </div>
    </section>
  );
}