import { Request, Response } from 'express';
import { CreateSupplierUseCase } from '../../02-application/usecase/supplier/CreateSupplierUseCase';
import { GetSupplierByIdUseCase } from '../../02-application/usecase/supplier/GetSupplierByIdUseCase';
import { ListSuppliersUseCase } from '../../02-application/usecase/supplier/ListSuppliersUseCase';
import { UpdateSupplierUseCase } from '../../02-application/usecase/supplier/UpdateSupplierUseCase';
import { DeleteSupplierUseCase } from '../../02-application/usecase/supplier/DeleteSupplierUseCase';
import { SupplierRepositoryImpl } from '../../03-infrastructure/services/SupplierRepositoryImpl';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { validateCreateSupplier } from '../../02-application/dto/supplier/CreateSupplierDTO';
import { validateUpdateSupplier } from '../../02-application/dto/supplier/UpdateSupplierDTO';
import { buildSuccessResponse, buildCreatedResponse, buildErrorResponse } from '../utils/ResponseHelper';

export class SupplierController {
  private readonly createSupplierUseCase: CreateSupplierUseCase;
  private readonly getSupplierByIdUseCase: GetSupplierByIdUseCase;
  private readonly listSuppliersUseCase: ListSuppliersUseCase;
  private readonly updateSupplierUseCase: UpdateSupplierUseCase;
  private readonly deleteSupplierUseCase: DeleteSupplierUseCase;

  constructor() {
    const supplierRepository = new SupplierRepositoryImpl();
    const logger = new WinstonLogger();
    this.createSupplierUseCase = new CreateSupplierUseCase(supplierRepository, logger);
    this.getSupplierByIdUseCase = new GetSupplierByIdUseCase(supplierRepository, logger);
    this.listSuppliersUseCase = new ListSuppliersUseCase(supplierRepository, logger);
    this.updateSupplierUseCase = new UpdateSupplierUseCase(supplierRepository, logger);
    this.deleteSupplierUseCase = new DeleteSupplierUseCase(supplierRepository, logger);
  }

  createSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateCreateSupplier(req.body);
      const supplier = await this.createSupplierUseCase.execute(validatedData);
      res.status(201).json(buildCreatedResponse(supplier, 'Proveedor creado exitosamente'));
    } catch (error) {
      this.handleError(error, req, res, 'createSupplier');
    }
  };

  getSupplierById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const supplier = await this.getSupplierByIdUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Proveedor encontrado', supplier));
    } catch (error) {
      this.handleError(error, req, res, 'getSupplierById');
    }
  };

  listSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const suppliers = await this.listSuppliersUseCase.execute();
      res.status(200).json(buildSuccessResponse('Lista de proveedores', suppliers));
    } catch (error) {
      this.handleError(error, req, res, 'listSuppliers');
    }
  };

  updateSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const validatedData = validateUpdateSupplier(req.body);
      const supplier = await this.updateSupplierUseCase.execute(id, validatedData);
      res.status(200).json(buildSuccessResponse('Proveedor actualizado', supplier));
    } catch (error) {
      this.handleError(error, req, res, 'updateSupplier');
    }
  };

  deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.deleteSupplierUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Proveedor eliminado', { id }));
    } catch (error) {
      this.handleError(error, req, res, 'deleteSupplier');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
} 