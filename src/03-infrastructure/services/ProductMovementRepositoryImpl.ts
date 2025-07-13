/**
 * @fileoverview Implementación del repositorio de movimientos de productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { ProductMovement, IProductMovement } from "../../01-domain/entity/ProductMovement";
import { IProductMovementRepository } from "../../01-domain/repository/ProductMovementRepository";

/**
 * Consultas SQL para movimientos de productos
 */
const ProductMovementQueries = {
  create: `
    INSERT INTO product_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reason, user_id, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `,
  
  findById: `
    SELECT * FROM product_movements WHERE id = $1
  `,
  
  findByProductId: `
    SELECT * FROM product_movements WHERE product_id = $1 ORDER BY created_at DESC
  `,
  
  findByUserId: `
    SELECT * FROM product_movements WHERE user_id = $1 ORDER BY created_at DESC
  `,
  
  findByMovementType: `
    SELECT * FROM product_movements WHERE movement_type = $1 ORDER BY created_at DESC
  `,
  
  findAll: `
    SELECT * FROM product_movements ORDER BY created_at DESC
  `,
  
  findByDateRange: `
    SELECT * FROM product_movements 
    WHERE created_at BETWEEN $1 AND $2 
    ORDER BY created_at DESC
  `,
  
  getRecentMovements: `
    SELECT * FROM product_movements 
    ORDER BY created_at DESC 
    LIMIT $1
  `,
  
  getMovementStats: `
    SELECT 
      movement_type,
      COUNT(*) as count,
      SUM(quantity) as total_quantity
    FROM product_movements 
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY movement_type
  `,
  
  getAuditTrail: `
    SELECT * FROM audit_logs 
    WHERE table_name = 'product_movements' AND record_id = $1 
    ORDER BY created_at DESC
  `
};

/**
 * Implementación del repositorio de movimientos de productos
 */
export class ProductMovementRepositoryImpl implements IProductMovementRepository {
  
  async create(movement: IProductMovement): Promise<ProductMovement> {
    const result = await pool.query(ProductMovementQueries.create, [
      movement.productId,
      movement.movementType,
      movement.quantity,
      movement.previousQuantity,
      movement.newQuantity,
      movement.reason,
      movement.userId,
      movement.createdAt || new Date()
    ]);
    
    if (result.rows.length > 0) {
      const createdMovement = new ProductMovement({
        id: result.rows[0].id,
        productId: movement.productId,
        movementType: movement.movementType,
        quantity: movement.quantity,
        previousQuantity: movement.previousQuantity,
        newQuantity: movement.newQuantity,
        reason: movement.reason,
        userId: movement.userId,
        createdAt: movement.createdAt || new Date()
      });
      return createdMovement;
    }
    
    throw new Error('Error al crear movimiento de producto');
  }

  async findById(id: number): Promise<ProductMovement | null> {
    const result = await pool.query(ProductMovementQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new ProductMovement({
      id: row.id,
      productId: row.product_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      userId: row.user_id,
      createdAt: row.created_at
    });
  }

  async findByProductId(productId: number): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByProductId, [productId]);
    return result.rows.map(row => new ProductMovement({
      id: row.id,
      productId: row.product_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      userId: row.user_id,
      createdAt: row.created_at
    }));
  }

  async findByUserId(userId: number): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByUserId, [userId]);
    return result.rows.map(row => new ProductMovement({
      id: row.id,
      productId: row.product_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      userId: row.user_id,
      createdAt: row.created_at
    }));
  }

  async findByMovementType(movementType: string): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByMovementType, [movementType]);
    return result.rows.map(row => new ProductMovement({
      id: row.id,
      productId: row.product_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      userId: row.user_id,
      createdAt: row.created_at
    }));
  }

  async findAll(): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findAll);
    return result.rows.map(row => new ProductMovement({
      id: row.id,
      productId: row.product_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      userId: row.user_id,
      createdAt: row.created_at
    }));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByDateRange, [startDate, endDate]);
    return result.rows.map(row => new ProductMovement({
      id: row.id,
      productId: row.product_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      userId: row.user_id,
      createdAt: row.created_at
    }));
  }

  async getRecentMovements(limit: number = 50): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.getRecentMovements, [limit]);
    return result.rows.map(row => new ProductMovement({
      id: row.id,
      productId: row.product_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      userId: row.user_id,
      createdAt: row.created_at
    }));
  }

  async getMovementStats(startDate: Date, endDate: Date): Promise<any[]> {
    const result = await pool.query(ProductMovementQueries.getMovementStats, [startDate, endDate]);
    return result.rows;
  }

  async getAuditTrail(movementId: number): Promise<any[]> {
    const result = await pool.query(ProductMovementQueries.getAuditTrail, [movementId]);
    return result.rows;
  }
} 