import { Request, Response, NextFunction } from 'express';
import { newsletterService } from '../services/newsletter.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export const subscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscriber = await newsletterService.subscribe(req.body.email, req.body.locale || req.body.lang);
    sendCreated(res, subscriber, 'Successfully subscribed to newsletter');
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await newsletterService.unsubscribe(req.body.email);
    sendSuccess(res, null, 'Successfully unsubscribed from newsletter');
  } catch (error) {
    next(error);
  }
};

export const getAllSubscribers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscribers = await newsletterService.findAll();
    sendSuccess(res, subscribers, 'Subscribers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getActiveSubscribers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscribers = await newsletterService.findActive();
    sendSuccess(res, subscribers, 'Active subscribers retrieved');
  } catch (error) {
    next(error);
  }
};

export const getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await newsletterService.getCount();
    sendSuccess(res, stats, 'Newsletter stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const sendArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, excerpt, slug, imageUrl, category, readTime } = req.body;
    const result = await newsletterService.sendArticleToSubscribers({
      title, excerpt, slug, imageUrl, category, readTime,
    });
    sendSuccess(res, result, `Newsletter envoyee: ${result.sent} succes, ${result.failed} echecs`);
  } catch (error) {
    next(error);
  }
};

export default { subscribe, unsubscribe, getAllSubscribers, getActiveSubscribers, getStats, sendArticle };
