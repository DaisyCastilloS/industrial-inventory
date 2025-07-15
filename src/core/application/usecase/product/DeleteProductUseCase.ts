/**
 * @fileoverview Caso de uso para eliminar productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseDeleteUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { Product } from '../../../domain/entity/Product';

export class DeleteProductUseCase extends BaseDeleteUseCase {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'DELETE_PRODUCT', entityName: 'Producto' });
  }

  protected async findById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  protected async deleteEntity(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}
