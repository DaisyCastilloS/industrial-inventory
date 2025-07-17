/**
 * @fileoverview Caso de uso para listar productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ProductFullResponseDTO } from '../../dto/product/ProductResponseDTO';
import { Product } from '../../../domain/entity/Product';
import { ServiceResult, PaginatedResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class ListProductsUseCase extends BaseListUseCase<Product, ProductFullResponseDTO> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'LIST_PRODUCTS', entityName: 'Product' });
  }

  protected async findAll(filters?: Record<string, any>): Promise<ServiceResult<PaginatedResult<Product>>> {
    return this.productRepository.findAll(filters);
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
}
