/**
 * @fileoverview Middleware optimizado para manejo de errores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { LoggerWrapperInterface } from '../../core/application/interface/LoggerWrapperInterface';
import { ApplicationError } from '../../core/application/error/ApplicationError';

export function createErrorHandlerMiddleware(logger: LoggerWrapperInterface) {
  return (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const status = error instanceof ApplicationError ? error.httpStatus : 500;
    const message = error.message || 'Internal Server Error';

    logger.error(`Error handling request: ${message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
      },
    });

    res.status(status).json({
      success: false,
      error: {
        message,
        code: error instanceof ApplicationError ? error.code : 'INTERNAL_ERROR',
      },
    });
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
