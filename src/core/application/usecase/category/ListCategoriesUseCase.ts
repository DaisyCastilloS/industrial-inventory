/**
 * @fileoverview Caso de uso optimizado para listar categorías
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../../base/BaseUseCase';
import { Category } from '../../../domain/entity/Category';
import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';
import { ServiceResult, PaginatedResult } from '../../../../infrastructure/services/base/ServiceTypes';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export class ListCategoriesUseCase extends BaseListUseCase<Category, CategoryResponseDTO> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'LIST_CATEGORIES', entityName: 'Category' });
  }

  protected async findAll(filters?: Record<string, any>): Promise<ServiceResult<PaginatedResult<Category>>> {
    return this.categoryRepository.findAll(filters);
  }

  protected mapToDTO(entity: Category): CategoryResponseDTO {
    return {
      id: entity.id || 0,
      name: entity.name,
      description: entity.description || null,
      isActive: entity.isActive,
      parentId: entity.parentId || null,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date()
    };
  }
}
