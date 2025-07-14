/**
 * @fileoverview Caso de uso para eliminar proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ISupplierRepository } from '../../../01-domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para eliminar proveedores
 */
export class DeleteSupplierUseCase {
  constructor(
    private supplierRepository: ISupplierRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para eliminar un proveedor.
   * @param id - ID del proveedor
   * @returns void
   */
  async execute(id: number): Promise<void> {
    try {
      await this.supplierRepository.delete(id);
      await this.logger.info('Proveedor eliminado exitosamente', {
        supplierId: id,
        action: 'DELETE_SUPPLIER'
      });
    } catch (error) {
      await this.logger.error('Error al eliminar proveedor', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        action: 'DELETE_SUPPLIER'
      });
      throw error;
    }
  }
} 