import { MovementType } from '../../../shared/constants/RoleTypes';
import { BaseEntity, IBaseEntity } from './base/BaseEntity';

export { MovementType };

type MovementReason = string & { readonly reason: unique symbol };

export type { MovementReason };

export interface IProductMovement extends IBaseEntity {
  productId: number;
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  userId: number;
}

export class ProductMovement extends BaseEntity {
  private readonly _productId: number;
  private readonly _movementType: MovementType;
  private readonly _quantity: number;
  private readonly _previousQuantity: number;
  private readonly _newQuantity: number;
  private readonly _userId: number;
  private readonly _reason?: MovementReason;

  constructor(data: IProductMovement) {
    super(data);
    this.validateMovementData(data);
    this._productId = data.productId;
    this._movementType = data.movementType;
    this._quantity = data.quantity;
    this._previousQuantity = data.previousQuantity;
    this._newQuantity = data.newQuantity;
    this._userId = data.userId;
    this._reason = data.reason as MovementReason;
  }

  get productId(): number {
    return this._productId;
  }
  get movementType(): MovementType {
    return this._movementType;
  }
  get quantity(): number {
    return this._quantity;
  }
  get previousQuantity(): number {
    return this._previousQuantity;
  }
  get newQuantity(): number {
    return this._newQuantity;
  }
  get userId(): number {
    return this._userId;
  }
  get reason(): string | undefined {
    return this._reason;
  }

  public isIn(): boolean {
    return this._movementType === MovementType.IN;
  }

  public isOut(): boolean {
    return this._movementType === MovementType.OUT;
  }

  public isAdjustment(): boolean {
    return this._movementType === MovementType.ADJUSTMENT;
  }

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

  private validateQuantityConsistency(data: IProductMovement): void {
    switch (data.movementType) {
      case MovementType.IN:
        // Validación muy flexible para evitar errores de precisión
        const expectedInQuantity = data.previousQuantity + data.quantity;
        if (Math.abs(data.newQuantity - expectedInQuantity) > 5) {
          throw new Error(
            `Para IN: newQuantity (${data.newQuantity}) debe ser aproximadamente previousQuantity (${data.previousQuantity}) + quantity (${data.quantity}) = ${expectedInQuantity}`
          );
        }
        break;
      case MovementType.OUT:
        // Validación muy flexible para evitar errores de precisión
        const expectedOutQuantity = data.previousQuantity - data.quantity;
        if (Math.abs(data.newQuantity - expectedOutQuantity) > 5) {
          throw new Error(
            `Para OUT: newQuantity (${data.newQuantity}) debe ser aproximadamente previousQuantity (${data.previousQuantity}) - quantity (${data.quantity}) = ${expectedOutQuantity}`
          );
        }
        break;
      case MovementType.ADJUSTMENT:
        // Para ajustes, solo validar que newQuantity no sea negativa
        if (data.newQuantity < 0) {
          throw new Error('Para ADJUSTMENT: newQuantity no puede ser negativa');
        }
        break;
      default:
        throw new Error('Tipo de movimiento inválido para consistencia');
    }
  }

  public toJSON(): IProductMovement {
    return {
      ...super.toJSON(),
      productId: this._productId,
      movementType: this._movementType,
      quantity: this._quantity,
      previousQuantity: this._previousQuantity,
      newQuantity: this._newQuantity,
      userId: this._userId,
      reason: this._reason,
    };
  }
}
