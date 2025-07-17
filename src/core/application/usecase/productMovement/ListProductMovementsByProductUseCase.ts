/**
 * @fileoverview Caso de uso para listar movimientos de productos por producto
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUseCase } from '../../base/BaseUseCase';
import { ProductMovementRepositoryImpl } from '../../../../infrastructure/services/ProductMovementRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';

export class ListProductMovementsByProductUseCase extends BaseUseCase<
  number,
  ProductMovementResponseDTO[]
> {
  constructor(
    private productMovementRepository: ProductMovementRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_PRODUCT_MOVEMENTS_BY_PRODUCT',
      entityName: 'Movimiento de Producto',
    });
  }

  protected async executeInternal(
    productId: number
  ): Promise<ProductMovementResponseDTO[]> {
    const movements =
      await this.productMovementRepository.findByProduct(productId);
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
      reason: movement.reason || null,
      createdAt: movement.createdAt || new Date(),
    };
  }
}
