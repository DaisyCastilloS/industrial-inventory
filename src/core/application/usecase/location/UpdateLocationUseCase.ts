/**
 * @fileoverview Caso de uso optimizado para actualizar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUpdateUseCase } from '../base/BaseUseCase';
import { ILocationRepository } from '../../../domain/repository/LocationRepository';
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
    private locationRepository: ILocationRepository,
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
    return this.locationRepository.update(id, data);
  }

  protected validateUpdatedEntity(entity: any): void {
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Persistencia inconsistente: la ubicación actualizada no tiene id, createdAt o updatedAt'
      );
    }
  }

  protected mapToDTO(entity: any): LocationResponseDTO {
    return DTOMapper.mapLocationToResponseDTO(entity);
  }
}
