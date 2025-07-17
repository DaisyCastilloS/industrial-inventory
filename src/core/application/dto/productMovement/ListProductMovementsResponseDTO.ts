import { ProductMovementResponseDTO } from './ProductMovementResponseDTO';

export interface ListProductMovementsResponseDTO {
  movements: ProductMovementResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
