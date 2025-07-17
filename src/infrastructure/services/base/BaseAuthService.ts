import { User, IUser } from '../../../core/domain/entity/User';
import { IUserRepository } from '../../../core/domain/repository/UserRepository';
import { EncryptionInterface } from '../../../core/application/interface/EncryptionInterface';
import { JWTInterface } from '../../../core/application/interface/JWTInterface';
import { LoggerWrapperInterface } from '../../../core/application/interface/LoggerWrapperInterface';
import {
  UserNotFoundError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '../../../core/domain/entity/UserErrors';
import { UserRole } from '../../../shared/constants/RoleTypes';

export abstract class BaseAuthService {
  constructor(
    protected readonly userRepository: IUserRepository,
    protected readonly encryptionService: EncryptionInterface,
    protected readonly jwtService: JWTInterface,
    protected readonly logger: LoggerWrapperInterface
  ) {}
}
