/**
 * @fileoverview Caso de uso optimizado para actualizar categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUpdateUseCase } from '../base/BaseUseCase';
import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  UpdateCategoryDTO,
  validateUpdateCategory,
} from '../../dto/category/UpdateCategoryDTO';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class UpdateCategoryUseCase extends BaseUpdateUseCase<
  UpdateCategoryDTO,
  CategoryResponseDTO
> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'UPDATE_CATEGORY',
      entityName: 'Category',
    });
  }

  protected async findById(id: number): Promise<any> {
    return this.categoryRepository.findById(id);
  }

  protected validateInput(input: UpdateCategoryDTO): any {
    return validateUpdateCategory(input);
  }

  protected async updateEntity(id: number, data: any): Promise<any> {
    const result = await this.categoryRepository.update(id, data);
    if (!result.success || !result.data) {
      throw new Error('Error al actualizar la categoría');
    }
    return result.data;
  }

  protected validateUpdatedEntity(entity: any): void {
    if (!entity || !entity.id) {
      throw new Error(
        'Persistencia inconsistente: la categoría actualizada no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): CategoryResponseDTO {
    return DTOMapper.mapCategoryToResponseDTO(entity);
  }
}
