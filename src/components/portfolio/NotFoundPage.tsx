import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block"
        >
          <h1 className="text-[12rem] md:text-[20rem] font-black leading-none tracking-tighter text-muted-foreground/10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                  {t('notFound.title')} <span className="text-primary">{t('notFound.titleAccent')}</span>
                </h2>
                <p className="text-muted-foreground font-medium max-w-md mx-auto">
                  {t('notFound.desc')}
                </p>
                <div className="pt-6">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    {t('notFound.backHome')}
                  </Link>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}