/**
 * @fileoverview Caso de uso para listar usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../base/BaseUseCase';
import { UserRepositoryImpl } from '../../../../infrastructure/services/UserRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  UserListResponseDTO,
  UserResponseDTO,
} from '../../dto/user/UserResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export default class ListUsersUseCase extends BaseListUseCase<UserListResponseDTO> {
  constructor(
    private userRepository: UserRepositoryImpl,
    protected logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_USERS',
      entityName: 'User',
    });
  }

  protected async findAll(): Promise<ServiceResult<any>> {
    const result = await this.userRepository.findAll();
    if (!result.success || !result.data) {
      throw new Error(
        result.error?.message || 'Error al obtener la lista de usuarios'
      );
    }
    return result;
  }

  protected isValidEntity(entity: any): boolean {
    return !!(entity.id && entity.email && entity.name && entity.role);
  }

  protected mapToDTO(entity: any): UserResponseDTO {
    return DTOMapper.mapUserToResponseDTO(entity);
  }

  protected createListResponse(
    dtos: UserResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): UserListResponseDTO {
    return {
      users: dtos,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
