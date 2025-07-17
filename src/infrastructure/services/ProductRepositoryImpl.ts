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

  protected addRelations(query: string): string {
    return query.replace(
      'FROM products',
      `FROM products 
      LEFT JOIN categories c ON products.category_id = c.id 
      LEFT JOIN locations l ON products.location_id = l.id 
      LEFT JOIN suppliers s ON products.supplier_id = s.id`
    );
  }

  async findBySku(sku: SKU | string): Promise<ServiceResult<Product | null>> {
    try {
      const result = await pool.query(
        'SELECT * FROM products WHERE sku = $1 AND is_active = true',
        [sku]
      );
      return {
        success: true,
        data: result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async findByCategory(
    categoryId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>> {
    return this.findByField('categoryId', categoryId, options);
  }

  async findByLocation(
    locationId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>> {
    return this.findByField('locationId', locationId, options);
  }

  async findBySupplier(
    supplierId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>> {
    return this.findByField('supplierId', supplierId, options);
  }

  async findCriticalStock(): Promise<ServiceResult<Product[]>> {
    return this.findByStockStatus(StockStatus.CRITICAL);
  }

  async findByStockStatus(status: StockStatus): Promise<ServiceResult<Product[]>> {
    try {
      let query = '';
      switch (status) {
        case StockStatus.CRITICAL:
          query = 'SELECT * FROM products WHERE quantity <= critical_stock AND is_active = true';
          break;
        case StockStatus.OUT_OF_STOCK:
          query = 'SELECT * FROM products WHERE quantity = 0 AND is_active = true';
          break;
        default:
          return {
            success: false,
            error: new Error('Estado de stock no válido'),
          };
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

  async findOutOfStock(): Promise<ServiceResult<Product[]>> {
    return this.findByStockStatus(StockStatus.OUT_OF_STOCK);
  }

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

  async updateStock(
    id: number,
    quantity: number
  ): Promise<ServiceResult<Product>> {
    return this.update(id, { quantity } as Partial<Product>);
  }

  async addStock(
    id: number,
    quantity: number
  ): Promise<ServiceResult<Product>> {
    const existingResult = await this.findById(id);
    if (!existingResult.success) return existingResult;

    const product = existingResult.data;
    if (!product) {
      return {
        success: false,
        error: new Error('Producto no encontrado'),
      };
    }
    const newQuantity = product.quantity + quantity;
    return this.update(id, { quantity: newQuantity } as Partial<Product>);
  }

  async reduceStock(
    id: number,
    quantity: number
  ): Promise<ServiceResult<Product>> {
    const existingResult = await this.findById(id);
    if (!existingResult.success) return existingResult;

    const product = existingResult.data;
    if (!product) {
      return {
        success: false,
        error: new Error('Producto no encontrado'),
      };
    }
    if (product.quantity < quantity) {
      return {
        success: false,
        error: new Error('Stock insuficiente para reducir'),
      };
    }
    const newQuantity = product.quantity - quantity;
    return this.update(id, { quantity: newQuantity } as Partial<Product>);
  }

  async existsBySku(sku: SKU | string): Promise<boolean> {
    return this.existsByField('sku', sku);
  }

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

  async getAuditTrail(
    productId: number
  ): Promise<ServiceResult<AuditLog<Product>[]>> {
    try {
      const result = await pool.query(ProductQueries.getAuditTrail, [
        productId,
      ]);
      return {
        success: true,
        data: result.rows.map((row: any) => new AuditLog<Product>(row)),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

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
