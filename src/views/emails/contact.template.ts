import { baseEmailTemplate } from './base.template.js';

interface ContactTemplateOptions {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang?: 'fr' | 'en';
  baseUrl?: string;
  phone?: string;
}

export const contactReceivedTemplate = ({
  name, email, subject, message, lang = 'fr', baseUrl, phone,
}: ContactTemplateOptions): string => {
  const isFr = lang === 'fr';

  const content = `
    <div class="greeting">
      ${isFr ? 'Nouveau message reçu' : 'New message received'}
    </div>
    <div class="content-text">
      <p>${isFr
        ? 'Vous avez reçu un nouveau message via votre portfolio.'
        : 'You have received a new message via your portfolio.'}</p>

      <div class="info-box">
        <p style="margin-bottom:10px;"><strong>${isFr ? 'Détails du message' : 'Message details'}</strong></p>
        <ul>
          <li><span class="label">${isFr ? 'De' : 'From'}</span>${name}</li>
          <li><span class="label">Email</span><a href="mailto:${email}" style="color:#0f766e;text-decoration:none;">${email}</a></li>
          <li><span class="label">${isFr ? 'Sujet' : 'Subject'}</span>${subject}</li>
        </ul>
      </div>

      <div class="quote-block">
        <p style="margin-bottom:4px;font-weight:600;font-size:13px;color:#6f6a60;">${isFr ? 'Message :' : 'Message:'}</p>
        <p style="white-space:pre-wrap;">${message}</p>
      </div>

      <div class="button-wrap">
        <a href="mailto:${email}?subject=Re: ${subject}" class="button button-teal">${isFr ? 'Répondre' : 'Reply'}</a>
      </div>
    </div>
  `;

  return baseEmailTemplate({
    title: isFr ? `Nouveau message de ${name}` : `New message from ${name}`,
    previewText: isFr
      ? `${name} vous a envoyé un message : ${subject}`
      : `${name} sent you a message: ${subject}`,
    content, lang, baseUrl, phone,
  });
};

export default { contactReceivedTemplate };
