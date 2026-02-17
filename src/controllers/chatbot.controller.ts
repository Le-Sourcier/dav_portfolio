import { Request, Response, NextFunction } from 'express';
import { chatbotService } from '../services/chatbot.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { generateId } from '../utils/helpers.js';

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    const response = await chatbotService.processMessage(content);

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

export const getQuickActions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const actions = await chatbotService.getQuickActions();
    sendSuccess(res, actions, 'Quick actions retrieved');
  } catch (error) {
    next(error);
  }
};

export const getInitialMessage = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const message = await chatbotService.getInitialMessage();
    sendSuccess(res, message, 'Initial message retrieved');
  } catch (error) {
    next(error);
  }
};

export default { sendMessage, getQuickActions, getInitialMessage };
