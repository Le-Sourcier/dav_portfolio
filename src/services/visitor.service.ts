import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { config } from '../config/index.js';
import VisitorOtp from '../models/VisitorOtp.js';
import { sendEmail } from '../helpers/mailer.js';
import { otpTemplate } from '../views/emails/otp.template.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { logger } from '../utils/logger.js';

export interface VisitorPayload {
  email: string;
  name: string;
  type: 'visitor';
}

class VisitorService {
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async requestOtp(email: string, name: string): Promise<void> {
    // Invalidate previous OTPs for this email
    await VisitorOtp.update(
      { verified: true },
      { where: { email, verified: false } }
    );

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + config.visitor.otpExpiresMinutes * 60 * 1000);

    await VisitorOtp.create({ email, code, expiresAt });

    // Send OTP email (silent failure — don't leak info)
    try {
      await sendEmail({
        to: email,
        subject: `${code} — Votre code de verification`,
        html: otpTemplate({ name, code, expiresMinutes: config.visitor.otpExpiresMinutes }),
      });
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw new AppError('Impossible d\'envoyer le code. Reessayez.', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
  }

  async verifyOtp(email: string, code: string, name: string, remember: boolean): Promise<{ token: string }> {
    const otp = await VisitorOtp.findOne({
      where: {
        email,
        code,
        verified: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otp) {
      throw new AppError('Code invalide ou expire', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Mark as verified
    await otp.update({ verified: true });

    // Generate visitor JWT
    const payload: VisitorPayload = { email, name, type: 'visitor' };
    const expiresIn = remember ? config.visitor.jwtRememberExpiresIn : config.visitor.jwtExpiresIn;
    const token = jwt.sign(payload, config.visitor.jwtSecret, { expiresIn });

    return { token };
  }

  verifyToken(token: string): VisitorPayload | null {
    try {
      const decoded = jwt.verify(token, config.visitor.jwtSecret) as VisitorPayload;
      if (decoded.type !== 'visitor') return null;
      return decoded;
    } catch {
      return null;
    }
  }

  async cleanupExpiredOtps(): Promise<number> {
    const deleted = await VisitorOtp.destroy({
      where: {
        [Op.or]: [
          { expiresAt: { [Op.lt]: new Date() } },
          { verified: true },
        ],
      },
    });
    if (deleted > 0) {
      logger.info(`Cleaned up ${deleted} expired/used OTPs`);
    }
    return deleted;
  }
}

export const visitorService = new VisitorService();
export default visitorService;
