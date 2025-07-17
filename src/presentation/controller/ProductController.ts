import { Request, Response } from 'express';
import { BaseController, BaseControllerConfig } from './base/BaseController';
import { GetProductByIdUseCase } from '../../core/application/usecase/product/GetProductByIdUseCase';
import { ListProductsUseCase } from '../../core/application/usecase/product/ListProductsUseCase';
import { CreateProductUseCase } from '../../core/application/usecase/product/CreateProductUseCase';
import { UpdateProductUseCase } from '../../core/application/usecase/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../core/application/usecase/product/DeleteProductUseCase';
import { validateCreateProduct } from '../../core/application/dto/product/CreateProductDTO';
import { validateUpdateProduct } from '../../core/application/dto/product/UpdateProductDTO';

export class ProductController extends BaseController {
  constructor(
    private getProductByIdUseCase: GetProductByIdUseCase,
    private listProductsUseCase: ListProductsUseCase,
    private createProductUseCase: CreateProductUseCase,
    private updateProductUseCase: UpdateProductUseCase,
    private deleteProductUseCase: DeleteProductUseCase
  ) {
    super({
      entityName: 'Product',
      successMessages: {
        created: 'Product created successfully',
        found: 'Product found',
        listed: 'Products list',
        updated: 'Product updated',
        deleted: 'Product deleted'
      }
    });
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getById(req: Request, res: Response): Promise<void> {
    await this.handleGetById(req, res, (id) => 
      this.getProductByIdUseCase.execute(id)
    );
  }

  async list(req: Request, res: Response): Promise<void> {
    await this.handleList(req, res, (params) => 
      this.listProductsUseCase.execute(params)
    );
  }

  async create(req: Request, res: Response): Promise<void> {
    await this.handleCreate(
      req,
      res,
      validateCreateProduct,
      (data) => this.createProductUseCase.execute(data)
    );
  }

  async update(req: Request, res: Response): Promise<void> {
    await this.handleUpdate(
      req,
      res,
      validateUpdateProduct,
      (id, data) => this.updateProductUseCase.execute({ id, ...data })
    );
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.handleDelete(req, res, (id) => 
      this.deleteProductUseCase.execute(id)
    );
  }
}
