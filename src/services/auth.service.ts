import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import Admin from '../models/Admin.js';
import { JwtPayload, TokenPair, LoginResponse } from '../types/auth.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';

class AuthService {
  private generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string & jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as string & jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Always authenticate via database + bcrypt
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      throw new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    // Verify password
    const isValid = await admin.verifyPassword(password);
    if (!isValid) {
      throw new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    // Update last login
    await admin.update({ lastLogin: new Date() });

    const payload: JwtPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const tokens = this.generateTokens(payload);

    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: admin.toJSON(),
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

      const payload: JwtPayload = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as string & jwt.SignOptions['expiresIn'],
      });

      return { token: accessToken };
    } catch {
      throw new AppError('Invalid refresh token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }
  }

  async getProfile(userId: string): Promise<Omit<import('../types/entities.types.js').IAdmin, 'password'>> {
    const admin = await Admin.findByPk(userId);
    if (!admin) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    return admin.toJSON();
  }

  async createAdmin(email: string, password: string, name: string): Promise<Omit<import('../types/entities.types.js').IAdmin, 'password'>> {
    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      throw new AppError('Admin already exists', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
    }

    const admin = await Admin.create({
      email,
      password,
      name,
      role: 'admin',
    });

    return admin.toJSON();
  }
}

export const authService = new AuthService();
export default authService;
