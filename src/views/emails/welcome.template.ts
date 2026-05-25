import { baseEmailTemplate } from './base.template.js';

interface WelcomeTemplateOptions {
  email: string;
  unsubscribeUrl?: string;
  lang?: 'fr' | 'en';
  baseUrl?: string;
  phone?: string;
}

export const welcomeTemplate = ({ email, unsubscribeUrl, lang = 'fr', baseUrl, phone }: WelcomeTemplateOptions): string => {
  const isFr = lang === 'fr';

  const content = `
    <div class="greeting">
      ${isFr ? 'Bienvenue !' : 'Welcome!'}
    </div>
    <div class="content-text">
      <p>${isFr
        ? `Merci de vous être inscrit à ma newsletter avec l'adresse <strong>${email}</strong>.`
        : `Thank you for subscribing to my newsletter with <strong>${email}</strong>.`}</p>

      <p>${isFr
        ? 'Vous recevrez désormais mes dernières réflexions sur :'
        : 'You will now receive my latest thoughts on:'}</p>

      <div class="info-box">
        <ul>
          <li><strong>${isFr ? 'Développement web & mobile' : 'Web & mobile development'}</strong> — ${isFr ? 'Tendances, bonnes pratiques et tutoriels' : 'Trends, best practices and tutorials'}</li>
          <li><strong>${isFr ? 'Architecture logicielle' : 'Software architecture'}</strong> — ${isFr ? 'Patterns, microservices et scalabilité' : 'Patterns, microservices and scalability'}</li>
          <li><strong>${isFr ? 'Mes projets' : 'My projects'}</strong> — ${isFr ? 'Nouveautés et retours d\'expérience' : 'Updates and behind the scenes'}</li>
        </ul>
      </div>

      <p>${isFr
        ? 'Je m\'engage à vous envoyer uniquement du contenu de qualité, pas de spam !'
        : 'I promise to send only quality content, no spam!'}</p>

      <p>${isFr ? 'À très bientôt,' : 'See you soon,'}<br><strong style="color:#0f766e;">Yao David Logan</strong></p>
    </div>
  `;

  return baseEmailTemplate({
    title: isFr ? 'Bienvenue dans ma newsletter !' : 'Welcome to my newsletter!',
    previewText: isFr
      ? 'Merci de vous être inscrit à la newsletter de Yao David Logan'
      : 'Thank you for subscribing to Yao David Logan\'s newsletter',
    content, lang, baseUrl,
    unsubscribeEmail: email,
    unsubscribeUrl: unsubscribeUrl || '#',
    phone,
  });
};

export default welcomeTemplate;
