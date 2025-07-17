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
    console.log('DEBUG: RegisterUserUseCase - Input data:', data);
    
    const existingUserResult = await this.userRepository.findByEmail(
      data.email
    );
    if (existingUserResult.success && existingUserResult.data) {
      throw new Error(`Ya existe un usuario con el email ${data.email}`);
    }
    
    const hashedPassword = await this.encryptionService.hashPassword(
      data.password
    );
    console.log('DEBUG: RegisterUserUseCase - Hashed password:', hashedPassword);
    
    const userData: IUser = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role as UserRole,
      isActive: true,
    };
    console.log('DEBUG: RegisterUserUseCase - User data:', userData);
    
    const user = new User(userData);
    console.log('DEBUG: RegisterUserUseCase - User entity:', user);

    const createResult = await this.userRepository.create(user);
    console.log('DEBUG: RegisterUserUseCase - Create result:', createResult);
    
    if (!createResult.success || !createResult.data) {
      throw new Error('Error al crear el usuario');
    }
    return createResult.data;
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

  protected sanitizeInput(input: RegisterUserDTO): any {
    const { password, ...safeInput } = input;
    return safeInput;
  }
}
