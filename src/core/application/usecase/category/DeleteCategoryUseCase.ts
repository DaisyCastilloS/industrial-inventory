/**
 * @fileoverview Caso de uso optimizado para eliminar categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseDeleteUseCase } from '../base/BaseUseCase';
import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export class DeleteCategoryUseCase extends BaseDeleteUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'DELETE_CATEGORY',
      entityName: 'Category',
    });
  }

  protected async findById(id: number): Promise<any> {
    return this.categoryRepository.findById(id);
  }

  protected async deleteEntity(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
