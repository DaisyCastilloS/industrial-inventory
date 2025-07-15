import { ProductMovementResponseDTO } from './ProductMovementResponseDTO';

/**
 * DTO de respuesta paginada para movimientos de producto
 * @author Daisy Castillo
 */
export interface ListProductMovementsResponseDTO {
  movements: ProductMovementResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
