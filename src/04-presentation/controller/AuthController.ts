import { Request, Response } from 'express';
import { AuthService } from '../../03-infrastructure/services/AuthService';
import { UserRepositoryImpl } from '../../03-infrastructure/services/UserRepositoryImpl';
import { EncryptionService } from '../../03-infrastructure/services/EncryptionService';
import { JWTService } from '../../03-infrastructure/services/JWTService';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { validateRegisterUserDTO } from '../../02-application/dto/auth/RegisterUserDTO';
import { validateLoginUserDTO } from '../../02-application/dto/auth/LoginUserDTO';
import { buildSuccessResponse, buildCreatedResponse, buildErrorResponse } from '../utils/ResponseHelper';
import { User } from '../../01-domain/entity/User';
import { UserRole } from '../../00-constants/RoleTypes';

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    // Initialize with dummy service for now
    const userRepository = new UserRepositoryImpl();
    const encryptionService = new EncryptionService();
    const jwtService = new JWTService();
    const logger = new WinstonLogger();
    this.authService = new AuthService(userRepository, encryptionService, jwtService, logger);
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const data = validateRegisterUserDTO(req.body);
      
      // Create dependencies
      const userRepository = new UserRepositoryImpl();
      const encryptionService = new EncryptionService();
      const logger = new WinstonLogger();
      
      // Check if user exists
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        res.status(400).json(buildErrorResponse('Error en registro', `Usuario con email ${data.email} ya existe`));
        return;
      }
      
      // Hash password
      const hashedPassword = await encryptionService.hashPassword(data.password);
      
      // Create user data
      const userData = {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role as UserRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Create user instance
      const user = new User(userData);
      
      // Save to database
      const createdUser = await userRepository.create(user);
      
      // Log audit (don't let this fail the request)
      try {
        await logger.audit('USER_REGISTER', 'User', createdUser.id || 0, undefined, {
          email: data.email,
          role: data.role,
          ipAddress: 'N/A'
        });
      } catch (auditError) {
        console.log('Warning: Audit logging failed, but user was created successfully');
      }
      
      // Return success response
      res.status(201).json(buildCreatedResponse({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt
      }, 'Usuario registrado exitosamente'));
      
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('ya existe')) {
          res.status(400).json(buildErrorResponse('Error en registro', error.message));
          return;
        }
        if (error.message.includes('Validation error')) {
          res.status(400).json(buildErrorResponse('Error en registro', error.message));
          return;
        }
      }
      
      // Generic error handling
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(buildErrorResponse('Error en registro', errorMessage));
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = validateLoginUserDTO(req.body);
      const { token, user } = await this.authService.loginUser(data.email, data.password);
      res.status(200).json(buildSuccessResponse('Login exitoso', {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }));
    } catch (error) {
      this.handleError(error, req, res, 'login');
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new Error('Refresh token requerido');
      const newToken = await this.authService.refreshToken(refreshToken);
      res.status(200).json(buildSuccessResponse('Token refrescado', { token: newToken }));
    } catch (error) {
      this.handleError(error, req, res, 'refresh');
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) throw new Error('Token requerido para logout');
      await this.authService.logout(token);
      res.status(200).json(buildSuccessResponse('Logout exitoso', {}));
    } catch (error) {
      this.handleError(error, req, res, 'logout');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
} 