import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const toggle = () => {
    i18n.changeLanguage(currentLang === 'fr' ? 'en' : 'fr');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      className="p-3 rounded-2xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all relative overflow-hidden"
      aria-label="Toggle Language"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentLang}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-black text-primary uppercase absolute"
          >
            {currentLang}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
