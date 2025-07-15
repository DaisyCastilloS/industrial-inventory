import { IProductRepository } from '../../../domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  ProductFullResponseDTO,
  ProductListResponseDTO,
} from '../../dto/product/ProductResponseDTO';
import {
  CreateProductDTO,
  validateCreateProduct,
} from '../../dto/product/CreateProductDTO';
import {
  UpdateProductDTO,
  validateUpdateProduct,
} from '../../dto/product/UpdateProductDTO';
import {
  BaseGetByIdUseCase,
  BaseListUseCase,
  BaseCreateUseCase,
  BaseUpdateUseCase,
  BaseDeleteUseCase,
} from '../../base/BaseUseCase';
import { Product, IProduct, SKU } from '../../../domain/entity/Product';

export class OptimizedGetProductByIdUseCase extends BaseGetByIdUseCase<ProductFullResponseDTO> {
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

export class OptimizedListProductsUseCase extends BaseListUseCase<ProductListResponseDTO> {
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

export class OptimizedCreateProductUseCase extends BaseCreateUseCase<
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

export class OptimizedUpdateProductUseCase extends BaseUpdateUseCase<
  UpdateProductDTO,
  ProductFullResponseDTO
> {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'UPDATE_PRODUCT', entityName: 'Producto' });
  }

  protected async findById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  protected validateInput(input: UpdateProductDTO): void {
    validateUpdateProduct(input);
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

  protected validateUpdatedEntity(product: Product): void {
    if (!product) {
      throw new Error('Error al actualizar el producto');
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

export class OptimizedDeleteProductUseCase extends BaseDeleteUseCase {
  constructor(
    private productRepository: IProductRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'DELETE_PRODUCT', entityName: 'Producto' });
  }

  protected async findById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  protected async deleteEntity(id: number): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (product && product.quantity > 0) {
      throw new Error(
        'No se puede eliminar un producto que tiene stock disponible'
      );
    }
    await this.productRepository.delete(id);
  }
}
