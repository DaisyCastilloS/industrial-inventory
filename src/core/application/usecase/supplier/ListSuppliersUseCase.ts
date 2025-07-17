/**
 * @fileoverview Caso de uso optimizado para listar proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../../base/BaseUseCase';
import { ISupplierRepository } from '../../../domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';
import { Supplier } from '../../../domain/entity/Supplier';
import { ServiceResult, PaginatedResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class ListSuppliersUseCase extends BaseListUseCase<Supplier, SupplierResponseDTO> {
  constructor(
    private supplierRepository: ISupplierRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, { action: 'LIST_SUPPLIERS', entityName: 'Supplier' });
  }

  protected async findAll(filters?: Record<string, any>): Promise<ServiceResult<PaginatedResult<Supplier>>> {
    return this.supplierRepository.findAll(filters);
  }

  protected mapToDTO(supplier: Supplier): SupplierResponseDTO {
    return {
      id: supplier.id || 0,
      name: supplier.name,
      description: supplier.description || null,
      isActive: supplier.isActive,
      email: supplier.email,
      phone: supplier.phone || null,
      address: supplier.address || null,
      createdAt: supplier.createdAt || new Date(),
      updatedAt: supplier.updatedAt || new Date()
    };
  }
}
