import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../03-infrastructure/services/JWTService';
import { LoggerWrapperInterface } from '../../02-application/interface/LoggerWrapperInterface';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Middleware de autenticación JWT
 */
export function createAuthMiddleware(logger: LoggerWrapperInterface) {
  const jwtService = new JWTService();

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido',
          error: 'AUTH_TOKEN_MISSING'
        });
      }

      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización inválido',
          error: 'AUTH_TOKEN_INVALID'
        });
      }

      try {
        const payload = await jwtService.verifyToken(token, 'ACCESS');
        
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role
        };

        // Log de acceso exitoso
        await logger.info('Acceso autorizado', {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          method: req.method,
          url: req.url,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        });

        next();
      } catch (error) {
        // Log de intento de acceso no autorizado
        await logger.warn('Intento de acceso no autorizado', {
          token: token.substring(0, 20) + '...',
          method: req.method,
          url: req.url,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          error: error instanceof Error ? error.message : 'Token inválido'
        });

        return res.status(401).json({
          success: false,
          message: 'Token de autorización inválido o expirado',
          error: 'AUTH_TOKEN_EXPIRED'
        });
      }
    } catch (error) {
      await logger.error('Error en middleware de autenticación', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  };
}

/**
 * Middleware para verificar roles específicos
 */
export function createRoleMiddleware(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'USER_NOT_AUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Permisos insuficientes',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware para verificar si el usuario es propietario del recurso o admin
 */
export function createOwnershipMiddleware(resourceIdParam: string = 'id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'USER_NOT_AUTHENTICATED'
      });
    }

    // Los administradores pueden acceder a cualquier recurso
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const resourceId = parseInt(req.params[resourceIdParam]);
    
    if (isNaN(resourceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de recurso inválido',
        error: 'INVALID_RESOURCE_ID'
      });
    }

    // Para usuarios normales, verificar si son propietarios del recurso
    // Esta lógica puede variar según el tipo de recurso
    if (req.user.userId !== resourceId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo puede acceder a sus propios recursos',
        error: 'RESOURCE_ACCESS_DENIED'
      });
    }

    next();
  };
}
