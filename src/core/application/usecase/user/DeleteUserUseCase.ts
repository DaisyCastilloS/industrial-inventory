/**
 * @fileoverview Caso de uso para eliminar usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseDeleteUseCase } from '../base/BaseUseCase';
import { UserRepositoryImpl } from '../../../../infrastructure/services/UserRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export default class DeleteUserUseCase extends BaseDeleteUseCase {
  constructor(
    private userRepository: UserRepositoryImpl,
    protected logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'DELETE_USER',
      entityName: 'User',
    });
  }

  protected async findById(id: number): Promise<any> {
    const result = await this.userRepository.findById(id);
    if (!result.success) {
      return null;
    }
    return result.data;
  }

  protected async deleteEntity(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (!result.success) {
      throw new Error(result.error?.message || 'Error al eliminar el usuario');
    }
  }
}
