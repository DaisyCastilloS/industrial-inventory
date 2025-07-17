

import { BaseUseCase } from '../base/BaseUseCase';
import { IUserRepository } from '../../../domain/repository/UserRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import { JWTInterface } from '../../interface/JWTInterface';
import {
  LoginUserDTO,
  validateLoginUserDTO,
} from '../../dto/auth/LoginUserDTO';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';
import { User } from '../../../domain/entity/User';
import { TokenPurpose } from '../../../../shared/constants/TokenPurpose';
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../../domain/entity/UserErrors';

export interface LoginResponse {
  accessToken: string;
  user: UserResponseDTO;
}

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

    const validatedData = validateLoginUserDTO(data);

    const userResult = await this.userRepository.findByEmail(
      validatedData.email
    );
    if (!userResult.success || !userResult.data) {
      throw new UserNotFoundError('Usuario no encontrado');
    }
    const user = userResult.data;

    if (!user.isActive) {
      throw new InvalidCredentialsError('Usuario inactivo');
    }
    const isPasswordValid = await this.encryptionService.verifyPassword(
      validatedData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Credenciales inválidas');
    }

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

    const userDTO = DTOMapper.mapUserToResponseDTO(user);

    return { accessToken: token, user: userDTO };
  }

  protected sanitizeInput(input: LoginUserDTO): any {
    const { password, ...safeInput } = input;
    return safeInput;
  }

  protected sanitizeResult(result: LoginResponse): any {
    return {
      user: result.user,
    };
  }
}
