import { IProductMovementRepository } from '../../../01-domain/repository/ProductMovementRepository';
import { CreateProductMovementDTO, validateCreateProductMovement } from '../../dto/productMovement/CreateProductMovementDTO';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductMovement } from '../../../01-domain/entity/ProductMovement';

/**
 * Caso de uso para crear un movimiento de producto
 * @author Daisy Castillo
 */
export class CreateProductMovementUseCase {
  constructor(
    private productMovementRepository: IProductMovementRepository,
    private logger: LoggerWrapperInterface
  ) {}

  async execute(data: CreateProductMovementDTO): Promise<ProductMovementResponseDTO> {
    try {
      const validated = validateCreateProductMovement(data);
      const movement = new ProductMovement(validated);
      const created = await this.productMovementRepository.create(movement);
      await this.logger.info('Movimiento de producto creado', { movementId: created.id });
      return {
        id: created.id!,
        productId: created.productId,
        movementType: String(created.movementType),
        quantity: created.quantity,
        previousQuantity: created.previousQuantity,
        newQuantity: created.newQuantity,
        reason: created.reason ?? null,
        userId: created.userId,
        createdAt: created.createdAt!
      };
    } catch (error) {
      await this.logger.error('Error al crear movimiento de producto', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        data,
        action: 'CREATE_PRODUCT_MOVEMENT'
      });
      throw error;
    }
  }
} 