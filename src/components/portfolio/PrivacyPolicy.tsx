import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';
import { useLocalizedField } from '@/hooks/useLocalizedField';

export function PrivacyPolicy() {
  const profile = useProfile();
  const { t, i18n } = useTranslation();
  const localize = useLocalizedField();
  const title = localize(profile.title, profile.title_en);

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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              {t('privacy.title')} <span className="text-primary">{t('privacy.titleAccent')}</span>
            </h1>
          </div>

          <p className="text-sm text-muted-foreground/60">
            {t('legal.lastUpdate')} {new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s1Title')}</h2>
              <p>
                {t('privacy.s1Intro')}<br />
                <strong className="text-foreground">{profile.name}</strong>, {title}.<br />
                {profile.email && <>{t('privacy.emailLabel')} <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a><br /></>}
                {profile.location && <>{t('privacy.locationLabel')} {profile.location}.</>}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s2Title')}</h2>
              <p>{t('privacy.s2Intro')}</p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.formContact')}</h3>
                  <p className="text-sm">{t('privacy.formContactDesc')}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.formComments')}</h3>
                  <p className="text-sm">{t('privacy.formCommentsDesc')}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.formAppointment')}</h3>
                  <p className="text-sm">{t('privacy.formAppointmentDesc')}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.formNewsletter')}</h3>
                  <p className="text-sm">{t('privacy.formNewsletterDesc')}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.formChatbot')}</h3>
                  <p className="text-sm">{t('privacy.formChatbotDesc')}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.formTechnical')}</h3>
                  <p className="text-sm">{t('privacy.formTechnicalDesc')}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s3Title')}</h2>
              <p>{t('privacy.s3Intro')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('privacy.s3Item1')}</li>
                <li>{t('privacy.s3Item2')}</li>
                <li>{t('privacy.s3Item3')}</li>
                <li>{t('privacy.s3Item4')}</li>
                <li>{t('privacy.s3Item5')}</li>
                <li>{t('privacy.s3Item6')}</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s4Title')}</h2>
              <p>{t('privacy.s4Intro')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">{t('privacy.s4ConsentLabel')}</strong> : {t('privacy.s4ConsentText')}</li>
                <li><strong className="text-foreground">{t('privacy.s4LegitLabel')}</strong> : {t('privacy.s4LegitText')}</li>
                <li><strong className="text-foreground">{t('privacy.s4ContractLabel')}</strong> : {t('privacy.s4ContractText')}</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s5Title')}</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">{t('privacy.s5ContactLabel')}</strong> : {t('privacy.s5ContactText')}</li>
                <li><strong className="text-foreground">{t('privacy.s5AppointmentLabel')}</strong> : {t('privacy.s5AppointmentText')}</li>
                <li><strong className="text-foreground">{t('privacy.s5CommentsLabel')}</strong> : {t('privacy.s5CommentsText')}</li>
                <li><strong className="text-foreground">{t('privacy.s5NewsletterLabel')}</strong> : {t('privacy.s5NewsletterText')}</li>
                <li><strong className="text-foreground">{t('privacy.s5OtpLabel')}</strong> : {t('privacy.s5OtpText')}</li>
                <li><strong className="text-foreground">{t('privacy.s5TokenLabel')}</strong> : {t('privacy.s5TokenText')}</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s6Title')}</h2>
              <p>{t('privacy.s6Intro')}</p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.cookieEssential')}</h3>
                  <p className="text-sm">{t('privacy.cookieEssentialDesc')}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">{t('privacy.cookieLocalStorage')}</h3>
                  <p className="text-sm">{t('privacy.cookieLocalStorageDesc')}</p>
                </div>
              </div>

              <p>
                {t('privacy.s6NoTracking')}
              </p>
              <p>
                {t('privacy.s6ConsentBanner')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s7Title')}</h2>
              <p>
                {t('privacy.s7P1')}
              </p>
              <p>{t('privacy.s7P2')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">{t('privacy.s7HostLabel')}</strong> : {t('privacy.s7HostText')}</li>
                <li><strong className="text-foreground">{t('privacy.s7EmailLabel')}</strong> : {t('privacy.s7EmailText')}</li>
              </ul>
              <p>
                {t('privacy.s7P3')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s8Title')}</h2>
              <p>
                {t('privacy.s8Intro')}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('privacy.s8Item1')}</li>
                <li>{t('privacy.s8Item2')}</li>
                <li>{t('privacy.s8Item3')}</li>
                <li>{t('privacy.s8Item4')}</li>
                <li>{t('privacy.s8Item5')}</li>
                <li>{t('privacy.s8Item6')}</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s9Title')}</h2>
              <p>
                {t('privacy.s9Intro')}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">{t('privacy.s9AccessLabel')}</strong> : {t('privacy.s9AccessText')}</li>
                <li><strong className="text-foreground">{t('privacy.s9RectifyLabel')}</strong> : {t('privacy.s9RectifyText')}</li>
                <li><strong className="text-foreground">{t('privacy.s9DeleteLabel')}</strong> : {t('privacy.s9DeleteText')}</li>
                <li><strong className="text-foreground">{t('privacy.s9ObjectLabel')}</strong> : {t('privacy.s9ObjectText')}</li>
                <li><strong className="text-foreground">{t('privacy.s9PortLabel')}</strong> : {t('privacy.s9PortText')}</li>
                <li><strong className="text-foreground">{t('privacy.s9WithdrawLabel')}</strong> : {t('privacy.s9WithdrawText')}</li>
              </ul>
              <p>
                {t('privacy.s9Contact')} <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a>. {t('privacy.s9Delay')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s10Title')}</h2>
              <p>
                {t('privacy.s10Text')}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{t('privacy.s11Title')}</h2>
              <p>
                {t('privacy.s11Intro')}<br />
                <strong className="text-foreground">{profile.name}</strong><br />
                {profile.email && <><a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a><br /></>}
                {profile.phone && <>{profile.phone}<br /></>}
                {profile.location && <>{profile.location}</>}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}