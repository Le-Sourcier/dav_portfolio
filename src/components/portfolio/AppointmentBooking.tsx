import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronRight, Check, MessageSquare, AlertCircle, User, Mail, ArrowLeft, Loader2, Info } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useCreateAppointment } from '@/hooks/queries';
import { useVisitorSession } from '@/hooks/useVisitorSession';
import { appointmentsApi } from '@/services/api';
import { OtpVerification } from '@/components/shared/OtpVerification';
import { useTranslation } from 'react-i18next';

export function AppointmentBooking() {
  const {
    session, isIdentified, isVerified, needsReverification,
    isPersisted, otpStatus, otpError, requestOtp, verifyOtp, saveSession,
  } = useVisitorSession();
  const { t } = useTranslation();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [step, setStep] = useState(1);
  const [existingRdv, setExistingRdv] = useState<Array<{ date: string; time: string; subject: string; status: string }>>([]);

  // Check existing RDV when visitor is verified
  useEffect(() => {
    if (isVerified && session?.email) {
      appointmentsApi.checkExisting(session.email)
        .then((rdvs) => setExistingRdv(rdvs))
        .catch(() => {});
    }
  }, [isVerified, session?.email]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sujet, setSujet] = useState('');
  const [urgence, setUrgence] = useState<'non-urgent' | 'urgent'>('non-urgent');
  const [nom, setNom] = useState(session?.name || '');
  const [email, setEmail] = useState(session?.email || '');
  const [rememberMe, setRememberMe] = useState(isPersisted);

  const createMutation = useCreateAppointment();
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  // Auto-advance from OTP step to time selection when verified
  useEffect(() => {
    if (isVerified && step === 10) setStep(2);
  }, [isVerified, step]);

  const handleNextToStep2 = async () => {
    if (!nom || !email || !sujet) {
      toast.error(t('appointment.fillRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('appointment.invalidEmail'));
      return;
    }
    if (isVerified) {
      // Already verified, go directly to time selection
      setStep(2);
    } else {
      // Need OTP verification first
      await requestOtp(email.trim(), nom.trim());
      setStep(10); // OTP step
    }
  };

  const handleBook = () => {
    if (!selectedTime || !date) {
      toast.error(t('appointment.chooseSlot'));
      return;
    }

    createMutation.mutate(
      {
        name: nom.trim(),
        email: email.trim(),
        subject: sujet.trim(),
        urgency: urgence,
        date: format(date, 'yyyy-MM-dd'),
        time: selectedTime,
      },
      {
        onSuccess: () => setStep(3),
      }
    );
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTime(null);
    setSujet('');
    setNom('');
    setEmail('');
    setUrgence('non-urgent');
  };

  return (
    <div id="booking" className="p-6 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2.5rem] bg-card border border-border shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 sm:mb-12 text-center sm:text-left">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{t('appointment.title')}</h3>
          <p className="text-sm text-muted-foreground font-medium italic">{t('appointment.subtitle')}</p>
        </div>
      </div>

      {/* Existing RDV — block if pending, warn if confirmed */}
      {existingRdv.length > 0 && step === 1 && (() => {
        const hasPending = existingRdv.some((r) => r.status === 'pending');
        return (
          <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 ${hasPending ? 'bg-destructive/10 border border-destructive/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <Info className={`w-5 h-5 shrink-0 mt-0.5 ${hasPending ? 'text-destructive' : 'text-amber-500'}`} />
            <div>
              <p className={`text-sm font-bold mb-1 ${hasPending ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}>
                {hasPending ? t('appointment.pendingTitle') : t('appointment.confirmedTitle')}
              </p>
              {existingRdv.map((rdv, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {rdv.subject} — {new Date(rdv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} a {rdv.time} ({rdv.status === 'pending' ? t('appointment.pending') : t('appointment.confirmed')})
                </p>
              ))}
              <p className="text-xs text-muted-foreground mt-1 italic">
                {hasPending
                  ? t('appointment.pendingMsg')
                  : t('appointment.confirmedMsg')}
              </p>
            </div>
          </div>
        );
      })()}

      <div className="min-h-fit sm:min-h-[450px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 sm:space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary block text-center lg:text-left">{t('appointment.step1')}</label>
                  <div className="bg-background border border-border rounded-3xl p-2 sm:p-4 shadow-inner flex justify-center w-full max-w-sm mx-auto lg:max-w-none">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={fr}
                      className="rounded-md scale-90 sm:scale-100 origin-center"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary block text-center lg:text-left">{t('appointment.step2')}</label>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold flex items-center gap-2">
                        <User className="w-3 h-3 text-primary" /> {t('appointment.fullName')}
                      </Label>
                      <Input
                        placeholder={t('appointment.namePlaceholder')}
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className="h-11 sm:h-12 rounded-xl bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold flex items-center gap-2">
                        <Mail className="w-3 h-3 text-primary" /> Email
                      </Label>
                      <Input
                        type="email"
                        placeholder={t('appointment.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 sm:h-12 rounded-xl bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-primary" /> {t('appointment.subjectLabel')}
                    </Label>
                    <Input
                      placeholder={t('appointment.subjectPlaceholder')}
                      value={sujet}
                      onChange={(e) => setSujet(e.target.value)}
                      className="h-11 sm:h-12 rounded-xl bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-primary" /> {t('appointment.urgency')}
                    </Label>
                    <RadioGroup
                      value={urgence}
                      onValueChange={(v) => setUrgence(v as 'non-urgent' | 'urgent')}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <div className="flex items-center space-x-3 bg-background p-3 rounded-xl border border-border hover:border-primary/30 transition-colors flex-1 cursor-pointer">
                        <RadioGroupItem value="non-urgent" id="r1" />
                        <Label htmlFor="r1" className="font-bold cursor-pointer text-sm flex-1">{t('appointment.notUrgent')}</Label>
                      </div>
                      <div className="flex items-center space-x-3 bg-background p-3 rounded-xl border border-border hover:border-primary/30 transition-colors flex-1 cursor-pointer">
                        <RadioGroupItem value="urgent" id="r2" />
                        <Label htmlFor="r2" className="font-bold cursor-pointer text-sm flex-1">{t('appointment.urgent')}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextToStep2}
                disabled={otpStatus === 'sending'}
                className="w-full py-4 sm:py-5 bg-primary text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all uppercase tracking-widest text-sm disabled:opacity-60"
              >
                {t('appointment.chooseTime')} <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 10 && (
            <motion.div
              key="stepOtp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 py-8"
            >
              <OtpVerification
                email={email}
                otpStatus={otpStatus}
                otpError={otpError}
                onVerify={(code, rem) => verifyOtp(code, rem)}
                onResend={() => requestOtp(email.trim(), nom.trim())}
                remember={rememberMe}
                onRememberChange={setRememberMe}
              />
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 border border-border rounded-xl font-bold text-sm hover:bg-secondary transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> {t('appointment.back')}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary block text-center sm:text-left">{t('appointment.step3')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {times.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold transition-all border text-sm sm:text-base ${
                        selectedTime === time
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 sm:py-5 border border-border rounded-xl sm:rounded-2xl font-bold hover:bg-secondary transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> {t('appointment.back')}
                </button>
                <button
                  disabled={!selectedTime || createMutation.isPending}
                  onClick={handleBook}
                  className="flex-[2] py-4 sm:py-5 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('appointment.confirm')
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 sm:py-16 space-y-6 sm:space-y-8"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl sm:text-3xl font-black tracking-tight px-4">{t('appointment.successTitle', { name: nom })}</h4>
                <div className="bg-secondary/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border max-w-md mx-auto space-y-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{t('appointment.summary')}</p>
                  <p className="text-foreground font-bold text-base sm:text-lg leading-tight px-2">
                    "{sujet}"
                  </p>
                  <div className="flex flex-col gap-2 text-muted-foreground font-medium text-sm">
                    <p className="flex items-center justify-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" /> {date && format(date, 'd MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> {selectedTime}
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-primary" /> {email}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground font-medium text-sm px-4">
                  {t('appointment.confirmEmail')}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-secondary text-foreground rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-secondary/80 transition-all"
              >
                {t('appointment.bookAnother')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
