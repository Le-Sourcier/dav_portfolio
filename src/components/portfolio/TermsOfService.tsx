import { motion } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

export function TermsOfService() {
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
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              Conditions <span className="text-primary">Generales</span>
            </h1>
          </div>

          <p className="text-sm text-muted-foreground/60">
            Derniere mise a jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">1. Objet</h2>
              <p>
                Les presentes Conditions Generales d'Utilisation (CGU) encadrent l'acces et l'utilisation du site portfolio de <strong className="text-foreground">{profile.name}</strong> (ci-apres « le Site »). En accedant au Site, l'utilisateur accepte sans reserve les presentes conditions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">2. Acces au site</h2>
              <p>
                Le Site est accessible gratuitement a tout utilisateur disposant d'un acces a Internet. Les frais d'acces et d'utilisation du reseau de telecommunication sont a la charge de l'utilisateur.
              </p>
              <p>
                {profile.name} met en oeuvre tous les moyens raisonnables pour assurer un acces continu au Site, mais ne saurait garantir une disponibilite permanente. L'acces au Site peut etre temporairement interrompu pour des raisons de maintenance, de mise a jour ou de force majeure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">3. Services proposes</h2>
              <p>Le Site propose les fonctionnalites suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Presentation du parcours professionnel et des projets realises</li>
                <li>Publication d'articles de blog avec possibilite de commentaires</li>
                <li>Formulaire de contact pour les demandes professionnelles</li>
                <li>Systeme de prise de rendez-vous en ligne</li>
                <li>Assistant chatbot pour orienter les visiteurs</li>
                <li>Inscription a la newsletter</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">4. Compte visiteur et verification</h2>
              <p>
                Certaines fonctionnalites (commentaires, prise de rendez-vous) necessitent une identification par email. Un code de verification a usage unique (OTP) est envoye a l'adresse email fournie pour confirmer l'identite du visiteur.
              </p>
              <p>
                L'utilisateur s'engage a fournir des informations exactes et a ne pas usurper l'identite d'un tiers. Tout usage abusif (spam, contenu offensant, tentative de piratage) pourra entrainer le blocage de l'acces aux services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">5. Commentaires et contributions</h2>
              <p>
                Les commentaires publies sur les articles de blog sont moderes. L'utilisateur est seul responsable du contenu qu'il publie et s'engage a respecter les regles suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Ne pas publier de contenu injurieux, diffamatoire, discriminatoire ou illegal</li>
                <li>Ne pas publier de spam, liens commerciaux ou contenus publicitaires</li>
                <li>Respecter la propriete intellectuelle d'autrui</li>
                <li>Ne pas collecter les donnees personnelles d'autres utilisateurs</li>
              </ul>
              <p>
                {profile.name} se reserve le droit de supprimer tout commentaire ne respectant pas ces regles, sans preavis ni justification.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">6. Rendez-vous</h2>
              <p>
                La prise de rendez-vous via le Site est soumise a la disponibilite des creneaux proposes. La confirmation d'un rendez-vous ne constitue pas un engagement contractuel de prestation.
              </p>
              <p>
                Un rendez-vous confirme peut etre annule par l'une ou l'autre des parties. Les rendez-vous non confirmes dans un delai de 48 heures sont automatiquement expires.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">7. Newsletter</h2>
              <p>
                L'inscription a la newsletter est volontaire. L'utilisateur peut se desinscrire a tout moment via le lien prevu dans chaque email ou en contactant directement {profile.name}.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">8. Propriete intellectuelle</h2>
              <p>
                Le contenu du Site (textes, code, design, images, logos) est protege par le droit d'auteur. Toute reproduction ou utilisation non autorisee est interdite. Pour plus de details, consultez les <Link to="/legal" className="text-primary hover:underline">Mentions Legales</Link>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">9. Limitation de responsabilite</h2>
              <p>
                Les informations presentes sur le Site sont fournies a titre indicatif. {profile.name} ne garantit pas l'exactitude, l'exhaustivite ou l'actualite des informations diffusees.
              </p>
              <p>
                En aucun cas {profile.name} ne pourra etre tenu responsable de dommages directs ou indirects resultant de l'utilisation du Site, y compris les pertes de donnees, les interruptions de service ou les virus informatiques.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">10. Liens externes</h2>
              <p>
                Le Site peut contenir des liens vers des sites tiers (GitHub, LinkedIn, projets clients, etc.). {profile.name} ne controle pas le contenu de ces sites et decline toute responsabilite quant a leur contenu ou leurs pratiques en matiere de confidentialite.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">11. Modifications des CGU</h2>
              <p>
                {profile.name} se reserve le droit de modifier les presentes CGU a tout moment. Les modifications prennent effet des leur publication sur le Site. L'utilisateur est invite a consulter regulierement cette page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">12. Contact</h2>
              <p>
                Pour toute question relative aux presentes CGU, vous pouvez contacter {profile.name} a l'adresse : <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">13. Droit applicable</h2>
              <p>
                Les presentes CGU sont regies par le droit togolais. Tout litige relatif a l'interpretation ou l'execution des presentes sera soumis aux tribunaux competents de Lome.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
