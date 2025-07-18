/**
 * @fileoverview Caso de uso optimizado para obtener proveedor por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseGetByIdUseCase } from '../base/BaseUseCase';
import { ISupplierRepository } from '../../../domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

/**
 * Caso de uso optimizado para obtener proveedor por ID
 */
export class GetSupplierByIdUseCase extends BaseGetByIdUseCase<SupplierResponseDTO> {
  constructor(
    private supplierRepository: ISupplierRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'GET_SUPPLIER_BY_ID',
      entityName: 'Supplier',
    });
  }

  protected async findById(id: number): Promise<any> {
    const result = await this.supplierRepository.findById(id);
    if (!result.success || !result.data) {
      throw new Error(`Proveedor con ID ${id} no encontrado`);
    }
    return result.data;
  }

  protected validateEntity(entity: any): void {
    if (!entity.id) {
      throw new Error(
        'Persistencia inconsistente: el proveedor no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): SupplierResponseDTO {
    return DTOMapper.mapSupplierToResponseDTO(entity);
  }
}
