import { PROJECTS } from '../../../data/mockData';
import { envConfig } from '@/config/env';
import { Message } from './types';

const owner = envConfig.owner;
const firstName = owner.name.split(' ').pop() || owner.name;

interface ChatbotResponses {
  [key: string]: { fr: string; en: string };
}

const RESPONSES: ChatbotResponses = {
  about: {
    fr: `${owner.name} est un ${owner.title} basé à ${owner.location}. ${owner.bio}`,
    en: `${owner.name} is a ${owner.title} based in ${owner.location}. ${owner.bio}`,
  },
  experience: {
    fr: `${firstName} a une solide expérience en ingénierie logicielle. Consultez la section "À Propos" pour découvrir son parcours complet.`,
    en: `${firstName} has solid experience in software engineering. Visit the "About" section to discover their complete career path.`,
  },
  skills: {
    fr: `${firstName} possède une expertise variée en tant que ${owner.title}. Visitez la section "À Propos" pour voir la liste complète de ses compétences techniques.`,
    en: `${firstName} has varied expertise as a ${owner.title}. Visit the "About" section to see the complete list of their technical skills.`,
  },
  contact: {
    fr: `Vous pouvez contacter ${firstName} par les moyens suivants :`,
    en: `You can contact ${firstName} using the following methods:`,
  },
  appointment: {
    fr: `${firstName} serait ravi d'échanger avec vous sur vos besoins. Voici les créneaux disponibles prochainement :`,
    en: `${firstName} would be happy to discuss your needs with you. Here are the available time slots coming up:`,
  },
  projects: {
    fr: `${firstName} a travaillé sur plusieurs projets, notamment : PROJECT_NAMES. Consultez la section Projets pour les détails.`,
    en: `${firstName} has worked on several projects, including: PROJECT_NAMES. Visit the Projects section for details.`,
  },
  projectDetail: {
    fr: `Le projet PROJECT_TITLE est une réalisation en PROJECT_CATEGORY. PROJECT_DESC`,
    en: `The PROJECT_TITLE project is a work in PROJECT_CATEGORY. PROJECT_DESC`,
  },
  location: {
    fr: `${firstName} est basé à ${owner.location}. Il est disponible pour des missions en présentiel ou en remote.`,
    en: `${firstName} is based in ${owner.location}. They are available for on-site or remote assignments.`,
  },
  blog: {
    fr: `${firstName} partage ses connaissances sur son blog. Visitez la section Blog pour découvrir les articles.`,
    en: `${firstName} shares their knowledge on their blog. Visit the Blog section to discover articles.`,
  },
  fallback: {
    fr: `Je peux vous renseigner sur le parcours de ${firstName} (expérience, compétences), ses projets récents, ou vous aider à le contacter via son email (${owner.email}) ou en prenant rendez-vous.`,
    en: `I can help you learn about ${firstName}'s background (experience, skills), their recent projects, or help you contact them via email (${owner.email}) or by booking an appointment.`,
  },
};

const TRIGGERS: Record<string, { fr: string[]; en: string[] }> = {
  about: {
    fr: ['qui es-tu', 'présente-toi', 'parle-moi de toi', 'ton profil', 'mon profil', 'identité'],
    en: ['who are you', 'introduce yourself', 'tell me about yourself', 'your profile', 'about you', 'identity'],
  },
  experience: {
    fr: ['expérience', 'parcours', 'travaille', 'job', 'carrière', 'entreprise'],
    en: ['experience', 'career', 'work', 'job', 'background', 'company'],
  },
  skills: {
    fr: ['compétence', 'stack', 'techno', 'langage', 'sais-tu faire', 'expertise', 'domaine'],
    en: ['skill', 'stack', 'technology', 'language', 'can you do', 'expertise', 'domain'],
  },
  contact: {
    fr: ['contact', 'email', 'téléphone', 'joindre', 'linkedin', 'github', 'écrire'],
    en: ['contact', 'email', 'phone', 'reach', 'linkedin', 'github', 'write'],
  },
  appointment: {
    fr: ['rendez-vous', 'disponibilité', 'réserver', 'rdv', 'rencontrer'],
    en: ['appointment', 'availability', 'book', 'schedule', 'meet'],
  },
  projects: {
    fr: ['projet', 'travaux', 'réalisations', 'portfolio', 'fait quoi', 'mes projets'],
    en: ['project', 'work', 'portfolio', 'what do you do', 'my projects'],
  },
  location: {
    fr: ['où est', 'où vit', 'habite', 'ville'],
    en: ['where is', 'where do you live', 'city', 'location'],
  },
  blog: {
    fr: ['blog', 'articles', 'lire le blog'],
    en: ['blog', 'articles', 'read blog'],
  },
};

export const getInitialMessage = (): Message => ({
  id: '1',
  role: 'assistant',
  content: envConfig.chatbot.welcomeMessage,
  timestamp: new Date(),
  type: 'text',
});

export const processUserMessage = async (content: string, lang: 'fr' | 'en' = 'fr'): Promise<Partial<Message>> => {
  const input = content.toLowerCase().trim();
  const NL = String.fromCharCode(10);

  const getResponse = (key: string, replacements?: Record<string, string>) => {
    let text = RESPONSES[key][lang];
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(k, v);
      });
    }
    return text;
  };

  // Check about triggers
  for (const trigger of TRIGGERS.about[lang]) {
    if (input.includes(trigger) || input.includes(`qui est ${firstName.toLowerCase()}`)) {
      return { content: getResponse('about'), type: 'text' };
    }
  }

  // Check other triggers
  for (const [key, triggers] of Object.entries(TRIGGERS)) {
    if (key === 'about') continue;
    for (const trigger of triggers[lang]) {
      if (input.includes(trigger)) {
        if (key === 'contact') {
          const lines = [
            getResponse('contact'),
            `- **Email**: ${owner.email}`,
            owner.phone ? `- **Phone**: ${owner.phone}` : '',
            `- **Location**: ${owner.location}`,
            envConfig.social.linkedin ? `- **LinkedIn**: ${envConfig.social.linkedin}` : '',
            envConfig.social.github ? `- **GitHub**: ${envConfig.social.github}` : '',
          ].filter(Boolean);
          return { content: lines.join(NL), type: 'text' };
        }
        if (key === 'appointment') {
          return {
            content: getResponse('appointment'),
            type: 'appointment_picker',
            metadata: {
              availableTimes: ['09:00', '11:00', '14:00', '16:00'],
              date: new Date().toISOString(),
            },
          };
        }
        if (key === 'projects') {
          const projectNames = PROJECTS.map((p) => p.title).join(', ');
          return { content: getResponse('projects', { PROJECT_NAMES: projectNames }), type: 'text' };
        }
        return { content: getResponse(key), type: 'text' };
      }
    }
  }

  // Check specific project
  for (const project of PROJECTS) {
    if (input.includes(project.title.toLowerCase()) || input.includes(project.id.toLowerCase())) {
      return {
        content: getResponse('projectDetail', {
          PROJECT_TITLE: project.title,
          PROJECT_CATEGORY: project.category,
          PROJECT_DESC: project.description,
        }),
        type: 'project_link',
        metadata: { projectId: project.id, projectTitle: project.title },
      };
    }
  }

  // Fallback
  return { content: getResponse('fallback'), type: 'text' };
};
