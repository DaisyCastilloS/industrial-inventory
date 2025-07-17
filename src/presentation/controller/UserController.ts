import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import CreateUserUseCase from '../../core/application/usecase/user/CreateUserUseCase';
import GetUserByIdUseCase from '../../core/application/usecase/user/GetUserByIdUseCase';
import ListUsersUseCase from '../../core/application/usecase/user/ListUsersUseCase';
import UpdateUserUseCase from '../../core/application/usecase/user/UpdateUserUseCase';
import DeleteUserUseCase from '../../core/application/usecase/user/DeleteUserUseCase';
import { UserRepositoryImpl } from '../../infrastructure/services/UserRepositoryImpl';
import { EncryptionService } from '../../infrastructure/services/EncryptionService';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateCreateUser } from '../../core/application/dto/user/CreateUserDTO';
import { validateUpdateUser } from '../../core/application/dto/user/UpdateUserDTO';

export class UserController extends BaseController {
  private readonly createUserUseCase: CreateUserUseCase;
  private readonly getUserByIdUseCase: GetUserByIdUseCase;
  private readonly listUsersUseCase: ListUsersUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly deleteUserUseCase: DeleteUserUseCase;

  constructor() {
    super({
      entityName: 'User',
      successMessages: {
        created: 'Usuario creado exitosamente',
        found: 'Usuario encontrado',
        listed: 'Lista de usuarios',
        updated: 'Usuario actualizado',
        deleted: 'Usuario eliminado',
      },
    });

    const userRepository = new UserRepositoryImpl();
    const logger = new WinstonLogger();
    const encryption = new EncryptionService();

    this.createUserUseCase = new CreateUserUseCase(
      userRepository,
      logger,
      encryption
    );
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository, logger);
    this.listUsersUseCase = new ListUsersUseCase(userRepository, logger);
    this.updateUserUseCase = new UpdateUserUseCase(
      userRepository,
      encryption,
      logger
    );
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository, logger);
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    await this.handleCreate(req, res, validateCreateUser, data =>
      this.createUserUseCase.execute(data)
    );
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    await this.handleGetById(req, res, id =>
      this.getUserByIdUseCase.execute(id)
    );
  };

  listUsers = async (req: Request, res: Response): Promise<void> => {
    await this.handleList(req, res, params =>
      this.listUsersUseCase.execute({ page: params.page, limit: params.limit })
    );
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    await this.handleUpdate(req, res, validateUpdateUser, (id, data) =>
      this.updateUserUseCase.execute({ id, data })
    );
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.handleDelete(req, res, id => this.deleteUserUseCase.execute(id));
  };
}
