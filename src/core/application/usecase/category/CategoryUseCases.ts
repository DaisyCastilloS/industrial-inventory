import { ICategoryRepository } from '../../../domain/repository/CategoryRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { CategoryResponseDTO } from '../../dto/category/CategoryResponseDTO';
import {
  CreateCategoryDTO,
  validateCreateCategory,
} from '../../dto/category/CreateCategoryDTO';
import {
  UpdateCategoryDTO,
  validateUpdateCategory,
} from '../../dto/category/UpdateCategoryDTO';
import { ListCategoriesResponseDTO } from '../../dto/category/ListCategoriesResponseDTO';
import {
  BaseGetByIdUseCase,
  BaseListUseCase,
  BaseCreateUseCase,
  BaseUpdateUseCase,
  BaseDeleteUseCase,
} from '../base/BaseUseCase';
import { DTOMapper } from '../../utils/DTOMapper';
import { Category } from '../../../domain/entity/Category';

export class OptimizedGetCategoryByIdUseCase extends BaseGetByIdUseCase<CategoryResponseDTO> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'GET_CATEGORY_BY_ID', entityName: 'Categoría' });
  }

  protected async findById(id: number) {
    return this.categoryRepository.findById(id);
  }

  protected validateEntity(category: any): void {
    if (!DTOMapper.validateEntity(category)) {
      throw new Error(
        'Persistencia inconsistente: la categoría no tiene campos obligatorios'
      );
    }
  }

  protected mapToDTO(category: any): CategoryResponseDTO {
    return DTOMapper.mapBaseEntity(category, {
      name: category.name,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
    });
  }
}

export class OptimizedListCategoriesUseCase extends BaseListUseCase<ListCategoriesResponseDTO> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'LIST_CATEGORIES', entityName: 'Categoría' });
  }

  protected async findAll() {
    return this.categoryRepository.findAll();
  }

  protected isValidEntity(category: any): boolean {
    return DTOMapper.validateEntity(category);
  }

  protected mapToDTO(category: any): CategoryResponseDTO {
    return DTOMapper.mapBaseEntity(category, {
      name: category.name,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
    });
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

export class OptimizedCreateCategoryUseCase extends BaseCreateUseCase<
  CreateCategoryDTO,
  CategoryResponseDTO
> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'CREATE_CATEGORY', entityName: 'Categoría' });
  }

  protected validateInput(input: CreateCategoryDTO) {
    return validateCreateCategory(input);
  }

  protected async createEntity(data: any) {
    return this.categoryRepository.create(data);
  }

  protected validateCreatedEntity(category: any): void {
    if (!DTOMapper.validateEntity(category)) {
      throw new Error(
        'Persistencia inconsistente: la categoría creada no tiene campos obligatorios'
      );
    }
  }

  protected mapToDTO(category: any): CategoryResponseDTO {
    return DTOMapper.mapBaseEntity(category, {
      name: category.name,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
    });
  }
}

export class OptimizedUpdateCategoryUseCase extends BaseUpdateUseCase<
  UpdateCategoryDTO,
  CategoryResponseDTO
> {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'UPDATE_CATEGORY', entityName: 'Categoría' });
  }

  protected async findById(id: number) {
    return this.categoryRepository.findById(id);
  }

  protected validateInput(input: UpdateCategoryDTO) {
    return validateUpdateCategory(input);
  }

  protected async updateEntity(id: number, data: any) {
    return this.categoryRepository.update(id, data);
  }

  protected validateUpdatedEntity(category: any): void {
    if (!DTOMapper.validateEntity(category)) {
      throw new Error(
        'Persistencia inconsistente: la categoría actualizada no tiene campos obligatorios'
      );
    }
  }

  protected mapToDTO(category: any): CategoryResponseDTO {
    return DTOMapper.mapBaseEntity(category, {
      name: category.name,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
    });
  }
}

export class OptimizedDeleteCategoryUseCase extends BaseDeleteUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'DELETE_CATEGORY', entityName: 'Categoría' });
  }

  protected async findById(id: number) {
    return this.categoryRepository.findById(id);
  }

  protected async deleteEntity(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
