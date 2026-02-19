import { motion } from 'framer-motion';
import { ChevronLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

export function LegalMentions() {
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
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              Mentions <span className="text-primary">Legales</span>
            </h1>
          </div>

          <p className="text-sm text-muted-foreground/60">
            Derniere mise a jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">1. Edition du site</h2>
              <p>
                Le present site portfolio est edite par :<br />
                <strong className="text-foreground">{profile.name}</strong>, {profile.title}.<br />
                {profile.location && <>Localisation : {profile.location}.<br /></>}
                {profile.email && <>Email de contact : <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a><br /></>}
                {profile.phone && <>Telephone : {profile.phone}<br /></>}
              </p>
              <p>
                Ce site est un portfolio personnel a but de presentation professionnelle. Il n'a pas vocation commerciale directe.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">2. Hebergement</h2>
              <p>
                Le site est heberge par la societe <strong className="text-foreground">Vercel Inc.</strong>, situee au 340 S Lemon Ave #4399, Walnut, CA 91789, USA.<br />
                Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://vercel.com</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">3. Directeur de publication</h2>
              <p>
                Le Directeur de la publication du site est <strong className="text-foreground">{profile.name}</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">4. Propriete intellectuelle</h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, illustrations, code source, design, logos) est la propriete exclusive de {profile.name}, sauf mention contraire explicite.
              </p>
              <p>
                Toute reproduction, representation, modification, publication ou adaptation de tout ou partie des elements du site, quel que soit le moyen ou le procede utilise, est interdite sans autorisation ecrite prealable.
              </p>
              <p>
                Les projets presentes sur ce site peuvent inclure des travaux realises dans le cadre de missions professionnelles. Les droits de propriete intellectuelle de ces travaux appartiennent a leurs commanditaires respectifs. Seules les captures d'ecran et descriptions sont presentees a titre d'illustration du savoir-faire.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">5. Donnees personnelles</h2>
              <p>
                Les informations recueillies via les formulaires de contact, de commentaires et de prise de rendez-vous sont destinees exclusivement a {profile.name} et ne sont en aucun cas cedees a des tiers.
              </p>
              <p>
                Conformement au Reglement General sur la Protection des Donnees (RGPD), vous disposez d'un droit d'acces, de rectification, de suppression et d'opposition concernant vos donnees personnelles. Pour exercer ces droits, contactez : <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a>.
              </p>
              <p>
                Pour plus de details, consultez notre <Link to="/privacy" className="text-primary hover:underline">Politique de Confidentialite</Link>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">6. Cookies</h2>
              <p>
                Ce site utilise des cookies techniques essentiels au fonctionnement du site (authentification, preferences d'affichage, consentement cookies). Aucun cookie de tracking publicitaire n'est utilise.
              </p>
              <p>
                Un bandeau de consentement vous est presente lors de votre premiere visite. Vous pouvez modifier vos preferences a tout moment.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">7. Limitation de responsabilite</h2>
              <p>
                {profile.name} s'efforce de fournir sur ce site des informations aussi precises que possible. Toutefois, il ne pourra etre tenu responsable des omissions, des inexactitudes ou des carences dans la mise a jour.
              </p>
              <p>
                Les liens hypertextes mis en place dans le cadre de ce site en direction d'autres ressources sur Internet ne sauraient engager la responsabilite de {profile.name}.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">8. Droit applicable</h2>
              <p>
                Tout litige en relation avec l'utilisation du site est soumis au droit togolais. L'utilisateur du site reconnait la competence exclusive des tribunaux de Lome pour tout differend relatif au present site.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
