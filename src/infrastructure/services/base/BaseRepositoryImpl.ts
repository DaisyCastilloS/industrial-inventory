/**
 * Implementación base para repositorios
 * @author Daisy Castillo
 */

import { pool } from '../../db/database';
import {
  IBaseRepository,
  BaseEntity,
} from '../../../domain/repository/base/BaseRepository';
import {
  QueryResult,
  DatabaseError,
  RepositoryOptions,
  PaginatedResult,
  ServiceResult,
} from './ServiceTypes';

export abstract class BaseRepositoryImpl<T extends BaseEntity>
  implements IBaseRepository<T>
{
  protected abstract tableName: string;
  protected abstract entityClass: new (data: any) => T;

  /**
   * Crea una nueva entidad
   */
  async create(entity: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const fields = Object.keys(entity).filter(
        key => (entity as any)[key] !== undefined
      );
      const values = fields.map(field => (entity as any)[field]);
      const placeholders = fields.map((_, index) => `$${index + 1}`);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders.join(', ')}, NOW(), NOW())
        RETURNING *
      `;

      const result = await pool.query(query, values);
      if (result.rows.length > 0) {
        return {
          success: true,
          data: this.mapRowToEntity(result.rows[0]),
        };
      }
      return {
        success: false,
        error: new Error(`Error al crear ${this.tableName}`),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Busca una entidad por ID
   */
  async findById(
    id: number,
    options?: RepositoryOptions
  ): Promise<ServiceResult<T>> {
    try {
      let query = `SELECT * FROM ${this.tableName} WHERE id = $1`;

      if (!options?.withDeleted) {
        query += ' AND is_active = true';
      }

      if (options?.withRelations) {
        query = this.addRelations(query);
      }

      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: new Error(`${this.tableName} no encontrado`),
        };
      }
      return {
        success: true,
        data: this.mapRowToEntity(result.rows[0]),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene todas las entidades con paginación
   */
  async findAll(
    options?: RepositoryOptions
  ): Promise<ServiceResult<PaginatedResult<T>>> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const offset = (page - 1) * limit;

      let query = `SELECT * FROM ${this.tableName}`;
      let countQuery = `SELECT COUNT(*) FROM ${this.tableName}`;

      if (!options?.withDeleted) {
        const whereClause = ' WHERE is_active = true';
        query += whereClause;
        countQuery += whereClause;
      }

      if (options?.withRelations) {
        query = this.addRelations(query);
      }

      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
      } else {
        query += ' ORDER BY created_at DESC';
      }

      query += ` LIMIT $1 OFFSET $2`;

      const [itemsResult, countResult] = await Promise.all([
        pool.query(query, [limit, offset]),
        pool.query(countQuery),
      ]);

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          items: itemsResult.rows.map(row => this.mapRowToEntity(row)),
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Actualiza una entidad
   */
  async update(id: number, entityData: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const existingResult = await this.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.keys(entityData).forEach(key => {
        if ((entityData as any)[key] !== undefined) {
          updateFields.push(`${this.mapFieldName(key)} = $${paramIndex++}`);
          values.push((entityData as any)[key]);
        }
      });

      if (updateFields.length === 0) {
        return {
          success: true,
          data: existingResult.data,
        };
      }

      updateFields.push('updated_at = NOW()');
      values.push(id);

      const query = `
        UPDATE ${this.tableName} 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return {
        success: true,
        data: this.mapRowToEntity(result.rows[0]),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Elimina una entidad (soft delete)
   */
  async delete(id: number): Promise<ServiceResult<void>> {
    try {
      const query = `UPDATE ${this.tableName} SET is_active = false, updated_at = NOW() WHERE id = $1`;
      const result = await pool.query(query, [id]);
      if (result.rowCount === 0) {
        return {
          success: false,
          error: new Error(`${this.tableName} no encontrado`),
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Activa una entidad
   */
  async activate(id: number): Promise<ServiceResult<T>> {
    try {
      const query = `UPDATE ${this.tableName} SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: new Error(`${this.tableName} con ID ${id} no encontrado`),
        };
      }
      return {
        success: true,
        data: this.mapRowToEntity(result.rows[0]),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Desactiva una entidad
   */
  async deactivate(id: number): Promise<ServiceResult<T>> {
    try {
      const query = `UPDATE ${this.tableName} SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: new Error(`${this.tableName} con ID ${id} no encontrado`),
        };
      }
      return {
        success: true,
        data: this.mapRowToEntity(result.rows[0]),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Verifica si existe una entidad con el ID dado
   */
  async exists(id: number): Promise<boolean> {
    const query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = $1)`;
    const result = await pool.query(query, [id]);
    return result.rows[0]?.exists || false;
  }

  /**
   * Busca entidades por un campo específico
   */
  async findByField(
    field: string,
    value: any,
    options?: RepositoryOptions
  ): Promise<ServiceResult<T[]>> {
    try {
      const mappedField = this.mapFieldName(field);
      let query = `SELECT * FROM ${this.tableName} WHERE ${mappedField} = $1`;

      if (!options?.withDeleted) {
        query += ' AND is_active = true';
      }

      if (options?.withRelations) {
        query = this.addRelations(query);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, [value]);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Verifica si existe una entidad con el valor dado en el campo especificado
   */
  async existsByField(field: string, value: any): Promise<boolean> {
    const mappedField = this.mapFieldName(field);
    const query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE ${mappedField} = $1)`;
    const result = await pool.query(query, [value]);
    return result.rows[0]?.exists || false;
  }

  /**
   * Mapea una fila de la base de datos a la entidad
   */
  protected mapRowToEntity(row: any): T {
    return new this.entityClass(row);
  }

  /**
   * Mapea nombres de campos de camelCase a snake_case
   */
  protected mapFieldName(field: string): string {
    return field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Añade relaciones a la consulta
   */
  protected addRelations(query: string): string {
    // Implementar en clases hijas si es necesario
    return query;
  }

  /**
   * Ejecuta una consulta personalizada
   */
  protected async executeQuery<R>(
    query: string,
    params: any[] = []
  ): Promise<ServiceResult<R[]>> {
    try {
      const result = await pool.query(query, params);
      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
}
