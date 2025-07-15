/**
 * @fileoverview Caso de uso para obtener movimiento de producto por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseGetByIdUseCase } from '../../base/BaseUseCase';
import { IProductMovementRepository } from '../../../domain/repository/ProductMovementRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';

export class GetProductMovementByIdUseCase extends BaseGetByIdUseCase<ProductMovementResponseDTO> {
  constructor(
    private productMovementRepository: IProductMovementRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'GET_PRODUCT_MOVEMENT_BY_ID',
      entityName: 'Movimiento de Producto',
    });
  }

  protected async findById(id: number): Promise<ProductMovement | null> {
    return this.productMovementRepository.findById(id);
  }

  protected validateEntity(movement: ProductMovement): void {
    if (!movement) {
      throw new Error('Movimiento de producto no encontrado');
    }
  }

  protected mapToDTO(movement: ProductMovement): ProductMovementResponseDTO {
    return {
      id: movement.id || 0,
      productId: movement.productId,
      userId: movement.userId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      reason: movement.reason,
      notes: movement.notes || null,
      createdAt: movement.createdAt || new Date(),
      updatedAt: movement.updatedAt || new Date(),
    };
  }
}
