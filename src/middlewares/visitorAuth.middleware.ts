import { Request, Response, NextFunction } from 'express';
import { visitorService, VisitorPayload } from '../services/visitor.service.js';
import { sendUnauthorized } from '../utils/response.util.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      visitor?: VisitorPayload | null;
    }
  }
}

/**
 * Optional visitor auth — attaches req.visitor if valid token present.
 * Does NOT block the request if no token.
 */
export const optionalVisitorAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers['x-visitor-token'] as string | undefined;
  req.visitor = token ? visitorService.verifyToken(token) : null;
  next();
};

/**
 * Required visitor auth — blocks the request if no valid visitor token.
 */
export const requireVisitorAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-visitor-token'] as string | undefined;
  if (!token) {
    sendUnauthorized(res, 'Verification requise. Veuillez vous identifier.');
    return;
  }

  const visitor = visitorService.verifyToken(token);
  if (!visitor) {
    sendUnauthorized(res, 'Session expiree. Veuillez vous re-identifier.');
    return;
  }

  req.visitor = visitor;
  next();
};

/**
 * Verify that the visitor email matches the request body email.
 * Must be used AFTER requireVisitorAuth.
 */
export const matchVisitorEmail = (emailField = 'email') => (req: Request, res: Response, next: NextFunction): void => {
  const bodyEmail = req.body?.[emailField] || req.query?.[emailField];
  if (req.visitor && bodyEmail && req.visitor.email !== bodyEmail) {
    sendUnauthorized(res, 'Email ne correspond pas a votre session.');
    return;
  }
  next();
};
