/**
 * @fileoverview Caso de uso para obtener proveedor por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ISupplierRepository } from '../../../01-domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';

/**
 * Caso de uso para obtener proveedor por ID
 */
export class GetSupplierByIdUseCase {
  constructor(
    private supplierRepository: ISupplierRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para obtener un proveedor por su ID.
   * @param id - ID del proveedor
   * @returns Proveedor encontrado (DTO)
   */
  async execute(id: number): Promise<SupplierResponseDTO> {
    try {
      const supplier = await this.supplierRepository.findById(id);
      if (!supplier) {
        throw new Error(`Proveedor con ID ${id} no encontrado`);
      }
      await this.logger.info('Proveedor consultado exitosamente', {
        supplierId: id,
        name: supplier.name,
        action: 'GET_SUPPLIER_BY_ID'
      });
      if (
        supplier.id === undefined ||
        supplier.createdAt === undefined ||
        supplier.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: el proveedor no tiene id, createdAt o updatedAt');
      }
      return {
        id: supplier.id,
        name: supplier.name,
        description: supplier.description ?? null,
        contactPerson: supplier.contactPerson ?? null,
        email: supplier.email ?? null,
        phone: supplier.phone ?? null,
        address: supplier.address ?? null,
        isActive: supplier.isActive,
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al obtener proveedor por ID', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        action: 'GET_SUPPLIER_BY_ID'
      });
      throw error;
    }
  }
} 