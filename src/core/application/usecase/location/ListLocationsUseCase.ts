

import { BaseListUseCase } from '../base/BaseUseCase';
import { LocationRepositoryImpl } from '../../../../infrastructure/services/LocationRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListLocationsResponseDTO } from '../../dto/location/ListLocationsResponseDTO';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class ListLocationsUseCase extends BaseListUseCase<ListLocationsResponseDTO> {
  constructor(
    private locationRepository: LocationRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_LOCATIONS',
      entityName: 'Location',
    });
  }

  protected async findAll(): Promise<any> {
    const result = await this.locationRepository.findAll();
    if (!result.success || !result.data) {
      throw new Error(
        result.error?.message || 'Error al obtener la lista de ubicaciones'
      );
    }
    return result;
  }

  protected isValidEntity(entity: any): boolean {
    return !!(entity.id && entity.name);
  }

  protected mapToDTO(entity: any): LocationResponseDTO {
    return DTOMapper.mapLocationToResponseDTO(entity);
  }

  protected createListResponse(
    dtos: LocationResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): ListLocationsResponseDTO {
    return {
      locations: dtos,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
