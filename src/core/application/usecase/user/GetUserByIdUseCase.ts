/**
 * @fileoverview Caso de uso para obtener usuario por ID
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseGetByIdUseCase } from '../base/BaseUseCase';
import { UserRepositoryImpl } from '../../../../infrastructure/services/UserRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export default class GetUserByIdUseCase extends BaseGetByIdUseCase<UserResponseDTO> {
  constructor(
    private userRepository: UserRepositoryImpl,
    protected logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'GET_USER_BY_ID',
      entityName: 'User',
    });
  }

  protected async findById(id: number): Promise<any> {
    const result = await this.userRepository.findById(id);
    if (!result.success || !result.data) {
      throw new Error(
        result.error?.message || `Usuario con ID ${id} no encontrado`
      );
    }
    return result.data;
  }

  protected validateEntity(entity: any): void {
    if (!entity.id) {
      throw new Error(
        'Persistencia inconsistente: el usuario no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): UserResponseDTO {
    return DTOMapper.mapUserToResponseDTO(entity);
  }
}
