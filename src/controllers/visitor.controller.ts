import { Request, Response, NextFunction } from 'express';
import { visitorService } from '../services/visitor.service.js';
import { sendSuccess } from '../utils/response.util.js';

export const requestOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name } = req.body;
    const lang: 'fr' | 'en' = req.body.lang || req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
    await visitorService.requestOtp(email, name, lang);
    sendSuccess(res, null, lang === 'fr' ? 'Code envoyé par email' : 'Code sent by email');
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code, name, remember } = req.body;
    const result = await visitorService.verifyOtp(email, code, name, !!remember);
    sendSuccess(res, result, 'Verification reussie');
  } catch (error) {
    next(error);
  }
};
