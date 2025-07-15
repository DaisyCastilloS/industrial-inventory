/**
 * @fileoverview Caso de uso para listar movimientos de productos por usuario
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUseCase } from '../../base/BaseUseCase';
import { IProductMovementRepository } from '../../../domain/repository/ProductMovementRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';

export class ListProductMovementsByUserUseCase extends BaseUseCase<
  number,
  ProductMovementResponseDTO[]
> {
  constructor(
    private productMovementRepository: IProductMovementRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_PRODUCT_MOVEMENTS_BY_USER',
      entityName: 'Movimiento de Producto',
    });
  }

  protected async executeInternal(
    userId: number
  ): Promise<ProductMovementResponseDTO[]> {
    const movements = await this.productMovementRepository.findByUser(userId);
    return movements.map(movement => this.mapToDTO(movement));
  }

  private mapToDTO(movement: ProductMovement): ProductMovementResponseDTO {
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
