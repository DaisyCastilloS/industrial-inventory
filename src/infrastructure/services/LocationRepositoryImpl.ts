import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import {
  Location,
  ILocation,
  LocationName,
} from '../../core/domain/entity/Location';
import { ILocationRepository } from '../../core/domain/repository/LocationRepository';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';

export class LocationRepositoryImpl
  extends BaseRepositoryImpl<Location>
{
  protected tableName = 'locations';
  protected entityClass = Location;

  protected getAllowedFields(): string[] {
    return [
      'id', 'name', 'description', 'code', 'type', 'zone', 'shelf', 'capacity',
      'currentUsage', 'isActive', 'createdAt', 'updatedAt'
    ];
  }

  protected mapFieldName(field: string): string {
    // Mapeo específico para campos de la entidad Location
    const fieldMapping: { [key: string]: string } = {
      '_name': 'name',
      '_address': 'address',
      '_description': 'description',
      '_isActive': 'is_active',
      '_createdAt': 'created_at',
      '_updatedAt': 'updated_at',
      'name': 'name',
      'address': 'address',
      'description': 'description',
      'isActive': 'is_active',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };
    
    return fieldMapping[field] || field;
  }

  async findByName(name: LocationName | string): Promise<Location | null> {
    const result = await this.findByField('name', name);
    return result.data?.[0] || null;
  }

  async findActive(): Promise<Location[]> {
    const result = await this.findByField('is_active', true);
    return result.data || [];
  }

  async findByDescription(description: string): Promise<Location[]> {
    const result = await this.findByField('description', description);
    return result.data || [];
  }

  async create(location: ILocation): Promise<ServiceResult<Location>> {
    try {
      const query = `
        INSERT INTO ${this.tableName} (name, description, code, type, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        location.name,
        location.description || null,
        location.code,
        location.type,
        location.isActive !== undefined ? location.isActive : true
      ];

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: new Error('No se pudo crear la ubicación') };
      }
      const createdLocation = this.mapRowToEntity(result.rows[0]);
      return { success: true, data: createdLocation };
    } catch (error) {
      console.error('Error creating Location:', error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
