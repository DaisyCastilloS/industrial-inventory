/**
 * @fileoverview Interfaz del repositorio de movimientos de productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { ProductMovement, IProductMovement } from '../entity/ProductMovement';
import { MovementType } from '../../00-constants/RoleTypes';

/**
 * Interfaz del repositorio de movimientos de productos
 */
export interface IProductMovementRepository {
  /**
   * Crea un nuevo movimiento
   * @param movement - Datos del movimiento
   * @returns Movimiento creado
   */
  create(movement: IProductMovement): Promise<ProductMovement>;

  /**
   * Busca un movimiento por ID
   * @param id - ID del movimiento
   * @returns Movimiento encontrado o null
   */
  findById(id: number): Promise<ProductMovement | null>;

  /**
   * Obtiene todos los movimientos
   * @returns Lista de movimientos
   */
  findAll(): Promise<ProductMovement[]>;

  /**
   * Busca movimientos por producto
   * @param productId - ID del producto
   * @returns Lista de movimientos del producto
   */
  findByProduct(productId: number): Promise<ProductMovement[]>;

  /**
   * Busca movimientos por usuario
   * @param userId - ID del usuario
   * @returns Lista de movimientos del usuario
   */
  findByUser(userId: number): Promise<ProductMovement[]>;

  /**
   * Busca movimientos por tipo
   * @param movementType - Tipo de movimiento
   * @returns Lista de movimientos del tipo especificado
   */
  findByType(movementType: MovementType): Promise<ProductMovement[]>;

  /**
   * Busca movimientos por producto y tipo
   * @param productId - ID del producto
   * @param movementType - Tipo de movimiento
   * @returns Lista de movimientos que coinciden
   */
  findByProductAndType(productId: number, movementType: MovementType): Promise<ProductMovement[]>;

  /**
   * Obtiene movimientos recientes
   * @param limit - Límite de movimientos a obtener
   * @returns Lista de movimientos recientes
   */
  findRecent(limit?: number): Promise<ProductMovement[]>;

  /**
   * Busca movimientos en un rango de fechas
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @returns Lista de movimientos en el rango
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<ProductMovement[]>;

  /**
   * Obtiene estadísticas de movimientos
   * @returns Estadísticas de movimientos
   */
  getStats(): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityMoved: number;
  }>;

  /**
   * Obtiene estadísticas de movimientos por producto
   * @param productId - ID del producto
   * @returns Estadísticas de movimientos del producto
   */
  getProductStats(productId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityIn: number;
    totalQuantityOut: number;
  }>;

  /**
   * Obtiene estadísticas de movimientos por usuario
   * @param userId - ID del usuario
   * @returns Estadísticas de movimientos del usuario
   */
  getUserStats(userId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityMoved: number;
  }>;

  /**
   * Obtiene el historial de auditoría de un movimiento
   * @param movementId - ID del movimiento
   * @returns Lista de logs de auditoría
   */
  getAuditTrail(movementId: number): Promise<any[]>;
} 