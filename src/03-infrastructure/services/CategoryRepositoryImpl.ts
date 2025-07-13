/**
 * @fileoverview Implementación del repositorio de categorías
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { Category, ICategory } from "../../01-domain/entity/Category";
import { ICategoryRepository } from "../../01-domain/repository/CategoryRepository";

/**
 * Consultas SQL para categorías
 */
const CategoryQueries = {
  create: `
    INSERT INTO categories (name, description, parent_id, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `,
  
  findById: `
    SELECT * FROM categories WHERE id = $1
  `,
  
  findByName: `
    SELECT * FROM categories WHERE name = $1
  `,
  
  findAll: `
    SELECT * FROM categories ORDER BY created_at DESC
  `,
  
  findActive: `
    SELECT * FROM categories WHERE is_active = true ORDER BY created_at DESC
  `,
  
  findByParent: `
    SELECT * FROM categories WHERE parent_id = $1 AND is_active = true
  `,
  
  findRootCategories: `
    SELECT * FROM categories WHERE parent_id IS NULL AND is_active = true
  `,
  
  update: `
    UPDATE categories 
    SET name = $1, description = $2, parent_id = $3, is_active = $4, updated_at = $5
    WHERE id = $6
  `,
  
  delete: `
    DELETE FROM categories WHERE id = $1
  `,
  
  existsByName: `
    SELECT COUNT(*) FROM categories WHERE name = $1
  `,
  
  getAuditTrail: `
    SELECT * FROM audit_logs 
    WHERE table_name = 'categories' AND record_id = $1 
    ORDER BY created_at DESC
  `
};

/**
 * Implementación del repositorio de categorías
 */
export class CategoryRepositoryImpl implements ICategoryRepository {
  
  async create(category: ICategory): Promise<Category> {
    const result = await pool.query(CategoryQueries.create, [
      category.name,
      category.description,
      category.parentId,
      category.isActive,
      category.createdAt || new Date(),
      category.updatedAt || new Date()
    ]);
    
    if (result.rows.length > 0) {
      const createdCategory = new Category({
        id: result.rows[0].id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        isActive: category.isActive,
        createdAt: category.createdAt || new Date(),
        updatedAt: category.updatedAt || new Date()
      });
      return createdCategory;
    }
    
    throw new Error('Error al crear categoría');
  }

  async findById(id: number): Promise<Category | null> {
    const result = await pool.query(CategoryQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parent_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findByName(name: string): Promise<Category | null> {
    const result = await pool.query(CategoryQueries.findByName, [name]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parent_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findAll(): Promise<Category[]> {
    const result = await pool.query(CategoryQueries.findAll);
    return result.rows.map(row => new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parent_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findActive(): Promise<Category[]> {
    const result = await pool.query(CategoryQueries.findActive);
    return result.rows.map(row => new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parent_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findByParent(parentId: number): Promise<Category[]> {
    const result = await pool.query(CategoryQueries.findByParent, [parentId]);
    return result.rows.map(row => new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parent_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findRootCategories(): Promise<Category[]> {
    const result = await pool.query(CategoryQueries.findRootCategories);
    return result.rows.map(row => new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parent_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async update(id: number, categoryData: Partial<ICategory>): Promise<Category> {
    const existingCategory = await this.findById(id);
    if (!existingCategory) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }

    const updatedData = {
      name: categoryData.name || existingCategory.name,
      description: categoryData.description || existingCategory.description,
      parentId: categoryData.parentId || existingCategory.parentId,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : existingCategory.isActive,
      updatedAt: new Date()
    };

    await pool.query(CategoryQueries.update, [
      updatedData.name,
      updatedData.description,
      updatedData.parentId,
      updatedData.isActive,
      updatedData.updatedAt,
      id
    ]);

    return new Category({
      id,
      ...updatedData,
      createdAt: existingCategory.createdAt
    });
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(CategoryQueries.delete, [id]);
    if (result.rowCount === 0) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await pool.query(CategoryQueries.existsByName, [name]);
    return parseInt(result.rows[0].count) > 0;
  }

  async getAuditTrail(categoryId: number): Promise<any[]> {
    const result = await pool.query(CategoryQueries.getAuditTrail, [categoryId]);
    return result.rows;
  }

  async findChildren(parentId: number): Promise<Category[]> {
    return this.findByParent(parentId);
  }

  async findHierarchy(categoryId: number): Promise<Category[]> {
    // Implementación recursiva para obtener toda la jerarquía
    const result = await pool.query(
      `WITH RECURSIVE category_hierarchy AS (
        SELECT id, name, description, parent_id, is_active, created_at, updated_at, 0 as level
        FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id, c.name, c.description, c.parent_id, c.is_active, c.created_at, c.updated_at, ch.level + 1
        FROM categories c
        INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
        WHERE c.is_active = true
      )
      SELECT * FROM category_hierarchy ORDER BY level`,
      [categoryId]
    );
    
    return result.rows.map(row => new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      parentId: row.parent_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async activate(id: number): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }

    category.activate();
    return this.update(id, { isActive: true });
  }

  async deactivate(id: number): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }

    category.deactivate();
    return this.update(id, { isActive: false });
  }

  async hasChildren(categoryId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM categories WHERE parent_id = $1 AND is_active = true`,
      [categoryId]
    );
    
    return parseInt(result.rows[0].count) > 0;
  }
} 