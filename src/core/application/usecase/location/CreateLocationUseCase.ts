/**
 * @fileoverview Caso de uso optimizado para crear ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../base/BaseUseCase';
import { ILocationRepository } from '../../../domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  CreateLocationDTO,
  validateCreateLocation,
} from '../../dto/location/CreateLocationDTO';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class CreateLocationUseCase extends BaseCreateUseCase<
  CreateLocationDTO,
  LocationResponseDTO
> {
  constructor(
    private locationRepository: ILocationRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'CREATE_LOCATION',
      entityName: 'Location',
    });
  }

  protected validateInput(input: CreateLocationDTO): any {
    return validateCreateLocation(input);
  }

  protected async createEntity(data: any): Promise<any> {
    return this.locationRepository.create(data);
  }

  protected validateCreatedEntity(entity: any): void {
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Persistencia inconsistente: la ubicación creada no tiene id, createdAt o updatedAt'
      );
    }
  }

  protected mapToDTO(entity: any): LocationResponseDTO {
    return DTOMapper.mapLocationToResponseDTO(entity);
  }
}
