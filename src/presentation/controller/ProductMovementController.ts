/**
 * @fileoverview Controlador para movimientos de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import { CreateProductMovementUseCase } from '../../core/application/usecase/productMovement/CreateProductMovementUseCase';
import { GetProductMovementByIdUseCase } from '../../core/application/usecase/productMovement/GetProductMovementByIdUseCase';
import { ListProductMovementsUseCase } from '../../core/application/usecase/productMovement/ListProductMovementsUseCase';
import { ListProductMovementsByUserUseCase } from '../../core/application/usecase/productMovement/ListProductMovementsByUserUseCase';
import { ListProductMovementsByProductUseCase } from '../../core/application/usecase/productMovement/ListProductMovementsByProductUseCase';
import { ProductMovementRepositoryImpl } from '../../infrastructure/services/ProductMovementRepositoryImpl';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateCreateProductMovement } from '../../core/application/dto/productMovement/CreateProductMovementDTO';

export class ProductMovementController extends BaseController {
  private readonly createProductMovementUseCase: CreateProductMovementUseCase;
  private readonly getProductMovementByIdUseCase: GetProductMovementByIdUseCase;
  private readonly listProductMovementsUseCase: ListProductMovementsUseCase;
  private readonly listProductMovementsByUserUseCase: ListProductMovementsByUserUseCase;
  private readonly listProductMovementsByProductUseCase: ListProductMovementsByProductUseCase;

  constructor() {
    super({
      entityName: 'ProductMovement',
      successMessages: {
        created: 'Movimiento de producto creado exitosamente',
        found: 'Movimiento de producto encontrado',
        listed: 'Lista de movimientos de productos',
        updated: 'Movimiento de producto actualizado',
        deleted: 'Movimiento de producto eliminado',
      },
    });

    const productMovementRepository = new ProductMovementRepositoryImpl();
    const logger = new WinstonLogger();

    this.createProductMovementUseCase = new CreateProductMovementUseCase(
      productMovementRepository,
      logger
    );
    this.getProductMovementByIdUseCase = new GetProductMovementByIdUseCase(
      productMovementRepository,
      logger
    );
    this.listProductMovementsUseCase = new ListProductMovementsUseCase(
      productMovementRepository,
      logger
    );
    this.listProductMovementsByUserUseCase =
      new ListProductMovementsByUserUseCase(productMovementRepository, logger);
    this.listProductMovementsByProductUseCase =
      new ListProductMovementsByProductUseCase(
        productMovementRepository,
        logger
      );
  }

  createProductMovement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.handleCreate(req, res, validateCreateProductMovement, data =>
      this.createProductMovementUseCase.execute(data)
    );
  };

  getProductMovementById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.handleGetById(req, res, id =>
      this.getProductMovementByIdUseCase.execute(id)
    );
  };

  listProductMovements = async (req: Request, res: Response): Promise<void> => {
    await this.handleList(req, res, params =>
      this.listProductMovementsUseCase.execute({
        page: params.page,
        limit: params.limit,
      })
    );
  };

  listProductMovementsByUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }

    try {
      const result =
        await this.listProductMovementsByUserUseCase.execute(userId);
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  listProductMovementsByProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      res.status(400).json({ error: 'ID de producto inválido' });
      return;
    }

    try {
      const result =
        await this.listProductMovementsByProductUseCase.execute(productId);
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
