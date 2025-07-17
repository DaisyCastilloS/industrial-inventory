import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import {
  ProductMovement,
  IProductMovement,
  MovementType,
  MovementReason,
} from '../../core/domain/entity/ProductMovement';
import { IProductMovementRepository } from '../../core/domain/repository/ProductMovementRepository';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';

export class ProductMovementRepositoryImpl
  extends BaseRepositoryImpl<ProductMovement>
{
  protected tableName = 'product_movements';
  protected entityClass = ProductMovement;

  protected getAllowedFields(): string[] {
    return [
      'id', 'product_id', 'movement_type', 'quantity', 'previous_quantity', 
      'new_quantity', 'reason', 'user_id', 'created_at'
    ];
  }

  protected mapFieldName(field: string): string {
    // Mapeo específico para campos de la entidad ProductMovement
    const fieldMapping: { [key: string]: string } = {
      '_productId': 'product_id',
      '_movementType': 'movement_type',
      '_quantity': 'quantity',
      '_previousQuantity': 'previous_quantity',
      '_newQuantity': 'new_quantity',
      '_reason': 'reason',
      '_userId': 'user_id',
      '_isActive': 'is_active',
      '_createdAt': 'created_at',
      '_updatedAt': 'updated_at',
      'productId': 'product_id',
      'movementType': 'movement_type',
      'quantity': 'quantity',
      'previousQuantity': 'previous_quantity',
      'newQuantity': 'new_quantity',
      'reason': 'reason',
      'userId': 'user_id',
      'isActive': 'is_active',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };
    
    return fieldMapping[field] || field;
  }

  async create(movement: ProductMovement): Promise<ServiceResult<ProductMovement>> {
    const query = `
      INSERT INTO ${this.tableName} (
        product_id, movement_type, quantity, previous_quantity, 
        new_quantity, reason, user_id, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;
    
    const values = [
      movement.productId,
      movement.movementType,
      movement.quantity,
      movement.previousQuantity,
      movement.newQuantity,
      movement.reason,
      movement.userId,
      movement.isActive !== undefined ? movement.isActive : true
    ];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: new Error('No se pudo crear el movimiento') };
      }
      const createdMovement = this.mapRowToEntity(result.rows[0]);
      return { success: true, data: createdMovement };
    } catch (error) {
      console.error('Error creating ProductMovement:', error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async update(id: number, movement: ProductMovement): Promise<ServiceResult<ProductMovement>> {
    const query = `
      UPDATE ${this.tableName} SET 
        product_id = $1, movement_type = $2, quantity = $3, 
        previous_quantity = $4, new_quantity = $5, reason = $6, 
        user_id = $7
      WHERE id = $8
      RETURNING *
    `;
    
    const values = [
      movement.productId,
      movement.movementType,
      movement.quantity,
      movement.previousQuantity,
      movement.newQuantity,
      movement.reason,
      movement.userId,
      id
    ];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: new Error('Movimiento no encontrado') };
      }
      const updatedMovement = this.mapRowToEntity(result.rows[0]);
      return { success: true, data: updatedMovement };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async findByProduct(productId: number): Promise<ProductMovement[]> {
    const result = await this.findByField('product_id', productId);
    return result.data || [];
  }

  async findByUser(userId: number): Promise<ProductMovement[]> {
    const result = await this.findByField('user_id', userId);
    return result.data || [];
  }

  async findByType(movementType: MovementType): Promise<ProductMovement[]> {
    const result = await this.findByField('movement_type', movementType);
    return result.data || [];
  }

  async findByProductAndType(
    productId: number,
    movementType: MovementType
  ): Promise<ProductMovement[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE product_id = $1 AND movement_type = $2 ORDER BY created_at DESC`;
    const result = await pool.query(query, [productId, movementType]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findRecent(limit: number = 10): Promise<ProductMovement[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1`;
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByReason(reason: MovementReason): Promise<ProductMovement[]> {
    const result = await this.findByField('reason', reason);
    return result.data || [];
  }

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

  async getRecentMovements(limit: number = 10): Promise<ProductMovement[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1`;
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async getProductStats(productId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    totalQuantity: number;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE product_id = $1`;
    const inQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE product_id = $1 AND movement_type = 'IN'`;
    const outQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE product_id = $1 AND movement_type = 'OUT'`;
    const quantityQuery = `SELECT SUM(quantity) FROM ${this.tableName} WHERE product_id = $1`;

    const [totalResult, inResult, outResult, quantityResult] = await Promise.all([
      pool.query(totalQuery, [productId]),
      pool.query(inQuery, [productId]),
      pool.query(outQuery, [productId]),
      pool.query(quantityQuery, [productId]),
    ]);

    return {
      totalMovements: parseInt(totalResult.rows[0].count),
      inMovements: parseInt(inResult.rows[0].count),
      outMovements: parseInt(outResult.rows[0].count),
      totalQuantity: parseInt(quantityResult.rows[0].sum) || 0,
    };
  }

  async getUserStats(userId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    uniqueProducts: number;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1`;
    const inQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1 AND movement_type = 'IN'`;
    const outQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1 AND movement_type = 'OUT'`;
    const uniqueProductsQuery = `SELECT COUNT(DISTINCT product_id) FROM ${this.tableName} WHERE user_id = $1`;

    const [totalResult, inResult, outResult, uniqueProductsResult] =
      await Promise.all([
        pool.query(totalQuery, [userId]),
        pool.query(inQuery, [userId]),
        pool.query(outQuery, [userId]),
        pool.query(uniqueProductsQuery, [userId]),
      ]);

    return {
      totalMovements: parseInt(totalResult.rows[0].count),
      inMovements: parseInt(inResult.rows[0].count),
      outMovements: parseInt(outResult.rows[0].count),
      uniqueProducts: parseInt(uniqueProductsResult.rows[0].count),
    };
  }

  async getAuditTrail(id: number): Promise<any[]> {
    const query = `
      SELECT * FROM audit_logs 
      WHERE table_name = 'product_movements' AND record_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  }

  async getStats(): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    uniqueProducts: number;
    uniqueUsers: number;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
    const inQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE movement_type = 'IN'`;
    const outQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE movement_type = 'OUT'`;
    const uniqueProductsQuery = `SELECT COUNT(DISTINCT product_id) FROM ${this.tableName}`;
    const uniqueUsersQuery = `SELECT COUNT(DISTINCT user_id) FROM ${this.tableName}`;

    const [totalResult, inResult, outResult, uniqueProductsResult, uniqueUsersResult] =
      await Promise.all([
        pool.query(totalQuery),
        pool.query(inQuery),
        pool.query(outQuery),
        pool.query(uniqueProductsQuery),
        pool.query(uniqueUsersQuery),
      ]);

    return {
      totalMovements: parseInt(totalResult.rows[0].count),
      inMovements: parseInt(inResult.rows[0].count),
      outMovements: parseInt(outResult.rows[0].count),
      uniqueProducts: parseInt(uniqueProductsResult.rows[0].count),
      uniqueUsers: parseInt(uniqueUsersResult.rows[0].count),
    };
  }
}
