/**
 * @fileoverview Caso de uso para crear movimientos de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../../base/BaseUseCase';
import { IProductMovementRepository } from '../../../domain/repository/ProductMovementRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  CreateProductMovementDTO,
  validateCreateProductMovement,
} from '../../dto/productMovement/CreateProductMovementDTO';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';

export class CreateProductMovementUseCase extends BaseCreateUseCase<
  CreateProductMovementDTO,
  ProductMovementResponseDTO
> {
  constructor(
    private productMovementRepository: IProductMovementRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'CREATE_PRODUCT_MOVEMENT',
      entityName: 'Movimiento de Producto',
    });
  }

  protected validateInput(input: CreateProductMovementDTO): void {
    validateCreateProductMovement(input);
  }

  protected async createEntity(
    data: CreateProductMovementDTO
  ): Promise<ProductMovement> {
    return this.productMovementRepository.create(data);
  }

  protected validateCreatedEntity(movement: ProductMovement): void {
    if (!movement) {
      throw new Error('Error al crear el movimiento de producto');
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
