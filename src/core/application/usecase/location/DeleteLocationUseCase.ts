/**
 * @fileoverview Caso de uso optimizado para eliminar ubicaciones
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseDeleteUseCase } from '../base/BaseUseCase';
import { LocationRepositoryImpl } from '../../../../infrastructure/services/LocationRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export class DeleteLocationUseCase extends BaseDeleteUseCase {
  constructor(
    private locationRepository: LocationRepositoryImpl,
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
