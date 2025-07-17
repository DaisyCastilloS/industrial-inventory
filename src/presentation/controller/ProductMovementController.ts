import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import { CreateProductMovementUseCase } from '../../core/application/usecase/productMovement/CreateProductMovementUseCase';
import { GetProductMovementByIdUseCase } from '../../core/application/usecase/productMovement/GetProductMovementByIdUseCase';
import { ListProductMovementsUseCase } from '../../core/application/usecase/productMovement/ListProductMovementsUseCase';
import { ListProductMovementsByUserUseCase } from '../../core/application/usecase/productMovement/ListProductMovementsByUserUseCase';
import { ListProductMovementsByProductUseCase } from '../../core/application/usecase/productMovement/ListProductMovementsByProductUseCase';
import { ProductMovementRepositoryImpl } from '../../infrastructure/services/ProductMovementRepositoryImpl';
import { ProductRepositoryImpl } from '../../infrastructure/services/ProductRepositoryImpl';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateCreateProductMovement } from '../../core/application/dto/productMovement/CreateProductMovementDTO';
import { CustomJWTPayload } from '../../core/application/interface/CustomJWTPayload';

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
    const productRepository = new ProductRepositoryImpl();
    const logger = new WinstonLogger();

    this.createProductMovementUseCase = new CreateProductMovementUseCase(
      productMovementRepository,
      productRepository,
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
    try {
      // Extraer userId del token (req.user debe estar seteado por el middleware de autenticación)
      const user = req.user as unknown as CustomJWTPayload;
      if (!user || !user.userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado o token inválido',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const validatedData = validateCreateProductMovement(req.body);
      
      // Inyectar el userId en el DTO para el caso de uso
      const dataWithUserId = {
        ...validatedData,
        user_id: user.userId
      };

      const result = await this.createProductMovementUseCase.execute(dataWithUserId);
      
      res.status(201).json({
        success: true,
        message: this.config.successMessages.created,
        data: result
      });
    } catch (error) {
      // Log detallado para depuración de errores de validación
      console.error('[createProductMovement] Error:', error);
      this.handleError(error, req, res, 'createProductMovement');
    }
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
      this.handleError(error, req, res, 'listProductMovementsByUser');
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
      this.handleError(error, req, res, 'listProductMovementsByProduct');
    }
  };
}
