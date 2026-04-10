import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function CookieConsent() {
  const { hasConsented, accept, reset } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useTranslation();

  // Also expose reset for the privacy policy page to call
  if (typeof window !== 'undefined') {
    (window as any).__resetCookieConsent = reset;
  }

  if (hasConsented) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 1.5 }}
        className="fixed bottom-0 left-0 right-0 z-[90] p-4 md:p-6"
      >
        <div className="max-w-3xl mx-auto bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-black/10 overflow-hidden">
          {/* Main bar */}
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold mb-1">{t('cookie.title')}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {t('cookie.desc')}{' '}
                  <Link to="/politique-confidentialite" className="text-primary hover:underline font-medium">
                    {t('cookie.learnMore')}
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 sm:ml-14">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl border border-border hover:bg-secondary/50"
              >
                {t('cookie.customize')}
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => accept('essential')}
                className="px-4 py-2.5 text-[12px] font-semibold text-foreground rounded-xl border border-border hover:bg-secondary/50 transition-colors"
              >
                {t('cookie.essentialOnly')}
              </button>
              <button
                onClick={() => accept('all')}
                className="px-5 py-2.5 text-[12px] font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                {t('cookie.acceptAll')}
              </button>
            </div>
          </div>

          {/* Details panel */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2 border-t border-border space-y-3">
                  <CookieCategory
                    icon={<Shield className="w-4 h-4" />}
                    title={t('cookie.essentialTitle')}
                    description={t('cookie.essentialDesc')}
                    requiredLabel={t('cookie.required')}
                    required
                  />
                  <CookieCategory
                    icon={<Cookie className="w-4 h-4" />}
                    title={t('cookie.analyticsTitle')}
                    description={t('cookie.analyticsDesc')}
                  />
                  <CookieCategory
                    icon={<Cookie className="w-4 h-4" />}
                    title={t('cookie.marketingTitle')}
                    description={t('cookie.marketingDesc')}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CookieCategory({
  icon,
  title,
  description,
  required = false,
  requiredLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  required?: boolean;
  requiredLabel?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
      <div className="mt-0.5 text-primary shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[12px] font-bold">{title}</span>
          {required && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full uppercase">{requiredLabel}</span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}