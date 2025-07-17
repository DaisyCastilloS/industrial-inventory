/**
 * @fileoverview Caso de uso para crear usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../base/BaseUseCase';
import { UserRepositoryImpl } from '../../../../infrastructure/services/UserRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import {
  CreateUserDTO,
  validateCreateUser,
} from '../../dto/user/CreateUserDTO';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export default class CreateUserUseCase extends BaseCreateUseCase<
  CreateUserDTO,
  UserResponseDTO
> {
  constructor(
    private userRepository: UserRepositoryImpl,
    protected logger: LoggerWrapperInterface,
    private encryptionService: EncryptionInterface
  ) {
    super(logger, {
      action: 'CREATE_USER',
      entityName: 'User',
    });
  }

  protected async validateInput(input: CreateUserDTO): Promise<any> {
    return validateCreateUser(input);
  }

  protected async createEntity(data: any): Promise<any> {
    console.log('DEBUG: createEntity data:', data);
    console.log('DEBUG: password type:', typeof data.password);
    console.log('DEBUG: password value:', data.password);
    
    // Verificar si el email ya existe
    const existingUserResult = await this.userRepository.findByEmail(
      data.email
    );
    if (existingUserResult.success && existingUserResult.data) {
      throw new Error('Ya existe un usuario con este email');
    }
    // Encriptar contraseña
    const hashedPassword = await this.encryptionService.hashPassword(
      data.password
    );
    const userData = {
      ...data,
      password: hashedPassword,
    };
    console.log('DEBUG: userData to create:', userData);
    const result = await this.userRepository.create(userData);
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Error al crear el usuario');
    }
    return result.data;
  }

  protected validateCreatedEntity(entity: any): void {
    if (!entity.id) {
      throw new Error(
        'Persistencia inconsistente: el usuario creado no tiene id'
      );
    }
    // Solo validar ID, no createdAt/updatedAt
  }

  protected mapToDTO(entity: any): UserResponseDTO {
    return DTOMapper.mapUserToResponseDTO(entity);
  }
}
