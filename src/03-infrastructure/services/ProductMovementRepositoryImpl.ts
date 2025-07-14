/**
 * @fileoverview Implementación de infraestructura del repositorio de movimientos de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { ProductMovement, IProductMovement, MovementType, MovementReason } from "../../01-domain/entity/ProductMovement";
import { IProductMovementRepository } from "../../01-domain/repository/ProductMovementRepository";
import { AuditLog } from "../../01-domain/entity/AuditLog";

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
  /**
   * Crea un nuevo movimiento de producto en la base de datos
   * @param movement - Datos del movimiento
   * @returns Movimiento creado
   */
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
      return this.mapRowToProductMovement(result.rows[0]);
    }
    throw new Error('Error al crear movimiento de producto');
  }

  /**
   * Busca un movimiento por ID
   * @param id - ID del movimiento
   * @returns Movimiento encontrado o null
   */
  async findById(id: number): Promise<ProductMovement | null> {
    const result = await pool.query(ProductMovementQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToProductMovement(result.rows[0]);
  }

  async findByProductId(productId: number): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByProductId, [productId]);
    return result.rows.map(this.mapRowToProductMovement);
  }

  async findByUserId(userId: number): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByUserId, [userId]);
    return result.rows.map(this.mapRowToProductMovement);
  }

  /**
   * Busca movimientos por tipo (tipado semántico)
   * @param movementType - Tipo de movimiento
   * @returns Lista de movimientos del tipo especificado
   */
  async findByMovementType(movementType: MovementType | string): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByMovementType, [movementType]);
    return result.rows.map(this.mapRowToProductMovement);
  }

  async findAll(): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findAll);
    return result.rows.map(this.mapRowToProductMovement);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.findByDateRange, [startDate, endDate]);
    return result.rows.map(this.mapRowToProductMovement);
  }

  async getRecentMovements(limit: number = 50): Promise<ProductMovement[]> {
    const result = await pool.query(ProductMovementQueries.getRecentMovements, [limit]);
    return result.rows.map(this.mapRowToProductMovement);
  }

  async getMovementStats(startDate: Date, endDate: Date): Promise<any[]> {
    const result = await pool.query(ProductMovementQueries.getMovementStats, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Obtiene el historial de auditoría de un movimiento
   * @param movementId - ID del movimiento
   * @returns Lista de logs de auditoría del movimiento
   */
  async getAuditTrail(movementId: number): Promise<AuditLog<IProductMovement>[]> {
    const result = await pool.query(ProductMovementQueries.getAuditTrail, [movementId]);
    return result.rows.map((row: any) => new AuditLog<IProductMovement>(row));
  }

  /**
   * Busca movimientos por producto
   * @param productId - ID del producto
   * @returns Lista de movimientos del producto
   */
  async findByProduct(productId: number): Promise<ProductMovement[]> {
    return this.findByProductId(productId);
  }

  /**
   * Busca movimientos por usuario
   * @param userId - ID del usuario
   * @returns Lista de movimientos del usuario
   */
  async findByUser(userId: number): Promise<ProductMovement[]> {
    return this.findByUserId(userId);
  }

  /**
   * Busca movimientos por tipo
   * @param movementType - Tipo de movimiento
   * @returns Lista de movimientos del tipo especificado
   */
  async findByType(movementType: MovementType): Promise<ProductMovement[]> {
    return this.findByMovementType(movementType);
  }

  /**
   * Busca movimientos por producto y tipo
   * @param productId - ID del producto
   * @param movementType - Tipo de movimiento
   * @returns Lista de movimientos que coinciden
   */
  async findByProductAndType(productId: number, movementType: MovementType): Promise<ProductMovement[]> {
    const result = await pool.query(
      `SELECT * FROM product_movements WHERE product_id = $1 AND movement_type = $2 ORDER BY created_at DESC`,
      [productId, movementType]
    );
    return result.rows.map(this.mapRowToProductMovement);
  }

  /**
   * Obtiene movimientos recientes
   * @param limit - Límite de movimientos a obtener
   * @returns Lista de movimientos recientes
   */
  async findRecent(limit?: number): Promise<ProductMovement[]> {
    return this.getRecentMovements(limit);
  }

  /**
   * Obtiene estadísticas de movimientos
   * @returns Estadísticas de movimientos
   */
  async getStats(): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityMoved: number;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_movements,
        COUNT(CASE WHEN movement_type = 'IN' THEN 1 END) as in_movements,
        COUNT(CASE WHEN movement_type = 'OUT' THEN 1 END) as out_movements,
        COUNT(CASE WHEN movement_type = 'ADJUSTMENT' THEN 1 END) as adjustments,
        SUM(quantity) as total_quantity_moved
      FROM product_movements
    `);
    
    const stats = result.rows[0];
    return {
      totalMovements: parseInt(stats.total_movements) || 0,
      inMovements: parseInt(stats.in_movements) || 0,
      outMovements: parseInt(stats.out_movements) || 0,
      adjustments: parseInt(stats.adjustments) || 0,
      totalQuantityMoved: parseFloat(stats.total_quantity_moved) || 0
    };
  }

  /**
   * Obtiene estadísticas de movimientos por producto
   * @param productId - ID del producto
   * @returns Estadísticas de movimientos del producto
   */
  async getProductStats(productId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityIn: number;
    totalQuantityOut: number;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_movements,
        COUNT(CASE WHEN movement_type = 'IN' THEN 1 END) as in_movements,
        COUNT(CASE WHEN movement_type = 'OUT' THEN 1 END) as out_movements,
        COUNT(CASE WHEN movement_type = 'ADJUSTMENT' THEN 1 END) as adjustments,
        SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END) as total_quantity_in,
        SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) as total_quantity_out
      FROM product_movements
      WHERE product_id = $1
    `, [productId]);
    
    const stats = result.rows[0];
    return {
      totalMovements: parseInt(stats.total_movements) || 0,
      inMovements: parseInt(stats.in_movements) || 0,
      outMovements: parseInt(stats.out_movements) || 0,
      adjustments: parseInt(stats.adjustments) || 0,
      totalQuantityIn: parseFloat(stats.total_quantity_in) || 0,
      totalQuantityOut: parseFloat(stats.total_quantity_out) || 0
    };
  }

  /**
   * Obtiene estadísticas de movimientos por usuario
   * @param userId - ID del usuario
   * @returns Estadísticas de movimientos del usuario
   */
  async getUserStats(userId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
    totalQuantityMoved: number;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_movements,
        COUNT(CASE WHEN movement_type = 'IN' THEN 1 END) as in_movements,
        COUNT(CASE WHEN movement_type = 'OUT' THEN 1 END) as out_movements,
        COUNT(CASE WHEN movement_type = 'ADJUSTMENT' THEN 1 END) as adjustments,
        SUM(quantity) as total_quantity_moved
      FROM product_movements
      WHERE user_id = $1
    `, [userId]);
    
    const stats = result.rows[0];
    return {
      totalMovements: parseInt(stats.total_movements) || 0,
      inMovements: parseInt(stats.in_movements) || 0,
      outMovements: parseInt(stats.out_movements) || 0,
      adjustments: parseInt(stats.adjustments) || 0,
      totalQuantityMoved: parseFloat(stats.total_quantity_moved) || 0
    };
  }

  // --- Método privado para mapear una fila de la BD a la entidad ProductMovement ---
  private mapRowToProductMovement(row: any): ProductMovement {
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
} 