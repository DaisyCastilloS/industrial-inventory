import { BaseGetByIdUseCase, BaseListUseCase, BaseCreateUseCase, BaseUpdateUseCase, BaseDeleteUseCase } from '../../base/BaseUseCase';
import { Product } from '../../../domain/entity/Product';
import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { CreateProductDTO } from '../../dto/product/CreateProductDTO';
import { UpdateProductDTO } from '../../dto/product/UpdateProductDTO';
import { ProductResponseDTO } from '../../dto/product/ProductResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { ServiceResult, PaginatedResult } from '../../../../infrastructure/services/base/ServiceTypes';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export class GetProductByIdUseCase extends BaseGetByIdUseCase<Product, ProductResponseDTO> {
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

  protected mapToDTO(entity: Product): ProductResponseDTO {
    return {
      id: entity.id || 0,
      name: entity.name,
      description: entity.description || null,
      isActive: entity.isActive,
      sku: entity.sku,
      price: entity.price,
      quantity: entity.quantity,
      criticalStock: entity.criticalStock,
      categoryId: entity.categoryId,
      locationId: entity.locationId || null,
      supplierId: entity.supplierId || null,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
      stockStatus: entity.getStockStatus(),
      inventoryValue: entity.getInventoryValue()
    };
  }
}

export class ListProductsUseCase extends BaseListUseCase<Product, ProductResponseDTO> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'LIST_PRODUCTS', entityName: 'Product' });
  }

  protected async findAll(filters?: Record<string, any>): Promise<ServiceResult<PaginatedResult<Product>>> {
    return this.productRepository.findAll(filters);
  }

  protected mapToDTO(entity: Product): ProductResponseDTO {
    return {
      id: entity.id || 0,
      name: entity.name,
      description: entity.description || null,
      isActive: entity.isActive,
      sku: entity.sku,
      price: entity.price,
      quantity: entity.quantity,
      criticalStock: entity.criticalStock,
      categoryId: entity.categoryId,
      locationId: entity.locationId || null,
      supplierId: entity.supplierId || null,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
      stockStatus: entity.getStockStatus(),
      inventoryValue: entity.getInventoryValue()
    };
  }
}

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
  }

  protected async performCreate(data: CreateProductDTO): Promise<ServiceResult<Product>> {
    const product = new Product({
      name: data.name,
      description: data.description,
      isActive: data.is_active ?? true,
      sku: data.sku,
      price: data.price,
      quantity: data.quantity,
      criticalStock: data.critical_stock,
      categoryId: data.category_id,
      locationId: data.location_id,
      supplierId: data.supplier_id
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

export class UpdateProductUseCase extends BaseUpdateUseCase<UpdateProductDTO & { id: number }, Product> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'UPDATE_PRODUCT', entityName: 'Product' });
  }

  protected async validateUpdateInput(input: UpdateProductDTO & { id: number }): Promise<void> {
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Product name cannot be empty');
    }
    if (input.sku !== undefined && input.sku.trim() === '') {
      throw new Error('Product SKU cannot be empty');
    }
  }

  protected async findEntityById(id: number): Promise<ServiceResult<Product>> {
    return this.productRepository.findById(id);
  }

  protected async performUpdate(current: Product, input: UpdateProductDTO & { id: number }): Promise<ServiceResult<Product>> {
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
    return this.productRepository.delete(id);
  }
}
