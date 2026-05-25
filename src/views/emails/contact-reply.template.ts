import { baseEmailTemplate } from './base.template.js';

interface ContactReplyTemplateOptions {
  visitorName: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  ownerName: string;
  lang?: 'fr' | 'en';
  baseUrl?: string;
  phone?: string;
}

export const contactReplyTemplate = ({
  visitorName, originalSubject, originalMessage, replyMessage, ownerName, lang = 'fr', baseUrl, phone,
}: ContactReplyTemplateOptions): string => {
  const isFr = lang === 'fr';

  const content = `
    <div class="greeting">
      ${isFr ? 'Bonjour' : 'Hello'} <strong>${visitorName}</strong>,
    </div>
    <div class="content-text">
      <p>${isFr
        ? `${ownerName} a répondu à votre message.`
        : `${ownerName} has replied to your message.`}</p>

      <div class="info-box" style="border-color:rgba(184,132,47,0.25);background:rgba(184,132,47,0.06);">
        <p style="margin-bottom:8px;"><strong style="color:#b8842f;">${isFr ? 'Réponse :' : 'Reply:'}</strong></p>
        <p style="white-space:pre-wrap;">${replyMessage}</p>
      </div>

      <div class="divider"></div>

      <p style="font-size:13px;color:#6f6a60;margin-bottom:6px;"><strong>${isFr ? 'Votre message original :' : 'Your original message:'}</strong></p>
      <p style="font-size:13px;color:#6f6a60;margin-bottom:2px;">${isFr ? 'Sujet' : 'Subject'} : ${originalSubject}</p>
      <div class="quote-block" style="margin-top:8px;">
        <p style="white-space:pre-wrap;font-size:13px;color:#6f6a60;">${originalMessage}</p>
      </div>

      <p style="margin-top:20px;">
        ${isFr ? 'Cordialement,' : 'Best regards,'}<br>
        <strong style="color:#0f766e;">${ownerName}</strong>
      </p>
    </div>
  `;

  return baseEmailTemplate({
    title: isFr ? `Re: ${originalSubject}` : `Re: ${originalSubject}`,
    previewText: isFr
      ? `${ownerName} a répondu à votre message`
      : `${ownerName} replied to your message`,
    content, lang, baseUrl, phone,
  });
};

export default { contactReplyTemplate };
