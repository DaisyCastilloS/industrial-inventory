/**
 * @fileoverview Caso de uso para listar productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { IProductRepository } from '../../../01-domain/repository/ProductRepository';
import { ProductListResponseDTO } from '../../dto/product/ProductResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { StockStatus } from '../../../00-constants/RoleTypes';

/**
 * Interfaz para filtros de búsqueda de productos
 */
export interface ProductFilters {
  categoryId?: number;
  locationId?: number;
  supplierId?: number;
  stockStatus?: StockStatus;
  isActive?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Interfaz para opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Caso de uso para listar productos
 */
export class ListProductsUseCase {
  constructor(
    private productRepository: IProductRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param filters - Filtros de búsqueda
   * @param pagination - Opciones de paginación
   * @returns Lista de productos
   */
  async execute(filters?: ProductFilters, pagination?: PaginationOptions): Promise<ProductListResponseDTO> {
    try {
      // Obtener todos los productos
      let products = await this.productRepository.findAll();

      // Aplicar filtros
      if (filters?.categoryId) {
        products = products.filter(product => product.categoryId === filters.categoryId);
      }

      if (filters?.locationId) {
        products = products.filter(product => product.locationId === filters.locationId);
      }

      if (filters?.supplierId) {
        products = products.filter(product => product.supplierId === filters.supplierId);
      }

      if (filters?.stockStatus) {
        products = products.filter(product => product.getStockStatus() === filters.stockStatus);
      }

      if (filters?.isActive !== undefined) {
        products = products.filter(product => product.isActive === filters.isActive);
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          (product.description && product.description.toLowerCase().includes(searchTerm))
        );
      }

      if (filters?.minPrice !== undefined) {
        products = products.filter(product => product.price >= filters.minPrice!);
      }

      if (filters?.maxPrice !== undefined) {
        products = products.filter(product => product.price <= filters.maxPrice!);
      }

      // Aplicar paginación
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      // Convertir a DTOs de respuesta
      const productDTOs = paginatedProducts.map(product => ({
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
        stockStatus: product.getStockStatus(),
        inventoryValue: product.getInventoryValue(),
        categoryName: null, // Se llenaría con información adicional si fuera necesario
        locationName: null, // Se llenaría con información adicional si fuera necesario
        supplierName: null, // Se llenaría con información adicional si fuera necesario
        createdAt: product.createdAt!,
        updatedAt: product.updatedAt!
      }));

      // Calcular información de paginación
      const total = products.length;
      const totalPages = Math.ceil(total / limit);

      // Log de auditoría
      await this.logger.info('Lista de productos consultada exitosamente', {
        action: 'LIST_PRODUCTS',
        metadata: {
          totalProducts: total,
          filteredCount: products.length,
          returnedCount: productDTOs.length,
          page,
          limit,
          totalPages,
          filters: filters || {},
          pagination: pagination || {}
        }
      });

      return {
        products: productDTOs,
        total,
        page,
        limit,
        totalPages
      };

    } catch (error) {
      // Log de error
      await this.logger.error('Error al listar productos', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        action: 'LIST_PRODUCTS',
        filters,
        pagination
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura
   * @param filters - Filtros de búsqueda
   * @param pagination - Opciones de paginación
   * @returns Resultado de la operación
   */
  async executeSafe(filters?: ProductFilters, pagination?: PaginationOptions): Promise<{ success: true; data: ProductListResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(filters, pagination);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
} 