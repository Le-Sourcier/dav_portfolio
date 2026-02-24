import { motion } from 'framer-motion';
import { ChevronLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';

export function LegalMentions() {
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
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              {t('legal.title')} <span className="text-primary">{t('legal.titleAccent')}</span>
            </h1>
          </div>

          <p className="text-sm text-muted-foreground/60">
            {t('legal.lastUpdate')} {new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s1Title')}</h2>
              <p>
                {t('legal.s1Intro')}<br />
                <strong className="text-foreground">{profile.name}</strong>, {profile.title}.<br />
                {profile.location && <>{t('legal.location')} {profile.location}.<br /></>}
                {profile.email && <>{t('legal.contactEmail')} <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a><br /></>}
                {profile.phone && <>{t('legal.phone')} {profile.phone}<br /></>}
              </p>
              <p>
                {t('legal.s1Desc')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s2Title')}</h2>
              <p>
                {t('legal.s2P1')}{' '}
                <strong className="text-foreground">Vercel Inc.</strong>, {t('legal.s2P2')}<br />
                {t('legal.s2Website')} <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://vercel.com</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s3Title')}</h2>
              <p>
                {t('legal.s3Text')} <strong className="text-foreground">{profile.name}</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s4Title')}</h2>
              <p>
                {t('legal.s4P1', { name: profile.name })}
              </p>
              <p>
                {t('legal.s4P2')}
              </p>
              <p>
                {t('legal.s4P3')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s5Title')}</h2>
              <p>
                {t('legal.s5P1', { name: profile.name })}
              </p>
              <p>
                {t('legal.s5P2')}
              </p>
              <p>
                {t('legal.s5P3')} <Link to="/privacy" className="text-primary hover:underline">{t('legal.privacyLink')}</Link>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s6Title')}</h2>
              <p>
                {t('legal.s6P1')}
              </p>
              <p>
                {t('legal.s6P2')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s7Title')}</h2>
              <p>
                {t('legal.s7P1', { name: profile.name })}
              </p>
              <p>
                {t('legal.s7P2', { name: profile.name })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('legal.s8Title')}</h2>
              <p>
                {t('legal.s8Text')}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}