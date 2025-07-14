import { Request, Response } from 'express';
import { CreateCategoryUseCase } from '../../02-application/usecase/category/CreateCategoryUseCase';
import { GetCategoryByIdUseCase } from '../../02-application/usecase/category/GetCategoryByIdUseCase';
import { ListCategoriesUseCase } from '../../02-application/usecase/category/ListCategoriesUseCase';
import { UpdateCategoryUseCase } from '../../02-application/usecase/category/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../02-application/usecase/category/DeleteCategoryUseCase';
import { CategoryRepositoryImpl } from '../../03-infrastructure/services/CategoryRepositoryImpl';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { validateCreateCategory } from '../../02-application/dto/category/CreateCategoryDTO';
import { validateUpdateCategory } from '../../02-application/dto/category/UpdateCategoryDTO';
import { buildSuccessResponse, buildCreatedResponse, buildErrorResponse } from '../utils/ResponseHelper';

export class CategoryController {
  private readonly createCategoryUseCase: CreateCategoryUseCase;
  private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase;
  private readonly listCategoriesUseCase: ListCategoriesUseCase;
  private readonly updateCategoryUseCase: UpdateCategoryUseCase;
  private readonly deleteCategoryUseCase: DeleteCategoryUseCase;

  constructor() {
    const categoryRepository = new CategoryRepositoryImpl();
    const logger = new WinstonLogger();
    this.createCategoryUseCase = new CreateCategoryUseCase(categoryRepository, logger);
    this.getCategoryByIdUseCase = new GetCategoryByIdUseCase(categoryRepository, logger);
    this.listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository, logger);
    this.updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository, logger);
    this.deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository, logger);
  }

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateCreateCategory(req.body);
      const category = await this.createCategoryUseCase.execute(validatedData);
      res.status(201).json(buildCreatedResponse(category, 'Categoría creada exitosamente'));
    } catch (error) {
      this.handleError(error, req, res, 'createCategory');
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const category = await this.getCategoryByIdUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Categoría encontrada', category));
    } catch (error) {
      this.handleError(error, req, res, 'getCategoryById');
    }
  };

  listCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.listCategoriesUseCase.execute();
      res.status(200).json(buildSuccessResponse('Lista de categorías', categories));
    } catch (error) {
      this.handleError(error, req, res, 'listCategories');
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const validatedData = validateUpdateCategory(req.body);
      const category = await this.updateCategoryUseCase.execute(id, validatedData);
      res.status(200).json(buildSuccessResponse('Categoría actualizada', category));
    } catch (error) {
      this.handleError(error, req, res, 'updateCategory');
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.deleteCategoryUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Categoría eliminada', { id }));
    } catch (error) {
      this.handleError(error, req, res, 'deleteCategory');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
} 