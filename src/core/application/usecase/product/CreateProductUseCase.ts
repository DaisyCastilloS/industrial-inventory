/**
 * @fileoverview Caso de uso para crear productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { CreateProductDTO } from '../../dto/product/CreateProductDTO';
import { Product } from '../../../domain/entity/Product';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class CreateProductUseCase extends BaseCreateUseCase<CreateProductDTO, Product> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'CREATE_PRODUCT', entityName: 'Product' });
  }

  protected async validateCreateInput(input: CreateProductDTO): Promise<void> {
    if (!input.name || !input.sku) {
      throw new Error('Product name and SKU are required');
    }
    
    const existingProduct = await this.productRepository.findBySku(input.sku);
    if (existingProduct.success && existingProduct.data) {
      throw new Error('A product with this SKU already exists');
    }
  }

  protected async performCreate(input: CreateProductDTO): Promise<ServiceResult<Product>> {
    const product = new Product({
      name: input.name,
      description: input.description,
      isActive: input.is_active ?? true,
      sku: input.sku,
      price: input.price,
      quantity: input.quantity,
      criticalStock: input.critical_stock,
      categoryId: input.category_id,
      locationId: input.location_id,
      supplierId: input.supplier_id
    });

    return this.productRepository.create(product);
  }

  protected async validateCreatedEntity(entity: Product): Promise<void> {
    if (!entity || !entity.name || !entity.sku) {
      throw new Error('Invalid product entity');
    }
    // Validar solo que tenga ID, no createdAt/updatedAt
    if (!entity.id) {
      throw new Error('Product entity must have an ID after creation');
    }
  }
}
