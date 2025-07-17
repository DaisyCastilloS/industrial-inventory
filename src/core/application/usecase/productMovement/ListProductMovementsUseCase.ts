/**
 * @fileoverview Caso de uso para listar movimientos de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../../base/BaseUseCase';
import { ProductMovementRepositoryImpl } from '../../../../infrastructure/services/ProductMovementRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';
import { ServiceResult, PaginatedResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class ListProductMovementsUseCase extends BaseListUseCase<ProductMovement, ProductMovementResponseDTO> {
  constructor(
    private productMovementRepository: ProductMovementRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_PRODUCT_MOVEMENTS',
      entityName: 'Movimiento de Producto',
    });
  }

  protected async findAll(filters?: Record<string, any>): Promise<ServiceResult<PaginatedResult<ProductMovement>>> {
    const result = await this.productMovementRepository.findAll(filters);
    // Always return a valid paginated result, even if no data
    if (!result.success || !result.data) {
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          totalPages: 0,
        },
      };
    }
    return result;
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

  protected createListResponse(
    dtos: ProductMovementResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): any {
    return {
      movements: dtos,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
