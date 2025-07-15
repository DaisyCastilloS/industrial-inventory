/**
 * @fileoverview Interfaz del repositorio de categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Category, ICategory } from '../entity/Category';
import { AuditLog } from '../entity/AuditLog';
import { IBaseRepository } from './base/BaseRepository';
import { ServiceResult } from '../../infrastructure/services/base/ServiceTypes';
// Tipos semánticos importados de la entidad Category
import type { CategoryName } from '../entity/Category';

/**
 * Interfaz del repositorio de categorías
 *
 * Todos los métodos usan tipado semántico y retornan entidades de dominio.
 */
export interface ICategoryRepository extends IBaseRepository<Category> {
  /**
   * Busca una categoría por nombre (tipado semántico)
   * @param name - Nombre de la categoría
   * @returns Categoría encontrada o null
   */
  findByName(
    name: CategoryName | string
  ): Promise<ServiceResult<Category | null>>;

  /**
   * Obtiene categorías activas
   * @returns Lista de categorías activas
   */
  findActive(): Promise<ServiceResult<Category[]>>;

  /**
   * Obtiene categorías raíz (sin padre)
   * @returns Lista de categorías raíz
   */
  findRootCategories(): Promise<ServiceResult<Category[]>>;

  /**
   * Obtiene subcategorías de una categoría
   * @param parentId - ID de la categoría padre
   * @returns Lista de subcategorías
   */
  findChildren(parentId: number): Promise<ServiceResult<Category[]>>;

  /**
   * Obtiene la jerarquía completa de una categoría
   * @param categoryId - ID de la categoría
   * @returns Lista de categorías en la jerarquía
   */
  findHierarchy(categoryId: number): Promise<ServiceResult<Category[]>>;

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
  getAuditTrail(
    categoryId: number
  ): Promise<ServiceResult<AuditLog<ICategory>[]>>;
}
