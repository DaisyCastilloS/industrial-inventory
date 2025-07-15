/**
 * @fileoverview Caso de uso optimizado para eliminar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseDeleteUseCase } from '../base/BaseUseCase';
import { ILocationRepository } from '../../../domain/repository/LocationRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export class DeleteLocationUseCase extends BaseDeleteUseCase {
  constructor(
    private locationRepository: ILocationRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'DELETE_LOCATION',
      entityName: 'Location',
    });
  }

  protected async findById(id: number): Promise<any> {
    return this.locationRepository.findById(id);
  }

  protected async deleteEntity(id: number): Promise<void> {
    await this.locationRepository.delete(id);
  }
}
