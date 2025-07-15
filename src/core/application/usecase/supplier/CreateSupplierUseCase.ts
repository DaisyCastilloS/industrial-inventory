/**
 * @fileoverview Caso de uso optimizado para crear proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../base/BaseUseCase';
import { ISupplierRepository } from '../../../domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  CreateSupplierDTO,
  validateCreateSupplier,
} from '../../dto/supplier/CreateSupplierDTO';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

/**
 * Caso de uso optimizado para crear proveedores
 */
export class CreateSupplierUseCase extends BaseCreateUseCase<
  CreateSupplierDTO,
  SupplierResponseDTO
> {
  constructor(
    private supplierRepository: ISupplierRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'CREATE_SUPPLIER',
      entityName: 'Supplier',
    });
  }

  protected validateInput(input: CreateSupplierDTO): any {
    return validateCreateSupplier(input);
  }

  protected async createEntity(data: any): Promise<any> {
    return this.supplierRepository.create(data);
  }

  protected validateCreatedEntity(entity: any): void {
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Persistencia inconsistente: el proveedor creado no tiene id, createdAt o updatedAt'
      );
    }
  }

  protected mapToDTO(entity: any): SupplierResponseDTO {
    return DTOMapper.mapSupplierToResponseDTO(entity);
  }
}
