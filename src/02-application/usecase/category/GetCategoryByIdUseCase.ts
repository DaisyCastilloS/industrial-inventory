/**
 * @fileoverview Caso de uso para obtener categoría por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ICategoryRepository } from '../../../01-domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';

/**
 * Caso de uso para obtener categoría por ID
 */
export class GetCategoryByIdUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para obtener una categoría por su ID.
   * @param id - ID de la categoría
   * @returns Categoría encontrada (DTO)
   */
  async execute(id: number): Promise<CategoryResponseDTO> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new Error(`Categoría con ID ${id} no encontrada`);
      }
      await this.logger.info('Categoría consultada exitosamente', {
        categoryId: id,
        name: category.name,
        action: 'GET_CATEGORY_BY_ID'
      });
      // Validación estricta de campos obligatorios
      if (
        category.id === undefined ||
        category.createdAt === undefined ||
        category.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: la categoría no tiene id, createdAt o updatedAt');
      }
      // Mapear a DTO de respuesta
      return {
        id: category.id,
        name: category.name,
        description: category.description ?? null,
        parentId: category.parentId ?? null,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al obtener categoría por ID', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        action: 'GET_CATEGORY_BY_ID'
      });
      throw error;
    }
  }
} 