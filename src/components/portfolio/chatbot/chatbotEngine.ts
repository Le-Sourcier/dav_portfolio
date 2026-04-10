import { PROJECTS } from '../../../data/mockData';
import { envConfig } from '@/config/env';
import { Message } from './types';

const owner = envConfig.owner;
const firstName = owner.name.split(' ').pop() || owner.name;

export const getInitialMessage = (): Message => ({
  id: '1',
  role: 'assistant',
  content: envConfig.chatbot.welcomeMessage,
  timestamp: new Date(),
  type: 'text'
});

export const processUserMessage = async (content: string): Promise<Partial<Message>> => {
  const input = content.toLowerCase().trim();
  const NL = String.fromCharCode(10);
  const firstNameLower = firstName.toLowerCase();

  if (
    input.includes('qui es-tu') ||
    input.includes(`qui est ${firstNameLower}`) ||
    input.includes('presente-toi') ||
    input.includes('parle-moi de toi') ||
    input.includes('ton profil') ||
    input.includes('mon profil') ||
    input.includes('identite')
  ) {
    return {
      content: `${owner.name} est un ${owner.title} base a ${owner.location}. ${owner.bio}`,
      type: 'text'
    };
  }

  if (
    input.includes('experience') ||
    input.includes('parcours') ||
    input.includes('travaille') ||
    input.includes('job') ||
    input.includes('carriere') ||
    input.includes('entreprise')
  ) {
    return {
      content: `${firstName} a une solide experience en ingenierie logicielle. Consultez la section "A Propos" pour decouvrir son parcours complet.`,
      type: 'text'
    };
  }

  if (
    input.includes('competence') ||
    input.includes('stack') ||
    input.includes('techno') ||
    input.includes('langage') ||
    input.includes('sais-tu faire') ||
    input.includes('expertise') ||
    input.includes('domaine')
  ) {
    return {
      content: `${firstName} possede une expertise variee en tant que ${owner.title}. Visitez la section "A Propos" pour voir la liste complete de ses competences techniques.`,
      type: 'text'
    };
  }

  if (
    input.includes('contact') ||
    input.includes('email') ||
    input.includes('telephone') ||
    input.includes('joindre') ||
    input.includes('linkedin') ||
    input.includes('github') ||
    input.includes('ecrire')
  ) {
    const lines = [
      `Vous pouvez contacter ${firstName} par les moyens suivants :`,
      `- **Email**: ${owner.email}`,
      owner.phone ? `- **Telephone**: ${owner.phone}` : '',
      `- **Localisation**: ${owner.location}`,
      envConfig.social.linkedin ? `- **LinkedIn**: ${envConfig.social.linkedin}` : '',
      envConfig.social.github ? `- **GitHub**: ${envConfig.social.github}` : '',
    ].filter(Boolean);
    return { content: lines.join(NL), type: 'text' };
  }

  if (
    input.includes('rendez-vous') ||
    input.includes('disponibilite') ||
    input.includes('reserver') ||
    input.includes('rdv') ||
    input.includes('rencontrer')
  ) {
    return {
      content: `${firstName} serait ravi d'echanger avec vous sur vos besoins. Voici les creneaux disponibles prochainement :`,
      type: 'appointment_picker',
      metadata: {
        availableTimes: ["09:00", "11:00", "14:00", "16:00"],
        date: new Date().toISOString()
      }
    };
  }

  if (
    input.includes('projet') ||
    input.includes('travaux') ||
    input.includes('realisations') ||
    input.includes('portfolio') ||
    input.includes('fait quoi') ||
    input.includes('mes projets')
  ) {
    const projectNames = PROJECTS.map(p => p.title).join(', ');
    return {
      content: `${firstName} a travaille sur plusieurs projets, notamment : ${projectNames}. Consultez la section Projets pour les details.`,
      type: 'text'
    };
  }

  for (const project of PROJECTS) {
    if (input.includes(project.title.toLowerCase()) || input.includes(project.id.toLowerCase())) {
      return {
        content: `Le projet ${project.title} est une realisation en ${project.category}. ${project.description}`,
        type: 'project_link',
        metadata: { projectId: project.id, projectTitle: project.title }
      };
    }
  }

  if (input.includes('ou est') || input.includes('ou vit') || input.includes('habite') || input.includes('ville')) {
    return {
      content: `${firstName} est base a ${owner.location}. Il est disponible pour des missions en presentiel ou en remote.`,
      type: 'text'
    };
  }

  if (input.includes('blog') || input.includes('articles') || input.includes('lire le blog')) {
    return {
      content: `${firstName} partage ses connaissances sur son blog. Visitez la section Blog pour decouvrir les articles.`,
      type: 'text'
    };
  }

  return {
    content: `Je peux vous renseigner sur le parcours de ${firstName} (experience, competences), ses projets recents, ou vous aider a le contacter via son email (${owner.email}) ou en prenant rendez-vous.`,
    type: 'text'
  };
};
