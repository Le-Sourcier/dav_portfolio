import { Request, Response, NextFunction } from 'express';
import { chatbotService } from '../services/chatbot.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { generateId } from '../utils/helpers.js';

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, history, sessionId, lang = 'fr' } = req.body;
    const response = await chatbotService.processMessage(content, history, sessionId || 'default', lang);

    const message = {
      id: generateId(),
      role: 'assistant' as const,
      ...response,
      timestamp: new Date(),
    };

    sendSuccess(res, message, 'Message processed');
  } catch (error) {
    next(error);
  }
};

export const getQuickActions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = (req.query.lang as string) === 'en' ? 'en' : 'fr';
    const actions = await chatbotService.getQuickActions(lang);
    sendSuccess(res, actions, 'Quick actions retrieved');
  } catch (error) {
    next(error);
  }
};

export const getInitialMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = (req.query.lang as string) === 'en' ? 'en' : 'fr';
    const message = await chatbotService.getInitialMessage(lang);
    sendSuccess(res, message, 'Initial message retrieved');
  } catch (error) {
    next(error);
  }
};

export default { sendMessage, getQuickActions, getInitialMessage };
