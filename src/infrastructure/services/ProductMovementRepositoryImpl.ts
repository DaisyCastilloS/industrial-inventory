/**
 * @fileoverview Implementación del repositorio de movimientos de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import {
  ProductMovement,
  IProductMovement,
  MovementType,
  MovementReason,
} from '../../core/domain/entity/ProductMovement';
import { IProductMovementRepository } from '../../core/domain/repository/ProductMovementRepository';
import { pool } from '../db/database';

export class ProductMovementRepositoryImpl
  extends BaseRepositoryImpl<ProductMovement>
  implements IProductMovementRepository
{
  protected tableName = 'product_movements';
  protected entityClass = ProductMovement;

  /**
   * Busca movimientos por producto
   */
  async findByProduct(productId: number): Promise<ProductMovement[]> {
    return this.findByField('product_id', productId);
  }

  /**
   * Busca movimientos por usuario
   */
  async findByUser(userId: number): Promise<ProductMovement[]> {
    return this.findByField('user_id', userId);
  }

  /**
   * Busca movimientos por tipo
   */
  async findByType(movementType: MovementType): Promise<ProductMovement[]> {
    return this.findByField('movement_type', movementType);
  }

  /**
   * Busca movimientos por producto y tipo
   */
  async findByProductAndType(
    productId: number,
    movementType: MovementType
  ): Promise<ProductMovement[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE product_id = $1 AND movement_type = $2 ORDER BY created_at DESC`;
    const result = await pool.query(query, [productId, movementType]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Obtiene movimientos recientes
   */
  async findRecent(limit: number = 10): Promise<ProductMovement[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1`;
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Busca movimientos por razón
   */
  async findByReason(reason: MovementReason): Promise<ProductMovement[]> {
    return this.findByField('reason', reason);
  }

  /**
   * Busca movimientos por rango de fechas
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ProductMovement[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE created_at BETWEEN $1 AND $2 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Obtiene movimientos recientes
   */
  async getRecentMovements(limit: number = 10): Promise<ProductMovement[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1`;
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Obtiene estadísticas de movimientos por producto
   */
  async getProductStats(productId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityIn: number;
    totalQuantityOut: number;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE product_id = $1`;
    const inQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE product_id = $1 AND movement_type = 'IN'`;
    const outQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE product_id = $1 AND movement_type = 'OUT'`;
    const adjustmentQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE product_id = $1 AND movement_type = 'ADJUSTMENT'`;
    const quantityInQuery = `SELECT SUM(quantity) FROM ${this.tableName} WHERE product_id = $1 AND movement_type = 'IN'`;
    const quantityOutQuery = `SELECT SUM(quantity) FROM ${this.tableName} WHERE product_id = $1 AND movement_type = 'OUT'`;

    const [
      totalResult,
      inResult,
      outResult,
      adjustmentResult,
      quantityInResult,
      quantityOutResult,
    ] = await Promise.all([
      pool.query(totalQuery, [productId]),
      pool.query(inQuery, [productId]),
      pool.query(outQuery, [productId]),
      pool.query(adjustmentQuery, [productId]),
      pool.query(quantityInQuery, [productId]),
      pool.query(quantityOutQuery, [productId]),
    ]);

    return {
      totalMovements: parseInt(totalResult.rows[0].count),
      inMovements: parseInt(inResult.rows[0].count),
      outMovements: parseInt(outResult.rows[0].count),
      adjustments: parseInt(adjustmentResult.rows[0].count),
      totalQuantityIn: parseInt(quantityInResult.rows[0].sum) || 0,
      totalQuantityOut: parseInt(quantityOutResult.rows[0].sum) || 0,
    };
  }

  /**
   * Obtiene estadísticas de movimientos por usuario
   */
  async getUserStats(userId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityMoved: number;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1`;
    const inQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1 AND movement_type = 'IN'`;
    const outQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1 AND movement_type = 'OUT'`;
    const adjustmentQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1 AND movement_type = 'ADJUSTMENT'`;
    const quantityQuery = `SELECT SUM(quantity) FROM ${this.tableName} WHERE user_id = $1`;

    const [totalResult, inResult, outResult, adjustmentResult, quantityResult] =
      await Promise.all([
        pool.query(totalQuery, [userId]),
        pool.query(inQuery, [userId]),
        pool.query(outQuery, [userId]),
        pool.query(adjustmentQuery, [userId]),
        pool.query(quantityQuery, [userId]),
      ]);

    return {
      totalMovements: parseInt(totalResult.rows[0].count),
      inMovements: parseInt(inResult.rows[0].count),
      outMovements: parseInt(outResult.rows[0].count),
      adjustments: parseInt(adjustmentResult.rows[0].count),
      totalQuantityMoved: parseInt(quantityResult.rows[0].sum) || 0,
    };
  }

  /**
   * Obtiene el historial de auditoría de un movimiento
   */
  async getAuditTrail(id: number): Promise<any[]> {
    const query = `
      SELECT * FROM audit_logs 
      WHERE table_name = 'product_movements' AND record_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  }

  /**
   * Obtiene estadísticas generales de movimientos
   */
  async getStats(): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityMoved: number;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
    const inQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE movement_type = 'IN'`;
    const outQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE movement_type = 'OUT'`;
    const adjustmentQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE movement_type = 'ADJUSTMENT'`;
    const quantityQuery = `SELECT SUM(quantity) FROM ${this.tableName}`;

    const [totalResult, inResult, outResult, adjustmentResult, quantityResult] =
      await Promise.all([
        pool.query(totalQuery),
        pool.query(inQuery),
        pool.query(outQuery),
        pool.query(adjustmentQuery),
        pool.query(quantityQuery),
      ]);

    return {
      totalMovements: parseInt(totalResult.rows[0].count),
      inMovements: parseInt(inResult.rows[0].count),
      outMovements: parseInt(outResult.rows[0].count),
      adjustments: parseInt(adjustmentResult.rows[0].count),
      totalQuantityMoved: parseInt(quantityResult.rows[0].sum) || 0,
    };
  }
}
