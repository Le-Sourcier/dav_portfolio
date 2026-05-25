import { baseEmailTemplate } from './base.template.js';

interface PasswordResetTemplateOptions {
  name: string;
  resetLink: string;
  expiresIn: string;
  lang?: 'fr' | 'en';
  baseUrl?: string;
  phone?: string;
}

export const passwordResetTemplate = ({
  name, resetLink, expiresIn, lang = 'fr', baseUrl, phone,
}: PasswordResetTemplateOptions): string => {
  const isFr = lang === 'fr';

  const content = `
    <div class="greeting">
      ${isFr ? 'Bonjour' : 'Hello'} <strong>${name}</strong>,
    </div>
    <div class="content-text">
      <p>${isFr
        ? 'Vous avez demandé la réinitialisation de votre mot de passe.'
        : 'You requested a password reset.'}</p>

      <p>${isFr
        ? 'Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :'
        : 'Click the button below to create a new password:'}</p>

      <div class="button-wrap">
        <a href="${resetLink}" class="button">${isFr ? 'Réinitialiser mon mot de passe' : 'Reset my password'}</a>
      </div>

      <div class="info-box">
        <p style="margin-bottom:8px;"><strong>${isFr ? 'Important :' : 'Important:'}</strong></p>
        <ul>
          <li>${isFr ? `Ce lien expire dans <strong>${expiresIn}</strong>` : `This link expires in <strong>${expiresIn}</strong>`}</li>
          <li>${isFr ? "Si vous n'avez pas fait cette demande, ignorez cet email" : 'If you did not request this, ignore this email'}</li>
          <li>${isFr ? 'Ne partagez jamais ce lien' : 'Never share this link'}</li>
        </ul>
      </div>

      <p style="font-size:13px;color:#6f6a60;margin-top:16px;">
        ${isFr ? 'Si le bouton ne fonctionne pas, copiez-collez ce lien :' : 'If the button does not work, copy and paste this link:'}<br>
        <span style="word-break:break-all;color:#0f766e;font-size:12px;">${resetLink}</span>
      </p>

      <p style="margin-top:20px;">${isFr ? 'Cordialement,' : 'Best regards,'}<br><strong style="color:#0f766e;">Yao David Logan</strong></p>
    </div>
  `;

  return baseEmailTemplate({
    title: isFr ? 'Réinitialisation de votre mot de passe' : 'Password reset',
    previewText: isFr ? 'Cliquez pour réinitialiser votre mot de passe' : 'Click to reset your password',
    content, lang, baseUrl, phone,
  });
};

export default { passwordResetTemplate };
