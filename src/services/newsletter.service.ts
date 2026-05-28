import Newsletter from '../models/Newsletter.js';
import BlogPost from '../models/BlogPost.js';
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

function normalizedLocale(locale?: string): 'fr' | 'en' {
  return locale === 'en' ? 'en' : 'fr';
}

function localizedFrontendUrl(path: string, locale: 'fr' | 'en'): string {
  return `${config.frontendUrl}/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

function localizedReadTime(value: string, locale: 'fr' | 'en'): string {
  const minutes = value.match(/\d+/)?.[0];
  if (!minutes) return value;
  return locale === 'en' ? `${minutes} min read` : `${minutes} min de lecture`;
}

// ======================== SERVICE ========================

class NewsletterService {
  async findAll(): Promise<INewsletter[]> {
    return Newsletter.findAll({ order: [['subscribedAt', 'DESC']] });
  }

  async findActive(): Promise<INewsletter[]> {
    return Newsletter.findAll({ where: { active: true }, order: [['subscribedAt', 'DESC']] });
  }

  async subscribe(email: string, locale: 'fr' | 'en' = 'fr'): Promise<INewsletter> {
    const subscriberLocale = normalizedLocale(locale);
    const existing = await Newsletter.findOne({ where: { email } });

    if (existing) {
      if (existing.active) {
        throw new AppError('Already subscribed to newsletter', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
      }
      await existing.update({ active: true, locale: subscriberLocale, subscribedAt: new Date(), unsubscribedAt: undefined });
      return existing;
    }

    const subscriber = await Newsletter.create({ email, locale: subscriberLocale });

    try {
      await sendEmail({
        to: email,
        subject: subscriberLocale === 'fr' ? 'Bienvenue dans ma newsletter !' : 'Welcome to my newsletter!',
        html: welcomeTemplate({ email, unsubscribeUrl: buildUnsubscribeUrl(email), lang: subscriberLocale, baseUrl: config.frontendUrl, phone: config.owner.phone }),
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

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        const lang = normalizedLocale((subscriber as any).locale || (subscriber as any).lang);
        const articleUrl = localizedFrontendUrl(`/blog/${article.slug}`, lang);
        const html = newsletterArticleTemplate({
          title: article.title,
          excerpt: article.excerpt,
          articleUrl,
          imageUrl: article.imageUrl,
          category: article.category,
          readTime: localizedReadTime(article.readTime, lang),
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

  async sendBlogPostToSubscribers(post: BlogPost): Promise<{ sent: number; failed: number }> {
    const subscribers = await this.findActive();

    if (subscribers.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      const lang = normalizedLocale((subscriber as any).locale || (subscriber as any).lang);
      const title = lang === 'en' && post.title_en?.trim() ? post.title_en : post.title;
      const excerpt = lang === 'en' && post.excerpt_en?.trim() ? post.excerpt_en : post.excerpt;
      const category = post.category;
      const articleUrl = localizedFrontendUrl(`/blog/${post.slug}`, lang);

      try {
        const html = newsletterArticleTemplate({
          title,
          excerpt,
          articleUrl,
          imageUrl: post.imageUrl,
          category,
          readTime: localizedReadTime(post.readTime, lang),
          unsubscribeUrl: buildUnsubscribeUrl(subscriber.email),
          subscriberEmail: subscriber.email,
          lang,
          baseUrl: config.frontendUrl,
          phone: config.owner.phone,
        });

        await sendEmail({
          to: subscriber.email,
          subject: lang === 'fr' ? `Nouvel article : ${title}` : `New article: ${title}`,
          html,
        });
        sent++;
      } catch (error) {
        logger.warn(`Failed to send publication newsletter to ${subscriber.email}:`, error);
        failed++;
      }
    }

    logger.info(`Publication newsletter sent for "${post.slug}": ${sent} success, ${failed} failed`);
    return { sent, failed };
  }
}

export const newsletterService = new NewsletterService();
export default newsletterService;
