/**
 * @fileoverview Implementación del repositorio de categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import { Category, ICategory } from '../../core/domain/entity/Category';
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

  override async create(entity: ICategory): Promise<ServiceResult<Category>> {
    return super.create(entity);
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

  async findActive(): Promise<ServiceResult<Category[]>> {
    return this.findByField('is_active', true);
  }

  async findByName(name: string): Promise<ServiceResult<Category | null>> {
    const result = await this.findByField('name', name);
    return {
      success: result.success,
      data: result.data?.[0] || null,
      error: result.error,
    };
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
    return this.findByField('parent_id', parentId);
  }

  async findChildren(parentId: number): Promise<ServiceResult<Category[]>> {
    return this.findByField('parent_id', parentId);
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

  async hasChildren(categoryId: number): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE parent_id = $1`;
      const result = await pool.query(query, [categoryId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      return false;
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

  async existsByName(name: string): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE name = $1`;
      const result = await pool.query(query, [name]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      return false;
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

  async getStats(): Promise<
    ServiceResult<{
      totalCategories: number;
      activeCategories: number;
      rootCategories: number;
    }>
  > {
    try {
      const totalQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
      const activeQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE is_active = true`;
      const rootQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE parent_id IS NULL AND is_active = true`;

      const [totalResult, activeResult, rootResult] = await Promise.all([
        pool.query(totalQuery),
        pool.query(activeQuery),
        pool.query(rootQuery),
      ]);

      return {
        success: true,
        data: {
          totalCategories: parseInt(totalResult.rows[0].count),
          activeCategories: parseInt(activeResult.rows[0].count),
          rootCategories: parseInt(rootResult.rows[0].count),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalCategories: 0,
          activeCategories: 0,
          rootCategories: 0,
        },
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}
