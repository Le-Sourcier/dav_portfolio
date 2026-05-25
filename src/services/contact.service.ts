import Contact from '../models/Contact.js';
import { IContact } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { sendEmail } from '../helpers/mailer.js';
import { contactReceivedTemplate } from '../views/emails/contact.template.js';
import { contactReplyTemplate } from '../views/emails/contact-reply.template.js';
import { config } from '../config/index.js';

class ContactService {
  async findAll(): Promise<IContact[]> {
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']],
    });
    return contacts;
  }

  async findById(id: string): Promise<IContact> {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new AppError('Contact message not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return contact;
  }

  async create(data: Omit<IContact, 'id' | 'read' | 'createdAt'> & { lang?: 'fr' | 'en' }): Promise<IContact> {
    const { lang = 'fr', ...contactData } = data as any;
    const contact = await Contact.create(contactData);

    // Send notification email to admin
    try {
      await sendEmail({
        to: config.admin.email,
        subject: lang === 'fr' ? `Nouveau message de ${data.name}` : `New message from ${data.name}`,
        html: contactReceivedTemplate({
          name: data.name,
          email: data.email,
          subject: data.subject || (lang === 'fr' ? 'Sans sujet' : 'No subject'),
          message: data.message,
          lang,
          baseUrl: config.frontendUrl,
          phone: config.owner.phone,
        }),
      });
    } catch {
      // Don't fail if email sending fails
    }

    return contact;
  }

  async markAsRead(id: string): Promise<IContact> {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new AppError('Contact message not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await contact.update({ read: true });
    return contact;
  }

  async delete(id: string): Promise<void> {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new AppError('Contact message not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await contact.destroy();
  }

  async reply(id: string, replyText: string, lang: 'fr' | 'en' = 'fr'): Promise<IContact> {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new AppError('Contact message not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Send email BEFORE updating DB — if email fails, no false trace
    await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.subject || (lang === 'fr' ? 'Votre message' : 'Your message')}`,
      html: contactReplyTemplate({
        visitorName: contact.name,
        originalSubject: contact.subject || (lang === 'fr' ? 'Sans sujet' : 'No subject'),
        originalMessage: contact.message,
        replyMessage: replyText,
        ownerName: config.owner.name,
        lang,
        baseUrl: config.frontendUrl,
        phone: config.owner.phone,
      }),
    });

    await contact.update({ reply: replyText, repliedAt: new Date(), read: true });
    return contact;
  }

  async getUnreadCount(): Promise<number> {
    const count = await Contact.count({ where: { read: false } });
    return count;
  }
}

export const contactService = new ContactService();
export default contactService;
