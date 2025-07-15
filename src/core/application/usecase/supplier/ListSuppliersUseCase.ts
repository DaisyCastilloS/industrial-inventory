/**
 * @fileoverview Caso de uso optimizado para listar proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../base/BaseUseCase';
import { ISupplierRepository } from '../../../domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListSuppliersResponseDTO } from '../../dto/supplier/ListSuppliersResponseDTO';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

/**
 * Caso de uso optimizado para listar proveedores
 */
export class ListSuppliersUseCase extends BaseListUseCase<ListSuppliersResponseDTO> {
  constructor(
    private supplierRepository: ISupplierRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_SUPPLIERS',
      entityName: 'Supplier',
    });
  }

  protected async findAll(): Promise<any[]> {
    return this.supplierRepository.findAll();
  }

  protected isValidEntity(entity: any): boolean {
    return !!(entity.id && entity.createdAt && entity.updatedAt);
  }

  protected mapToDTO(entity: any): SupplierResponseDTO {
    return DTOMapper.mapSupplierToResponseDTO(entity);
  }

  protected createListResponse(
    dtos: SupplierResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): ListSuppliersResponseDTO {
    return {
      suppliers: dtos,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
