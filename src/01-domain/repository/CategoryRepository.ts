/**
 * @fileoverview Interfaz del repositorio de categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Category, ICategory } from '../entity/Category';
import { AuditLog } from '../entity/AuditLog';
// Tipos semánticos importados de la entidad Category
import type { CategoryName } from '../entity/Category';

/**
 * Interfaz del repositorio de categorías
 *
 * Todos los métodos usan tipado semántico y retornan entidades de dominio.
 */
export interface ICategoryRepository {
  /**
   * Crea una nueva categoría
   * @param category - Datos de la categoría
   * @returns Categoría creada
   */
  create(category: ICategory): Promise<Category>;

  /**
   * Busca una categoría por ID
   * @param id - ID de la categoría
   * @returns Categoría encontrada o null
   */
  findById(id: number): Promise<Category | null>;

  /**
   * Busca una categoría por nombre (tipado semántico)
   * @param name - Nombre de la categoría
   * @returns Categoría encontrada o null
   */
  findByName(name: CategoryName | string): Promise<Category | null>;

  /**
   * Obtiene todas las categorías
   * @returns Lista de categorías
   */
  findAll(): Promise<Category[]>;

  /**
   * Obtiene categorías activas
   * @returns Lista de categorías activas
   */
  findActive(): Promise<Category[]>;

  /**
   * Obtiene categorías raíz (sin padre)
   * @returns Lista de categorías raíz
   */
  findRootCategories(): Promise<Category[]>;

  /**
   * Obtiene subcategorías de una categoría
   * @param parentId - ID de la categoría padre
   * @returns Lista de subcategorías
   */
  findChildren(parentId: number): Promise<Category[]>;

  /**
   * Obtiene la jerarquía completa de una categoría
   * @param categoryId - ID de la categoría
   * @returns Lista de categorías en la jerarquía
   */
  findHierarchy(categoryId: number): Promise<Category[]>;

  /**
   * Actualiza una categoría
   * @param id - ID de la categoría
   * @param categoryData - Datos a actualizar
   * @returns Categoría actualizada
   */
  update(id: number, categoryData: Partial<ICategory>): Promise<Category>;

  /**
   * Elimina una categoría (soft delete)
   * @param id - ID de la categoría
   */
  delete(id: number): Promise<void>;

  /**
   * Activa una categoría
   * @param id - ID de la categoría
   * @returns Categoría activada
   */
  activate(id: number): Promise<Category>;

  /**
   * Desactiva una categoría
   * @param id - ID de la categoría
   * @returns Categoría desactivada
   */
  deactivate(id: number): Promise<Category>;

  /**
   * Verifica si existe una categoría con el nombre dado (tipado semántico)
   * @param name - Nombre a verificar
   * @returns true si existe
   */
  existsByName(name: CategoryName | string): Promise<boolean>;

  /**
   * Verifica si una categoría tiene subcategorías
   * @param categoryId - ID de la categoría
   * @returns true si tiene subcategorías
   */
  hasChildren(categoryId: number): Promise<boolean>;

  /**
   * Obtiene el historial de auditoría de una categoría
   * @param categoryId - ID de la categoría
   * @returns Lista de logs de auditoría de la categoría
   */
  getAuditTrail(categoryId: number): Promise<AuditLog<ICategory>[]>;
} 