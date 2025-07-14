import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../02-application/usecase/user/CreateUserUseCase';
import { GetUserByIdUseCase } from '../../02-application/usecase/user/GetUserByIdUseCase';
import { ListUsersUseCase } from '../../02-application/usecase/user/ListUsersUseCase';
import { UpdateUserUseCase } from '../../02-application/usecase/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../02-application/usecase/user/DeleteUserUseCase';
import { UserRepositoryImpl } from '../../03-infrastructure/services/UserRepositoryImpl';
import { EncryptionService } from '../../03-infrastructure/services/EncryptionService';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { validateCreateUser } from '../../02-application/dto/user/CreateUserDTO';
import { validateUpdateUser } from '../../02-application/dto/user/UpdateUserDTO';
import { buildSuccessResponse, buildCreatedResponse, buildErrorResponse } from '../utils/ResponseHelper';

export class UserController {
  private readonly createUserUseCase: CreateUserUseCase;
  private readonly getUserByIdUseCase: GetUserByIdUseCase;
  private readonly listUsersUseCase: ListUsersUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly deleteUserUseCase: DeleteUserUseCase;

  constructor() {
    const userRepository = new UserRepositoryImpl();
    const logger = new WinstonLogger();
    const encryption = new EncryptionService();
    this.createUserUseCase = new CreateUserUseCase(userRepository, logger, encryption);
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository, logger);
    this.listUsersUseCase = new ListUsersUseCase(userRepository, logger);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository, encryption, logger);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository, logger);
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateCreateUser(req.body);
      const user = await this.createUserUseCase.execute(validatedData);
      res.status(201).json(buildCreatedResponse(user, 'Usuario creado exitosamente'));
    } catch (error) {
      this.handleError(error, req, res, 'createUser');
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const user = await this.getUserByIdUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Usuario encontrado', user));
    } catch (error) {
      this.handleError(error, req, res, 'getUserById');
    }
  };

  listUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(buildSuccessResponse('Lista de usuarios', users));
    } catch (error) {
      this.handleError(error, req, res, 'listUsers');
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const validatedData = validateUpdateUser(req.body);
      const user = await this.updateUserUseCase.execute(id, validatedData);
      res.status(200).json(buildSuccessResponse('Usuario actualizado', user));
    } catch (error) {
      this.handleError(error, req, res, 'updateUser');
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.deleteUserUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Usuario eliminado', { id }));
    } catch (error) {
      this.handleError(error, req, res, 'deleteUser');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
} 