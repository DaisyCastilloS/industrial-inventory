/**
 * @fileoverview Caso de uso para actualizar productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUpdateUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { UpdateProductDTO } from '../../dto/product/UpdateProductDTO';
import { Product } from '../../../domain/entity/Product';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export interface UpdateProductInput extends UpdateProductDTO {
  id: number;
}

export class UpdateProductUseCase extends BaseUpdateUseCase<UpdateProductInput, Product> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'UPDATE_PRODUCT', entityName: 'Product' });
  }

  protected async validateUpdateInput(input: UpdateProductInput): Promise<void> {
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Product name cannot be empty');
    }
    if (input.sku !== undefined && input.sku.trim() === '') {
      throw new Error('Product SKU cannot be empty');
    }

    if (input.sku) {
      const existingProduct = await this.productRepository.findBySku(input.sku);
      if (existingProduct.success && existingProduct.data && existingProduct.data.id !== input.id) {
        throw new Error('A product with this SKU already exists');
      }
    }
  }

  protected async findEntityById(id: number): Promise<ServiceResult<Product>> {
    return this.productRepository.findById(id);
  }

  protected async performUpdate(current: Product, input: UpdateProductInput): Promise<ServiceResult<Product>> {
    const updatedProduct = new Product({
      ...current,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      isActive: input.isActive ?? current.isActive,
      sku: input.sku ?? current.sku,
      price: input.price ?? current.price,
      quantity: input.quantity ?? current.quantity,
      criticalStock: input.criticalStock ?? current.criticalStock,
      categoryId: input.categoryId ?? current.categoryId,
      locationId: input.locationId ?? current.locationId,
      supplierId: input.supplierId ?? current.supplierId
    });

    return this.productRepository.update(input.id, updatedProduct);
  }

  protected async validateUpdatedEntity(entity: Product): Promise<void> {
    if (!entity || !entity.name || !entity.sku) {
      throw new Error('Invalid product entity');
    }
    // Validar solo que tenga ID, no createdAt/updatedAt
    if (!entity.id) {
      throw new Error('Product entity must have an ID after update');
    }
  }
}
