/**
 * @fileoverview Caso de uso para crear productos
 * @author Daisy Castillo
 * @version 1.0.1
 */

import { Product, IProduct, SKU } from '../../../01-domain/entity/Product';
import { IProductRepository } from '../../../01-domain/repository/ProductRepository';
import { CreateProductDTO, validateCreateProduct } from '../../dto/product/CreateProductDTO';
import { ProductResponseDTO } from '../../dto/product/ProductResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { StockStatus } from '../../../00-constants/RoleTypes';

/**
 * Caso de uso para crear productos
 */
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para crear un producto.
   * @param data - Datos del producto a crear
   * @returns Producto creado (DTO de respuesta)
   * @throws {Error} Si hay un error en la validación o creación
   */
  async execute(data: CreateProductDTO): Promise<ProductResponseDTO> {
    try {
      // Validar datos de entrada
      const validatedData = validateCreateProduct(data);

      // Verificar si el SKU ya existe
      const existingProduct = await this.productRepository.findBySku(validatedData.sku as SKU);
      if (existingProduct) {
        throw new Error('Ya existe un producto con este SKU');
      }

      // Crear entidad de producto
      const productData: IProduct = {
        name: validatedData.name,
        description: validatedData.description,
        sku: validatedData.sku as SKU,
        price: validatedData.price,
        quantity: validatedData.quantity,
        criticalStock: validatedData.criticalStock,
        categoryId: validatedData.categoryId,
        locationId: validatedData.locationId,
        supplierId: validatedData.supplierId,
        isActive: validatedData.isActive
      };

      const product = new Product(productData);

      // Persistir producto
      const createdProduct = await this.productRepository.create(product);

      // Determinar estado del stock
      const stockStatus = createdProduct.getStockStatus();

      // Log de auditoría
      await this.logger.info('Producto creado exitosamente', {
        productId: createdProduct.id,
        sku: createdProduct.sku,
        name: createdProduct.name,
        action: 'CREATE_PRODUCT',
        metadata: {
          price: createdProduct.price,
          quantity: createdProduct.quantity,
          criticalStock: createdProduct.criticalStock,
          stockStatus,
          categoryId: createdProduct.categoryId,
          locationId: createdProduct.locationId,
          supplierId: createdProduct.supplierId
        }
      });

      // Alertar si está en stock crítico
      if (stockStatus === StockStatus.CRITICAL) {
        await this.logger.warn('Producto creado en stock crítico', {
          productId: createdProduct.id,
          sku: createdProduct.sku,
          name: createdProduct.name,
          quantity: createdProduct.quantity,
          criticalStock: createdProduct.criticalStock,
          action: 'CRITICAL_STOCK_ALERT'
        });
      }

      // Retornar respuesta
      return {
        id: createdProduct.id!,
        name: createdProduct.name,
        description: createdProduct.description || null,
        sku: createdProduct.sku,
        price: createdProduct.price,
        quantity: createdProduct.quantity,
        criticalStock: createdProduct.criticalStock,
        categoryId: createdProduct.categoryId,
        locationId: createdProduct.locationId || null,
        supplierId: createdProduct.supplierId || null,
        isActive: createdProduct.isActive,
        stockStatus,
        inventoryValue: createdProduct.getInventoryValue(),
        createdAt: createdProduct.createdAt!,
        updatedAt: createdProduct.updatedAt!
      };

    } catch (error) {
      // Log de error
      await this.logger.error('Error al crear producto', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        data: { sku: data.sku, name: data.name, categoryId: data.categoryId },
        action: 'CREATE_PRODUCT'
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura, capturando errores y retornando un resultado tipado.
   * @param data - Datos del producto a crear
   * @returns Resultado de la operación (éxito o error)
   */
  async executeSafe(data: CreateProductDTO): Promise<{ success: true; data: ProductResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(data);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
}
