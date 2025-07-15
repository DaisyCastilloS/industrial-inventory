/**
 * @fileoverview Caso de uso optimizado para eliminar proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseDeleteUseCase } from '../base/BaseUseCase';
import { ISupplierRepository } from '../../../domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso optimizado para eliminar proveedores
 */
export class DeleteSupplierUseCase extends BaseDeleteUseCase {
  constructor(
    private supplierRepository: ISupplierRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'DELETE_SUPPLIER',
      entityName: 'Supplier',
    });
  }

  protected async findById(id: number): Promise<any> {
    return this.supplierRepository.findById(id);
  }

  protected async deleteEntity(id: number): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
