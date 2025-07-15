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

export class GetProductByIdUseCase extends BaseGetByIdUseCase<ProductFullResponseDTO> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'GET_PRODUCT_BY_ID', entityName: 'Producto' });
  }

  protected async findById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  protected validateEntity(product: Product): void {
    if (!product) {
      throw new Error('Producto no encontrado');
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
}
