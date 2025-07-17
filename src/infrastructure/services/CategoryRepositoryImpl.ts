
import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import {
  Category,
  ICategory,
  CategoryName,
} from '../../core/domain/entity/Category';
import { ICategoryRepository } from '../../core/domain/repository/CategoryRepository';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';
import { AuditLog } from '../../core/domain/entity/AuditLog';

export class CategoryRepositoryImpl
  extends BaseRepositoryImpl<Category>
  implements ICategoryRepository
{
  protected tableName = 'categories';
  protected entityClass = Category;


  protected getAllowedFields(): string[] {
    return [
      'id', 'name', 'description', 'parentId', 'isActive', 
      'createdAt', 'updatedAt'
    ];
  }

  protected mapFieldName(field: string): string {
    // Mapeo específico para campos de la entidad Category
    const fieldMapping: { [key: string]: string } = {
      '_name': 'name',
      '_description': 'description',
      '_parentId': 'parent_id',
      '_isActive': 'is_active',
      '_createdAt': 'created_at',
      '_updatedAt': 'updated_at',
      'name': 'name',
      'description': 'description',
      'parentId': 'parent_id',
      'isActive': 'is_active',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };
    
    return fieldMapping[field] || field;
  }

  async findActive(): Promise<ServiceResult<Category[]>> {
    return this.findByField('is_active', true);
  }

  async create(category: ICategory): Promise<ServiceResult<Category>> {
    try {
      const query = `
        INSERT INTO ${this.tableName} (name, description, parent_id, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        category.name,
        category.description || null,
        category.parentId || null,
        category.isActive !== undefined ? category.isActive : true
      ];

      const result = await pool.query(query, values);
      const createdCategory = this.mapRowToEntity(result.rows[0]);
      return { success: true, data: createdCategory };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  override async update(
    id: number,
    entityData: Partial<ICategory>
  ): Promise<ServiceResult<Category>> {
    return super.update(id, entityData);
  }

  override async findById(id: number): Promise<ServiceResult<Category>> {
    return super.findById(id);
  }

  override async delete(id: number): Promise<ServiceResult<void>> {
    return super.delete(id);
  }

  override async activate(id: number): Promise<ServiceResult<Category>> {
    return super.activate(id);
  }

  override async deactivate(id: number): Promise<ServiceResult<Category>> {
    return super.deactivate(id);
  }

  async findByName(name: CategoryName | string): Promise<ServiceResult<Category | null>> {
    try {
      const result = await this.findByField('name', name);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || new Error('No data returned'),
        };
      }
      return { success: true, data: result.data[0] || null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async findByDescription(
    description: string
  ): Promise<ServiceResult<Category[]>> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE description ILIKE $1 ORDER BY created_at DESC`;
      const result = await pool.query(query, [`%${description}%`]);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async findRootCategories(): Promise<ServiceResult<Category[]>> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE parent_id IS NULL AND is_active = true ORDER BY created_at DESC`;
      const result = await pool.query(query);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async findByParent(parentId: number): Promise<ServiceResult<Category[]>> {
    try {
      const result = await this.findByField('parent_id', parentId);
      return result;
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async findChildren(parentId: number): Promise<ServiceResult<Category[]>> {
    return this.findByParent(parentId);
  }

  async getCategoryTree(): Promise<ServiceResult<Category[]>> {
    try {
      const query = `
        WITH RECURSIVE category_tree AS (
          SELECT id, name, description, parent_id, is_active, created_at, updated_at, 0 as level
          FROM ${this.tableName}
          WHERE parent_id IS NULL AND is_active = true
          
          UNION ALL
          
          SELECT c.id, c.name, c.description, c.parent_id, c.is_active, c.created_at, c.updated_at, ct.level + 1
          FROM ${this.tableName} c
          INNER JOIN category_tree ct ON c.parent_id = ct.id
          WHERE c.is_active = true
        )
        SELECT * FROM category_tree
        ORDER BY level, name
      `;
      
      const result = await pool.query(query);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async getCategoryPath(categoryId: number): Promise<ServiceResult<Category[]>> {
    try {
      const query = `
        WITH RECURSIVE category_path AS (
          SELECT id, name, description, parent_id, is_active, created_at, updated_at
          FROM ${this.tableName}
          WHERE id = $1
          
          UNION ALL
          
          SELECT c.id, c.name, c.description, c.parent_id, c.is_active, c.created_at, c.updated_at
          FROM ${this.tableName} c
          INNER JOIN category_path cp ON c.id = cp.parent_id
        )
        SELECT * FROM category_path
        ORDER BY id
      `;
      
      const result = await pool.query(query, [categoryId]);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async existsByName(name: string): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE name = $1`;
      const result = await pool.query(query, [name]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      return false;
    }
  }

  async hasChildren(categoryId: number): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE parent_id = $1`;
      const result = await pool.query(query, [categoryId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      return false;
    }
  }

  async findHierarchy(categoryId: number): Promise<ServiceResult<Category[]>> {
    try {
      const query = `
        WITH RECURSIVE category_hierarchy AS (
          SELECT id, name, parent_id, 0 as level
          FROM ${this.tableName}
          WHERE id = $1
          UNION ALL
          SELECT c.id, c.name, c.parent_id, ch.level + 1
          FROM ${this.tableName} c
          INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
        )
        SELECT * FROM category_hierarchy ORDER BY level
      `;
      const result = await pool.query(query, [categoryId]);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async findByLevel(level: number): Promise<ServiceResult<Category[]>> {
    try {
      const query = `
        WITH RECURSIVE category_tree AS (
          SELECT id, name, parent_id, 0 as level
          FROM ${this.tableName}
          WHERE parent_id IS NULL
          UNION ALL
          SELECT c.id, c.name, c.parent_id, ct.level + 1
          FROM ${this.tableName} c
          INNER JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT * FROM category_tree WHERE level = $1
      `;
      const result = await pool.query(query, [level]);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async getAuditTrail(
    id: number
  ): Promise<ServiceResult<AuditLog<ICategory>[]>> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE table_name = 'categories' AND record_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [id]);
      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    root: number;
  }> {
    try {
      const [totalResult, activeResult, rootResult] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM ${this.tableName}`),
        pool.query(`SELECT COUNT(*) FROM ${this.tableName} WHERE is_active = true`),
        pool.query(`SELECT COUNT(*) FROM ${this.tableName} WHERE parent_id IS NULL AND is_active = true`),
      ]);

      return {
        total: parseInt(totalResult.rows[0].count),
        active: parseInt(activeResult.rows[0].count),
        root: parseInt(rootResult.rows[0].count),
      };
    } catch (error) {
      throw new Error('Error al obtener estadísticas de categorías');
    }
  }
}
