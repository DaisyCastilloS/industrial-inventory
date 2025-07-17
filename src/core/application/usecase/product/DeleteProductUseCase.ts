/**
 * @fileoverview Caso de uso para eliminar productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseDeleteUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { Product } from '../../../domain/entity/Product';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class DeleteProductUseCase extends BaseDeleteUseCase<Product> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'DELETE_PRODUCT', entityName: 'Product' });
  }

  protected async findEntityById(id: number): Promise<ServiceResult<Product>> {
    return this.productRepository.findById(id);
  }

  protected async performDelete(id: number): Promise<ServiceResult<void>> {
    const product = await this.findEntityById(id);
    if (product.success && product.data && product.data.quantity > 0) {
      throw new Error('Cannot delete a product with available stock');
    }
    return this.productRepository.delete(id);
  }
}
