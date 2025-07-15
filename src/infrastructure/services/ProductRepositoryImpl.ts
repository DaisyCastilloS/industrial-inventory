/**
 * @fileoverview Implementación del repositorio de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import { Product, IProduct, SKU } from '../../core/domain/entity/Product';
import { IProductRepository } from '../../core/domain/repository/ProductRepository';
import { ProductQueries } from '../db/sqlQueries/ProductQueries';
import { StockStatus } from '../../shared/constants/RoleTypes';
import { AuditLog } from '../../core/domain/entity/AuditLog';
import { pool } from '../db/database';
import { ServiceResult, RepositoryOptions } from './base/ServiceTypes';

export class ProductRepositoryImpl
  extends BaseRepositoryImpl<Product>
  implements IProductRepository
{
  protected tableName = 'products';
  protected entityClass = Product;

  /**
   * Añade relaciones a la consulta
   */
  protected addRelations(query: string): string {
    return query.replace(
      'FROM products',
      `FROM products 
      LEFT JOIN categories c ON products.category_id = c.id 
      LEFT JOIN locations l ON products.location_id = l.id 
      LEFT JOIN suppliers s ON products.supplier_id = s.id`
    );
  }

  /**
   * Busca un producto por SKU
   */
  async findBySku(sku: SKU | string): Promise<ServiceResult<Product | null>> {
    const result = await this.findByField('sku', sku);
    if (!result.success) return result;
    return {
      success: true,
      data: result.data[0] || null,
    };
  }

  /**
   * Busca productos por categoría
   */
  async findByCategory(
    categoryId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>> {
    return this.findByField('categoryId', categoryId, options);
  }

  /**
   * Busca productos por ubicación
   */
  async findByLocation(
    locationId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>> {
    return this.findByField('locationId', locationId, options);
  }

  /**
   * Busca productos por proveedor
   */
  async findBySupplier(
    supplierId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>> {
    return this.findByField('supplierId', supplierId, options);
  }

  /**
   * Busca productos por estado de stock
   */
  async findByStockStatus(
    status: StockStatus
  ): Promise<ServiceResult<Product[]>> {
    try {
      let query: string;
      switch (status) {
        case StockStatus.CRITICAL:
          query = ProductQueries.findCriticalStock;
          break;
        case StockStatus.OUT_OF_STOCK:
          query = ProductQueries.findOutOfStock;
          break;
        case StockStatus.NORMAL:
          query = ProductQueries.findNormalStock;
          break;
        default:
          return { success: true, data: [] };
      }
      const result = await pool.query(query);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Busca productos en stock crítico
   */
  async findCriticalStock(): Promise<ServiceResult<Product[]>> {
    return this.findByStockStatus(StockStatus.CRITICAL);
  }

  /**
   * Busca productos sin stock
   */
  async findOutOfStock(): Promise<ServiceResult<Product[]>> {
    return this.findByStockStatus(StockStatus.OUT_OF_STOCK);
  }

  /**
   * Busca productos por nombre
   */
  async searchByName(name: string): Promise<ServiceResult<Product[]>> {
    try {
      const result = await pool.query(ProductQueries.searchByName, [
        `%${name}%`,
      ]);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Actualiza el stock de un producto
   */
  async updateStock(
    id: number,
    quantity: number
  ): Promise<ServiceResult<Product>> {
    return this.update(id, { quantity } as Partial<Product>);
  }

  /**
   * Añade stock a un producto
   */
  async addStock(
    id: number,
    quantity: number
  ): Promise<ServiceResult<Product>> {
    const existingResult = await this.findById(id);
    if (!existingResult.success) return existingResult;

    const product = existingResult.data;
    const newQuantity = product.quantity + quantity;
    return this.update(id, { quantity: newQuantity } as Partial<Product>);
  }

  /**
   * Reduce stock de un producto
   */
  async reduceStock(
    id: number,
    quantity: number
  ): Promise<ServiceResult<Product>> {
    const existingResult = await this.findById(id);
    if (!existingResult.success) return existingResult;

    const product = existingResult.data;
    if (product.quantity < quantity) {
      return {
        success: false,
        error: new Error('Stock insuficiente para reducir'),
      };
    }
    const newQuantity = product.quantity - quantity;
    return this.update(id, { quantity: newQuantity } as Partial<Product>);
  }

  /**
   * Verifica si existe un producto con el SKU dado
   */
  async existsBySku(sku: SKU | string): Promise<boolean> {
    return this.existsByField('sku', sku);
  }

  /**
   * Obtiene estadísticas de inventario
   */
  async getInventoryStats(): Promise<
    ServiceResult<{
      totalProducts: number;
      activeProducts: number;
      criticalStockCount: number;
      outOfStockCount: number;
      totalValue: number;
    }>
  > {
    try {
      const result = await pool.query(ProductQueries.getInventoryStats);
      return {
        success: true,
        data: result.rows[0] || {
          totalProducts: 0,
          activeProducts: 0,
          criticalStockCount: 0,
          outOfStockCount: 0,
          totalValue: 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene el historial de auditoría de un producto
   */
  async getAuditTrail(
    productId: number
  ): Promise<ServiceResult<AuditLog<IProduct>[]>> {
    try {
      const result = await pool.query(ProductQueries.getAuditTrail, [
        productId,
      ]);
      return {
        success: true,
        data: result.rows.map((row: any) => new AuditLog<IProduct>(row)),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene productos con información completa
   */
  async getProductsFullInfo(
    options?: RepositoryOptions
  ): Promise<ServiceResult<any[]>> {
    try {
      let query = 'SELECT * FROM products_full_info';
      if (!options?.withDeleted) {
        query += ' WHERE is_active = true';
      }
      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
      }
      if (options?.limit) {
        query += ` LIMIT ${options.limit}`;
        if (options.page) {
          const offset = (options.page - 1) * options.limit;
          query += ` OFFSET ${offset}`;
        }
      }
      const result = await pool.query(query);
      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene productos en stock crítico
   */
  async getCriticalStockProducts(
    options?: RepositoryOptions
  ): Promise<ServiceResult<any[]>> {
    try {
      let query = 'SELECT * FROM critical_stock_products';
      if (!options?.withDeleted) {
        query += ' WHERE is_active = true';
      }
      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
      }
      if (options?.limit) {
        query += ` LIMIT ${options.limit}`;
        if (options.page) {
          const offset = (options.page - 1) * options.limit;
          query += ` OFFSET ${offset}`;
        }
      }
      const result = await pool.query(query);
      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
}
