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

  private async getQuickActionsFromSettings(lang: 'fr' | 'en' = 'fr'): Promise<QuickAction[]> {
    try {
      const chatbot = await settingsService.getByKey('chatbot') as ChatbotSettings | null;
      if (chatbot?.quickActions?.length) return chatbot.quickActions;
    } catch { /* fallback */ }
    const firstName = config.owner.name.split(' ').pop() || config.owner.name;
    const isFr = lang === 'fr';
    return isFr
      ? [
          { id: '1', label: 'Mes Projets', prompt: 'Montre-moi tes projets' },
          { id: '2', label: 'Rendez-vous', prompt: 'Je veux prendre rendez-vous' },
          { id: '3', label: 'Mon Profil', prompt: `Qui est ${firstName} ?` },
          { id: '4', label: 'Compétences', prompt: 'Quelles sont tes compétences ?' },
          { id: '5', label: 'Lire le Blog', prompt: 'Montre-moi le blog' },
          { id: '6', label: 'Contact', prompt: 'Comment te contacter ?' },
        ]
      : [
          { id: '1', label: 'My Projects', prompt: 'Show me your projects' },
          { id: '2', label: 'Appointment', prompt: 'I want to book an appointment' },
          { id: '3', label: 'My Profile', prompt: `Who is ${firstName} ?` },
          { id: '4', label: 'Skills', prompt: 'What are your skills ?' },
          { id: '5', label: 'Read Blog', prompt: 'Show me the blog' },
          { id: '6', label: 'Contact', prompt: 'How to contact you ?' },
        ];
  }

  private async getWelcomeMessage(lang: 'fr' | 'en' = 'fr'): Promise<string> {
    const isFr = lang === 'fr';
    try {
      const chatbot = await settingsService.getByKey('chatbot') as ChatbotSettings | null;
      if (isFr && chatbot?.welcomeMessage) return chatbot.welcomeMessage;
      if (!isFr && (chatbot as any)?.welcomeMessage_en) return (chatbot as any).welcomeMessage_en;
    } catch { /* fallback */ }
    return isFr
      ? `Bonjour ! Je suis l'assistant de **${config.owner.name}**. Comment puis-je vous aider ?`
      : `Hello! I'm **${config.owner.name}'s** assistant. How can I help you?`;
  }

  async processMessage(
    content: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    sessionId: string = 'default',
    lang: 'fr' | 'en' = 'fr',
  ): Promise<Partial<ChatMessage>> {
    const input = content.toLowerCase().trim();

    // Rich intents ONLY on the first user message (no prior user messages).
    // Once a conversation is ongoing, let the AI handle everything
    // to prevent keyword conflicts (e.g. "project" in appointment flow).
    const isFirstExchange = !history || history.length === 0 || !history.some(m => m.role === 'user');
    if (isFirstExchange) {
      const richIntent = await this.tryRichIntent(input, lang);
      if (richIntent) return richIntent;
    }

    // Free conversation → AI with tools, fallback to local
    if (openaiService.isEnabled()) {
      try {
        const verifiedEmails = this.getVerifiedEmails(sessionId);
        const aiResponse = await openaiService.chat(content, history, verifiedEmails, lang);
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
            content: lang === 'fr' 
              ? `Désolé, je rencontre un problème technique temporaire. Veuillez réessayer dans quelques secondes. Si le problème persiste, vous pouvez utiliser le formulaire de contact.`
              : `Sorry, I'm experiencing a temporary technical issue. Please try again in a few seconds. If the problem persists, you can use the contact form.`,
            type: 'text' as MessageType,
          };
        }
      }
    }

    return this.processMessageLocal(content, lang);
  }

  /**
   * Quick intents that return rich message types (project_link, experience_link, etc.)
   * These bypass the AI and return immediately for fast, rich UI responses.
   */
  private async tryRichIntent(input: string, lang: 'fr' | 'en' = 'fr'): Promise<Partial<ChatMessage> | null> {
    const info = await this.getPersonalInfo();
    const firstName = info.name.split(' ').pop() || info.name;

    const isFr = lang === 'fr';
    const experienceTriggers = isFr 
      ? ['experience', 'parcours', 'travaille', 'job', 'carriere', 'entreprise']
      : ['experience', 'career', 'work', 'job', 'background', 'company'];
    
    // Experience
    if (this.matchesIntent(input, experienceTriggers)) {
      const experiences = await experienceService.findAll();
      if (experiences.length === 0) {
        return null;
      }
      const expList = experiences.slice(0, 4).map(exp =>
        `- **${exp.company}** : ${exp.title} (${exp.dates})`
      ).join('\n');
      return {
        content: isFr 
          ? `Voici le parcours professionnel :\n\n${expList}\n\nCliquez sur une experience pour en savoir plus.`
          : `Here's the professional background:\n\n${expList}\n\nClick on an experience to learn more.`,
        type: 'experience_link' as MessageType,
        metadata: {
          experienceId: experiences[0]!.id,
          experienceTitle: `${experiences[0]!.title} - ${experiences[0]!.company}`,
        },
      };
    }

    const projectTriggers = isFr
      ? ['projet', 'portfolio', 'realisation', 'travaux', 'creation', 'mes projets', 'montre', 'affiche', 'liste']
      : ['project', 'portfolio', 'work', 'creation', 'my projects', 'show', 'list', 'display'];
    
    // Projects
    if (this.matchesIntent(input, projectTriggers)) {
      const projects = await projectService.findAll();
      if (projects.length === 0) return null;
      const list = projects.slice(0, 3).map(p => `- **${p.title}** (${p.category})`).join('\n');
      return {
        content: isFr ? `Projets recents :\n\n${list}` : `Recent projects:\n\n${list}`,
        type: 'project_link' as MessageType,
        metadata: { projectId: projects[0]!.id, projectTitle: projects[0]!.title },
      };
    }

    const blogTriggers = isFr
      ? ['blog', 'article', 'lire', 'publication', 'newsletter']
      : ['blog', 'article', 'read', 'publication', 'newsletter'];
    
    // Blog
    if (this.matchesIntent(input, blogTriggers)) {
      const posts = await blogService.findAll(true);
      if (posts.length === 0) return null;
      return {
        content: isFr ? `Voici les derniers articles du blog :` : `Here are the latest blog articles:`,
        type: 'blog_link' as MessageType,
        metadata: {
          posts: posts.slice(0, 3).map(p => ({ id: p.id, title: p.title, slug: (p as any).slug })),
        },
      };
    }

    const contactTriggers = isFr
      ? ['contact', 'telephone', 'joindre', 'linkedin', 'github', 'ecrire', 'message']
      : ['contact', 'phone', 'reach', 'linkedin', 'github', 'write', 'message'];
    // Note: 'email' is intentionally excluded — it's too broad and conflicts
    // with appointment booking (users naturally include their email in responses).
    
    // Contact
    if (this.matchesIntent(input, contactTriggers)) {
      const lines = [
        isFr ? `Coordonnees de ${info.name} :` : `${info.name}'s contact info:`,
        info.email ? `- **Email** : ${info.email}` : '',
        info.phone ? `- **Phone** : ${info.phone}` : '',
        info.linkedin ? `- **LinkedIn** : ${info.linkedin}` : '',
        info.github ? `- **GitHub** : ${info.github}` : '',
        '',
        isFr ? 'Ou envoyez un message rapide ci-dessous :' : 'Or send a quick message below:',
      ].filter(Boolean).join('\n');
      return { content: lines, type: 'contact_form' as MessageType };
    }

    return null; // No rich intent matched
  }

  /**
   * Fallback local — text-only responses when AI is unavailable.
   * Rich intents (projects, blog, contact, experience) are handled by tryRichIntent() above.
   */
  private async processMessageLocal(content: string, lang: 'fr' | 'en' = 'fr'): Promise<Partial<ChatMessage>> {
    const input = content.toLowerCase().trim();
    const info = await this.getPersonalInfo();
    const firstName = info.name.split(' ').pop() || info.name;
    const isFr = lang === 'fr';

    const greetingTriggers = isFr
      ? ['bonjour', 'salut', 'hello', 'hey', 'bonsoir', 'coucou']
      : ['hello', 'hi', 'hey', 'good morning', 'good evening', 'hey there'];
    
    // Greetings
    if (this.matchesIntent(input, greetingTriggers)) {
      return {
        content: isFr
          ? `Bonjour ! Je suis l'assistant de **${info.name}**. Comment puis-je vous aider ?\n\nJe peux vous parler de son parcours, ses competences, ses projets ou vous aider a prendre rendez-vous.`
          : `Hello! I'm **${info.name}'s** assistant. How can I help you?\n\nI can tell you about their background, skills, projects, or help you book an appointment.`,
        type: 'text' as MessageType,
      };
    }

    const identityTriggers = isFr
      ? ['qui es-tu', 'presente-toi', 'parle-moi de toi', 'ton profil', 'identite', 'mon profil']
      : ['who are you', 'introduce yourself', 'tell me about yourself', 'your profile', 'about you', 'identity'];
    
    // Identity
    if (this.matchesIntent(input, identityTriggers) || this.matchesIntent(input, [`qui est ${firstName.toLowerCase()}`])) {
      return {
        content: isFr
          ? `**${info.name}** est un **${info.title || 'professionnel'}** base a **${info.location}**.\n\nPassionne par la creation de solutions logicielles robustes et evolutives, il met en oeuvre des technologies modernes pour concevoir des applications performantes.`
          : `**${info.name}** is a **${info.title || 'professional'}** based in **${info.location}**.\n\nPassionate about creating robust and scalable software solutions, they use modern technologies to build high-performance applications.`,
        type: 'text' as MessageType,
      };
    }

    const skillTriggers = isFr
      ? ['competence', 'stack', 'techno', 'langage', 'sais-tu faire', 'expertise', 'domaine']
      : ['skill', 'stack', 'technology', 'language', 'can you do', 'expertise', 'domain', 'technologies'];
    
    // Skills
    if (this.matchesIntent(input, skillTriggers)) {
      return {
        content: isFr
          ? `${firstName} possede une expertise variee en tant que ${info.title || 'developpeur'}. Consultez la section "A Propos" pour voir la liste complete de ses competences techniques.`
          : `${firstName} has varied expertise as a ${info.title || 'developer'}. Visit the "About" section to see the complete list of their technical skills.`,
        type: 'text' as MessageType,
      };
    }

    const apptTriggers = isFr
      ? ['rendez-vous', 'disponibilite', 'reserver', 'rdv', 'rencontrer']
      : ['appointment', 'availability', 'book', 'schedule', 'meet', 'booking'];
    
    // Appointment (fallback — simple text when AI is down)
    if (this.matchesIntent(input, apptTriggers)) {
      return {
        content: isFr
          ? `${firstName} serait ravi d'echanger avec vous. Voici les creneaux disponibles :`
          : `${firstName} would be happy to discuss with you. Here are the available time slots:`,
        type: 'appointment_picker' as MessageType,
        metadata: {
          availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          date: new Date().toISOString(),
        },
      };
    }

    const locationTriggers = isFr
      ? ['ou est', 'ou vit', 'habite', 'ville', 'localisation', 'pays']
      : ['where', 'live', 'city', 'location', 'country', 'based'];
    
    // Location
    if (this.matchesIntent(input, locationTriggers)) {
      return {
        content: isFr
          ? `${firstName} est base a **${info.location}**. Il est disponible pour des missions en presentiel ou en remote.`
          : `${firstName} is based in **${info.location}**. They are available for on-site or remote work.`,
        type: 'text' as MessageType,
      };
    }

    const thanksTriggers = isFr
      ? ['merci', 'thanks', 'super', 'genial', 'parfait', 'cool']
      : ['thanks', 'thank you', 'great', 'awesome', 'perfect', 'cool'];
    
    // Thanks
    if (this.matchesIntent(input, thanksTriggers)) {
      return {
        content: isFr
          ? `Avec plaisir ! N'hesitez pas si vous avez d'autres questions.`
          : `You're welcome! Feel free to ask if you have more questions.`,
        type: 'text' as MessageType,
      };
    }

    // Default
    return {
      content: isFr
        ? `Je peux vous renseigner sur :\n\n- **Parcours** professionnel\n- **Competences** techniques\n- **Projets** realises\n- **Blog** et articles\n- **Contact** et coordonnees\n- **Rendez-vous** pour discuter\n\nQue souhaitez-vous savoir ?`
        : `I can help you with:\n\n- **Background** & professional experience\n- **Skills** & technical expertise\n- **Projects** & work samples\n- **Blog** & articles\n- **Contact** info\n- **Appointment** booking\n\nWhat would you like to know?`,
      type: 'text' as MessageType,
    };
  }

  private matchesIntent(input: string, keywords: string[]): boolean {
    return keywords.some(keyword => input.includes(keyword));
  }

  async getInitialMessage(lang: 'fr' | 'en' = 'fr'): Promise<ChatMessage> {
    const welcome = await this.getWelcomeMessage(lang);
    return {
      id: generateId(),
      role: 'assistant',
      content: welcome,
      type: 'text',
      timestamp: new Date(),
    };
  }

  async getQuickActions(lang: 'fr' | 'en' = 'fr'): Promise<QuickAction[]> {
    return this.getQuickActionsFromSettings(lang);
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;
