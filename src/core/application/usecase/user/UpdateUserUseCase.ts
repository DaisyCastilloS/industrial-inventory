/**
 * @fileoverview Caso de uso para actualizar usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUpdateUseCase } from '../base/BaseUseCase';
import { IUserRepository } from '../../../domain/repository/UserRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import {
  UpdateUserDTO,
  validateUpdateUser,
} from '../../dto/user/UpdateUserDTO';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export default class UpdateUserUseCase extends BaseUpdateUseCase<
  UpdateUserDTO,
  UserResponseDTO
> {
  constructor(
    private userRepository: IUserRepository,
    private encryptionService: EncryptionInterface,
    protected logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'UPDATE_USER',
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

  protected validateInput(input: UpdateUserDTO): any {
    return validateUpdateUser(input);
  }

  protected async updateEntity(id: number, data: any): Promise<any> {
    // Validar email único si se actualiza
    if (data.email) {
      const userWithEmailResult = await this.userRepository.findByEmail(
        data.email
      );
      if (
        userWithEmailResult.success &&
        userWithEmailResult.data &&
        userWithEmailResult.data.id !== id
      ) {
        throw new Error('Ya existe un usuario con este email');
      }
    }
    // Encriptar contraseña si se actualiza
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await this.encryptionService.hashPassword(
        updateData.password
      );
    }
    const result = await this.userRepository.update(id, updateData);
    if (!result.success || !result.data) {
      throw new Error(
        result.error?.message || 'Error al actualizar el usuario'
      );
    }
    return result.data;
  }

  protected validateUpdatedEntity(entity: any): void {
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Persistencia inconsistente: el usuario actualizado no tiene id, createdAt o updatedAt'
      );
    }
  }

  protected mapToDTO(entity: any): UserResponseDTO {
    return DTOMapper.mapUserToResponseDTO(entity);
  }
}
