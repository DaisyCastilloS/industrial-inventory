/**
 * @fileoverview Caso de uso para obtener producto por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseGetByIdUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductFullResponseDTO } from '../../dto/product/ProductResponseDTO';
import { Product } from '../../../domain/entity/Product';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class GetProductByIdUseCase extends BaseGetByIdUseCase<Product, ProductFullResponseDTO> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'GET_PRODUCT_BY_ID', entityName: 'Product' });
  }

  protected async findById(id: number): Promise<ServiceResult<Product>> {
    return this.productRepository.findById(id);
  }

  protected async validateEntity(entity: Product): Promise<void> {
    if (!entity || !entity.name || !entity.sku) {
      throw new Error('Invalid product entity');
    }
  }

  protected mapToDTO(product: Product): ProductFullResponseDTO {
    return {
      id: product.id || 0,
      name: product.name,
      description: product.description || null,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      criticalStock: product.criticalStock,
      categoryId: product.categoryId,
      locationId: product.locationId || null,
      supplierId: product.supplierId || null,
      isActive: product.isActive,
      stockStatus: product.getStockStatus(),
      inventoryValue: product.getInventoryValue(),
      createdAt: product.createdAt || new Date(),
      updatedAt: product.updatedAt || new Date(),
      categoryName: null,
      locationName: null,
      supplierName: null,
    };
  }

  public async execute(id: number): Promise<ProductFullResponseDTO> {
    const result = await this.findById(id);
    if (!result.success || !result.data) {
      throw new Error('Product not found');
    }
    await this.validateEntity(result.data);
    return this.mapToDTO(result.data);
  }
}
