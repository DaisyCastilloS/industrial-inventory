/**
 * @fileoverview Interfaz del repositorio de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Product, IProduct } from '../entity/Product';
import { StockStatus } from '../../00-constants/RoleTypes';
import { AuditLog } from '../entity/AuditLog';

// Tipos semánticos importados de la entidad Product
import type { SKU, ProductName } from '../entity/Product';

/**
 * Interfaz del repositorio de productos
 *
 * Todos los métodos usan tipado semántico y retornan entidades de dominio.
 */
export interface IProductRepository {
  /**
   * Crea un nuevo producto
   * @param product - Datos del producto
   * @returns Producto creado
   */
  create(product: IProduct): Promise<Product>;

  /**
   * Busca un producto por ID
   * @param id - ID del producto
   * @returns Producto encontrado o null
   */
  findById(id: number): Promise<Product | null>;

  /**
   * Busca un producto por SKU
   * @param sku - SKU del producto (tipado semántico)
   * @returns Producto encontrado o null
   */
  findBySku(sku: SKU | string): Promise<Product | null>;

  /**
   * Obtiene todos los productos
   * @returns Lista de productos
   */
  findAll(): Promise<Product[]>;

  /**
   * Obtiene productos activos
   * @returns Lista de productos activos
   */
  findActive(): Promise<Product[]>;

  /**
   * Busca productos por categoría
   * @param categoryId - ID de la categoría
   * @returns Lista de productos de la categoría
   */
  findByCategory(categoryId: number): Promise<Product[]>;

  /**
   * Busca productos por proveedor
   * @param supplierId - ID del proveedor
   * @returns Lista de productos del proveedor
   */
  findBySupplier(supplierId: number): Promise<Product[]>;

  /**
   * Busca productos por ubicación
   * @param locationId - ID de la ubicación
   * @returns Lista de productos en la ubicación
   */
  findByLocation(locationId: number): Promise<Product[]>;

  /**
   * Busca productos por estado de stock
   * @param status - Estado del stock
   * @returns Lista de productos con el estado especificado
   */
  findByStockStatus(status: StockStatus): Promise<Product[]>;

  /**
   * Busca productos en stock crítico
   * @returns Lista de productos en stock crítico
   */
  findCriticalStock(): Promise<Product[]>;

  /**
   * Busca productos sin stock
   * @returns Lista de productos sin stock
   */
  findOutOfStock(): Promise<Product[]>;

  /**
   * Busca productos por nombre (búsqueda parcial, tipado semántico)
   * @param name - Nombre a buscar
   * @returns Lista de productos que coinciden
   */
  searchByName(name: ProductName | string): Promise<Product[]>;

  /**
   * Actualiza un producto
   * @param id - ID del producto
   * @param productData - Datos a actualizar
   * @returns Producto actualizado
   */
  update(id: number, productData: Partial<IProduct>): Promise<Product>;

  /**
   * Elimina un producto (soft delete)
   * @param id - ID del producto
   */
  delete(id: number): Promise<void>;

  /**
   * Actualiza el stock de un producto
   * @param id - ID del producto
   * @param quantity - Nueva cantidad
   * @returns Producto actualizado
   */
  updateStock(id: number, quantity: number): Promise<Product>;

  /**
   * Añade stock a un producto
   * @param id - ID del producto
   * @param quantity - Cantidad a añadir
   * @returns Producto actualizado
   */
  addStock(id: number, quantity: number): Promise<Product>;

  /**
   * Reduce stock de un producto
   * @param id - ID del producto
   * @param quantity - Cantidad a reducir
   * @returns Producto actualizado
   */
  reduceStock(id: number, quantity: number): Promise<Product>;

  /**
   * Verifica si existe un producto con el SKU dado (tipado semántico)
   * @param sku - SKU a verificar
   * @returns true si existe
   */
  existsBySku(sku: SKU | string): Promise<boolean>;

  /**
   * Obtiene estadísticas de inventario
   * @returns Estadísticas del inventario
   */
  getInventoryStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    criticalStockCount: number;
    outOfStockCount: number;
    totalValue: number;
  }>;

  /**
   * Obtiene el historial de auditoría de un producto
   * @param productId - ID del producto
   * @returns Lista de logs de auditoría del producto
   */
  getAuditTrail(productId: number): Promise<AuditLog<IProduct>[]>;
}
