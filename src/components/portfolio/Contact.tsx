import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Send, Loader2 } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';
import { AppointmentBooking } from './AppointmentBooking';
import { useProfile } from '@/hooks/useProfile';
import { useSendContact } from '@/hooks/queries';
import { useVisitorSession } from '@/hooks/useVisitorSession';
import { useTranslation } from 'react-i18next';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function Contact() {
  const { session, isIdentified, isPersisted, saveSession } = useVisitorSession();
  const { t } = useTranslation();
  const [rememberMe, setRememberMe] = useState(isPersisted);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    defaultValues: {
      name: session?.name || '',
      email: session?.email || '',
    },
  });
  const profile = useProfile();
  const sendMutation = useSendContact();

  const onSubmit = (data: ContactFormData) => {
    if (!isIdentified || rememberMe !== isPersisted) {
      saveSession({ name: data.name.trim(), email: data.email.trim() }, rememberMe);
    }
    sendMutation.mutate(data, {
      onSuccess: () => reset({ name: data.name, email: data.email, subject: '', message: '' }),
    });
  };

  return (
    <section id="contact" className="py-32 px-6 md:px-12 lg:px-24 bg-card relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter & Booking Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <NewsletterForm />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <AppointmentBooking />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-bold mb-12 tracking-tighter"
            >
              {t('contact.title')} <span className="text-primary italic">{t('contact.titleAccent')}</span>.
            </motion.h2>

            <p className="text-xl text-muted-foreground mb-16 max-w-md font-medium leading-relaxed">
              {t('contact.subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t('contact.contactLabel')}</h4>
                <div className="space-y-2">
                  <p className="font-bold text-lg">{profile.email}</p>
                  <p className="text-muted-foreground font-medium">{profile.phone.split(' / ')[0]}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t('contact.locationLabel')}</h4>
                <div className="space-y-2">
                  <p className="font-bold text-lg">{profile.location}</p>
                  <p className="text-muted-foreground font-medium">{t('contact.remoteAvailable')}</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-10 rounded-xl bg-background border border-border shadow-2xl relative"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('contact.fullName')}</label>
                  <input
                    {...register('name', { required: t('contact.nameRequired') })}
                    className="w-full bg-secondary/30 border-border rounded-xl px-6 py-5 focus:ring-2 focus:ring-primary transition-all font-medium"
                    placeholder={t('contact.namePlaceholder')}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('contact.email')}</label>
                  <input
                    {...register('email', {
                      required: t('contact.emailRequired'),
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('contact.emailInvalid') }
                    })}
                    type="email"
                    className="w-full bg-secondary/30 border-border rounded-xl px-6 py-5 focus:ring-2 focus:ring-primary transition-all font-medium"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('contact.subject')}</label>
                <select
                  {...register('subject')}
                  className="w-full bg-secondary/30 border-border rounded-xl px-6 py-5 focus:ring-2 focus:ring-primary transition-all font-medium appearance-none"
                >
                  <option>{t('contact.subjectNew')}</option>
                  <option>{t('contact.subjectCollab')}</option>
                  <option>{t('contact.subjectInfo')}</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('contact.message')}</label>
                <textarea
                  {...register('message', { required: t('contact.messageRequired') })}
                  rows={5}
                  className="w-full bg-secondary/30 border-border rounded-xl px-6 py-5 focus:ring-2 focus:ring-primary transition-all resize-none font-medium"
                  placeholder={t('contact.messagePlaceholder')}
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <button
                disabled={sendMutation.isPending}
                className="w-full py-6 bg-primary text-primary-foreground rounded-xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-70 active:scale-[0.98]"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {t('contact.send')}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
