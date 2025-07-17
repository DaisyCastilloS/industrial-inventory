import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import { CreateCategoryUseCase } from '../../core/application/usecase/category/CreateCategoryUseCase';
import { GetCategoryByIdUseCase } from '../../core/application/usecase/category/GetCategoryByIdUseCase';
import { ListCategoriesUseCase } from '../../core/application/usecase/category/ListCategoriesUseCase';
import { UpdateCategoryUseCase } from '../../core/application/usecase/category/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../core/application/usecase/category/DeleteCategoryUseCase';
import { CategoryRepositoryImpl } from '../../infrastructure/services/CategoryRepositoryImpl';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateCreateCategory } from '../../core/application/dto/category/CreateCategoryDTO';
import { validateUpdateCategory } from '../../core/application/dto/category/UpdateCategoryDTO';

export class CategoryController extends BaseController {
  private readonly createCategoryUseCase: CreateCategoryUseCase;
  private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase;
  private readonly listCategoriesUseCase: ListCategoriesUseCase;
  private readonly updateCategoryUseCase: UpdateCategoryUseCase;
  private readonly deleteCategoryUseCase: DeleteCategoryUseCase;

  constructor() {
    super({
      entityName: 'Category',
      successMessages: {
        created: 'Categoría creada exitosamente',
        found: 'Categoría encontrada',
        listed: 'Lista de categorías',
        updated: 'Categoría actualizada',
        deleted: 'Categoría eliminada',
      },
    });

    const categoryRepository = new CategoryRepositoryImpl();
    const logger = new WinstonLogger();

    this.createCategoryUseCase = new CreateCategoryUseCase(
      categoryRepository,
      logger
    );
    this.getCategoryByIdUseCase = new GetCategoryByIdUseCase(
      categoryRepository,
      logger
    );
    this.listCategoriesUseCase = new ListCategoriesUseCase(
      categoryRepository,
      logger
    );
    this.updateCategoryUseCase = new UpdateCategoryUseCase(
      categoryRepository,
      logger
    );
    this.deleteCategoryUseCase = new DeleteCategoryUseCase(
      categoryRepository,
      logger
    );
  }

  createCategory = async (req: Request, res: Response): Promise<void> => {
    await this.handleCreate(req, res, validateCreateCategory, data =>
      this.createCategoryUseCase.execute(data)
    );
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    await this.handleGetById(req, res, id =>
      this.getCategoryByIdUseCase.execute(id)
    );
  };

  listCategories = async (req: Request, res: Response): Promise<void> => {
    await this.handleList(req, res, params =>
      this.listCategoriesUseCase.execute({
        page: params.page,
        limit: params.limit,
      })
    );
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    await this.handleUpdate(req, res, validateUpdateCategory, (id, data) =>
      this.updateCategoryUseCase.execute({ id, data })
    );
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    await this.handleDelete(req, res, id =>
      this.deleteCategoryUseCase.execute(id)
    );
  };
}
