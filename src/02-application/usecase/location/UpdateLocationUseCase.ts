/**
 * @fileoverview Caso de uso para actualizar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ILocationRepository } from '../../../01-domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { UpdateLocationDTO, validateUpdateLocation } from '../../dto/location/UpdateLocationDTO';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';

/**
 * Caso de uso para actualizar ubicaciones
 */
export class UpdateLocationUseCase {
  constructor(
    private locationRepository: ILocationRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para actualizar una ubicación.
   * @param id - ID de la ubicación
   * @param data - DTO de actualización de ubicación
   * @returns Ubicación actualizada (DTO)
   */
  async execute(id: number, data: UpdateLocationDTO): Promise<LocationResponseDTO> {
    try {
      const validatedData = validateUpdateLocation(data);
      const updatedLocation = await this.locationRepository.update(id, validatedData);
      await this.logger.info('Ubicación actualizada exitosamente', {
        locationId: updatedLocation.id,
        name: updatedLocation.name,
        action: 'UPDATE_LOCATION'
      });
      if (
        updatedLocation.id === undefined ||
        updatedLocation.createdAt === undefined ||
        updatedLocation.updatedAt === undefined
      ) {
        throw new Error('Persistencia inconsistente: la ubicación actualizada no tiene id, createdAt o updatedAt');
      }
      return {
        id: updatedLocation.id,
        name: updatedLocation.name,
        description: updatedLocation.description ?? null,
        code: updatedLocation.code ?? null,
        type: updatedLocation.type ?? null,
        parentId: updatedLocation.parentId ?? null,
        isActive: updatedLocation.isActive,
        createdAt: updatedLocation.createdAt,
        updatedAt: updatedLocation.updatedAt
      };
    } catch (error) {
      await this.logger.error('Error al actualizar ubicación', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        data,
        action: 'UPDATE_LOCATION'
      });
      throw error;
    }
  }
} 