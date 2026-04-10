import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { envConfig } from '@/config/env';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // Redirect if already authenticated — only if a real token exists
  useEffect(() => {
    const realToken = localStorage.getItem('admin_token');
    if (realToken && (isAuthenticated || token)) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, token, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      // Real API login
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.token, data.refreshToken);
      toast.success('Connexion reussie. Bienvenue !');
      navigate(from, { replace: true });
    } catch (error: any) {
      // If the error is a network error (backend down), show specific message
      if (error.message?.includes('indisponible') || error.message?.includes('timeout')) {
        toast.error('Serveur indisponible. Verifiez que le backend est demarre.');
      } else {
        toast.error(error.message || 'Identifiants incorrects');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Espace Admin</h1>
          <p className="text-muted-foreground font-medium italic">Acces restreint aux administrateurs uniquement</p>
        </div>

        <div className="bg-card border border-border p-8 md:p-10 rounded-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-secondary/50 border-none rounded-xl font-medium focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Mot de passe</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-secondary/50 border-none rounded-xl font-medium focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-sm group"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Se Connecter
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border flex items-center justify-center gap-2 text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Connexion securisee SSL</span>
          </div>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-muted-foreground">
          &copy; {new Date().getFullYear()} {envConfig.appName}
        </p>
      </motion.div>
    </div>
  );
}
