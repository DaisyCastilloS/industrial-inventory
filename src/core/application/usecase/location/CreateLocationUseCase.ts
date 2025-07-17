

import { BaseCreateUseCase } from '../base/BaseUseCase';
import { LocationRepositoryImpl } from '../../../../infrastructure/services/LocationRepositoryImpl';
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
    private locationRepository: LocationRepositoryImpl,
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
    const result = await this.locationRepository.create(data);
    if (!result.success || !result.data) {
      throw new Error('Error al crear la ubicación');
    }
    return result.data;
  }

  protected validateCreatedEntity(entity: any): void {
    if (!entity || !entity.id) {
      throw new Error(
        'Persistencia inconsistente: la ubicación creada no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): LocationResponseDTO {
    return DTOMapper.mapLocationToResponseDTO(entity);
  }
}
