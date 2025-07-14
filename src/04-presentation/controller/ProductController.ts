import { Request, Response } from 'express';
import { CreateProductUseCase } from '../../02-application/usecase/product/CreateProductUseCase';
import { GetProductByIdUseCase } from '../../02-application/usecase/product/GetProductByIdUseCase';
import { ListProductsUseCase } from '../../02-application/usecase/product/ListProductsUseCase';
import { UpdateProductUseCase } from '../../02-application/usecase/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../02-application/usecase/product/DeleteProductUseCase';
import { ProductRepositoryImpl } from '../../03-infrastructure/services/ProductRepositoryImpl';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { validateCreateProduct } from '../../02-application/dto/product/CreateProductDTO';
import { validateUpdateProduct } from '../../02-application/dto/product/UpdateProductDTO';
import { buildSuccessResponse, buildCreatedResponse, buildErrorResponse } from '../utils/ResponseHelper';

export class ProductController {
  private readonly createProductUseCase: CreateProductUseCase;
  private readonly getProductByIdUseCase: GetProductByIdUseCase;
  private readonly listProductsUseCase: ListProductsUseCase;
  private readonly updateProductUseCase: UpdateProductUseCase;
  private readonly deleteProductUseCase: DeleteProductUseCase;

  constructor() {
    const productRepository = new ProductRepositoryImpl();
    const logger = new WinstonLogger();
    this.createProductUseCase = new CreateProductUseCase(productRepository, logger);
    this.getProductByIdUseCase = new GetProductByIdUseCase(productRepository, logger);
    this.listProductsUseCase = new ListProductsUseCase(productRepository, logger);
    this.updateProductUseCase = new UpdateProductUseCase(productRepository, logger);
    this.deleteProductUseCase = new DeleteProductUseCase(productRepository, logger);
  }

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateCreateProduct(req.body);
      const product = await this.createProductUseCase.execute(validatedData);
      res.status(201).json(buildCreatedResponse(product, 'Producto creado exitosamente'));
    } catch (error) {
      this.handleError(error, req, res, 'createProduct');
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const product = await this.getProductByIdUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Producto encontrado', product));
    } catch (error) {
      this.handleError(error, req, res, 'getProductById');
    }
  };

  listProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.listProductsUseCase.execute();
      res.status(200).json(buildSuccessResponse('Lista de productos', products));
    } catch (error) {
      this.handleError(error, req, res, 'listProducts');
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const validatedData = validateUpdateProduct(req.body);
      const product = await this.updateProductUseCase.execute(id, validatedData);
      res.status(200).json(buildSuccessResponse('Producto actualizado', product));
    } catch (error) {
      this.handleError(error, req, res, 'updateProduct');
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.deleteProductUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Producto eliminado', { id }));
    } catch (error) {
      this.handleError(error, req, res, 'deleteProduct');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
}