/**
 * @fileoverview Enums para roles y permisos del sistema
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Roles de usuario disponibles en el sistema
 * @enum {string}
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  AUDITOR = 'AUDITOR',
}

/**
 * Permisos disponibles en el sistema
 * @enum {string}
 */
export enum Permission {
  // Permisos de productos
  VIEW_PRODUCTS = 'VIEW_PRODUCTS',
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  UPDATE_PRODUCT = 'UPDATE_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',

  // Permisos de inventario
  VIEW_INVENTORY = 'VIEW_INVENTORY',
  ADJUST_INVENTORY = 'ADJUST_INVENTORY',
  TRANSFER_INVENTORY = 'TRANSFER_INVENTORY',

  // Permisos de usuarios
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',

  // Permisos de reportes
  VIEW_REPORTS = 'VIEW_REPORTS',
  GENERATE_REPORTS = 'GENERATE_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',

  // Permisos de auditoría
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  EXPORT_AUDIT_LOGS = 'EXPORT_AUDIT_LOGS',
}

/**
 * Tipos de movimiento de inventario
 * @enum {string}
 */
export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
}

/**
 * Razones de movimiento de inventario
 * @enum {string}
 */
export enum MovementReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  DAMAGE = 'DAMAGE',
  EXPIRATION = 'EXPIRATION',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  OTHER = 'OTHER',
}

/**
 * Acciones de auditoría
 * @enum {string}
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

/**
 * Estados de stock
 * @enum {string}
 */
export enum StockStatus {
  NORMAL = 'NORMAL',
  CRITICAL = 'CRÍTICO',
  OUT_OF_STOCK = 'SIN STOCK',
  OVERSTOCK = 'EXCESO',
  RESERVED = 'RESERVADO',
  DAMAGED = 'DAÑADO',
  EXPIRED = 'VENCIDO',
  IN_TRANSIT = 'EN TRÁNSITO',
}

/**
 * Niveles de severidad para errores
 * @enum {string}
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Tipos de ubicación
 * @enum {string}
 */
export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  ZONE = 'ZONE',
  RACK = 'RACK',
  SHELF = 'SHELF',
  BIN = 'BIN',
}

/**
 * Estados de orden
 * @enum {string}
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

/**
 * Tipos de notificación
 * @enum {string}
 */
export enum NotificationType {
  STOCK_ALERT = 'STOCK_ALERT',
  ORDER_STATUS = 'ORDER_STATUS',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  USER_ALERT = 'USER_ALERT',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Prioridades
 * @enum {string}
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Mapeo de roles a permisos por defecto
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.MANAGER]: [
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.VIEW_INVENTORY,
    Permission.ADJUST_INVENTORY,
    Permission.TRANSFER_INVENTORY,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.SUPERVISOR]: [
    Permission.VIEW_PRODUCTS,
    Permission.UPDATE_PRODUCT,
    Permission.VIEW_INVENTORY,
    Permission.ADJUST_INVENTORY,
    Permission.VIEW_REPORTS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.USER]: [
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.VIEWER]: [Permission.VIEW_PRODUCTS, Permission.VIEW_INVENTORY],
  [UserRole.AUDITOR]: [
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_REPORTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_AUDIT_LOGS,
  ],
};
