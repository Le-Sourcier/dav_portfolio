import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.util.js';
import { ErrorCode, HttpStatus, HttpStatusCode } from '../types/response.types.js';
import { config } from '../config/index.js';

export class AppError extends Error {
  statusCode: HttpStatusCode;
  code: ErrorCode;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (err instanceof AppError) {
    sendError(
      res,
      err.message,
      err.code,
      err.statusCode,
      config.nodeEnv === 'development' ? err.stack : undefined
    );
    return;
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    sendError(
      res,
      'Validation error',
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      err.message
    );
    return;
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    sendError(
      res,
      'Resource already exists',
      ErrorCode.ALREADY_EXISTS,
      HttpStatus.CONFLICT,
      err.message
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(
      res,
      'Invalid or expired token',
      ErrorCode.INVALID_TOKEN,
      HttpStatus.UNAUTHORIZED
    );
    return;
  }

  // Default error
  sendError(
    res,
    'An unexpected error occurred',
    ErrorCode.INTERNAL_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR,
    config.nodeEnv === 'development' ? err.message : undefined
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(
    res,
    `Route ${req.method} ${req.path} not found`,
    ErrorCode.NOT_FOUND,
    HttpStatus.NOT_FOUND
  );
};

export default { errorHandler, notFoundHandler, AppError };
