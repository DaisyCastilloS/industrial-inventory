/**
 * @fileoverview Caso de uso para obtener ubicación por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ILocationRepository } from '../../../01-domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';

/**
 * Caso de uso para obtener ubicación por ID
 */
export class GetLocationByIdUseCase {
  constructor(
    private locationRepository: ILocationRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para obtener una ubicación por su ID.
   * @param id - ID de la ubicación
   * @returns Ubicación encontrada (DTO)
   */
  async execute(id: number): Promise<LocationResponseDTO> {
    try {
      const location = await this.locationRepository.findById(id);
      if (!location) {
        throw new Error(`Ubicación con ID ${id} no encontrada`);
      }
      await this.logger.info('Ubicación consultada exitosamente', {
        locationId: id,
        name: location.name,
        action: 'GET_LOCATION_BY_ID'
      });
      if (
        location.id === undefined ||
        location.createdAt === undefined ||
        location.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: la ubicación no tiene id, createdAt o updatedAt');
      }
      return {
        id: location.id,
        name: location.name,
        description: location.description ?? null,
        code: location.code ?? null,
        type: location.type ?? null,
        parentId: location.parentId ?? null,
        isActive: location.isActive,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al obtener ubicación por ID', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        action: 'GET_LOCATION_BY_ID'
      });
      throw error;
    }
  }
} 