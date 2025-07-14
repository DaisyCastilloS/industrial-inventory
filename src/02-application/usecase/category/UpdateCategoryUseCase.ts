/**
 * @fileoverview Caso de uso para actualizar categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ICategoryRepository } from '../../../01-domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { UpdateCategoryDTO, validateUpdateCategory } from '../../dto/category/UpdateCategoryDTO';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';

/**
 * Caso de uso para actualizar categorías
 */
export class UpdateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para actualizar una categoría.
   * @param id - ID de la categoría
   * @param data - DTO de actualización de categoría
   * @returns Categoría actualizada (DTO)
   */
  async execute(id: number, data: UpdateCategoryDTO): Promise<CategoryResponseDTO> {
    try {
      // Validar datos de entrada
      const validatedData = validateUpdateCategory(data);
      const updatedCategory = await this.categoryRepository.update(id, validatedData);
      await this.logger.info('Categoría actualizada exitosamente', {
        categoryId: updatedCategory.id,
        name: updatedCategory.name,
        action: 'UPDATE_CATEGORY'
      });
      // Validación estricta de campos obligatorios
      if (
        updatedCategory.id === undefined ||
        updatedCategory.createdAt === undefined ||
        updatedCategory.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: la categoría actualizada no tiene id, createdAt o updatedAt');
      }
      // Mapear a DTO de respuesta
      return {
        id: updatedCategory.id,
        name: updatedCategory.name,
        description: updatedCategory.description ?? null,
        parentId: updatedCategory.parentId ?? null,
        isActive: updatedCategory.isActive,
        createdAt: updatedCategory.createdAt,
        updatedAt: updatedCategory.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al actualizar categoría', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        data,
        action: 'UPDATE_CATEGORY'
      });
      throw error;
    }
  }
} 