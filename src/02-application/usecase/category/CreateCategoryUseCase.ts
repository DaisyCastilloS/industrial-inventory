/**
 * @fileoverview Caso de uso para crear categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ICategoryRepository } from '../../../01-domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { CreateCategoryDTO, validateCreateCategory } from '../../dto/category/CreateCategoryDTO';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';

/**
 * Caso de uso para crear categorías
 */
export class CreateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para crear una categoría.
   * @param data - DTO de creación de categoría
   * @returns Categoría creada (DTO)
   */
  async execute(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {
    try {
      // Validar datos de entrada
      const validatedData = validateCreateCategory(data);
      // Persistir categoría
      const createdCategory = await this.categoryRepository.create(validatedData);
      await this.logger.info('Categoría creada exitosamente', {
        categoryId: createdCategory.id,
        name: createdCategory.name,
        action: 'CREATE_CATEGORY'
      });
      // Validación estricta de campos obligatorios
      if (
        createdCategory.id === undefined ||
        createdCategory.createdAt === undefined ||
        createdCategory.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: la categoría creada no tiene id, createdAt o updatedAt');
      }
      // Mapear a DTO de respuesta
      return {
        id: createdCategory.id,
        name: createdCategory.name,
        description: createdCategory.description ?? null,
        parentId: createdCategory.parentId ?? null,
        isActive: createdCategory.isActive,
        createdAt: createdCategory.createdAt,
        updatedAt: createdCategory.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al crear categoría', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        data,
        action: 'CREATE_CATEGORY'
      });
      throw error;
    }
  }
} 