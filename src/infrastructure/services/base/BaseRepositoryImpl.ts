import { pool } from '../../db/database';
import {
  IBaseRepository,
  BaseEntity,
} from '../../../core/domain/repository/base/BaseRepository';
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

  protected getAllowedFields(): string[] {
    return [
      'id', 'created_at', 'updated_at', 'is_active'
    ];
  }

  protected validateField(field: string): string {
    const allowedFields = this.getAllowedFields();
    if (!allowedFields.includes(field)) {
      throw new Error(`Campo no permitido: ${field}`);
    }
    return this.mapFieldName(field);
  }

  protected mapRowToEntity(row: any): T {
    // Convert snake_case database fields to private entity fields with underscore prefix
    const entityData: any = {};
    for (const [key, value] of Object.entries(row)) {
      // Special handling for common fields
      switch (key) {
        case 'is_active':
          entityData.isActive = value;
          break;
        case 'created_at':
          entityData.createdAt = value;
          break;
        case 'updated_at':
          entityData.updatedAt = value;
          break;
        default:
          // Convert snake_case to camelCase for other fields
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          entityData[camelKey] = value;
      }
    }
    
    return new this.entityClass(entityData);
  }

  protected mapEntityToDbFields(entity: Partial<T>): { fields: string[], values: any[] } {
    const fields: string[] = [];
    const values: any[] = [];

    // Get the public representation of the entity using toJSON with includePassword=true for User entities
    const entityData = entity instanceof this.entityClass 
      ? (entity as any).toJSON?.(true) || (entity as any).toJSON()
      : entity;

    // Map entity fields to database fields
    Object.entries(entityData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Special handling for common fields
        let dbField: string;
        switch (key) {
          case 'isActive':
            dbField = 'is_active';
            break;
          case 'createdAt':
            dbField = 'created_at';
            break;
          case 'updatedAt':
            dbField = 'updated_at';
            break;
          default:
            // Convert camelCase to snake_case for other fields
            dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        }
        fields.push(dbField);
        values.push(value);
      }
    });

    return { fields, values };
  }

  protected mapFieldName(field: string): string {
    // Handle special cases first
    switch (field) {
      case 'isActive':
        return 'is_active';
      case 'createdAt':
        return 'created_at';
      case 'updatedAt':
        return 'updated_at';
      default:
        // Convert camelCase to snake_case for database fields
        return field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
  }

  protected addRelations(query: string): string {
    return query;
  }

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

  async create(entity: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const { fields, values } = this.mapEntityToDbFields(entity);
      const placeholders = values.map((_, index) => `$${index + 1}`);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders.join(', ')}, NOW(), NOW())
        RETURNING *
      `;

      console.log('DEBUG: Create query:', query);
      console.log('DEBUG: Create values:', values);
      console.log('DEBUG: Create fields:', fields);

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
      console.log('DEBUG: Create error:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

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
        const allowedOrderFields = this.getAllowedFields();
        if (!allowedOrderFields.includes(options.orderBy)) {
          throw new Error(`Campo de ordenamiento no permitido: ${options.orderBy}`);
        }
        const orderDirection = options.orderDirection === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${this.mapFieldName(options.orderBy)} ${orderDirection}`;
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

  async update(id: number, entityData: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const existingResult = await this.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      const { fields, values } = this.mapEntityToDbFields(entityData);
      if (fields.length === 0) {
        return {
          success: true,
          data: existingResult.data,
        };
      }

      const updateFields = fields.map((field, index) => `${field} = $${index + 1}`);
      values.push(id);

      const query = `
        UPDATE ${this.tableName} 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${values.length}
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

  async delete(id: number): Promise<ServiceResult<void>> {
    try {
      const query = `UPDATE ${this.tableName} SET is_active = false, updated_at = NOW() WHERE id = $1 AND is_active = true`;
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
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

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

  async exists(id: number): Promise<boolean> {
    const query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = $1)`;
    const result = await pool.query(query, [id]);
    return result.rows[0]?.exists || false;
  }

  async findByField(
    field: string,
    value: any,
    options?: RepositoryOptions
  ): Promise<ServiceResult<T[]>> {
    try {
      const mappedField = this.validateField(field);
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

  async existsByField(field: string, value: any): Promise<boolean> {
    const mappedField = this.validateField(field);
    const query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE ${mappedField} = $1)`;
    const result = await pool.query(query, [value]);
    return result.rows[0]?.exists || false;
  }
}
