/**
 * @fileoverview Caso de uso para listar productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../../base/BaseUseCase';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  ProductFullResponseDTO,
  ProductListResponseDTO,
} from '../../dto/product/ProductResponseDTO';
import { Product } from '../../../domain/entity/Product';

export class ListProductsUseCase extends BaseListUseCase<ProductListResponseDTO> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'LIST_PRODUCTS', entityName: 'Producto' });
  }

  protected async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  protected isValidEntity(product: Product): boolean {
    return !!product;
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

  protected createListResponse(
    products: ProductFullResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): ProductListResponseDTO {
    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
