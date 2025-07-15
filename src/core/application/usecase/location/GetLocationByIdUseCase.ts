/**
 * @fileoverview Caso de uso optimizado para obtener ubicación por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseGetByIdUseCase } from '../base/BaseUseCase';
import { ILocationRepository } from '../../../domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class GetLocationByIdUseCase extends BaseGetByIdUseCase<LocationResponseDTO> {
  constructor(
    private locationRepository: ILocationRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'GET_LOCATION_BY_ID',
      entityName: 'Location',
    });
  }

  protected async findById(id: number): Promise<any> {
    return this.locationRepository.findById(id);
  }

  protected validateEntity(entity: any): void {
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Persistencia inconsistente: la ubicación no tiene id, createdAt o updatedAt'
      );
    }
  }

  protected mapToDTO(entity: any): LocationResponseDTO {
    return DTOMapper.mapLocationToResponseDTO(entity);
  }
}
