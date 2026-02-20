import { baseEmailTemplate } from './base.template.js';

interface ContactReplyTemplateOptions {
  visitorName: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  ownerName: string;
}

export const contactReplyTemplate = ({
  visitorName,
  originalSubject,
  originalMessage,
  replyMessage,
  ownerName,
}: ContactReplyTemplateOptions): string => {
  const content = `
    <div class="greeting">
      Bonjour ${visitorName},
    </div>
    <div class="content">
      <p>${ownerName} a repondu a votre message.</p>

      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin-bottom: 8px; font-weight: 600; color: #10b981;">Reponse :</p>
        <p style="white-space: pre-wrap; color: #b4c6e0;">${replyMessage}</p>
      </div>

      <div class="info-box">
        <p style="margin-bottom: 8px;"><strong>Votre message original :</strong></p>
        <p style="margin-bottom: 4px; font-size: 13px; color: #6b7c93;"><strong>Sujet :</strong> ${originalSubject}</p>
        <p style="white-space: pre-wrap; color: #6b7c93; font-size: 13px;">${originalMessage}</p>
      </div>

      <p style="font-size: 14px; color: #b4c6e0; margin-top: 24px;">
        Cordialement,<br/>
        <strong style="color: #e9f1ff;">${ownerName}</strong>
      </p>
    </div>
  `;

  return baseEmailTemplate({
    title: `Re: ${originalSubject}`,
    previewText: `${ownerName} a repondu a votre message`,
    content,
  });
};
