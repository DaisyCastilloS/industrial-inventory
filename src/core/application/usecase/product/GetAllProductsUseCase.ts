/**
 * @fileoverview Use Case optimizado para obtener todos los productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseGetAllUseCase } from '../../base/BaseGetAllUseCase';
import { Product } from '../../../domain/entity/Product';
import { ProductResponseDTO } from '../../dto/product/ProductResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class OptimizedGetAllProductsUseCase extends BaseGetAllUseCase<
  Product,
  ProductResponseDTO
> {
  constructor() {
    super();
  }

  protected getEntityName(): string {
    return 'Product';
  }

  protected mapToResponseDTO(entity: Product): ProductResponseDTO {
    return DTOMapper.mapToResponseDTO(entity, ProductResponseDTO);
  }
}
