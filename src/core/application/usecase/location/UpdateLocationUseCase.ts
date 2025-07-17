/**
 * @fileoverview Caso de uso optimizado para actualizar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUpdateUseCase } from '../base/BaseUseCase';
import { LocationRepositoryImpl } from '../../../../infrastructure/services/LocationRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  UpdateLocationDTO,
  validateUpdateLocation,
} from '../../dto/location/UpdateLocationDTO';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class UpdateLocationUseCase extends BaseUpdateUseCase<
  UpdateLocationDTO,
  LocationResponseDTO
> {
  constructor(
    private locationRepository: LocationRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'UPDATE_LOCATION',
      entityName: 'Location',
    });
  }

  protected async findById(id: number): Promise<any> {
    return this.locationRepository.findById(id);
  }

  protected validateInput(input: UpdateLocationDTO): any {
    return validateUpdateLocation(input);
  }

  protected async updateEntity(id: number, data: any): Promise<any> {
    const result = await this.locationRepository.update(id, data);
    if (!result.success || !result.data) {
      throw new Error('Error al actualizar la ubicación');
    }
    return result.data;
  }

  protected validateUpdatedEntity(entity: any): void {
    if (!entity || !entity.id) {
      throw new Error(
        'Persistencia inconsistente: la ubicación actualizada no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): LocationResponseDTO {
    return DTOMapper.mapLocationToResponseDTO(entity);
  }
}
