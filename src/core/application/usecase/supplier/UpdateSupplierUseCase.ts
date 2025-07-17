/**
 * @fileoverview Caso de uso optimizado para actualizar proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUpdateUseCase } from '../base/BaseUseCase';
import { ISupplierRepository } from '../../../domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  UpdateSupplierDTO,
  validateUpdateSupplier,
} from '../../dto/supplier/UpdateSupplierDTO';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

/**
 * Caso de uso optimizado para actualizar proveedores
 */
export class UpdateSupplierUseCase extends BaseUpdateUseCase<
  UpdateSupplierDTO,
  SupplierResponseDTO
> {
  constructor(
    private supplierRepository: ISupplierRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'UPDATE_SUPPLIER',
      entityName: 'Supplier',
    });
  }

  protected async findById(id: number): Promise<any> {
    return this.supplierRepository.findById(id);
  }

  protected validateInput(input: UpdateSupplierDTO): any {
    return validateUpdateSupplier(input);
  }

  protected async updateEntity(id: number, data: any): Promise<any> {
    const result = await this.supplierRepository.update(id, data);
    if (!result.success || !result.data) {
      throw new Error('Error al actualizar el proveedor');
    }
    return result.data;
  }

  protected validateUpdatedEntity(entity: any): void {
    if (!entity || !entity.id) {
      throw new Error(
        'Persistencia inconsistente: el proveedor actualizado no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): SupplierResponseDTO {
    return DTOMapper.mapSupplierToResponseDTO(entity);
  }
}
