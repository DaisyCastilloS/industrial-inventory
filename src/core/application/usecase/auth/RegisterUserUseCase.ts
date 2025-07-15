/**
 * @fileoverview Caso de uso para registro de usuario
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseCreateUseCase } from '../base/BaseUseCase';
import { IUserRepository } from '../../../domain/repository/UserRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import {
  RegisterUserDTO,
  validateRegisterUserDTO,
} from '../../dto/auth/RegisterUserDTO';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { User, IUser } from '../../../domain/entity/User';
import { UserRole } from '../../../../shared/constants/RoleTypes';

/**
 * Caso de uso para registro de usuario
 */
export default class RegisterUserUseCase extends BaseCreateUseCase<
  RegisterUserDTO,
  UserResponseDTO
> {
  constructor(
    private userRepository: IUserRepository,
    private encryptionService: EncryptionInterface,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'REGISTER_USER',
      entityName: 'User',
    });
  }

  protected validateInput(input: RegisterUserDTO): any {
    return validateRegisterUserDTO(input);
  }

  protected async createEntity(data: any): Promise<any> {
    // Verificar si el usuario ya existe
    const existingUserResult = await this.userRepository.findByEmail(
      data.email
    );
    if (existingUserResult.success && existingUserResult.data) {
      throw new Error(`Ya existe un usuario con el email ${data.email}`);
    }

    // Encriptar contraseña
    const hashedPassword = await this.encryptionService.hashPassword(
      data.password
    );

    // Crear nuevo usuario usando la interfaz IUser
    const userData: IUser = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role as UserRole,
      isActive: true, // Por defecto activo
    };
    const user = new User(userData);

    // Guardar en base de datos
    const createResult = await this.userRepository.create(user);
    if (!createResult.success || !createResult.data) {
      throw new Error('Error al crear el usuario');
    }
    return createResult.data;
  }

  protected validateCreatedEntity(entity: any): void {
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Persistencia inconsistente: el usuario creado no tiene id, createdAt o updatedAt'
      );
    }
  }

  protected mapToDTO(entity: any): UserResponseDTO {
    return DTOMapper.mapUserToResponseDTO(entity);
  }

  protected sanitizeInput(input: RegisterUserDTO): any {
    // Remover contraseña del log por seguridad
    const { password, ...safeInput } = input;
    return safeInput;
  }
}
