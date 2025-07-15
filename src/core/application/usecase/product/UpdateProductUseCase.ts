/**
 * @fileoverview Caso de uso para actualizar productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUpdateUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  UpdateProductDTO,
  validateUpdateProduct,
} from '../../dto/product/UpdateProductDTO';
import { ProductFullResponseDTO } from '../../dto/product/ProductResponseDTO';
import { Product } from '../../../domain/entity/Product';

export class UpdateProductUseCase extends BaseUpdateUseCase<
  UpdateProductDTO,
  ProductFullResponseDTO
> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'UPDATE_PRODUCT', entityName: 'Producto' });
  }

  protected validateInput(input: UpdateProductDTO): void {
    validateUpdateProduct(input);
  }

  protected async findById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  protected async updateEntity(
    id: number,
    data: UpdateProductDTO
  ): Promise<Product> {
    if (data.sku) {
      const existingProduct = await this.productRepository.findById(id);
      if (existingProduct && data.sku !== existingProduct.sku) {
        const productWithSku = await this.productRepository.findBySku(data.sku);
        if (productWithSku) {
          throw new Error('Ya existe un producto con este SKU');
        }
      }
    }
    return this.productRepository.update(id, data);
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
