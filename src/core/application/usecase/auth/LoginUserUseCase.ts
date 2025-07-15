/**
 * @fileoverview Caso de uso para login de usuario
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseUseCase } from '../base/BaseUseCase';
import { IUserRepository } from '@core/domain/repository/UserRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import { JWTInterface } from '../../interface/JWTInterface';
import {
  LoginUserDTO,
  validateLoginUserDTO,
} from '../../dto/auth/LoginUserDTO';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { User } from '@core/domain/entity/User';
import { TokenPurpose } from '@shared/constants/TokenPurpose';
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@core/domain/entity/UserErrors';

export interface LoginResponse {
  token: string;
  user: UserResponseDTO;
}

/**
 * Caso de uso para login de usuario
 */
export default class LoginUserUseCase extends BaseUseCase<
  LoginUserDTO,
  LoginResponse
> {
  constructor(
    private userRepository: IUserRepository,
    private encryptionService: EncryptionInterface,
    private jwtService: JWTInterface,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LOGIN_USER',
      entityName: 'User',
    });
  }

  protected async executeInternal(data: LoginUserDTO): Promise<LoginResponse> {
    // Validar datos de entrada
    const validatedData = validateLoginUserDTO(data);

    // Buscar usuario por email
    const userResult = await this.userRepository.findByEmail(
      validatedData.email
    );
    if (!userResult.success || !userResult.data) {
      throw new UserNotFoundError('Usuario no encontrado');
    }
    const user = userResult.data;

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new InvalidCredentialsError('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await this.encryptionService.verifyPassword(
      validatedData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Credenciales inválidas');
    }

    // Generar token JWT
    if (user.id === undefined) {
      throw new Error('El usuario no tiene ID asignado');
    }
    const token = await this.jwtService.generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        purpose: TokenPurpose.ACCESS,
      },
      TokenPurpose.ACCESS
    );

    // Mapear a DTO
    const userDTO = DTOMapper.mapUserToResponseDTO(user);

    return { token, user: userDTO };
  }

  protected sanitizeInput(input: LoginUserDTO): any {
    // Remover contraseña del log por seguridad
    const { password, ...safeInput } = input;
    return safeInput;
  }

  protected sanitizeResult(result: LoginResponse): any {
    // Remover token del log por seguridad
    return {
      user: result.user,
    };
  }
}
