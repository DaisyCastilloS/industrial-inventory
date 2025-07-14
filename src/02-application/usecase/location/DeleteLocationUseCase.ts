/**
 * @fileoverview Caso de uso para eliminar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ILocationRepository } from '../../../01-domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para eliminar ubicaciones
 */
export class DeleteLocationUseCase {
  constructor(
    private locationRepository: ILocationRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para eliminar una ubicación.
   * @param id - ID de la ubicación
   * @returns void
   */
  async execute(id: number): Promise<void> {
    try {
      await this.locationRepository.delete(id);
      await this.logger.info('Ubicación eliminada exitosamente', {
        locationId: id,
        action: 'DELETE_LOCATION'
      });
    } catch (error) {
      await this.logger.error('Error al eliminar ubicación', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        id,
        action: 'DELETE_LOCATION'
      });
      throw error;
    }
  }
} 