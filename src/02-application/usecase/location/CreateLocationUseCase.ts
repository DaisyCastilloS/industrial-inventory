/**
 * @fileoverview Caso de uso para crear ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ILocationRepository } from '../../../01-domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { CreateLocationDTO, validateCreateLocation } from '../../dto/location/CreateLocationDTO';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';

/**
 * Caso de uso para crear ubicaciones
 */
export class CreateLocationUseCase {
  constructor(
    private locationRepository: ILocationRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para crear una ubicación.
   * @param data - DTO de creación de ubicación
   * @returns Ubicación creada (DTO)
   */
  async execute(data: CreateLocationDTO): Promise<LocationResponseDTO> {
    try {
      const validatedData = validateCreateLocation(data);
      const createdLocation = await this.locationRepository.create(validatedData);
      await this.logger.info('Ubicación creada exitosamente', {
        locationId: createdLocation.id,
        name: createdLocation.name,
        action: 'CREATE_LOCATION'
      });
      if (
        createdLocation.id === undefined ||
        createdLocation.createdAt === undefined ||
        createdLocation.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: la ubicación creada no tiene id, createdAt o updatedAt');
      }
      return {
        id: createdLocation.id,
        name: createdLocation.name,
        description: createdLocation.description ?? null,
        code: createdLocation.code ?? null,
        type: createdLocation.type ?? null,
        parentId: createdLocation.parentId ?? null,
        isActive: createdLocation.isActive,
        createdAt: createdLocation.createdAt,
        updatedAt: createdLocation.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al crear ubicación', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        data,
        action: 'CREATE_LOCATION'
      });
      throw error;
    }
  }
} 