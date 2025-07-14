/**
 * @fileoverview Caso de uso para listar categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ICategoryRepository } from '../../../01-domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListCategoriesResponseDTO } from '../../dto/category/ListCategoriesResponseDTO';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';

/**
 * Caso de uso para listar categorías
 */
export class ListCategoriesUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para listar todas las categorías.
   * @param page - Página actual (opcional, por defecto 1)
   * @param limit - Límite de resultados por página (opcional, por defecto 10)
   * @returns Respuesta paginada de categorías (DTO)
   */
  async execute(page: number = 1, limit: number = 10): Promise<ListCategoriesResponseDTO> {
    try {
      const categories = await this.categoryRepository.findAll();
      // Validación estricta de campos obligatorios
      const validCategories = categories.filter(cat =>
        cat.id !== undefined &&
        cat.createdAt !== undefined &&
        cat.updatedAt !== undefined
      );
      if (validCategories.length !== categories.length) {
        throw new Error('Persistencia inconsistente: una o más categorías no tienen id, createdAt o updatedAt');
      }
      const total = validCategories.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginated = validCategories.slice(startIndex, endIndex);
      const categoryDTOs: CategoryResponseDTO[] = paginated.map(category => ({
        id: category.id!,
        name: category.name,
        description: category.description ?? null,
        parentId: category.parentId ?? null,
        isActive: category.isActive,
        createdAt: category.createdAt!,
        updatedAt: category.updatedAt!
      }));
      await this.logger.info('Lista de categorías consultada exitosamente', {
        count: categoryDTOs.length,
        action: 'LIST_CATEGORIES'
      });
      return {
        categories: categoryDTOs,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      await this.logger.error('Error al listar categorías', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        action: 'LIST_CATEGORIES'
      });
      throw error;
    }
  }
} 