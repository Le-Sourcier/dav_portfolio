import { baseEmailTemplate } from './base.template.js';

interface OtpTemplateOptions {
  name: string;
  code: string;
  expiresMinutes: number;
}

export const otpTemplate = ({ name, code, expiresMinutes }: OtpTemplateOptions): string => {
  const content = `
    <div class="greeting">
      Bonjour <span class="highlight">${name}</span>,
    </div>
    <div class="content">
      <p>Voici votre code de verification :</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #3b82f6; background: rgba(59,130,246,0.1); padding: 16px 32px; border-radius: 12px; display: inline-block;">
          ${code}
        </span>
      </div>
      <div class="info-box">
        <ul style="margin: 0; padding-left: 18px;">
          <li>Ce code est valable <strong>${expiresMinutes} minutes</strong></li>
          <li>Ne partagez ce code avec personne</li>
          <li>Si vous n'avez pas fait cette demande, ignorez cet email</li>
        </ul>
      </div>
    </div>
  `;

  return baseEmailTemplate({
    title: 'Code de verification',
    previewText: `Votre code : ${code}`,
    content,
  });
};
