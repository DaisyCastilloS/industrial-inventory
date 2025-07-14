import { Request, Response } from 'express';
import { CreateProductMovementUseCase } from '../../02-application/usecase/productMovement/CreateProductMovementUseCase';
import { ListProductMovementsUseCase } from '../../02-application/usecase/productMovement/ListProductMovementsUseCase';
import { ListProductMovementsByUserUseCase } from '../../02-application/usecase/productMovement/ListProductMovementsByUserUseCase';
import { ProductMovementRepositoryImpl } from '../../03-infrastructure/services/ProductMovementRepositoryImpl';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { validateCreateProductMovement } from '../../02-application/dto/productMovement/CreateProductMovementDTO';
import { buildSuccessResponse, buildCreatedResponse, buildErrorResponse } from '../utils/ResponseHelper';

export class ProductMovementController {
  private readonly createProductMovementUseCase: CreateProductMovementUseCase;
  private readonly listProductMovementsUseCase: ListProductMovementsUseCase;
  private readonly listProductMovementsByUserUseCase: ListProductMovementsByUserUseCase;

  constructor() {
    const productMovementRepository = new ProductMovementRepositoryImpl();
    const logger = new WinstonLogger();
    this.createProductMovementUseCase = new CreateProductMovementUseCase(productMovementRepository, logger);
    this.listProductMovementsUseCase = new ListProductMovementsUseCase(productMovementRepository, logger);
    this.listProductMovementsByUserUseCase = new ListProductMovementsByUserUseCase(productMovementRepository, logger);
  }

  createProductMovement = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateCreateProductMovement(req.body);
      const movement = await this.createProductMovementUseCase.execute(validatedData);
      res.status(201).json(buildCreatedResponse(movement, 'Movimiento de producto creado exitosamente'));
    } catch (error) {
      this.handleError(error, req, res, 'createProductMovement');
    }
  };

  listProductMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      const movements = await this.listProductMovementsUseCase.execute();
      res.status(200).json(buildSuccessResponse('Lista de movimientos de producto', movements));
    } catch (error) {
      this.handleError(error, req, res, 'listProductMovements');
    }
  };

  listProductMovementsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.params.userId);
      const movements = await this.listProductMovementsByUserUseCase.execute(userId);
      res.status(200).json(buildSuccessResponse('Movimientos de producto por usuario', movements));
    } catch (error) {
      this.handleError(error, req, res, 'listProductMovementsByUser');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
} 