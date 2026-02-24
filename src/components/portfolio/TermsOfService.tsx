import { motion } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';

export function TermsOfService() {
  const profile = useProfile();
  const { t, i18n } = useTranslation();

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" />
          {t('common.backHome')}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              {t('terms.title')} <span className="text-primary">{t('terms.titleAccent')}</span>
            </h1>
          </div>

          <p className="text-sm text-muted-foreground/60">
            {t('legal.lastUpdate')} {new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s1Title')}</h2>
              <p>
                {t('terms.s1Text', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s2Title')}</h2>
              <p>
                {t('terms.s2P1')}
              </p>
              <p>
                {t('terms.s2P2', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s3Title')}</h2>
              <p>{t('terms.s3Intro')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('terms.s3Item1')}</li>
                <li>{t('terms.s3Item2')}</li>
                <li>{t('terms.s3Item3')}</li>
                <li>{t('terms.s3Item4')}</li>
                <li>{t('terms.s3Item5')}</li>
                <li>{t('terms.s3Item6')}</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s4Title')}</h2>
              <p>
                {t('terms.s4P1')}
              </p>
              <p>
                {t('terms.s4P2')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s5Title')}</h2>
              <p>
                {t('terms.s5Intro')}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('terms.s5Item1')}</li>
                <li>{t('terms.s5Item2')}</li>
                <li>{t('terms.s5Item3')}</li>
                <li>{t('terms.s5Item4')}</li>
              </ul>
              <p>
                {t('terms.s5Bottom', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s6Title')}</h2>
              <p>
                {t('terms.s6P1')}
              </p>
              <p>
                {t('terms.s6P2')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s7Title')}</h2>
              <p>
                {t('terms.s7Text', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s8Title')}</h2>
              <p>
                {t('terms.s8Text')} <Link to="/legal" className="text-primary hover:underline">{t('terms.legalLink')}</Link>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s9Title')}</h2>
              <p>
                {t('terms.s9P1', { name: profile.name })}
              </p>
              <p>
                {t('terms.s9P2', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s10Title')}</h2>
              <p>
                {t('terms.s10Text', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s11Title')}</h2>
              <p>
                {t('terms.s11Text', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s12Title')}</h2>
              <p>
                {t('terms.s12Text', { name: profile.name })} <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('terms.s13Title')}</h2>
              <p>
                {t('terms.s13Text')}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}