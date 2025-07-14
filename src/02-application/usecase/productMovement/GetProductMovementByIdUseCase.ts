import { IProductMovementRepository } from '../../../01-domain/repository/ProductMovementRepository';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para obtener un movimiento de producto por ID
 * @author Daisy Castillo
 */
export class GetProductMovementByIdUseCase {
  constructor(
    private productMovementRepository: IProductMovementRepository,
    private logger: LoggerWrapperInterface
  ) {}

  async execute(id: number): Promise<ProductMovementResponseDTO> {
    try {
      const movement = await this.productMovementRepository.findById(id);
      if (!movement) {
        throw new Error(`Movimiento de producto con ID ${id} no encontrado`);
      }
      await this.logger.info('Movimiento de producto consultado', { movementId: id });
      return {
        id: movement.id!,
        productId: movement.productId,
        movementType: String(movement.movementType),
        quantity: movement.quantity,
        previousQuantity: movement.previousQuantity,
        newQuantity: movement.newQuantity,
        reason: movement.reason ?? null,
        userId: movement.userId,
        createdAt: movement.createdAt!
      };
    } catch (error) {
      await this.logger.error('Error al consultar movimiento de producto', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        action: 'GET_PRODUCT_MOVEMENT_BY_ID'
      });
      throw error;
    }
  }
} 