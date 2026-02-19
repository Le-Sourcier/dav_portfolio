import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

export function PrivacyPolicy() {
  const profile = useProfile();

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" />
          Retour a l'accueil
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
              Politique de <span className="text-primary">Confidentialite</span>
            </h1>
          </div>

          <p className="text-sm text-muted-foreground/60">
            Derniere mise a jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">1. Responsable du traitement</h2>
              <p>
                Le responsable du traitement des donnees personnelles collectees sur ce site est :<br />
                <strong className="text-foreground">{profile.name}</strong>, {profile.title}.<br />
                {profile.email && <>Email : <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a><br /></>}
                {profile.location && <>Localisation : {profile.location}.</>}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">2. Donnees collectees</h2>
              <p>Nous collectons les donnees suivantes selon les fonctionnalites que vous utilisez :</p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Formulaire de contact</h3>
                  <p className="text-sm">Nom, adresse email, sujet, message. <strong>Aucune verification OTP requise</strong> — ces donnees sont envoyees directement sans creation de compte.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Commentaires de blog</h3>
                  <p className="text-sm">Nom, adresse email (verifiee par OTP), contenu du commentaire. L'email est verifie pour prevenir l'usurpation d'identite.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Prise de rendez-vous</h3>
                  <p className="text-sm">Nom, adresse email (verifiee par OTP), date et heure souhaitees, niveau d'urgence, description du projet.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Newsletter</h3>
                  <p className="text-sm">Adresse email uniquement.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Chatbot</h3>
                  <p className="text-sm">Les conversations avec le chatbot ne sont pas stockees de maniere permanente. Les donnees saisies dans les formulaires inline (contact, RDV) suivent les memes regles que les formulaires dedies.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Donnees techniques</h3>
                  <p className="text-sm">Pour les statistiques de blog (compteur de vues), un hash anonyme est genere a partir de votre adresse IP et user-agent. Aucune donnee personnelle identifiable n'est stockee a cette fin.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">3. Finalites du traitement</h2>
              <p>Les donnees personnelles sont collectees pour les finalites suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Repondre aux demandes de contact</li>
                <li>Gerer les prises de rendez-vous et leur suivi</li>
                <li>Publier et moderer les commentaires de blog</li>
                <li>Envoyer la newsletter (avec consentement prealable)</li>
                <li>Verifier l'identite des visiteurs via OTP pour prevenir les abus</li>
                <li>Produire des statistiques de frequentation anonymisees</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">4. Base legale</h2>
              <p>Le traitement des donnees est fonde sur :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">Consentement</strong> : pour l'inscription a la newsletter et le depot de cookies</li>
                <li><strong className="text-foreground">Interet legitime</strong> : pour repondre aux demandes de contact et gerer les rendez-vous</li>
                <li><strong className="text-foreground">Execution contractuelle</strong> : pour les prestations de services suite a un rendez-vous confirme</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">5. Duree de conservation</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">Messages de contact</strong> : conserves jusqu'a resolution de la demande, maximum 12 mois</li>
                <li><strong className="text-foreground">Rendez-vous</strong> : conserves 12 mois apres la date du rendez-vous</li>
                <li><strong className="text-foreground">Commentaires</strong> : conserves tant que l'article de blog est publie</li>
                <li><strong className="text-foreground">Newsletter</strong> : jusqu'au desabonnement</li>
                <li><strong className="text-foreground">Codes OTP</strong> : supprimes automatiquement apres 10 minutes ou apres verification</li>
                <li><strong className="text-foreground">Tokens visiteur</strong> : validite de 24 heures (ou 7 jours si « Se souvenir de moi » est active)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">6. Cookies et stockage local</h2>
              <p>Ce site utilise les mecanismes de stockage suivants :</p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Cookies essentiels</h3>
                  <p className="text-sm">Consentement cookies (cookie_consent), preferences d'affichage. Ces cookies sont necessaires au fonctionnement du site.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-black text-foreground mb-1">Stockage local (localStorage / sessionStorage)</h3>
                  <p className="text-sm">Session visiteur (nom, email, token de verification), preferences admin, theme d'affichage. Ces donnees restent sur votre navigateur et ne sont pas transmises a des tiers.</p>
                </div>
              </div>

              <p>
                Aucun cookie de tracking publicitaire, d'analyse tierce (Google Analytics, Facebook Pixel, etc.) n'est utilise sur ce site.
              </p>
              <p>
                Un bandeau de consentement est affiche lors de votre premiere visite. Vous pouvez modifier vos preferences a tout moment.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">7. Partage des donnees</h2>
              <p>
                Vos donnees personnelles ne sont <strong className="text-foreground">jamais vendues, louees ou cedees a des tiers</strong> a des fins commerciales.
              </p>
              <p>Les seuls tiers susceptibles d'acceder a vos donnees sont :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">Hebergeur</strong> : Vercel Inc. (hebergement du site et des donnees)</li>
                <li><strong className="text-foreground">Service email</strong> : pour l'envoi des codes OTP, confirmations de rendez-vous et newsletter</li>
              </ul>
              <p>
                Ces prestataires sont tenus par des obligations de confidentialite et n'utilisent vos donnees que dans le cadre des services fournis.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">8. Securite</h2>
              <p>
                Nous mettons en oeuvre des mesures de securite appropriees pour proteger vos donnees :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Communication chiffree via HTTPS</li>
                <li>Authentification par JWT avec tokens a duree de vie limitee</li>
                <li>Rate limiting sur tous les endpoints publics pour prevenir les abus</li>
                <li>Verification d'identite par OTP pour les actions sensibles</li>
                <li>Mots de passe hashes (jamais stockes en clair)</li>
                <li>Nettoyage automatique des donnees expirees (OTP, rendez-vous)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">9. Vos droits</h2>
              <p>
                Conformement au Reglement General sur la Protection des Donnees (RGPD) et aux lois applicables, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-foreground">Droit d'acces</strong> : obtenir une copie de vos donnees personnelles</li>
                <li><strong className="text-foreground">Droit de rectification</strong> : corriger des donnees inexactes ou incompletes</li>
                <li><strong className="text-foreground">Droit de suppression</strong> : demander l'effacement de vos donnees</li>
                <li><strong className="text-foreground">Droit d'opposition</strong> : vous opposer au traitement de vos donnees</li>
                <li><strong className="text-foreground">Droit a la portabilite</strong> : recevoir vos donnees dans un format structure</li>
                <li><strong className="text-foreground">Droit de retrait du consentement</strong> : retirer votre consentement a tout moment (newsletter, cookies)</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous a : <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a>. Nous repondrons dans un delai de 30 jours.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">10. Modifications</h2>
              <p>
                Cette politique de confidentialite peut etre mise a jour a tout moment. Les modifications sont effectives des leur publication sur cette page. Nous vous invitons a la consulter regulierement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">11. Contact</h2>
              <p>
                Pour toute question concernant cette politique ou vos donnees personnelles :<br />
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
