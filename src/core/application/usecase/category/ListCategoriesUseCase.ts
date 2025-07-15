/**
 * @fileoverview Caso de uso optimizado para listar categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../base/BaseUseCase';
import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListCategoriesResponseDTO } from '../../dto/category/ListCategoriesResponseDTO';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class ListCategoriesUseCase extends BaseListUseCase<ListCategoriesResponseDTO> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_CATEGORIES',
      entityName: 'Category',
    });
  }

  protected async findAll(): Promise<any[]> {
    return this.categoryRepository.findAll();
  }

  protected isValidEntity(entity: any): boolean {
    return !!(entity.id && entity.createdAt && entity.updatedAt);
  }

  protected mapToDTO(entity: any): CategoryResponseDTO {
    return DTOMapper.mapCategoryToResponseDTO(entity);
  }

  protected createListResponse(
    dtos: CategoryResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): ListCategoriesResponseDTO {
    return {
      categories: dtos,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
