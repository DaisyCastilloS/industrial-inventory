

import { BaseGetByIdUseCase } from '../../base/BaseUseCase';
import { ProductMovementRepositoryImpl } from '../../../../infrastructure/services/ProductMovementRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class GetProductMovementByIdUseCase extends BaseGetByIdUseCase<ProductMovement, ProductMovementResponseDTO> {
  constructor(
    private productMovementRepository: ProductMovementRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'GET_PRODUCT_MOVEMENT_BY_ID',
      entityName: 'Movimiento de Producto',
    });
  }

  protected async findById(id: number): Promise<ServiceResult<ProductMovement>> {
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
      reason: movement.reason || null,
      createdAt: movement.createdAt || new Date(),
    };
  }
}
