/**
 * @fileoverview Middleware optimizado para manejo de errores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { LoggerWrapperInterface } from '../../core/application/interface/LoggerWrapperInterface';
import {
  ApplicationError,
  ErrorType,
} from '../../core/application/error/ApplicationError';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    type: string;
    details?: any;
  };
}

export function createErrorHandlerMiddleware(logger: LoggerWrapperInterface) {
  return (
    err: Error | ApplicationError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    const timestamp = new Date().toISOString();

    // Información básica del error para logging
    const errorContext = {
      requestId,
      timestamp,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).user?.id,
    };

    // Preparar respuesta base
    const baseResponse: ErrorResponse = {
      success: false,
      error: {
        message: err.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        type: 'INTERNAL',
      },
    };

    // Manejar errores de la aplicación
    if (err instanceof ApplicationError) {
      baseResponse.error.code = err.code;
      baseResponse.error.type = err.type;
      if (err.context) {
        baseResponse.error.details = err.context;
      }

      // Log basado en el tipo de error
      switch (err.type) {
        case ErrorType.VALIDATION:
        case ErrorType.BAD_REQUEST:
          logger.warn('Validation error', { ...errorContext, error: err });
          break;
        case ErrorType.UNAUTHORIZED:
        case ErrorType.FORBIDDEN:
          logger.warn('Security error', { ...errorContext, error: err });
          break;
        case ErrorType.NOT_FOUND:
          logger.info('Resource not found', { ...errorContext, error: err });
          break;
        default:
          logger.error('Application error', { ...errorContext, error: err });
      }

      return res.status(err.httpStatus).json(baseResponse);
    }

    // Manejar errores de Express/Node
    if (err instanceof SyntaxError && 'body' in err) {
      logger.warn('Invalid request syntax', { ...errorContext, error: err });
      baseResponse.error.message = 'Invalid request syntax';
      baseResponse.error.code = 'INVALID_SYNTAX';
      baseResponse.error.type = 'BAD_REQUEST';
      return res.status(400).json(baseResponse);
    }

    // Manejar errores de validación de Express-Validator
    if (Array.isArray((err as any).errors)) {
      logger.warn('Validation errors', { ...errorContext, error: err });
      baseResponse.error.message = 'Validation failed';
      baseResponse.error.code = 'VALIDATION_ERROR';
      baseResponse.error.type = 'VALIDATION';
      baseResponse.error.details = (err as any).errors;
      return res.status(400).json(baseResponse);
    }

    // Error no manejado
    logger.error('Unhandled error', {
      ...errorContext,
      error: {
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
    });

    // En producción, no enviar detalles del error
    if (process.env.NODE_ENV === 'production') {
      baseResponse.error.message = 'An unexpected error occurred';
      delete baseResponse.error.details;
    }

    res.status(500).json(baseResponse);
  };
}

// Middleware para capturar errores asíncronos
export function asyncErrorHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Middleware para errores 404
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.url} not found`,
      code: 'NOT_FOUND',
      type: 'NOT_FOUND',
    },
  });
}
