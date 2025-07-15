/**
 * @fileoverview Caso de uso para listar movimientos de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../../base/BaseUseCase';
import { IProductMovementRepository } from '../../../domain/repository/ProductMovementRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  ProductMovementResponseDTO,
  ListProductMovementsResponseDTO,
} from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';

export class ListProductMovementsUseCase extends BaseListUseCase<ListProductMovementsResponseDTO> {
  constructor(
    private productMovementRepository: IProductMovementRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_PRODUCT_MOVEMENTS',
      entityName: 'Movimiento de Producto',
    });
  }

  protected async findAll(): Promise<ProductMovement[]> {
    return this.productMovementRepository.findAll();
  }

  protected isValidEntity(movement: ProductMovement): boolean {
    return !!movement;
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

  protected createListResponse(
    movements: ProductMovementResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): ListProductMovementsResponseDTO {
    return {
      movements,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
