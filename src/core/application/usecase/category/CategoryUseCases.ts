import { BaseGetByIdUseCase, BaseListUseCase, BaseCreateUseCase, BaseUpdateUseCase, BaseDeleteUseCase } from '../../base/BaseUseCase';
import { Category } from '../../../domain/entity/Category';
import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { CreateCategoryDTO } from '../../dto/category/CreateCategoryDTO';
import { UpdateCategoryDTO } from '../../dto/category/UpdateCategoryDTO';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { ServiceResult, PaginatedResult } from '../../../../infrastructure/services/base/ServiceTypes';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export class OptimizedGetCategoryByIdUseCase extends BaseGetByIdUseCase<Category, CategoryResponseDTO> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'GET_CATEGORY_BY_ID', entityName: 'Category' });
  }

  protected async findById(id: number): Promise<ServiceResult<Category>> {
    return this.categoryRepository.findById(id);
  }

  protected async validateEntity(entity: Category): Promise<void> {
    if (!entity || !entity.name) {
      throw new Error('Invalid category entity');
    }
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

export class OptimizedListCategoriesUseCase extends BaseListUseCase<Category, CategoryResponseDTO> {
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

export class OptimizedCreateCategoryUseCase extends BaseCreateUseCase<CreateCategoryDTO, Category> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'CREATE_CATEGORY', entityName: 'Category' });
  }

  protected async validateCreateInput(input: CreateCategoryDTO): Promise<void> {
    if (!input.name) {
      throw new Error('Category name is required');
    }
  }

  protected async performCreate(data: CreateCategoryDTO): Promise<ServiceResult<Category>> {
    const category = new Category({
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      parentId: data.parentId ?? undefined,
    });
    return this.categoryRepository.create(category);
  }

  protected async validateCreatedEntity(entity: Category): Promise<void> {
    if (!entity || !entity.name) {
      throw new Error('Invalid category entity');
    }
  }
}

export class OptimizedUpdateCategoryUseCase extends BaseUpdateUseCase<UpdateCategoryDTO & { id: number }, Category> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'UPDATE_CATEGORY', entityName: 'Category' });
  }

  protected async validateUpdateInput(input: UpdateCategoryDTO & { id: number }): Promise<void> {
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Category name cannot be empty');
    }
  }

  protected async findEntityById(id: number): Promise<ServiceResult<Category>> {
    return this.categoryRepository.findById(id);
  }

  protected async performUpdate(current: Category, input: UpdateCategoryDTO & { id: number }): Promise<ServiceResult<Category>> {
    const updatedCategory = new Category({
      ...current,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      isActive: input.isActive ?? current.isActive,
      parentId: input.parentId ?? current.parentId
    });
    return this.categoryRepository.update(input.id, updatedCategory);
  }

  protected async validateUpdatedEntity(entity: Category): Promise<void> {
    if (!entity || !entity.name) {
      throw new Error('Invalid category entity');
    }
  }
}

export class OptimizedDeleteCategoryUseCase extends BaseDeleteUseCase<Category> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'DELETE_CATEGORY', entityName: 'Category' });
  }

  protected async findEntityById(id: number): Promise<ServiceResult<Category>> {
    return this.categoryRepository.findById(id);
  }

  protected async performDelete(id: number): Promise<ServiceResult<void>> {
    return this.categoryRepository.delete(id);
  }
}
