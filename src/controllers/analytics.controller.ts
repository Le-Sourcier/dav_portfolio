import { Request, Response, NextFunction } from 'express';
import { analyticsService, AnalyticsPeriod } from '../services/analytics.service.js';
import { sendCreated, sendSuccess } from '../utils/response.util.js';

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() || req.ip || 'unknown';
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const trackPageView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pageView = await analyticsService.trackPageView({
      ...req.body,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });
    sendCreated(res, { id: pageView.id }, 'Page view tracked');
  } catch (error) {
    next(error);
  }
};

export const getTraffic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const period = (req.query.period as AnalyticsPeriod | undefined) || '12m';
    const traffic = await analyticsService.getTraffic(period);
    sendSuccess(res, traffic, 'Traffic analytics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getWeeklyActivity = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activity = await analyticsService.getWeeklyActivity();
    sendSuccess(res, activity, 'Weekly activity retrieved');
  } catch (error) {
    next(error);
  }
};
