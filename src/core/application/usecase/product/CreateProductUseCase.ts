/**
 * @fileoverview Caso de uso para crear productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  CreateProductDTO,
  validateCreateProduct,
} from '../../dto/product/CreateProductDTO';
import { ProductFullResponseDTO } from '../../dto/product/ProductResponseDTO';
import { Product, IProduct, SKU } from '../../../domain/entity/Product';

export class CreateProductUseCase extends BaseCreateUseCase<
  CreateProductDTO,
  ProductFullResponseDTO
> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'CREATE_PRODUCT', entityName: 'Producto' });
  }

  protected validateInput(input: CreateProductDTO): void {
    validateCreateProduct(input);
  }

  protected async createEntity(data: CreateProductDTO): Promise<Product> {
    const existingProduct = await this.productRepository.findBySku(
      data.sku as SKU
    );
    if (existingProduct) {
      throw new Error('Ya existe un producto con este SKU');
    }

    const productData: IProduct = {
      name: data.name,
      description: data.description,
      sku: data.sku as SKU,
      price: data.price,
      quantity: data.quantity,
      criticalStock: data.criticalStock,
      categoryId: data.categoryId,
      locationId: data.locationId,
      supplierId: data.supplierId,
      isActive: data.isActive,
    };

    const product = new Product(productData);
    return this.productRepository.create(product);
  }

  protected validateCreatedEntity(product: Product): void {
    if (!product) {
      throw new Error('Error al crear el producto');
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
