/**
 * @fileoverview Caso de uso optimizado para obtener categoría por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseGetByIdUseCase } from '../base/BaseUseCase';
import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class GetCategoryByIdUseCase extends BaseGetByIdUseCase<CategoryResponseDTO> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'GET_CATEGORY_BY_ID',
      entityName: 'Category',
    });
  }

  protected async findById(id: number): Promise<any> {
    const result = await this.categoryRepository.findById(id);
    if (!result.success || !result.data) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }
    return result.data;
  }

  protected validateEntity(entity: any): void {
    if (!entity.id) {
      throw new Error(
        'Persistencia inconsistente: la categoría no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): CategoryResponseDTO {
    return DTOMapper.mapCategoryToResponseDTO(entity);
  }
}
