import { useState } from 'react';
import { Mail, Briefcase, CalendarCheck, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSubscribe } from '@/hooks/queries';

interface BlogCtaCardProps {
  variant: 'newsletter' | 'services' | 'booking';
}

export function BlogCtaCard({ variant }: BlogCtaCardProps) {
  if (variant === 'newsletter') return <NewsletterCta />;
  if (variant === 'services') return <ServicesCta />;
  return <BookingCta />;
}

function NewsletterCta() {
  const [email, setEmail] = useState('');
  const subscribeMutation = useSubscribe();
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate(email, {
      onSuccess: () => {
        setSubscribed(true);
        setEmail('');
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-[2.5rem] overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 justify-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-5">
        <Mail className="w-5 h-5" />
      </div>

      <h3 className="text-xl font-black tracking-tight mb-2">Restez informe</h3>
      <p className="text-muted-foreground font-medium text-sm mb-5 leading-relaxed">
        Recevez les derniers articles et reflexions directement dans votre boite mail.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={subscribed}
          placeholder="votre@email.com"
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
          required
        />
        <button
          type="submit"
          disabled={subscribeMutation.isPending || subscribed}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {subscribeMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : subscribed ? (
            <>Inscrit ! <Check className="w-4 h-4" /></>
          ) : (
            "S'abonner"
          )}
        </button>
      </form>

      <p className="text-[9px] text-muted-foreground/40 font-medium text-center mt-3">
        Pas de spam. Desabonnez-vous a tout moment.
      </p>
    </motion.div>
  );
}

export function NewsletterCtaWide() {
  const [email, setEmail] = useState('');
  const subscribeMutation = useSubscribe();
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate(email, {
      onSuccess: () => {
        setSubscribed(true);
        setEmail('');
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Mail className="w-4 h-4" />
            </div>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Restez informe</h3>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            Recevez les derniers articles et reflexions directement dans votre boite mail. Pas de spam, desabonnement en un clic.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribed}
            placeholder="votre@email.com"
            className="flex-1 md:w-64 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending || subscribed}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
          >
            {subscribeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : subscribed ? (
              <>Inscrit ! <Check className="w-4 h-4" /></>
            ) : (
              <>S'abonner <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function ServicesCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-[2.5rem] overflow-hidden border border-border bg-gradient-to-br from-secondary via-card/50 to-transparent p-8 justify-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background shadow-lg mb-5">
        <Briefcase className="w-5 h-5" />
      </div>

      <h3 className="text-xl font-black tracking-tight mb-2">Un projet en tete ?</h3>
      <p className="text-muted-foreground font-medium text-sm mb-6 leading-relaxed">
        Du design a la mise en production, je vous accompagne dans la realisation de vos idees les plus ambitieuses.
      </p>

      <Link
        to="/#contact"
        className="w-full py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Demander un devis
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

function BookingCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-[2.5rem] overflow-hidden border border-border bg-gradient-to-br from-primary/5 via-card/50 to-transparent p-8 justify-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5">
        <CalendarCheck className="w-5 h-5" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xl font-black tracking-tight">Discutons ensemble</h3>
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <p className="text-muted-foreground font-medium text-sm mb-6 leading-relaxed">
        Reservez un creneau pour echanger sur votre projet. Premiere consultation gratuite et sans engagement.
      </p>

      <Link
        to="/#booking"
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
      >
        Prendre rendez-vous
        <CalendarCheck className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
