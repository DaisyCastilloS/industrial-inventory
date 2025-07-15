/**
 * @fileoverview Caso de uso para crear categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../base/BaseUseCase';
import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  CreateCategoryDTO,
  validateCreateCategory,
} from '../../dto/category/CreateCategoryDTO';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class CreateCategoryUseCase extends BaseCreateUseCase<
  CreateCategoryDTO,
  CategoryResponseDTO
> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'CREATE_CATEGORY',
      entityName: 'Category',
    });
  }

  protected validateInput(input: CreateCategoryDTO): any {
    return validateCreateCategory(input);
  }

  protected async createEntity(data: any): Promise<any> {
    return this.categoryRepository.create(data);
  }

  protected validateCreatedEntity(entity: any): void {
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Persistencia inconsistente: la categoría creada no tiene id, createdAt o updatedAt'
      );
    }
  }

  protected mapToDTO(entity: any): CategoryResponseDTO {
    return DTOMapper.mapCategoryToResponseDTO(entity);
  }
}
