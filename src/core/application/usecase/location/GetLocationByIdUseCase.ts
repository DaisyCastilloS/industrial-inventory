

import { BaseGetByIdUseCase } from '../base/BaseUseCase';
import { LocationRepositoryImpl } from '../../../../infrastructure/services/LocationRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class GetLocationByIdUseCase extends BaseGetByIdUseCase<LocationResponseDTO> {
  constructor(
    private locationRepository: LocationRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'GET_LOCATION_BY_ID',
      entityName: 'Location',
    });
  }

  protected async findById(id: number): Promise<any> {
    const result = await this.locationRepository.findById(id);
    if (!result.success || !result.data) {
      throw new Error(`Ubicación con ID ${id} no encontrada`);
    }
    return result.data;
  }

  protected validateEntity(entity: any): void {
    if (!entity.id) {
      throw new Error(
        'Persistencia inconsistente: la ubicación no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): LocationResponseDTO {
    return DTOMapper.mapLocationToResponseDTO(entity);
  }
}
