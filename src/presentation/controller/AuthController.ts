import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import RegisterUserUseCase from '../../core/application/usecase/auth/RegisterUserUseCase';
import LoginUserUseCase from '../../core/application/usecase/auth/LoginUserUseCase';
import { UserRepositoryImpl } from '../../infrastructure/services/UserRepositoryImpl';
import { EncryptionService } from '../../infrastructure/services/EncryptionService';
import { JWTService } from '../../infrastructure/services/JWTService';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateRegisterUserDTO } from '../../core/application/dto/auth/RegisterUserDTO';
import { validateLoginUserDTO } from '../../core/application/dto/auth/LoginUserDTO';
import {
  buildSuccessResponse,
  buildCreatedResponse,
} from '../utils/ResponseHelper';

export class AuthController extends BaseController {
  private readonly registerUserUseCase: RegisterUserUseCase;
  private readonly loginUserUseCase: LoginUserUseCase;

  constructor() {
    super({
      entityName: 'Auth',
      successMessages: {
        created: 'Usuario registrado exitosamente',
        found: 'Login exitoso',
        listed: 'Lista de usuarios',
        updated: 'Usuario actualizado',
        deleted: 'Usuario eliminado',
      },
    });

    const userRepository = new UserRepositoryImpl();
    const encryptionService = new EncryptionService();
    const jwtService = new JWTService();
    const logger = new WinstonLogger();

    this.registerUserUseCase = new RegisterUserUseCase(
      userRepository,
      encryptionService,
      logger
    );
    this.loginUserUseCase = new LoginUserUseCase(
      userRepository,
      encryptionService,
      jwtService,
      logger
    );
  }

  register = async (req: Request, res: Response): Promise<void> => {
    console.log('DEBUG: AuthController.register - req.body:', JSON.stringify(req.body, null, 2));
    try {
      await this.handleCreate(req, res, validateRegisterUserDTO, data =>
        this.registerUserUseCase.execute(data)
      );
    } catch (error) {
      console.log('DEBUG: AuthController.register - error:', error);
      this.handleError(error, req, res, 'register');
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateLoginUserDTO(req.body);
      const { accessToken, user } =
        await this.loginUserUseCase.execute(validatedData);
      res.status(200).json(
        buildSuccessResponse('Login exitoso', {
          accessToken,
          user,
        })
      );
    } catch (error) {
      this.handleError(error, req, res, 'login');
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new Error('Refresh token requerido');
      }
      throw new Error('Funcionalidad de refresh token no implementada');
    } catch (error) {
      this.handleError(error, req, res, 'refresh');
    }
  };
}
