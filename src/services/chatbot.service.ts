import { ChatMessage, MessageType } from '../types/entities.types.js';
import { generateId } from '../utils/helpers.js';
import { config } from '../config/index.js';
import projectService from './project.service.js';
import experienceService from './experience.service.js';
import blogService from './blog.service.js';
import { settingsService } from './settings.service.js';
import { openaiService } from './openai.service.js';
import logger from '../utils/logger.js';

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

interface ChatbotSettings {
  quickActions?: QuickAction[];
  welcomeMessage?: string;
}

class ChatbotService {
  // Verified emails per session (sessionId → Set<email>)
  private verifiedSessions = new Map<string, Set<string>>();
  private sessionLastAccess = new Map<string, number>();

  private getVerifiedEmails(sessionId: string): Set<string> {
    this.sessionLastAccess.set(sessionId, Date.now());
    if (!this.verifiedSessions.has(sessionId)) {
      this.verifiedSessions.set(sessionId, new Set());
    }
    // Cleanup old sessions (>1h)
    if (this.verifiedSessions.size > 100) {
      const cutoff = Date.now() - 60 * 60 * 1000;
      for (const [id, ts] of this.sessionLastAccess) {
        if (ts < cutoff) {
          this.verifiedSessions.delete(id);
          this.sessionLastAccess.delete(id);
        }
      }
    }
    return this.verifiedSessions.get(sessionId)!;
  }

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
      const chatbot = await settingsService.getByKey('chatbot') as ChatbotSettings | null;
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
      const chatbot = await settingsService.getByKey('chatbot') as ChatbotSettings | null;
      if (chatbot?.welcomeMessage) return chatbot.welcomeMessage;
    } catch { /* fallback */ }
    return `Bonjour ! Je suis l'assistant de **${config.owner.name}**. Comment puis-je vous aider ?`;
  }

  async processMessage(
    content: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    sessionId: string = 'default',
  ): Promise<Partial<ChatMessage>> {
    const input = content.toLowerCase().trim();

    // Quick intents with rich types → always use local engine (fast + rich UI)
    const richIntent = await this.tryRichIntent(input);
    if (richIntent) return richIntent;

    // Free conversation → AI with tools, fallback to local
    if (openaiService.isEnabled()) {
      try {
        const verifiedEmails = this.getVerifiedEmails(sessionId);
        const aiResponse = await openaiService.chat(content, history, verifiedEmails);
        if (aiResponse) {
          return { content: aiResponse, type: 'text' as MessageType };
        }
      } catch (error) {
        const err = error as any;
        logger.warn('AI providers failed, falling back to local engine', {
          message: err.message,
          status: err.status,
          code: err.code,
          type: err.type,
        });

        // If there's conversation history, the user is mid-conversation → transparent error
        if (history && history.length > 2) {
          return {
            content: `Désolé, je rencontre un problème technique temporaire. Veuillez réessayer dans quelques secondes. Si le problème persiste, vous pouvez utiliser le formulaire de contact.`,
            type: 'text' as MessageType,
          };
        }
      }
    }

    return this.processMessageLocal(content);
  }

  /**
   * Quick intents that return rich message types (project_link, experience_link, etc.)
   * These bypass the AI and return immediately for fast, rich UI responses.
   */
  private async tryRichIntent(input: string): Promise<Partial<ChatMessage> | null> {
    const info = await this.getPersonalInfo();

    // Experience
    if (this.matchesIntent(input, ['experience', 'parcours', 'travaille', 'job', 'carriere', 'entreprise'])) {
      const experiences = await experienceService.findAll();
      if (experiences.length === 0) {
        return null; // let AI handle "no experiences"
      }
      const expList = experiences.slice(0, 4).map(exp =>
        `- **${exp.company}** : ${exp.title} (${exp.dates})`
      ).join('\n');
      return {
        content: `Voici le parcours professionnel :\n\n${expList}\n\nCliquez sur une experience pour en savoir plus.`,
        type: 'experience_link' as MessageType,
        metadata: {
          experienceId: experiences[0]!.id,
          experienceTitle: `${experiences[0]!.title} - ${experiences[0]!.company}`,
        },
      };
    }

    // Projects
    if (this.matchesIntent(input, ['projet', 'portfolio', 'realisation', 'travaux', 'creation', 'mes projets'])) {
      const projects = await projectService.findAll();
      if (projects.length === 0) return null;
      const list = projects.slice(0, 3).map(p => `- **${p.title}** (${p.category})`).join('\n');
      return {
        content: `Projets recents :\n\n${list}`,
        type: 'project_link' as MessageType,
        metadata: { projectId: projects[0]!.id, projectTitle: projects[0]!.title },
      };
    }

    // Blog
    if (this.matchesIntent(input, ['blog', 'article', 'lire', 'publication', 'newsletter'])) {
      const posts = await blogService.findAll(true);
      if (posts.length === 0) return null;
      return {
        content: `Voici les derniers articles du blog :`,
        type: 'blog_link' as MessageType,
        metadata: {
          posts: posts.slice(0, 3).map(p => ({ id: p.id, title: p.title, slug: (p as any).slug })),
        },
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

    return null; // No rich intent matched
  }

  /**
   * Fallback local — text-only responses when AI is unavailable.
   * Rich intents (projects, blog, contact, experience) are handled by tryRichIntent() above.
   */
  private async processMessageLocal(content: string): Promise<Partial<ChatMessage>> {
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

    // Skills
    if (this.matchesIntent(input, ['competence', 'stack', 'techno', 'langage', 'sais-tu faire', 'expertise', 'domaine'])) {
      return {
        content: `${firstName} possede une expertise variee en tant que ${info.title || 'developpeur'}. Consultez la section "A Propos" pour voir la liste complete de ses competences techniques.`,
        type: 'text' as MessageType,
      };
    }

    // Appointment (fallback — simple text when AI is down)
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
