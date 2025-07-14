import { IProductMovementRepository } from '../../../01-domain/repository/ProductMovementRepository';
import { ListProductMovementsResponseDTO } from '../../dto/productMovement/ListProductMovementsResponseDTO';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para listar movimientos de producto por producto
 * @author Daisy Castillo
 */
export class ListProductMovementsByProductUseCase {
  constructor(
    private productMovementRepository: IProductMovementRepository,
    private logger: LoggerWrapperInterface
  ) {}

  async execute(productId: number, page: number = 1, limit: number = 10): Promise<ListProductMovementsResponseDTO> {
    try {
      const all = await this.productMovementRepository.findByProduct(productId);
      const total = all.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = all.slice(start, end);
      const dtos: ProductMovementResponseDTO[] = paginated.map(m => ({
        id: m.id!,
        productId: m.productId,
        movementType: String(m.movementType),
        quantity: m.quantity,
        previousQuantity: m.previousQuantity,
        newQuantity: m.newQuantity,
        reason: m.reason ?? null,
        userId: m.userId,
        createdAt: m.createdAt!
      }));
      await this.logger.info('Movimientos de producto listados por producto', { productId, count: dtos.length });
      return { movements: dtos, total, page, limit, totalPages };
    } catch (error) {
      await this.logger.error('Error al listar movimientos de producto por producto', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        productId,
        page,
        limit,
        action: 'LIST_PRODUCT_MOVEMENTS_BY_PRODUCT'
      });
      throw error;
    }
  }
} 