import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Message } from './types';
import { cn } from '../../../lib/utils';
import { User, ExternalLink, Calendar, CheckCircle2, Send, Loader2, Briefcase, BookOpen, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { contactsApi, appointmentsApi } from '@/services/api';
import { toast } from 'sonner';
import { useVisitorSession } from '@/hooks/useVisitorSession';
import { envConfig } from '@/config/env';

interface MessageBubbleProps {
  message: Message;
}

const AI_AVATAR = envConfig.chatbot.avatar;

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex w-full gap-3", isAssistant ? "justify-start" : "justify-end")}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-1 border border-primary/20 shadow-sm">
          <img src={AI_AVATAR} alt="AI" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={cn("max-w-[85%] flex flex-col gap-1.5", isAssistant ? "items-start" : "items-end")}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all",
          isAssistant
            ? "bg-secondary/40 border border-border/50 text-foreground rounded-tl-none hover:bg-secondary/60"
            : "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20"
        )}>
          {/* Markdown for assistant, plain text for user */}
          {isAssistant ? (
            <div className="chatbot-markdown text-[13px] [&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_li]:text-[13px] [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline">
              <MarkdownRenderer content={message.content} className="text-[13px]" />
            </div>
          ) : (
            message.content
          )}

          {/* Project Link Card */}
          {message.type === 'project_link' && message.metadata?.projectId && (
            <LinkCard
              to={`/work/${message.metadata.projectId}`}
              icon={<Briefcase className="w-3.5 h-3.5" />}
              label="Voir le projet"
              title={message.metadata.projectTitle as string}
              isAssistant={isAssistant}
            />
          )}

          {/* Experience Link Card */}
          {message.type === 'experience_link' && message.metadata?.experienceId && (
            <LinkCard
              to={`/experience/${message.metadata.experienceId}`}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              label="Voir l'experience"
              title={message.metadata.experienceTitle as string}
              isAssistant={isAssistant}
            />
          )}

          {/* Blog Link Card */}
          {message.type === 'blog_link' && message.metadata?.posts && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 pt-3 border-t border-border/30 space-y-2">
              {(message.metadata.posts as Array<{ id: string; title: string; slug: string }>).map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background/50 hover:bg-background border border-border/30 transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-[11px] truncate">{post.title}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </motion.div>
          )}

          {/* Appointment Picker */}
          {message.type === 'appointment_picker' && message.metadata?.availableTimes && (
            <AppointmentPicker times={message.metadata.availableTimes as string[]} />
          )}

          {/* Contact Form Inline */}
          {message.type === 'contact_form' && <InlineContactForm />}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-muted-foreground/60 font-medium italic">
            {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
          </span>
          {!isAssistant && <CheckCircle2 className="w-3 h-3 text-primary opacity-50" />}
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0 mt-1 border border-border shadow-sm">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
};

// ======================== LINK CARD ========================

function LinkCard({ to, icon, label, title, isAssistant }: {
  to: string; icon: React.ReactNode; label: string; title: string; isAssistant: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-3 pt-3 border-t border-border/30">
      <Link
        to={to}
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-xl border transition-all group",
          isAssistant ? "bg-background/50 hover:bg-background" : "bg-white/10 hover:bg-white/20 border-white/20"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary shrink-0">{icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{label}</span>
            <span className="font-bold text-[12px] truncate">{title}</span>
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </motion.div>
  );
}

// ======================== INLINE APPOINTMENT BOOKING ========================

function AppointmentPicker({ times }: { times: string[] }) {
  const { session, isIdentified, isPersisted, saveSession } = useVisitorSession();

  const [step, setStep] = useState<'time' | 'info' | 'done'>('time');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState(session?.name || '');
  const [email, setEmail] = useState(session?.email || '');
  const [subject, setSubject] = useState('');
  const [rememberMe, setRememberMe] = useState(isPersisted);
  const [sending, setSending] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const isFormValid = name.trim().length > 0
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    && subject.trim().length > 0;

  const handleBook = async () => {
    if (!selectedTime || !isFormValid) return;
    if (!isIdentified || rememberMe !== isPersisted) {
      saveSession({ name: name.trim(), email: email.trim() }, rememberMe);
    }
    setSending(true);
    try {
      await appointmentsApi.create({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        urgency: 'non-urgent',
        date: today,
        time: selectedTime,
      });
      setStep('done');
      toast.success('Rendez-vous reserve !');
    } catch {
      toast.error('Erreur lors de la reservation');
    } finally {
      setSending(false);
    }
  };

  // Step 3: Done
  if (step === 'done') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-2 text-emerald-500 mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[12px] font-bold">Rendez-vous confirme !</span>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-0.5">
          <p>Creneau : <strong>{selectedTime}</strong></p>
          <p>Sujet : <strong>{subject}</strong></p>
          <p>Un email de confirmation vous sera envoye.</p>
        </div>
      </motion.div>
    );
  }

  // Step 2: Info form
  if (step === 'info') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <Calendar className="w-3 h-3 text-primary" /> RDV a {selectedTime}
          </div>
          <button onClick={() => setStep('time')} className="text-[10px] text-primary font-bold hover:underline">Changer</button>
        </div>
        {isIdentified ? (
          <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-black">
              {session!.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold truncate">{session!.name}</span>
          </div>
        ) : (
          <>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" type="text"
              className="w-full h-8 px-3 rounded-lg bg-background/80 border border-border/50 text-[12px] outline-none focus:border-primary/50 transition-colors" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre email" type="email"
              className="w-full h-8 px-3 rounded-lg bg-background/80 border border-border/50 text-[12px] outline-none focus:border-primary/50 transition-colors" />
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" />
              <span className="text-[10px] text-muted-foreground">Se souvenir de moi</span>
            </label>
          </>
        )}
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Sujet du rendez-vous"
          className="w-full h-8 px-3 rounded-lg bg-background/80 border border-border/50 text-[12px] outline-none focus:border-primary/50 transition-colors" />
        <button onClick={handleBook} disabled={sending || !isFormValid}
          className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirmer le rendez-vous</>}
        </button>
      </motion.div>
    );
  }

  // Step 1: Time selection
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 grid grid-cols-2 gap-2">
      {times.map((time, idx) => (
        <motion.button
          key={time}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + idx * 0.05 }}
          onClick={() => { setSelectedTime(time); setStep('info'); }}
          className="border bg-background/50 hover:bg-primary/10 border-border/50 hover:border-primary/50 text-foreground px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-2 group"
        >
          <Calendar className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
          {time}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ======================== INLINE CONTACT FORM ========================

function InlineContactForm() {
  const { session, isIdentified, isPersisted, saveSession } = useVisitorSession();

  const [name, setName] = useState(session?.name || '');
  const [email, setEmail] = useState(session?.email || '');
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(isPersisted);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = name.trim().length > 0 && isValidEmail && message.trim().length >= 10;

  const handleSend = async () => {
    if (!isFormValid) return;
    // Save session (with remember preference)
    if (!isIdentified || rememberMe !== isPersisted) {
      saveSession({ name: name.trim(), email: email.trim() }, rememberMe);
    }
    setSending(true);
    try {
      await contactsApi.create({ name: name.trim(), email: email.trim(), subject: 'Via chatbot', message: message.trim() });
      setSent(true);
      toast.success('Message envoye !');
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-emerald-500">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-[12px] font-bold">Message envoye avec succes !</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 pt-3 border-t border-border/30 space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        <Mail className="w-3 h-3 text-primary" /> Contact rapide
      </div>
      {isIdentified ? (
        <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-black">
            {session!.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] font-semibold truncate">{session!.name}</span>
          <span className="text-[10px] text-muted-foreground truncate">({session!.email})</span>
        </div>
      ) : (
        <>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Votre nom"
            type="text"
            className="w-full h-8 px-3 rounded-lg bg-background/80 border border-border/50 text-[12px] outline-none focus:border-primary/50 transition-colors"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Votre email"
            type="email"
            className="w-full h-8 px-3 rounded-lg bg-background/80 border border-border/50 text-[12px] outline-none focus:border-primary/50 transition-colors"
          />
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-[10px] text-muted-foreground">Se souvenir de moi</span>
          </label>
        </>
      )}
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Votre message (min. 10 caracteres)..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-background/80 border border-border/50 text-[12px] outline-none focus:border-primary/50 transition-colors resize-none"
      />
      <button
        onClick={handleSend}
        disabled={sending || !isFormValid}
        className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Envoyer</>}
      </button>
    </motion.div>
  );
}
