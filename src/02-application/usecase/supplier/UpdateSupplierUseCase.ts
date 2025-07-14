/**
 * @fileoverview Caso de uso para actualizar proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ISupplierRepository } from '../../../01-domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { UpdateSupplierDTO, validateUpdateSupplier } from '../../dto/supplier/UpdateSupplierDTO';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';

/**
 * Caso de uso para actualizar proveedores
 */
export class UpdateSupplierUseCase {
  constructor(
    private supplierRepository: ISupplierRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para actualizar un proveedor.
   * @param id - ID del proveedor
   * @param data - DTO de actualización de proveedor
   * @returns Proveedor actualizado (DTO)
   */
  async execute(id: number, data: UpdateSupplierDTO): Promise<SupplierResponseDTO> {
    try {
      const validatedData = validateUpdateSupplier(data);
      const updatedSupplier = await this.supplierRepository.update(id, validatedData);
      await this.logger.info('Proveedor actualizado exitosamente', {
        supplierId: updatedSupplier.id,
        name: updatedSupplier.name,
        action: 'UPDATE_SUPPLIER'
      });
      if (
        updatedSupplier.id === undefined ||
        updatedSupplier.createdAt === undefined ||
        updatedSupplier.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: el proveedor actualizado no tiene id, createdAt o updatedAt');
      }
      return {
        id: updatedSupplier.id,
        name: updatedSupplier.name,
        description: updatedSupplier.description ?? null,
        contactPerson: updatedSupplier.contactPerson ?? null,
        email: updatedSupplier.email ?? null,
        phone: updatedSupplier.phone ?? null,
        address: updatedSupplier.address ?? null,
        isActive: updatedSupplier.isActive,
        createdAt: updatedSupplier.createdAt,
        updatedAt: updatedSupplier.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al actualizar proveedor', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        data,
        action: 'UPDATE_SUPPLIER'
      });
      throw error;
    }
  }
} 