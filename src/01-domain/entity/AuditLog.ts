/**
 * @fileoverview Entidad de dominio para logs de auditoría
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { AuditAction } from '../../00-constants/RoleTypes';

/**
 * Interfaz para datos de log de auditoría
 */
export interface IAuditLog {
  id?: number;
  tableName: string;
  recordId?: number;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  reviewed?: boolean;
  metadata?: any;
}

/**
 * Entidad de dominio para logs de auditoría
 * @class AuditLog
 */
export class AuditLog {
  private readonly _id?: number;
  private _tableName: string;
  private _recordId: number;
  private _action: string;
  private _userId?: number;
  private _metadata?: any;
  private _createdAt: Date;
  private _reviewed: boolean;

  constructor(data: IAuditLog) {
    this.validateAuditLogData(data);
    this._id = data.id;
    this._tableName = data.tableName;
    this._recordId = data.recordId;
    this._action = data.action;
    this._userId = data.userId;
    this._metadata = data.metadata;
    this._createdAt = data.createdAt || new Date();
    this._reviewed = data.reviewed ?? false;
  }

  // Getters solo lectura
  get id(): number | undefined { return this._id; }
  get tableName(): string { return this._tableName; }
  get recordId(): number { return this._recordId; }
  get action(): string { return this._action; }
  get userId(): number | undefined { return this._userId; }
  get metadata(): any { return this._metadata; }
  get createdAt(): Date { return this._createdAt; }
  get reviewed(): boolean { return this._reviewed; }

  // Método de dominio para marcar como revisado
  public markAsReviewed(): void {
    this._reviewed = true;
  }

  // Validaciones centralizadas
  private validateAuditLogData(data: IAuditLog): void {
    if (!data.tableName || data.tableName.length > 100) {
      throw new Error('El nombre de la tabla es obligatorio y no puede exceder 100 caracteres');
    }
    if (!data.recordId || data.recordId <= 0) {
      throw new Error('El ID de registro es obligatorio');
    }
    if (!data.action || data.action.length > 50) {
      throw new Error('La acción es obligatoria y no puede exceder 50 caracteres');
    }
    if (data.userId !== undefined && data.userId <= 0) {
      throw new Error('El ID de usuario debe ser positivo');
    }
  }

  /**
   * Verifica si es una acción de creación
   * @returns true si es creación
   */
  public isCreateAction(): boolean {
    return this._action === AuditAction.CREATE;
  }

  /**
   * Verifica si es una acción de actualización
   * @returns true si es actualización
   */
  public isUpdateAction(): boolean {
    return this._action === AuditAction.UPDATE;
  }

  /**
   * Verifica si es una acción de eliminación
   * @returns true si es eliminación
   */
  public isDeleteAction(): boolean {
    return this._action === AuditAction.DELETE;
  }

  /**
   * Obtiene la descripción de la acción
   * @returns Descripción de la acción
   */
  public getActionDescription(): string {
    const actionDescriptions = {
      [AuditAction.CREATE]: 'Creación',
      [AuditAction.UPDATE]: 'Actualización',
      [AuditAction.DELETE]: 'Eliminación'
    };
    return actionDescriptions[this._action];
  }

  /**
   * Obtiene los campos que cambiaron (solo para UPDATE)
   * @returns Array de campos que cambiaron
   */
  public getChangedFields(): string[] {
    if (this._action !== AuditAction.UPDATE || !this._oldValues || !this._newValues) {
      return [];
    }

    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(this._oldValues), ...Object.keys(this._newValues)]);

    for (const key of allKeys) {
      const oldValue = this._oldValues[key];
      const newValue = this._newValues[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }

  /**
   * Obtiene el resumen de cambios
   * @returns Resumen de cambios
   */
  public getChangeSummary(): string {
    switch (this._action) {
      case AuditAction.CREATE:
        return `Nuevo registro creado en ${this._tableName}`;
      case AuditAction.UPDATE:
        const changedFields = this.getChangedFields();
        return `Registro actualizado en ${this._tableName}. Campos modificados: ${changedFields.join(', ')}`;
      case AuditAction.DELETE:
        return `Registro eliminado de ${this._tableName}`;
      default:
        return `Acción ${this._action} en ${this._tableName}`;
    }
  }

  /**
   * Verifica si tiene información de usuario
   * @returns true si tiene información de usuario
   */
  public hasUserInfo(): boolean {
    return !!(this._userId || this._ipAddress || this._userAgent);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns Objeto con los datos del log de auditoría
   */
  public toJSON(): IAuditLog {
    return {
      id: this._id,
      tableName: this._tableName,
      recordId: this._recordId,
      action: this._action,
      userId: this._userId,
      metadata: this._metadata,
      createdAt: this._createdAt,
      reviewed: this._reviewed
    };
  }
} 