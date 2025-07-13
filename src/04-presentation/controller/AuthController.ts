import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../02-application/usecase/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../02-application/usecase/auth/LoginUserUseCase';
import { UserRepository } from '../../01-domain/repository/UserRepository';
import { LoggerWrapperInterface } from '../../02-application/interface/LoggerWrapperInterface';
import { validateRegisterUserDTO } from '../../02-application/dto/auth/RegisterUserDTO';
import { validateLoginUserDTO } from '../../02-application/dto/auth/LoginUserDTO';
import { EncryptionService } from '../../03-infrastructure/services/EncryptionService';
import { JWTService } from '../../03-infrastructure/services/JWTService';
import { buildCreatedResponse, buildSuccessResponse } from '../../03-infrastructure/utils/ResponseHelper';

/**
 * Controlador de autenticación siguiendo Clean Architecture
 * Maneja registro y login de usuarios con validaciones robustas
 */
export class AuthController {
    private readonly registerUserUseCase: RegisterUserUseCase;
    private readonly loginUserUseCase: LoginUserUseCase;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerWrapperInterface
    ) {
        const encryptionService = new EncryptionService();
        const jwtService = new JWTService();
        
        this.registerUserUseCase = new RegisterUserUseCase(userRepository, encryptionService);
        this.loginUserUseCase = new LoginUserUseCase(userRepository, encryptionService, jwtService);
    }

    /**
     * Registra un nuevo usuario
     * @param req - Request de Express
     * @param res - Response de Express
     */
    registerUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validar datos de entrada
            const validatedData = validateRegisterUserDTO(req.body);
            
            // Ejecutar caso de uso
            const user = await this.registerUserUseCase.execute(validatedData);
            
            // Construir respuesta exitosa (sin contraseña)
            const userResponse = {
                id: user.getId(),
                email: user.getEmail(),
                name: user.getName(),
                role: user.getRole(),
                isActive: user.getIsActive(),
                createdAt: user.getCreatedAt(),
                updatedAt: user.getUpdatedAt()
            };
            
            const response = buildCreatedResponse(
                userResponse,
                'Usuario registrado exitosamente'
            );
            
            res.status(201).json(response);
            
            // Log de éxito
            this.logger.info('✅ Usuario registrado exitosamente', {
                email: validatedData.email,
                role: validatedData.role,
                userAgent: req.get('User-Agent')
            });
            
        } catch (error) {
            this.handleError(error, req, res, 'registerUser');
        }
    };

    /**
     * Autentica un usuario y devuelve token JWT
     * @param req - Request de Express
     * @param res - Response de Express
     */
    loginUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validar datos de entrada
            const validatedData = validateLoginUserDTO(req.body);
            
            // Ejecutar caso de uso
            const { token, user } = await this.loginUserUseCase.execute(validatedData);
            
            // Construir respuesta exitosa
            const userResponse = {
                id: user.getId(),
                email: user.getEmail(),
                name: user.getName(),
                role: user.getRole(),
                isActive: user.getIsActive(),
                createdAt: user.getCreatedAt(),
                updatedAt: user.getUpdatedAt()
            };
            
            const response = buildSuccessResponse(
                {
                    token,
                    user: userResponse
                },
                'Login exitoso'
            );
            
            res.status(200).json(response);
            
            // Log de éxito
            this.logger.info('✅ Usuario autenticado exitosamente', {
                email: validatedData.email,
                userAgent: req.get('User-Agent')
            });
            
        } catch (error) {
            this.handleError(error, req, res, 'loginUser');
        }
    };

    /**
     * Maneja errores de manera centralizada
     * @param error - Error capturado
     * @param req - Request de Express
     * @param res - Response de Express
     * @param method - Método donde ocurrió el error
     */
    private handleError(error: any, req: Request, res: Response, method: string): void {
        this.logger.error(`❌ Error en AuthController.${method}`, {
            error: error.message,
            stack: error.stack,
            userAgent: req.get('User-Agent'),
            body: req.body
        });

        // Determinar tipo de error y código de estado
        let statusCode = 500;
        let errorMessage = 'Error interno del servidor';

        if (error.message.includes('Validation error')) {
            statusCode = 400;
            errorMessage = error.message;
        } else if (error.name === 'UserAlreadyExistsError') {
            statusCode = 409;
            errorMessage = error.message;
        } else if (error.name === 'UserNotFoundError' || error.name === 'InvalidCredentialsError') {
            statusCode = 401;
            errorMessage = error.message;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: error.name || 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
        });
    }
} 