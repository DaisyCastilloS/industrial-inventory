/**
 * @fileoverview Caso de uso para obtener producto por ID
 * @author Daisy Castillo
 * @version 1.0.1
 */

import { IProductRepository } from '../../../01-domain/repository/ProductRepository';
import { ProductResponseDTO } from '../../dto/product/ProductResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { StockStatus } from '../../../00-constants/RoleTypes';

/**
 * Caso de uso para obtener producto por ID
 */
export class GetProductByIdUseCase {
  constructor(
    private productRepository: IProductRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para obtener un producto por su ID.
   * @param id - ID numérico del producto a consultar
   * @returns DTO de respuesta del producto encontrado
   * @throws {Error} Si el producto no existe o el ID es inválido
   */
  async execute(id: number): Promise<ProductResponseDTO> {
    try {
      // Validar ID
      if (!id || id <= 0) {
        throw new Error('ID de producto inválido');
      }

      // Buscar producto
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      // Determinar estado del stock
      const stockStatus = product.getStockStatus();

      // Log de auditoría
      await this.logger.info('Producto consultado exitosamente', {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        action: 'GET_PRODUCT_BY_ID',
        metadata: {
          price: product.price,
          quantity: product.quantity,
          criticalStock: product.criticalStock,
          stockStatus,
          categoryId: product.categoryId,
          locationId: product.locationId,
          supplierId: product.supplierId
        }
      });

      // Retornar respuesta
      return {
        id: product.id!,
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
        stockStatus,
        inventoryValue: product.getInventoryValue(),
        createdAt: product.createdAt!,
        updatedAt: product.updatedAt!
      };

    } catch (error) {
      // Log de error
      await this.logger.error('Error al obtener producto por ID', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        productId: id,
        action: 'GET_PRODUCT_BY_ID'
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura, capturando errores y retornando un resultado tipado.
   * @param id - ID numérico del producto a consultar
   * @returns Resultado de la operación (éxito o error)
   */
  async executeSafe(id: number): Promise<{ success: true; data: ProductResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(id);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
}