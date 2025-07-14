/**
 * @fileoverview Caso de uso para eliminar categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ICategoryRepository } from '../../../01-domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para eliminar categorías
 */
export class DeleteCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para eliminar una categoría.
   * @param id - ID de la categoría
   * @returns void
   */
  async execute(id: number): Promise<void> {
    try {
      await this.categoryRepository.delete(id);
      await this.logger.info('Categoría eliminada exitosamente', {
        categoryId: id,
        action: 'DELETE_CATEGORY'
      });
    } catch (error) {
      await this.logger.error('Error al eliminar categoría', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        action: 'DELETE_CATEGORY'
      });
      throw error;
    }
  }
} 