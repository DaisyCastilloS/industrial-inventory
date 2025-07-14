/**
 * @fileoverview Implementación de infraestructura del repositorio de ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { Location, ILocation, LocationName } from "../../01-domain/entity/Location";
import { ILocationRepository } from "../../01-domain/repository/LocationRepository";
import { AuditLog } from "../../01-domain/entity/AuditLog";

/**
 * Consultas SQL para ubicaciones
 */
const LocationQueries = {
  create: `
    INSERT INTO locations (name, description, code, type, parent_id, zone, shelf, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,
  
  findById: `
    SELECT * FROM locations WHERE id = $1
  `,
  
  findByName: `
    SELECT * FROM locations WHERE name = $1
  `,
  
  findAll: `
    SELECT * FROM locations ORDER BY created_at DESC
  `,
  
  findActive: `
    SELECT * FROM locations WHERE is_active = true ORDER BY created_at DESC
  `,
  
  findByZone: `
    SELECT * FROM locations WHERE zone = $1 AND is_active = true
  `,
  
  findByShelf: `
    SELECT * FROM locations WHERE shelf = $1 AND is_active = true
  `,
  
  update: `
    UPDATE locations 
    SET name = $1, description = $2, code = $3, type = $4, parent_id = $5, zone = $6, shelf = $7, is_active = $8, updated_at = $9
    WHERE id = $10
  `,
  
  delete: `
    DELETE FROM locations WHERE id = $1
  `,
  
  existsByName: `
    SELECT COUNT(*) FROM locations WHERE name = $1
  `,
  
  getAuditTrail: `
    SELECT * FROM audit_logs 
    WHERE table_name = 'locations' AND record_id = $1 
    ORDER BY created_at DESC
  `
};

/**
 * Implementación del repositorio de ubicaciones
 */
export class LocationRepositoryImpl implements ILocationRepository {
  /**
   * Crea una nueva ubicación en la base de datos
   * @param location - Datos de la ubicación
   * @returns Ubicación creada
   */
  async create(location: ILocation): Promise<Location> {
    const result = await pool.query(LocationQueries.create, [
      location.name,
      location.description,
      location.code,
      location.type,
      location.parentId,
      location.zone,
      location.shelf,
      location.isActive,
      location.createdAt || new Date(),
      location.updatedAt || new Date()
    ]);
    if (result.rows.length > 0) {
      return this.mapRowToLocation(result.rows[0]);
    }
    throw new Error('Error al crear ubicación');
  }

  /**
   * Busca una ubicación por ID
   * @param id - ID de la ubicación
   * @returns Ubicación encontrada o null
   */
  async findById(id: number): Promise<Location | null> {
    const result = await pool.query(LocationQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToLocation(result.rows[0]);
  }

  /**
   * Busca una ubicación por nombre (tipado semántico)
   * @param name - Nombre de la ubicación
   * @returns Ubicación encontrada o null
   */
  async findByName(name: LocationName | string): Promise<Location | null> {
    const result = await pool.query(LocationQueries.findByName, [name]);
    if (result.rows.length === 0) return null;
    return this.mapRowToLocation(result.rows[0]);
  }

  /**
   * Obtiene todas las ubicaciones
   * @returns Lista de ubicaciones
   */
  async findAll(): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findAll);
    return result.rows.map(this.mapRowToLocation);
  }

  /**
   * Obtiene ubicaciones activas
   * @returns Lista de ubicaciones activas
   */
  async findActive(): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findActive);
    return result.rows.map(this.mapRowToLocation);
  }

  async findByZone(zone: string): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findByZone, [zone]);
    return result.rows.map(this.mapRowToLocation);
  }

  async findByShelf(shelf: string): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findByShelf, [shelf]);
    return result.rows.map(this.mapRowToLocation);
  }

  async update(id: number, locationData: Partial<ILocation>): Promise<Location> {
    const existingLocation = await this.findById(id);
    if (!existingLocation) {
      throw new Error(`Ubicación con ID ${id} no encontrada`);
    }
    const updatedData = {
      name: locationData.name || existingLocation.name,
      description: locationData.description || existingLocation.description,
      code: locationData.code || existingLocation.code,
      type: locationData.type || existingLocation.type,
      parentId: locationData.parentId || existingLocation.parentId,
      zone: locationData.zone || existingLocation.zone,
      shelf: locationData.shelf || existingLocation.shelf,
      isActive: locationData.isActive !== undefined ? locationData.isActive : existingLocation.isActive,
      updatedAt: new Date()
    };
    await pool.query(LocationQueries.update, [
      updatedData.name,
      updatedData.description,
      updatedData.code,
      updatedData.type,
      updatedData.parentId,
      updatedData.zone,
      updatedData.shelf,
      updatedData.isActive,
      updatedData.updatedAt,
      id
    ]);
    return await this.findById(id) as Location;
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(LocationQueries.delete, [id]);
    if (result.rowCount === 0) {
      throw new Error(`Ubicación con ID ${id} no encontrada`);
    }
  }

  /**
   * Verifica si existe una ubicación con el nombre dado (tipado semántico)
   * @param name - Nombre a verificar
   * @returns true si existe
   */
  async existsByName(name: LocationName | string): Promise<boolean> {
    const result = await pool.query(LocationQueries.existsByName, [name]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Obtiene el historial de auditoría de una ubicación
   * @param locationId - ID de la ubicación
   * @returns Lista de logs de auditoría de la ubicación
   */
  async getAuditTrail(locationId: number): Promise<AuditLog<ILocation>[]> {
    const result = await pool.query(LocationQueries.getAuditTrail, [locationId]);
    return result.rows.map((row: any) => new AuditLog<ILocation>(row));
  }

  async findByDescription(description: string): Promise<Location[]> {
    const result = await pool.query(
      `SELECT * FROM locations WHERE description ILIKE $1 AND is_active = true`,
      [`%${description}%`]
    );
    return result.rows.map(this.mapRowToLocation);
  }

  async activate(id: number): Promise<Location> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: number): Promise<Location> {
    return this.update(id, { isActive: false });
  }

  // --- Método privado para mapear una fila de la BD a la entidad Location ---
  private mapRowToLocation(row: any): Location {
    return new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      code: row.code,
      type: row.type,
      parentId: row.parent_id,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
} 