import Newsletter from '../models/Newsletter.js';
import { INewsletter } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { sendEmail } from '../helpers/mailer.js';
import { welcomeTemplate } from '../views/emails/welcome.template.js';
import { newsletterArticleTemplate } from '../views/emails/newsletter-article.template.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// ======================== HELPERS ========================

function buildUnsubscribeUrl(email: string): string {
  return `${config.frontendUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
}

// ======================== SERVICE ========================

class NewsletterService {
  async findAll(): Promise<INewsletter[]> {
    return Newsletter.findAll({ order: [['subscribedAt', 'DESC']] });
  }

  async findActive(): Promise<INewsletter[]> {
    return Newsletter.findAll({ where: { active: true }, order: [['subscribedAt', 'DESC']] });
  }

  async subscribe(email: string): Promise<INewsletter> {
    const existing = await Newsletter.findOne({ where: { email } });

    if (existing) {
      if (existing.active) {
        throw new AppError('Already subscribed to newsletter', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
      }
      await existing.update({ active: true, subscribedAt: new Date(), unsubscribedAt: undefined });
      return existing;
    }

    const subscriber = await Newsletter.create({ email });

    try {
      await sendEmail({
        to: email,
        subject: 'Bienvenue dans ma newsletter !',
        html: welcomeTemplate({ email, unsubscribeUrl: buildUnsubscribeUrl(email), lang: 'fr', baseUrl: config.frontendUrl, phone: config.owner.phone }),
      });
    } catch {
      // Don't fail if email sending fails
    }

    return subscriber;
  }

  async unsubscribe(email: string): Promise<void> {
    const subscriber = await Newsletter.findOne({ where: { email } });

    if (!subscriber) {
      throw new AppError('Email not found in newsletter', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await subscriber.update({ active: false, unsubscribedAt: new Date() });
  }

  async getCount(): Promise<{ total: number; active: number }> {
    const total = await Newsletter.count();
    const active = await Newsletter.count({ where: { active: true } });
    return { total, active };
  }

  async sendArticleToSubscribers(article: {
    title: string;
    excerpt: string;
    slug: string;
    imageUrl?: string;
    category: string;
    readTime: string;
  }): Promise<{ sent: number; failed: number }> {
    const subscribers = await this.findActive();

    if (subscribers.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const articleUrl = `${config.frontendUrl}/blog/${article.slug}`;
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        const lang = (subscriber as any).lang || 'fr';
        const html = newsletterArticleTemplate({
          title: article.title,
          excerpt: article.excerpt,
          articleUrl,
          imageUrl: article.imageUrl,
          category: article.category,
          readTime: article.readTime,
          unsubscribeUrl: buildUnsubscribeUrl(subscriber.email),
          subscriberEmail: subscriber.email,
          lang,
          baseUrl: config.frontendUrl,
          phone: config.owner.phone,
        });

        await sendEmail({
          to: subscriber.email,
          subject: lang === 'fr' ? `Nouvel article : ${article.title}` : `New article: ${article.title}`,
          html,
        });
        sent++;
      } catch (error) {
        logger.warn(`Failed to send newsletter to ${subscriber.email}:`, error);
        failed++;
      }
    }

    logger.info(`Newsletter sent: ${sent} success, ${failed} failed out of ${subscribers.length}`);
    return { sent, failed };
  }
}

export const newsletterService = new NewsletterService();
export default newsletterService;
