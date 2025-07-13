/**
 * @fileoverview Caso de uso para eliminar productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { IProductRepository } from '../../../01-domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para eliminar productos
 */
export class DeleteProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del producto
   * @throws {Error} Si hay un error en la eliminación
   */
  async execute(id: number): Promise<void> {
    try {
      // Validar ID
      if (!id || id <= 0) {
        throw new Error('ID de producto inválido');
      }

      // Verificar que el producto existe
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      // Verificar que no tenga stock (opcional, dependiendo de la lógica de negocio)
      if (existingProduct.quantity > 0) {
        throw new Error('No se puede eliminar un producto que tiene stock disponible');
      }

      // Eliminar producto (soft delete)
      await this.productRepository.delete(id);

      // Log de auditoría
      await this.logger.info('Producto eliminado exitosamente', {
        productId: id,
        sku: existingProduct.sku,
        name: existingProduct.name,
        action: 'DELETE_PRODUCT',
        metadata: {
          price: existingProduct.price,
          quantity: existingProduct.quantity,
          criticalStock: existingProduct.criticalStock,
          categoryId: existingProduct.categoryId,
          locationId: existingProduct.locationId,
          supplierId: existingProduct.supplierId
        }
      });

    } catch (error) {
      // Log de error
      await this.logger.error('Error al eliminar producto', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        productId: id,
        action: 'DELETE_PRODUCT'
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura
   * @param id - ID del producto
   * @returns Resultado de la operación
   */
  async executeSafe(id: number): Promise<{ success: true } | { success: false; error: string }> {
    try {
      await this.execute(id);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
}