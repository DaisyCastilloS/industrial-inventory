/**
 * @fileoverview Implementación del repositorio de ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import {
  Location,
  ILocation,
  LocationName,
} from '../../core/domain/entity/Location';
import { ILocationRepository } from '../../core/domain/repository/LocationRepository';
import { pool } from '../db/database';

export class LocationRepositoryImpl
  extends BaseRepositoryImpl<Location>
  implements ILocationRepository
{
  protected tableName = 'locations';
  protected entityClass = Location;

  /**
   * Busca una ubicación por nombre
   */
  async findByName(name: LocationName | string): Promise<Location | null> {
    return this.findByField('name', name).then(results => results[0] || null);
  }

  /**
   * Busca ubicaciones por descripción
   */
  async findByDescription(description: string): Promise<Location[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE description ILIKE $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [`%${description}%`]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Busca ubicaciones por zona
   */
  async findByZone(zone: string): Promise<Location[]> {
    return this.findByField('zone', zone);
  }

  /**
   * Busca ubicaciones por estante
   */
  async findByShelf(shelf: string): Promise<Location[]> {
    return this.findByField('shelf', shelf);
  }

  /**
   * Busca ubicaciones raíz (sin padre)
   */
  async findRootLocations(): Promise<Location[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE parent_id IS NULL AND is_active = true ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Busca ubicaciones hijas de una ubicación padre
   */
  async findByParent(parentId: number): Promise<Location[]> {
    return this.findByField('parent_id', parentId);
  }

  /**
   * Verifica si existe una ubicación con el nombre dado
   */
  async existsByName(name: LocationName | string): Promise<boolean> {
    const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE name = $1`;
    const result = await pool.query(query, [name]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Obtiene el historial de auditoría de una ubicación
   */
  async getAuditTrail(id: number): Promise<any[]> {
    const query = `
      SELECT * FROM audit_logs 
      WHERE table_name = 'locations' AND record_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  }

  /**
   * Obtiene estadísticas de ubicaciones
   */
  async getStats(): Promise<{
    totalLocations: number;
    activeLocations: number;
    rootLocations: number;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
    const activeQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE is_active = true`;
    const rootQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE parent_id IS NULL AND is_active = true`;

    const [totalResult, activeResult, rootResult] = await Promise.all([
      pool.query(totalQuery),
      pool.query(activeQuery),
      pool.query(rootQuery),
    ]);

    return {
      totalLocations: parseInt(totalResult.rows[0].count),
      activeLocations: parseInt(activeResult.rows[0].count),
      rootLocations: parseInt(rootResult.rows[0].count),
    };
  }
}
