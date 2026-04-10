import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailX, Check, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useUnsubscribe } from '@/hooks/queries';
import { toast } from 'sonner';

type Status = 'confirm' | 'loading' | 'done' | 'error';

export function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<Status>(emailParam ? 'confirm' : 'confirm');
  const unsubscribeMutation = useUnsubscribe();

  const handleUnsubscribe = () => {
    if (!email.trim()) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setStatus('loading');
    unsubscribeMutation.mutate(email.trim(), {
      onSuccess: () => setStatus('done'),
      onError: () => setStatus('error'),
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="p-8 rounded-xl bg-card border border-border shadow-2xl text-center">
          {status === 'done' ? (
            <>
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-3">Desinscription confirmee</h1>
              <p className="text-muted-foreground font-medium mb-8">
                L'adresse <strong className="text-foreground">{email}</strong> a ete retiree de la newsletter.
                Vous ne recevrez plus d'emails.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Vous avez change d'avis ? Vous pouvez vous reinscrire depuis la page d'accueil.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour a l'accueil
              </Link>
            </>
          ) : status === 'error' ? (
            <>
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <MailX className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-3">Email introuvable</h1>
              <p className="text-muted-foreground font-medium mb-8">
                Cette adresse email n'est pas inscrite a la newsletter, ou a deja ete desabonnee.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour a l'accueil
              </Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <MailX className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-3">Se desabonner</h1>
              <p className="text-muted-foreground font-medium mb-6">
                Confirmez votre adresse email pour vous desabonner de la newsletter.
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full bg-secondary/30 border border-border rounded-xl pl-11 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                  />
                </div>

                <button
                  onClick={handleUnsubscribe}
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <MailX className="w-4 h-4" />
                      Confirmer la desinscription
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground mt-6">
                Vous continuerez a recevoir les emails transactionnels (confirmations de RDV, etc.)
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
