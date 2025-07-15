/**
 * @fileoverview Controlador para autenticación
 * @author Daisy Castillo
 * @version 1.0.0
 */

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

/**
 * Controlador para autenticación
 */
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
    try {
      const validatedData = validateRegisterUserDTO(req.body);
      const user = await this.registerUserUseCase.execute(validatedData);
      res
        .status(201)
        .json(buildCreatedResponse(user, 'Usuario registrado exitosamente'));
    } catch (error) {
      this.handleError(error, req, res, 'register');
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateLoginUserDTO(req.body);
      const { token, user } =
        await this.loginUserUseCase.execute(validatedData);
      res.status(200).json(
        buildSuccessResponse('Login exitoso', {
          token,
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

      // Aquí se implementaría la lógica de refresh token
      // Por ahora retornamos un error genérico
      throw new Error('Funcionalidad de refresh token no implementada');
    } catch (error) {
      this.handleError(error, req, res, 'refresh');
    }
  };
}
