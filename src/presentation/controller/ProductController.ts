/**
 * @fileoverview Controlador para productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import { CreateProductUseCase } from '../../core/application/usecase/product/CreateProductUseCase';
import { GetProductByIdUseCase } from '../../core/application/usecase/product/GetProductByIdUseCase';
import { ListProductsUseCase } from '../../core/application/usecase/product/ListProductsUseCase';
import { UpdateProductUseCase } from '../../core/application/usecase/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../core/application/usecase/product/DeleteProductUseCase';
import { ProductRepositoryImpl } from '../../infrastructure/services/ProductRepositoryImpl';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateCreateProduct } from '../../core/application/dto/product/CreateProductDTO';
import { validateUpdateProduct } from '../../core/application/dto/product/UpdateProductDTO';

export class ProductController extends BaseController {
  private readonly createProductUseCase: CreateProductUseCase;
  private readonly getProductByIdUseCase: GetProductByIdUseCase;
  private readonly listProductsUseCase: ListProductsUseCase;
  private readonly updateProductUseCase: UpdateProductUseCase;
  private readonly deleteProductUseCase: DeleteProductUseCase;

  constructor() {
    super({
      entityName: 'Product',
      successMessages: {
        created: 'Producto creado exitosamente',
        found: 'Producto encontrado',
        listed: 'Lista de productos',
        updated: 'Producto actualizado',
        deleted: 'Producto eliminado',
      },
    });

    const productRepository = new ProductRepositoryImpl();
    const logger = new WinstonLogger();

    this.createProductUseCase = new CreateProductUseCase(
      productRepository,
      logger
    );
    this.getProductByIdUseCase = new GetProductByIdUseCase(
      productRepository,
      logger
    );
    this.listProductsUseCase = new ListProductsUseCase(
      productRepository,
      logger
    );
    this.updateProductUseCase = new UpdateProductUseCase(
      productRepository,
      logger
    );
    this.deleteProductUseCase = new DeleteProductUseCase(
      productRepository,
      logger
    );
  }

  createProduct = async (req: Request, res: Response): Promise<void> => {
    await this.handleCreate(req, res, validateCreateProduct, data =>
      this.createProductUseCase.execute(data)
    );
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    await this.handleGetById(req, res, id =>
      this.getProductByIdUseCase.execute(id)
    );
  };

  listProducts = async (req: Request, res: Response): Promise<void> => {
    await this.handleList(req, res, params =>
      this.listProductsUseCase.execute({
        page: params.page,
        limit: params.limit,
      })
    );
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    await this.handleUpdate(req, res, validateUpdateProduct, (id, data) =>
      this.updateProductUseCase.execute({ id, data })
    );
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    await this.handleDelete(req, res, id =>
      this.deleteProductUseCase.execute(id)
    );
  };
}
