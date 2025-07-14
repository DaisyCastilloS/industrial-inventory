/**
 * @fileoverview Caso de uso para listar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ILocationRepository } from '../../../01-domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListLocationsResponseDTO } from '../../dto/location/ListLocationsResponseDTO';
import { LocationResponseDTO } from '../../dto/location/LocationResponseDTO';

/**
 * Caso de uso para listar ubicaciones
 */
export class ListLocationsUseCase {
  constructor(
    private locationRepository: ILocationRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para listar todas las ubicaciones.
   * @param page - Página actual (opcional, por defecto 1)
   * @param limit - Límite de resultados por página (opcional, por defecto 10)
   * @returns Respuesta paginada de ubicaciones (DTO)
   */
  async execute(page: number = 1, limit: number = 10): Promise<ListLocationsResponseDTO> {
    try {
      const locations = await this.locationRepository.findAll();
      // Validación estricta de campos obligatorios
      const validLocations = locations.filter(loc =>
        loc.id !== undefined &&
        loc.createdAt !== undefined &&
        loc.updatedAt !== undefined
      );
      if (validLocations.length !== locations.length) {
        throw new Error('Persistencia inconsistente: una o más ubicaciones no tienen id, createdAt o updatedAt');
      }
      const total = validLocations.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginated = validLocations.slice(startIndex, endIndex);
      const locationDTOs: LocationResponseDTO[] = paginated.map(location => ({
        id: location.id!,
        name: location.name,
        description: location.description ?? null,
        code: location.code ?? null,
        type: location.type ?? null,
        parentId: location.parentId ?? null,
        isActive: location.isActive,
        createdAt: location.createdAt!,
        updatedAt: location.updatedAt!
      }));
      await this.logger.info('Lista de ubicaciones consultada exitosamente', {
        count: locationDTOs.length,
        action: 'LIST_LOCATIONS'
      });
      return {
        locations: locationDTOs,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      await this.logger.error('Error al listar ubicaciones', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        action: 'LIST_LOCATIONS'
      });
      throw error;
    }
  }
} 