/**
 * @fileoverview Entidad de dominio para movimientos de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { MovementType } from '../../00-constants/RoleTypes';

export { MovementType };

/**
 * Tipos semánticos para mayor claridad y robustez
 */
type MovementReason = string & { readonly reason: unique symbol };

export type { MovementReason };

/**
 * Interfaz para datos de movimiento de producto alineada a la tabla 'product_movements'
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
 *
 * - Inmutable: solo se crea, no se edita.
 * - Validación centralizada y exhaustiva.
 * - Getters públicos para todos los campos relevantes.
 *
 * @class ProductMovement
 */
export class ProductMovement {
  private readonly _id?: number;
  private readonly _productId: number;
  private readonly _movementType: MovementType;
  private readonly _quantity: number;
  private readonly _previousQuantity: number;
  private readonly _newQuantity: number;
  private readonly _userId: number;
  private readonly _reason?: MovementReason;
  private readonly _createdAt?: Date;

  /**
   * Crea una nueva instancia de ProductMovement
   * @param data - Datos del movimiento
   * @throws {Error} Si los datos son inválidos
   */
  constructor(data: IProductMovement) {
    this.validateMovementData(data);
    this._id = data.id;
    this._productId = data.productId;
    this._movementType = data.movementType;
    this._quantity = data.quantity;
    this._previousQuantity = data.previousQuantity;
    this._newQuantity = data.newQuantity;
    this._userId = data.userId;
    this._reason = data.reason as MovementReason;
    this._createdAt = data.createdAt;
  }

  // --- Getters públicos ---
  get id(): number | undefined { return this._id; }
  get productId(): number { return this._productId; }
  get movementType(): MovementType { return this._movementType; }
  get quantity(): number { return this._quantity; }
  get previousQuantity(): number { return this._previousQuantity; }
  get newQuantity(): number { return this._newQuantity; }
  get userId(): number { return this._userId; }
  get reason(): string | undefined { return this._reason; }
  get createdAt(): Date | undefined { return this._createdAt; }

  /**
   * Indica si el movimiento es de tipo IN (entrada)
   */
  public isIn(): boolean {
    return this._movementType === MovementType.IN;
  }

  /**
   * Indica si el movimiento es de tipo OUT (salida)
   */
  public isOut(): boolean {
    return this._movementType === MovementType.OUT;
  }

  /**
   * Indica si el movimiento es de tipo ADJUSTMENT (ajuste)
   */
  public isAdjustment(): boolean {
    return this._movementType === MovementType.ADJUSTMENT;
  }

  // --- Validación centralizada y granular ---
  private validateMovementData(data: IProductMovement): void {
    this.validateProductId(data.productId);
    this.validateMovementType(data.movementType);
    this.validateQuantity(data.quantity);
    this.validatePreviousQuantity(data.previousQuantity);
    this.validateNewQuantity(data.newQuantity);
    this.validateUserId(data.userId);
    this.validateReason(data.reason);
    this.validateQuantityConsistency(data);
  }
  private validateProductId(productId: number): void {
    if (productId <= 0) {
      throw new Error('El ID del producto es obligatorio');
    }
  }
  private validateMovementType(movementType: MovementType): void {
    switch (movementType) {
      case MovementType.IN:
      case MovementType.OUT:
      case MovementType.ADJUSTMENT:
        break;
      default:
        throw new Error('Tipo de movimiento inválido');
    }
  }
  private validateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
  }
  private validatePreviousQuantity(previousQuantity: number): void {
    if (previousQuantity < 0) {
      throw new Error('La cantidad anterior no puede ser negativa');
    }
  }
  private validateNewQuantity(newQuantity: number): void {
    if (newQuantity < 0) {
      throw new Error('La cantidad nueva no puede ser negativa');
    }
  }
  private validateUserId(userId: number): void {
    if (userId <= 0) {
      throw new Error('El ID del usuario es obligatorio');
    }
  }
  private validateReason(reason?: string): void {
    if (reason && reason.length > 200) {
      throw new Error('La razón no puede exceder 200 caracteres');
    }
  }
  /**
   * Valida la consistencia de cantidades según el tipo de movimiento
   * @param data - Datos del movimiento
   * @throws {Error} Si la consistencia es inválida
   */
  private validateQuantityConsistency(data: IProductMovement): void {
    switch (data.movementType) {
      case MovementType.IN:
        if (data.newQuantity !== data.previousQuantity + data.quantity) {
          throw new Error('Para IN: newQuantity debe ser previousQuantity + quantity');
        }
        break;
      case MovementType.OUT:
        if (data.newQuantity !== data.previousQuantity - data.quantity) {
          throw new Error('Para OUT: newQuantity debe ser previousQuantity - quantity');
        }
        break;
      case MovementType.ADJUSTMENT:
        // Para ajuste, solo se requiere que newQuantity sea explícito
        break;
      default:
        throw new Error('Tipo de movimiento inválido para consistencia');
    }
  }

  /**
   * Convierte la entidad a un objeto plano
   */
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