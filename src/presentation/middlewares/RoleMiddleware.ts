import { Request, Response, NextFunction } from 'express';
import { CustomJWTPayload } from '@core/application/interface/CustomJWTPayload';
import { UserRole } from '@shared/constants/RoleTypes';

// Función auxiliar para verificar si un rol tiene acceso a otro rol
function hasRoleAccess(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    ADMIN:6,
    MANAGER: 5,
    SUPERVISOR: 4,
    USER:3,
    AUDITOR: 2,
    VIEWER: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Middleware para verificar si el usuario tiene rol de ADMIN
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de ADMIN.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  next();
};

// Middleware para verificar si el usuario tiene rol de MANAGER o superior
export const requireManager = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user || !hasRoleAccess(user.role, 'MANAGER')) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de MANAGER o superior.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  next();
};

// Middleware para verificar si el usuario tiene rol de SUPERVISOR o superior
export const requireSupervisor = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user || !hasRoleAccess(user.role, 'SUPERVISOR')) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de SUPERVISOR o superior.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  next();
};

// Middleware para verificar si el usuario tiene rol de USER o superior
export const requireUser = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user || !hasRoleAccess(user.role, 'USER')) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de USER o superior.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  next();
};

// Middleware para verificar si el usuario tiene rol de AUDITOR o superior
export const requireAuditor = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user || !hasRoleAccess(user.role, 'AUDITOR')) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de AUDITOR o superior.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  next();
};

// Middleware para verificar si el usuario tiene rol de VIEWER o superior
export const requireViewer = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user || !hasRoleAccess(user.role, 'VIEWER')) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de VIEWER o superior.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  next();
};

// Middleware para verificar permisos de escritura (ADMIN, MANAGER, USER, SUPERVISOR)
export const requireWritePermissions = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Usuario no autenticado.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  // Permitir ADMIN, MANAGER, USER, SUPERVISOR para escritura
  const writeRoles = ['ADMIN', 'MANAGER', 'USER', 'SUPERVISOR'];
  if (writeRoles.includes(user.role)) {
    next();
    return;
  }
  
  res.status(403).json({
    success: false,
    message: 'Acceso denegado. Permisos insuficientes para escritura.',
    error: 'INSUFFICIENT_PERMISSIONS'
  });
};

// Middleware para verificar permisos de lectura (todos los roles autenticados)
export const requireReadPermissions = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as unknown as CustomJWTPayload;
  
  if (!user) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Usuario no autenticado.',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  // Permitir todos los roles autenticados para lectura
  next();
};
