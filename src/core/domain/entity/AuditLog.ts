/**
 * @fileoverview Entidad de dominio para logs de auditoría
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { AuditAction } from '../../../shared/constants/RoleTypes';

/**
 * Tipos semánticos para mayor claridad y robustez
 */
type TableName = string & { readonly table: unique symbol };
type IpAddress = string & { readonly ip: unique symbol };

type UserAgent = string & { readonly ua: unique symbol };

export type { TableName, IpAddress };

/**
 * Interfaz para datos de log de auditoría alineada a la tabla 'audit_logs'
 * Permite parametrizar los tipos de oldValues y newValues para mayor seguridad de tipos.
 */
export interface IAuditLog<T = unknown> {
  id?: number;
  tableName: string;
  recordId?: number;
  action: AuditAction;
  oldValues?: T;
  newValues?: T;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  reviewed?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Entidad de dominio para logs de auditoría
 *
 * - Solo se puede modificar el estado mediante métodos de dominio.
 * - Validación centralizada y exhaustiva.
 * - Getters públicos para todos los campos relevantes.
 *
 * @class AuditLog
 * @template T - Tipo de los valores antiguos y nuevos (por defecto unknown)
 */
export class AuditLog<T = unknown> {
  private readonly _id?: number;
  private _tableName: TableName;
  private _recordId: number;
  private _action: AuditAction;
  private _userId?: number;
  private _ipAddress?: IpAddress;
  private _userAgent?: UserAgent;
  private _metadata?: Record<string, unknown>;
  private readonly _createdAt: Date;
  private _reviewed: boolean;
  private _oldValues?: T;
  private _newValues?: T;

  /**
   * Crea una nueva instancia de AuditLog
   * @param data - Datos del log de auditoría
   * @throws {Error} Si los datos son inválidos
   */
  constructor(data: IAuditLog<T>) {
    this.validateAuditLogData(data);
    this._id = data.id;
    this._tableName = data.tableName as TableName;
    this._recordId = data.recordId!;
    this._action = data.action;
    this._userId = data.userId;
    this._ipAddress = data.ipAddress as IpAddress;
    this._userAgent = data.userAgent as UserAgent;
    this._metadata = data.metadata;
    this._createdAt = data.createdAt || new Date();
    this._reviewed = data.reviewed ?? false;
    this._oldValues = data.oldValues;
    this._newValues = data.newValues;
  }

  // --- Getters públicos ---
  get id(): number | undefined {
    return this._id;
  }
  get tableName(): string {
    return this._tableName;
  }
  get recordId(): number {
    return this._recordId;
  }
  get action(): AuditAction {
    return this._action;
  }
  get userId(): number | undefined {
    return this._userId;
  }
  get ipAddress(): string | undefined {
    return this._ipAddress;
  }
  get userAgent(): string | undefined {
    return this._userAgent;
  }
  get metadata(): Record<string, unknown> | undefined {
    return this._metadata;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get reviewed(): boolean {
    return this._reviewed;
  }
  get oldValues(): T | undefined {
    return this._oldValues;
  }
  get newValues(): T | undefined {
    return this._newValues;
  }

  /**
   * Indica si el log ha sido revisado
   */
  public isReviewed(): boolean {
    return this._reviewed;
  }

  // --- Métodos de dominio para cambios de estado ---

  /**
   * Marca el log como revisado
   */
  public markReviewed(): void {
    this._reviewed = true;
  }

  /**
   * Actualiza la metadata del log
   * @param newMetadata - nueva metadata
   */
  public updateMetadata(newMetadata: Record<string, unknown>): void {
    this._metadata = newMetadata;
  }

  // --- Validación centralizada y granular ---
  private validateAuditLogData(data: IAuditLog<T>): void {
    this.validateTableName(data.tableName);
    this.validateRecordId(data.recordId);
    this.validateAction(data.action);
    this.validateUserId(data.userId);
    this.validateIpAddress(data.ipAddress);
    this.validateUserAgent(data.userAgent);
  }
  private validateTableName(tableName: string): void {
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('El nombre de la tabla es obligatorio');
    }
    if (tableName.length > 100) {
      throw new Error('El nombre de la tabla no puede exceder 100 caracteres');
    }
  }
  private validateRecordId(recordId?: number): void {
    if (recordId === undefined || recordId === null) {
      throw new Error('El ID de registro es obligatorio');
    }
    if (recordId <= 0) {
      throw new Error('El ID de registro debe ser positivo');
    }
  }
  private validateAction(action: AuditAction): void {
    if (!action || typeof action !== 'string') {
      throw new Error('La acción es obligatoria');
    }
    if (!Object.values(AuditAction).includes(action as AuditAction)) {
      throw new Error('La acción no es válida');
    }
    if (action.length > 50) {
      throw new Error('La acción no puede exceder 50 caracteres');
    }
  }
  private validateUserId(userId?: number): void {
    if (userId !== undefined && userId <= 0) {
      throw new Error('El ID de usuario debe ser positivo');
    }
  }
  private validateIpAddress(ip?: string): void {
    if (ip && ip.length > 50) {
      throw new Error('La IP no puede exceder 50 caracteres');
    }
  }
  private validateUserAgent(ua?: string): void {
    if (ua && ua.length > 255) {
      throw new Error('El user agent no puede exceder 255 caracteres');
    }
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns Objeto con los datos del log de auditoría
   */
  public toJSON(): IAuditLog<T> {
    return {
      id: this._id,
      tableName: this._tableName,
      recordId: this._recordId,
      action: this._action,
      userId: this._userId,
      ipAddress: this._ipAddress,
      userAgent: this._userAgent,
      metadata: this._metadata,
      createdAt: this._createdAt,
      reviewed: this._reviewed,
      oldValues: this._oldValues,
      newValues: this._newValues,
    };
  }
}
