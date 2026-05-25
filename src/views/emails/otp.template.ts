import { baseEmailTemplate } from './base.template.js';

interface OtpTemplateOptions {
  name: string;
  code: string;
  expiresMinutes: number;
  lang?: 'fr' | 'en';
  baseUrl?: string;
  phone?: string;
}

export const otpTemplate = ({ name, code, expiresMinutes, lang = 'fr', baseUrl, phone }: OtpTemplateOptions): string => {
  const isFr = lang === 'fr';

  const content = `
    <div class="greeting">
      ${isFr ? 'Bonjour' : 'Hello'} <strong>${name}</strong>,
    </div>
    <div class="content-text">
      <p>${isFr ? 'Voici votre code de vérification :' : 'Here is your verification code:'}</p>

      <div class="otp-code">
        <span>${code}</span>
      </div>

      <div class="info-box">
        <ul>
          <li>${isFr ? `Ce code est valable <strong>${expiresMinutes} minutes</strong>` : `This code expires in <strong>${expiresMinutes} minutes</strong>`}</li>
          <li>${isFr ? 'Ne partagez ce code avec personne' : 'Do not share this code with anyone'}</li>
          <li>${isFr ? "Si vous n'avez pas fait cette demande, ignorez cet email" : 'If you did not request this, ignore this email'}</li>
        </ul>
      </div>
    </div>
  `;

  return baseEmailTemplate({
    title: isFr ? 'Code de vérification' : 'Verification code',
    previewText: isFr ? `Votre code : ${code}` : `Your code: ${code}`,
    content, lang, baseUrl, phone,
  });
};

export default { otpTemplate };
