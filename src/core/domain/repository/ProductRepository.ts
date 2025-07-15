/**
 * @fileoverview Interfaz del repositorio de productos
 * @author Daisy Castillo
 */

import { IBaseRepository } from './base/BaseRepository';
import { Product, SKU } from '../entity/Product';
import { StockStatus } from '../../shared/constants/RoleTypes';
import {
  ServiceResult,
  RepositoryOptions,
} from '../../infrastructure/services/base/ServiceTypes';
import { AuditLog } from '../entity/AuditLog';

export interface IProductRepository extends IBaseRepository<Product> {
  findBySku(sku: SKU | string): Promise<ServiceResult<Product | null>>;
  findByCategory(
    categoryId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>>;
  findByLocation(
    locationId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>>;
  findBySupplier(
    supplierId: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<Product[]>>;
  findByStockStatus(status: StockStatus): Promise<ServiceResult<Product[]>>;
  findCriticalStock(): Promise<ServiceResult<Product[]>>;
  findOutOfStock(): Promise<ServiceResult<Product[]>>;
  searchByName(name: string): Promise<ServiceResult<Product[]>>;
  updateStock(id: number, quantity: number): Promise<ServiceResult<Product>>;
  addStock(id: number, quantity: number): Promise<ServiceResult<Product>>;
  reduceStock(id: number, quantity: number): Promise<ServiceResult<Product>>;
  existsBySku(sku: SKU | string): Promise<boolean>;
  getInventoryStats(): Promise<
    ServiceResult<{
      totalProducts: number;
      activeProducts: number;
      criticalStockCount: number;
      outOfStockCount: number;
      totalValue: number;
    }>
  >;
  getAuditTrail(productId: number): Promise<ServiceResult<AuditLog<Product>[]>>;
  getProductsFullInfo(
    options?: RepositoryOptions
  ): Promise<ServiceResult<any[]>>;
  getCriticalStockProducts(
    options?: RepositoryOptions
  ): Promise<ServiceResult<any[]>>;
}
