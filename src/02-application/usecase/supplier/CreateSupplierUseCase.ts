/**
 * @fileoverview Caso de uso para crear proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ISupplierRepository } from '../../../01-domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { CreateSupplierDTO, validateCreateSupplier } from '../../dto/supplier/CreateSupplierDTO';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';

/**
 * Caso de uso para crear proveedores
 */
export class CreateSupplierUseCase {
  constructor(
    private supplierRepository: ISupplierRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para crear un proveedor.
   * @param data - DTO de creación de proveedor
   * @returns Proveedor creado (DTO)
   */
  async execute(data: CreateSupplierDTO): Promise<SupplierResponseDTO> {
    try {
      const validatedData = validateCreateSupplier(data);
      const createdSupplier = await this.supplierRepository.create(validatedData);
      await this.logger.info('Proveedor creado exitosamente', {
        supplierId: createdSupplier.id,
        name: createdSupplier.name,
        action: 'CREATE_SUPPLIER'
      });
      if (
        createdSupplier.id === undefined ||
        createdSupplier.createdAt === undefined ||
        createdSupplier.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: el proveedor creado no tiene id, createdAt o updatedAt');
      }
      return {
        id: createdSupplier.id,
        name: createdSupplier.name,
        description: createdSupplier.description ?? null,
        contactPerson: createdSupplier.contactPerson ?? null,
        email: createdSupplier.email ?? null,
        phone: createdSupplier.phone ?? null,
        address: createdSupplier.address ?? null,
        isActive: createdSupplier.isActive,
        createdAt: createdSupplier.createdAt,
        updatedAt: createdSupplier.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al crear proveedor', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        data,
        action: 'CREATE_SUPPLIER'
      });
      throw error;
    }
  }
} 