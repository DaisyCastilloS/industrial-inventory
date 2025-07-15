/**
 * @fileoverview Middleware para autenticación y autorización
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../infrastructure/services/JWTService';
import { LoggerWrapperInterface } from '../../core/application/interface/LoggerWrapperInterface';
import {
  ApplicationError,
  ErrorType,
  ErrorCode,
} from '../../core/application/error/ApplicationError';
import rateLimit from 'express-rate-limit';

export interface AuthUser {
  id: number;
  userId: number;
  email: string;
  role: string;
  permissions?: string[];
  lastActivity?: Date;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Rate limiter específico para intentos de autenticación
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos fallidos
  message:
    'Demasiados intentos fallidos de autenticación. Por favor, intente más tarde.',
  statusCode: 429,
  headers: true,
  keyGenerator: req => {
    return `${req.ip}:${(req.headers.authorization || '').substring(0, 20)}`;
  },
});

/**
 * Middleware de autenticación JWT
 */
export function createAuthMiddleware(logger: LoggerWrapperInterface) {
  const jwtService = new JWTService();
  const tokenBlacklist = new Set<string>();

  return [
    authRateLimiter,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] || 'unknown';

      try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          throw new ApplicationError('Token de autorización requerido', {
            type: ErrorType.UNAUTHORIZED,
            code: ErrorCode.INVALID_TOKEN,
            httpStatus: 401,
            isOperational: true,
          });
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token) {
          throw new ApplicationError('Token de autorización inválido', {
            type: ErrorType.UNAUTHORIZED,
            code: ErrorCode.INVALID_TOKEN,
            httpStatus: 401,
            isOperational: true,
          });
        }

        // Verificar si el token está en la lista negra
        if (tokenBlacklist.has(token)) {
          throw new ApplicationError('Token revocado', {
            type: ErrorType.UNAUTHORIZED,
            code: ErrorCode.TOKEN_REVOKED,
            httpStatus: 401,
            isOperational: true,
          });
        }

        try {
          const payload = await jwtService.verifyToken(token, 'ACCESS');

          req.user = {
            id: payload.userId, // Añadir id para compatibilidad
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            lastActivity: new Date(),
          };

          // Log de acceso exitoso
          await logger.info('Acceso autorizado', {
            requestId,
            duration: Date.now() - startTime,
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
          });

          // Verificar si el token está próximo a expirar
          const timeRemaining = await jwtService.getTokenTimeRemaining(token);
          if (timeRemaining < 300) {
            // 5 minutos
            res.setHeader('X-Token-Expiring-Soon', 'true');
          }

          next();
        } catch (error) {
          // Incrementar contador de intentos fallidos
          if (
            error instanceof ApplicationError &&
            error.code === ErrorCode.TOKEN_EXPIRED
          ) {
            tokenBlacklist.add(token);
          }

          // Log de intento de acceso no autorizado
          await logger.warn('Intento de acceso no autorizado', {
            requestId,
            duration: Date.now() - startTime,
            token: `${token.substring(0, 20)}...`,
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
            error: error instanceof Error ? error.message : 'Token inválido',
          });

          throw error;
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          throw error;
        }

        await logger.error('Error en middleware de autenticación', {
          requestId,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Error desconocido',
          method: req.method,
          url: req.url,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
        });

        throw new ApplicationError('Error interno del servidor', {
          type: ErrorType.INTERNAL,
          code: ErrorCode.SERVER_ERROR,
          httpStatus: 500,
          isOperational: false,
        });
      }
    },
  ];
}

/**
 * Middleware para verificar roles específicos
 */
export function createRoleMiddleware(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApplicationError('Usuario no autenticado', {
          type: ErrorType.UNAUTHORIZED,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 401,
          isOperational: true,
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApplicationError(
          'Acceso denegado. Permisos insuficientes',
          {
            type: ErrorType.FORBIDDEN,
            code: ErrorCode.INSUFFICIENT_PERMISSIONS,
            httpStatus: 403,
            isOperational: true,
          },
          {
            requiredRoles: allowedRoles,
            userRole: req.user.role,
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar permisos específicos
 */
export function createPermissionMiddleware(requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApplicationError('Usuario no autenticado', {
          type: ErrorType.UNAUTHORIZED,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 401,
          isOperational: true,
        });
      }

      // Los administradores tienen todos los permisos
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Verificar si el usuario tiene todos los permisos requeridos
      const hasAllPermissions = requiredPermissions.every(permission =>
        req.user?.permissions?.includes(permission)
      );

      if (!hasAllPermissions) {
        throw new ApplicationError(
          'Acceso denegado. Permisos insuficientes',
          {
            type: ErrorType.FORBIDDEN,
            code: ErrorCode.INSUFFICIENT_PERMISSIONS,
            httpStatus: 403,
            isOperational: true,
          },
          {
            requiredPermissions,
            userPermissions: req.user.permissions,
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar si el usuario es propietario del recurso o admin
 */
export function createOwnershipMiddleware(resourceIdParam: string = 'id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApplicationError('Usuario no autenticado', {
          type: ErrorType.UNAUTHORIZED,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 401,
          isOperational: true,
        });
      }

      // Los administradores pueden acceder a cualquier recurso
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const resourceId = parseInt(req.params[resourceIdParam]);

      if (isNaN(resourceId)) {
        throw new ApplicationError('ID de recurso inválido', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        });
      }

      // Para usuarios normales, verificar si son propietarios del recurso
      if (req.user.userId !== resourceId) {
        throw new ApplicationError(
          'Acceso denegado. Solo puede acceder a sus propios recursos',
          {
            type: ErrorType.FORBIDDEN,
            code: ErrorCode.INSUFFICIENT_PERMISSIONS,
            httpStatus: 403,
            isOperational: true,
          },
          {
            resourceId,
            userId: req.user.userId,
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
