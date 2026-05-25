import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contact.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export const getAllContacts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contacts = await contactService.findAll();
    sendSuccess(res, contacts, 'Contacts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await contactService.findById(req.params.id!);
    sendSuccess(res, contact, 'Contact retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await contactService.create(req.body);
    sendCreated(res, contact, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await contactService.markAsRead(req.params.id!);
    sendSuccess(res, contact, 'Contact marked as read');
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await contactService.delete(req.params.id!);
    sendSuccess(res, null, 'Contact deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const replyToContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await contactService.reply(req.params.id!, req.body.reply, req.body.lang || 'fr');
    sendSuccess(res, contact, 'Reply sent successfully');
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await contactService.getUnreadCount();
    sendSuccess(res, { count }, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
};

export default { getAllContacts, getContactById, createContact, markAsRead, replyToContact, deleteContact, getUnreadCount };
