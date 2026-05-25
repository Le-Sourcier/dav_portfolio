import { baseEmailTemplate } from './base.template.js';

interface NewsletterArticleOptions {
  title: string;
  excerpt: string;
  articleUrl: string;
  imageUrl?: string;
  category: string;
  readTime: string;
  unsubscribeUrl: string;
  subscriberEmail: string;
  lang?: 'fr' | 'en';
  baseUrl?: string;
  phone?: string;
}

export const newsletterArticleTemplate = ({
  title, excerpt, articleUrl, imageUrl, category, readTime, unsubscribeUrl, subscriberEmail, lang = 'fr', baseUrl, phone,
}: NewsletterArticleOptions): string => {
  const isFr = lang === 'fr';

  const content = `
    <div class="greeting">
      ${isFr ? 'Nouvel article publié' : 'New article published'}
    </div>
    <div class="content-text">
      ${imageUrl ? `<div style="margin-bottom:20px;border-radius:10px;overflow:hidden;"><img src="${imageUrl}" alt="${title}" style="width:100%;height:auto;display:block;max-width:100%;" /></div>` : ''}

      <div style="margin-bottom:10px;">
        <span class="pill">${category}</span>
        <span style="color:#8a857b;font-size:12px;margin-left:6px;">${readTime}</span>
      </div>

      <h2 style="font-size:20px;font-weight:700;color:#111111;margin-bottom:10px;line-height:1.3;">${title}</h2>

      <p style="color:#3a3a3a;line-height:1.7;margin-bottom:20px;">${excerpt}</p>

      <div class="button-wrap">
        <a href="${articleUrl}" class="button button-teal">${isFr ? "Lire l'article" : 'Read article'}</a>
      </div>

      <p style="margin-top:20px;">${isFr ? 'Bonne lecture,' : 'Happy reading,'}<br><strong style="color:#0f766e;">Yao David Logan</strong></p>
    </div>
  `;

  return baseEmailTemplate({
    title: isFr ? `Nouvel article : ${title}` : `New article: ${title}`,
    previewText: excerpt.slice(0, 100),
    content, lang, baseUrl,
    unsubscribeEmail: subscriberEmail,
    unsubscribeUrl,
    phone,
  });
};

export default { newsletterArticleTemplate };
