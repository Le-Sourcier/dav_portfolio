import { baseEmailTemplate } from './base.template.js';

interface AppointmentTemplateOptions {
  name: string;
  date: string;
  time: string;
  subject: string;
  urgency?: string;
  lang?: 'fr' | 'en';
  baseUrl?: string;
  phone?: string;
}

export const appointmentConfirmationTemplate = ({
  name, date, time, subject, urgency = 'non-urgent', lang = 'fr', baseUrl, phone,
}: AppointmentTemplateOptions): string => {
  const isFr = lang === 'fr';
  const isUrgent = urgency === 'urgent';

  const content = `
    <div class="greeting">
      ${isFr ? 'Bonjour' : 'Hello'} <strong>${name}</strong>,
    </div>
    <div class="content-text">
      <p>${isFr
        ? 'Votre demande de rendez-vous a bien été enregistrée.'
        : 'Your appointment request has been recorded.'}</p>

      <div class="info-box">
        <p style="margin-bottom:10px;"><strong>${isFr ? 'Détails du rendez-vous' : 'Appointment details'}</strong></p>
        <ul>
          <li><span class="label">${isFr ? 'Date' : 'Date'}</span>${date}</li>
          <li><span class="label">${isFr ? 'Heure' : 'Time'}</span>${time}</li>
          <li><span class="label">${isFr ? 'Sujet' : 'Subject'}</span>${subject}</li>
          <li>
            <span class="label">${isFr ? 'Urgence' : 'Urgency'}</span>
            <span class="pill ${isUrgent ? 'pill-gold' : ''}">${isUrgent
              ? (isFr ? 'Urgent' : 'Urgent')
              : (isFr ? 'Non urgent' : 'Non-urgent')}</span>
          </li>
        </ul>
      </div>

      <p>${isFr
        ? 'Je vous confirmerai le rendez-vous sous peu. Si vous avez besoin de modifier ou annuler, n\'hésitez pas à me contacter.'
        : 'I will confirm the appointment shortly. If you need to modify or cancel, feel free to contact me.'}</p>

      <div class="button-wrap">
        <a href="mailto:yaodavidlogan02@gmail.com" class="button button-teal">${isFr ? 'Me contacter' : 'Contact me'}</a>
      </div>

      <p>${isFr ? 'À bientôt,' : 'See you soon,'}<br><strong style="color:#0f766e;">Yao David Logan</strong></p>
    </div>
  `;

  return baseEmailTemplate({
    title: isFr ? 'Confirmation de votre rendez-vous' : 'Appointment confirmation',
    previewText: isFr
      ? `Votre rendez-vous du ${date} à ${time} a été enregistré`
      : `Your appointment on ${date} at ${time} has been recorded`,
    content, lang, baseUrl, phone,
  });
};

export default { appointmentConfirmationTemplate };
