/**
 * @fileoverview Implementación del repositorio de ubicaciones
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { Location, ILocation } from "../../01-domain/entity/Location";
import { ILocationRepository } from "../../01-domain/repository/LocationRepository";

/**
 * Consultas SQL para ubicaciones
 */
const LocationQueries = {
  create: `
    INSERT INTO locations (name, description, zone, shelf, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
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
    SET name = $1, description = $2, zone = $3, shelf = $4, is_active = $5, updated_at = $6
    WHERE id = $7
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
  
  async create(location: ILocation): Promise<Location> {
    const result = await pool.query(LocationQueries.create, [
      location.name,
      location.description,
      location.zone,
      location.shelf,
      location.isActive,
      location.createdAt || new Date(),
      location.updatedAt || new Date()
    ]);
    
    if (result.rows.length > 0) {
      const createdLocation = new Location({
        id: result.rows[0].id,
        name: location.name,
        description: location.description,
        zone: location.zone,
        shelf: location.shelf,
        isActive: location.isActive,
        createdAt: location.createdAt || new Date(),
        updatedAt: location.updatedAt || new Date()
      });
      return createdLocation;
    }
    
    throw new Error('Error al crear ubicación');
  }

  async findById(id: number): Promise<Location | null> {
    const result = await pool.query(LocationQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findByName(name: string): Promise<Location | null> {
    const result = await pool.query(LocationQueries.findByName, [name]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findAll(): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findAll);
    return result.rows.map(row => new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findActive(): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findActive);
    return result.rows.map(row => new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findByZone(zone: string): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findByZone, [zone]);
    return result.rows.map(row => new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findByShelf(shelf: string): Promise<Location[]> {
    const result = await pool.query(LocationQueries.findByShelf, [shelf]);
    return result.rows.map(row => new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async update(id: number, locationData: Partial<ILocation>): Promise<Location> {
    const existingLocation = await this.findById(id);
    if (!existingLocation) {
      throw new Error(`Ubicación con ID ${id} no encontrada`);
    }

    const updatedData = {
      name: locationData.name || existingLocation.name,
      description: locationData.description || existingLocation.description,
      zone: locationData.zone || existingLocation.zone,
      shelf: locationData.shelf || existingLocation.shelf,
      isActive: locationData.isActive !== undefined ? locationData.isActive : existingLocation.isActive,
      updatedAt: new Date()
    };

    await pool.query(LocationQueries.update, [
      updatedData.name,
      updatedData.description,
      updatedData.zone,
      updatedData.shelf,
      updatedData.isActive,
      updatedData.updatedAt,
      id
    ]);

    return new Location({
      id,
      ...updatedData,
      createdAt: existingLocation.createdAt
    });
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(LocationQueries.delete, [id]);
    if (result.rowCount === 0) {
      throw new Error(`Ubicación con ID ${id} no encontrada`);
    }
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await pool.query(LocationQueries.existsByName, [name]);
    return parseInt(result.rows[0].count) > 0;
  }

  async getAuditTrail(locationId: number): Promise<any[]> {
    const result = await pool.query(LocationQueries.getAuditTrail, [locationId]);
    return result.rows;
  }

  async findByDescription(description: string): Promise<Location[]> {
    const result = await pool.query(
      `SELECT * FROM locations WHERE description ILIKE $1 AND is_active = true`,
      [`%${description}%`]
    );
    return result.rows.map(row => new Location({
      id: row.id,
      name: row.name,
      description: row.description,
      zone: row.zone,
      shelf: row.shelf,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async activate(id: number): Promise<Location> {
    const location = await this.findById(id);
    if (!location) {
      throw new Error(`Ubicación con ID ${id} no encontrada`);
    }

    location.activate();
    return this.update(id, { isActive: true });
  }

  async deactivate(id: number): Promise<Location> {
    const location = await this.findById(id);
    if (!location) {
      throw new Error(`Ubicación con ID ${id} no encontrada`);
    }

    location.deactivate();
    return this.update(id, { isActive: false });
  }
} 