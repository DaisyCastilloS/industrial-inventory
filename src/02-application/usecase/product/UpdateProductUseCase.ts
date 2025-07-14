/**
 * @fileoverview Caso de uso para actualizar productos
 * @author Daisy Castillo
 * @version 1.0.1
 */

import { IProductRepository } from '../../../01-domain/repository/ProductRepository';
import { UpdateProductDTO, validateUpdateProduct } from '../../dto/product/UpdateProductDTO';
import { ProductResponseDTO } from '../../dto/product/ProductResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { StockStatus } from '../../../00-constants/RoleTypes';

/**
 * Caso de uso para actualizar productos
 */
export class UpdateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para actualizar un producto.
   * @param id - ID numérico del producto a actualizar
   * @param data - Datos a actualizar (DTO)
   * @returns DTO del producto actualizado
   * @throws {Error} Si hay un error en la validación o actualización
   */
  async execute(id: number, data: UpdateProductDTO): Promise<ProductResponseDTO> {
    try {
      this.validateId(id);
      const validatedData = validateUpdateProduct(data);
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }
      // Validar SKU único si se actualiza
      if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
        const productWithSku = await this.productRepository.findBySku(validatedData.sku);
        if (productWithSku) {
          throw new Error('Ya existe un producto con este SKU');
        }
      }
      // Preparar datos de actualización
      const updateData = this.prepareUpdateData(validatedData);
      const updatedProduct = await this.productRepository.update(id, updateData);
      const stockStatus = updatedProduct.getStockStatus();
      await this.logger.info('Producto actualizado exitosamente', {
        productId: updatedProduct.id,
        sku: updatedProduct.sku,
        name: updatedProduct.name,
        action: 'UPDATE_PRODUCT',
        metadata: {
          updatedFields: Object.keys(updateData),
          price: updatedProduct.price,
          quantity: updatedProduct.quantity,
          criticalStock: updatedProduct.criticalStock,
          stockStatus,
          categoryId: updatedProduct.categoryId,
          locationId: updatedProduct.locationId,
          supplierId: updatedProduct.supplierId
        }
      });
      if (stockStatus === StockStatus.CRITICAL) {
        await this.logger.warn('Producto actualizado en stock crítico', {
          productId: updatedProduct.id,
          sku: updatedProduct.sku,
          name: updatedProduct.name,
          quantity: updatedProduct.quantity,
          criticalStock: updatedProduct.criticalStock,
          action: 'CRITICAL_STOCK_ALERT'
        });
      }
      return {
        id: updatedProduct.id!,
        name: updatedProduct.name,
        description: updatedProduct.description || null,
        sku: updatedProduct.sku,
        price: updatedProduct.price,
        quantity: updatedProduct.quantity,
        criticalStock: updatedProduct.criticalStock,
        categoryId: updatedProduct.categoryId,
        locationId: updatedProduct.locationId || null,
        supplierId: updatedProduct.supplierId || null,
        isActive: updatedProduct.isActive,
        stockStatus,
        inventoryValue: updatedProduct.getInventoryValue(),
        createdAt: updatedProduct.createdAt!,
        updatedAt: updatedProduct.updatedAt!
      };
    } catch (error) {
      await this.logger.error('Error al actualizar producto', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        productId: id,
        data: data,
        action: 'UPDATE_PRODUCT'
      });
      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura, capturando errores y retornando un resultado tipado.
   * @param id - ID numérico del producto a actualizar
   * @param data - Datos a actualizar (DTO)
   * @returns Resultado de la operación (éxito o error)
   */
  async executeSafe(id: number, data: UpdateProductDTO): Promise<{ success: true; data: ProductResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(id, data);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Valida el ID del producto
   * @param id - ID a validar
   * @throws {Error} Si el ID es inválido
   */
  private validateId(id: number): void {
    if (!id || id <= 0) {
      throw new Error('ID de producto inválido');
    }
  }

  /**
   * Prepara los datos de actualización a partir de los datos validados
   * @param validatedData - Datos validados
   * @returns Objeto con los campos a actualizar
   */
  private prepareUpdateData(validatedData: UpdateProductDTO): Partial<UpdateProductDTO> {
    const updateData: Partial<UpdateProductDTO> = {};
    // Usar switch/case si en el futuro hay lógica de selección múltiple
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.sku !== undefined) updateData.sku = validatedData.sku;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.quantity !== undefined) updateData.quantity = validatedData.quantity;
    if (validatedData.criticalStock !== undefined) updateData.criticalStock = validatedData.criticalStock;
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId;
    if (validatedData.locationId !== undefined) updateData.locationId = validatedData.locationId;
    if (validatedData.supplierId !== undefined) updateData.supplierId = validatedData.supplierId;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    return updateData;
  }
}