/**
 * @fileoverview Controlador para proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import { CreateSupplierUseCase } from '../../core/application/usecase/supplier/CreateSupplierUseCase';
import { GetSupplierByIdUseCase } from '../../core/application/usecase/supplier/GetSupplierByIdUseCase';
import { ListSuppliersUseCase } from '../../core/application/usecase/supplier/ListSuppliersUseCase';
import { UpdateSupplierUseCase } from '../../core/application/usecase/supplier/UpdateSupplierUseCase';
import { DeleteSupplierUseCase } from '../../core/application/usecase/supplier/DeleteSupplierUseCase';
import { SupplierRepositoryImpl } from '../../infrastructure/services/SupplierRepositoryImpl';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateCreateSupplier } from '../../core/application/dto/supplier/CreateSupplierDTO';
import { validateUpdateSupplier } from '../../core/application/dto/supplier/UpdateSupplierDTO';

export class SupplierController extends BaseController {
  private readonly createSupplierUseCase: CreateSupplierUseCase;
  private readonly getSupplierByIdUseCase: GetSupplierByIdUseCase;
  private readonly listSuppliersUseCase: ListSuppliersUseCase;
  private readonly updateSupplierUseCase: UpdateSupplierUseCase;
  private readonly deleteSupplierUseCase: DeleteSupplierUseCase;

  constructor() {
    super({
      entityName: 'Supplier',
      successMessages: {
        created: 'Proveedor creado exitosamente',
        found: 'Proveedor encontrado',
        listed: 'Lista de proveedores',
        updated: 'Proveedor actualizado',
        deleted: 'Proveedor eliminado',
      },
    });

    const supplierRepository = new SupplierRepositoryImpl();
    const logger = new WinstonLogger();

    this.createSupplierUseCase = new CreateSupplierUseCase(
      supplierRepository,
      logger
    );
    this.getSupplierByIdUseCase = new GetSupplierByIdUseCase(
      supplierRepository,
      logger
    );
    this.listSuppliersUseCase = new ListSuppliersUseCase(
      supplierRepository,
      logger
    );
    this.updateSupplierUseCase = new UpdateSupplierUseCase(
      supplierRepository,
      logger
    );
    this.deleteSupplierUseCase = new DeleteSupplierUseCase(
      supplierRepository,
      logger
    );
  }

  createSupplier = async (req: Request, res: Response): Promise<void> => {
    await this.handleCreate(req, res, validateCreateSupplier, data =>
      this.createSupplierUseCase.execute(data)
    );
  };

  getSupplierById = async (req: Request, res: Response): Promise<void> => {
    await this.handleGetById(req, res, id =>
      this.getSupplierByIdUseCase.execute(id)
    );
  };

  listSuppliers = async (req: Request, res: Response): Promise<void> => {
    await this.handleList(req, res, params =>
      this.listSuppliersUseCase.execute({
        page: params.page,
        limit: params.limit,
      })
    );
  };

  updateSupplier = async (req: Request, res: Response): Promise<void> => {
    await this.handleUpdate(req, res, validateUpdateSupplier, (id, data) =>
      this.updateSupplierUseCase.execute({ id, data })
    );
  };

  deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    await this.handleDelete(req, res, id =>
      this.deleteSupplierUseCase.execute(id)
    );
  };
}
