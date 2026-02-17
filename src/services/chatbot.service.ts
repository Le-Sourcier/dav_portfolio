import { ChatMessage, MessageType } from '../types/entities.types.js';
import { generateId } from '../utils/helpers.js';
import { config } from '../config/index.js';
import projectService from './project.service.js';
import experienceService from './experience.service.js';
import blogService from './blog.service.js';
import { settingsService } from './settings.service.js';

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

class ChatbotService {
  private get defaultInfo() {
    return {
      name: config.owner.name,
      title: '',
      location: config.owner.location,
      email: config.owner.email,
      phone: config.owner.phone,
      github: '',
      linkedin: '',
    };
  }

  private async getPersonalInfo() {
    try {
      const [profile, social] = await Promise.all([
        settingsService.getByKey('profile'),
        settingsService.getByKey('socialLinks'),
      ]);
      return {
        ...this.defaultInfo,
        ...(profile || {}),
        ...(social || {}),
      };
    } catch { /* fallback */ }
    return this.defaultInfo;
  }

  private async getQuickActionsFromSettings(): Promise<QuickAction[]> {
    try {
      const chatbot = await settingsService.getByKey('chatbot');
      if (chatbot?.quickActions?.length) return chatbot.quickActions;
    } catch { /* fallback */ }
    const firstName = config.owner.name.split(' ').pop() || config.owner.name;
    return [
      { id: '1', label: 'Mes Projets', prompt: 'Montre-moi tes projets' },
      { id: '2', label: 'Rendez-vous', prompt: 'Je veux prendre rendez-vous' },
      { id: '3', label: 'Mon Profil', prompt: `Qui est ${firstName} ?` },
      { id: '4', label: 'Competences', prompt: 'Quelles sont tes competences ?' },
      { id: '5', label: 'Lire le Blog', prompt: 'Montre-moi le blog' },
      { id: '6', label: 'Contact', prompt: 'Comment te contacter ?' },
    ];
  }

  private async getWelcomeMessage(): Promise<string> {
    try {
      const chatbot = await settingsService.getByKey('chatbot');
      if (chatbot?.welcomeMessage) return chatbot.welcomeMessage;
    } catch { /* fallback */ }
    return `Bonjour ! Je suis l'assistant de **${config.owner.name}**. Comment puis-je vous aider ?`;
  }

  async processMessage(content: string): Promise<Partial<ChatMessage>> {
    const input = content.toLowerCase().trim();
    const info = await this.getPersonalInfo();
    const firstName = info.name.split(' ').pop() || info.name;

    // Greetings
    if (this.matchesIntent(input, ['bonjour', 'salut', 'hello', 'hey', 'bonsoir', 'coucou'])) {
      return {
        content: `Bonjour ! Je suis l'assistant de **${info.name}**. Comment puis-je vous aider ?\n\nJe peux vous parler de son parcours, ses competences, ses projets ou vous aider a prendre rendez-vous.`,
        type: 'text' as MessageType,
      };
    }

    // Identity
    if (this.matchesIntent(input, ['qui es-tu', `qui est ${firstName.toLowerCase()}`, 'presente-toi', 'parle-moi de toi', 'ton profil', 'identite', 'mon profil'])) {
      return {
        content: `**${info.name}** est un **${info.title || 'professionnel'}** base a **${info.location}**.\n\nPassionne par la creation de solutions logicielles robustes et evolutives, il met en oeuvre des technologies modernes pour concevoir des applications performantes.`,
        type: 'text' as MessageType,
      };
    }

    // Experience
    if (this.matchesIntent(input, ['experience', 'parcours', 'travaille', 'job', 'carriere', 'entreprise'])) {
      const experiences = await experienceService.findAll();
      if (experiences.length === 0) {
        return { content: 'Aucune experience enregistree pour le moment.', type: 'text' as MessageType };
      }
      const expList = experiences.slice(0, 4).map(exp =>
        `- **${exp.company}** : ${exp.title} (${exp.dates})`
      ).join('\n');
      return {
        content: `Voici le parcours professionnel :\n\n${expList}\n\nCliquez sur une experience pour en savoir plus.`,
        type: 'experience_link' as MessageType,
        metadata: {
          experienceId: experiences[0].id,
          experienceTitle: `${experiences[0].title} - ${experiences[0].company}`,
        },
      };
    }

    // Skills — read from settings or fallback
    if (this.matchesIntent(input, ['competence', 'stack', 'techno', 'langage', 'sais-tu faire', 'expertise', 'domaine'])) {
      return {
        content: `${firstName} possede une expertise variee en tant que ${info.title || 'developpeur'}. Consultez la section "A Propos" pour voir la liste complete de ses competences techniques.`,
        type: 'text' as MessageType,
      };
    }

    // Contact
    if (this.matchesIntent(input, ['contact', 'email', 'telephone', 'joindre', 'linkedin', 'github', 'ecrire', 'message'])) {
      const lines = [
        `Coordonnees de ${info.name} :`,
        info.email ? `- **Email** : ${info.email}` : '',
        info.phone ? `- **Telephone** : ${info.phone}` : '',
        info.linkedin ? `- **LinkedIn** : ${info.linkedin}` : '',
        info.github ? `- **GitHub** : ${info.github}` : '',
        '',
        'Ou envoyez un message rapide ci-dessous :',
      ].filter(Boolean).join('\n');
      return { content: lines, type: 'contact_form' as MessageType };
    }

    // Appointment
    if (this.matchesIntent(input, ['rendez-vous', 'disponibilite', 'reserver', 'rdv', 'rencontrer'])) {
      return {
        content: `${firstName} serait ravi d'echanger avec vous. Voici les creneaux disponibles :`,
        type: 'appointment_picker' as MessageType,
        metadata: {
          availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          date: new Date().toISOString(),
        },
      };
    }

    // Projects
    if (this.matchesIntent(input, ['projet', 'portfolio', 'realisation', 'travaux', 'creation', 'mes projets'])) {
      const projects = await projectService.findAll();
      if (projects.length === 0) {
        return { content: 'Aucun projet enregistre pour le moment.', type: 'text' as MessageType };
      }
      const list = projects.slice(0, 3).map(p => `- **${p.title}** (${p.category})`).join('\n');
      return {
        content: `Projets recents :\n\n${list}`,
        type: 'project_link' as MessageType,
        metadata: { projectId: projects[0].id, projectTitle: projects[0].title },
      };
    }

    // Blog
    if (this.matchesIntent(input, ['blog', 'article', 'lire', 'publication', 'newsletter'])) {
      const posts = await blogService.findAll(true);
      if (posts.length === 0) {
        return { content: 'Aucun article publie pour le moment. Revenez bientot !', type: 'text' as MessageType };
      }
      return {
        content: `Voici les derniers articles du blog :`,
        type: 'blog_link' as MessageType,
        metadata: {
          posts: posts.slice(0, 3).map(p => ({ id: p.id, title: p.title, slug: (p as any).slug })),
        },
      };
    }

    // Location
    if (this.matchesIntent(input, ['ou est', 'ou vit', 'habite', 'ville', 'localisation', 'pays'])) {
      return {
        content: `${firstName} est base a **${info.location}**. Il est disponible pour des missions en presentiel ou en remote.`,
        type: 'text' as MessageType,
      };
    }

    // Thanks
    if (this.matchesIntent(input, ['merci', 'thanks', 'super', 'genial', 'parfait', 'cool'])) {
      return {
        content: `Avec plaisir ! N'hesitez pas si vous avez d'autres questions.`,
        type: 'text' as MessageType,
      };
    }

    // Default
    return {
      content: `Je peux vous renseigner sur :\n\n- **Parcours** professionnel\n- **Competences** techniques\n- **Projets** realises\n- **Blog** et articles\n- **Contact** et coordonnees\n- **Rendez-vous** pour discuter\n\nQue souhaitez-vous savoir ?`,
      type: 'text' as MessageType,
    };
  }

  private matchesIntent(input: string, keywords: string[]): boolean {
    return keywords.some(keyword => input.includes(keyword));
  }

  async getInitialMessage(): Promise<ChatMessage> {
    const welcome = await this.getWelcomeMessage();
    return {
      id: generateId(),
      role: 'assistant',
      content: welcome,
      type: 'text',
      timestamp: new Date(),
    };
  }

  async getQuickActions(): Promise<QuickAction[]> {
    return this.getQuickActionsFromSettings();
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;
