/**
 * @fileoverview Entidad de dominio para movimientos de productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { MovementType } from '../../00-constants/RoleTypes';

/**
 * Interfaz para datos de movimiento de producto
 */
export interface IProductMovement {
  id?: number;
  productId: number;
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  userId: number;
  createdAt?: Date;
}

/**
 * Entidad de dominio para movimientos de productos
 * @class ProductMovement
 */
export class ProductMovement {
  private readonly _id?: number;
  private _productId: number;
  private _movementType: MovementType;
  private _quantity: number;
  private _previousQuantity: number;
  private _newQuantity: number;
  private _userId: number;
  private _reason?: string;
  private readonly _createdAt?: Date;

  constructor(data: IProductMovement) {
    this.validateMovementData(data);
    this._id = data.id;
    this._productId = data.productId;
    this._movementType = data.movementType;
    this._quantity = data.quantity;
    this._previousQuantity = data.previousQuantity;
    this._newQuantity = data.newQuantity;
    this._userId = data.userId;
    this._reason = data.reason;
    this._createdAt = data.createdAt;
  }

  // Getters solo lectura
  get id(): number | undefined { return this._id; }
  get productId(): number { return this._productId; }
  get movementType(): MovementType { return this._movementType; }
  get quantity(): number { return this._quantity; }
  get previousQuantity(): number { return this._previousQuantity; }
  get newQuantity(): number { return this._newQuantity; }
  get userId(): number { return this._userId; }
  get reason(): string | undefined { return this._reason; }
  get createdAt(): Date | undefined { return this._createdAt; }

  // Métodos de dominio (si aplica)
  // No se permite modificar movimientos una vez creados (inmutabilidad)

  // Validaciones centralizadas
  private validateMovementData(data: IProductMovement): void {
    if (data.productId <= 0) {
      throw new Error('El ID del producto es obligatorio');
    }
    if (!Object.values(MovementType).includes(data.movementType)) {
      throw new Error('Tipo de movimiento inválido');
    }
    if (data.quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    if (data.previousQuantity < 0) {
      throw new Error('La cantidad anterior no puede ser negativa');
    }
    if (data.newQuantity < 0) {
      throw new Error('La cantidad nueva no puede ser negativa');
    }
    if (data.userId <= 0) {
      throw new Error('El ID del usuario es obligatorio');
    }
    if (data.reason && data.reason.length > 200) {
      throw new Error('La razón no puede exceder 200 caracteres');
    }
    // Validar consistencia de cantidades según el tipo de movimiento
    this.validateQuantityConsistency(data);
  }

  private validateQuantityConsistency(data: IProductMovement): void {
    switch (data.movementType) {
      case MovementType.IN:
        if (data.newQuantity !== data.previousQuantity + data.quantity) {
          throw new Error('Cantidad inconsistente para movimiento de entrada');
        }
        break;
      case MovementType.OUT:
        if (data.newQuantity !== data.previousQuantity - data.quantity) {
          throw new Error('Cantidad inconsistente para movimiento de salida');
        }
        if (data.previousQuantity < data.quantity) {
          throw new Error('No hay suficiente stock para el movimiento de salida');
        }
        break;
      case MovementType.ADJUSTMENT:
        if (data.newQuantity !== data.quantity) {
          throw new Error('Cantidad inconsistente para ajuste');
        }
        break;
    }
  }

  /**
   * Verifica si es un movimiento de entrada
   * @returns true si es entrada
   */
  public isInMovement(): boolean {
    return this._movementType === MovementType.IN;
  }

  /**
   * Verifica si es un movimiento de salida
   * @returns true si es salida
   */
  public isOutMovement(): boolean {
    return this._movementType === MovementType.OUT;
  }

  /**
   * Verifica si es un ajuste
   * @returns true si es ajuste
   */
  public isAdjustment(): boolean {
    return this._movementType === MovementType.ADJUSTMENT;
  }

  /**
   * Obtiene la descripción del movimiento
   * @returns Descripción del movimiento
   */
  public getMovementDescription(): string {
    const typeDescription = {
      [MovementType.IN]: 'Entrada',
      [MovementType.OUT]: 'Salida',
      [MovementType.ADJUSTMENT]: 'Ajuste'
    };

    const baseDescription = `${typeDescription[this._movementType]} de ${this._quantity} unidades`;
    
    if (this._reason) {
      return `${baseDescription} - ${this._reason}`;
    }
    
    return baseDescription;
  }

  /**
   * Calcula la diferencia de stock
   * @returns Diferencia de stock
   */
  public getStockDifference(): number {
    return this._newQuantity - this._previousQuantity;
  }

  /**
   * Verifica si el movimiento afectó el stock crítico
   * @param criticalStock - Stock crítico del producto
   * @returns true si afectó el stock crítico
   */
  public affectedCriticalStock(criticalStock: number): boolean {
    const wasAboveCritical = this._previousQuantity > criticalStock;
    const isNowBelowCritical = this._newQuantity <= criticalStock;
    return wasAboveCritical && isNowBelowCritical;
  }

  public toJSON(): IProductMovement {
    return {
      id: this._id,
      productId: this._productId,
      movementType: this._movementType,
      quantity: this._quantity,
      previousQuantity: this._previousQuantity,
      newQuantity: this._newQuantity,
      userId: this._userId,
      reason: this._reason,
      createdAt: this._createdAt
    };
  }
} 