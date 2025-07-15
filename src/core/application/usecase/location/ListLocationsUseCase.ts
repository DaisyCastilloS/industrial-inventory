/**
 * @fileoverview Caso de uso optimizado para listar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../base/BaseUseCase';
import { ILocationRepository } from '../../../domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListLocationsResponseDTO } from '../../dto/location/ListLocationsResponseDTO';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class ListLocationsUseCase extends BaseListUseCase<ListLocationsResponseDTO> {
  constructor(
    private locationRepository: ILocationRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_LOCATIONS',
      entityName: 'Location',
    });
  }

  protected async findAll(): Promise<any[]> {
    return this.locationRepository.findAll();
  }

  protected isValidEntity(entity: any): boolean {
    return !!(entity.id && entity.createdAt && entity.updatedAt);
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
