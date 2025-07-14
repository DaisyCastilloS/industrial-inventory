/**
 * @fileoverview Caso de uso para login de usuario
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { User } from '../../../01-domain/entity/User';
import { IUserRepository } from '../../../01-domain/repository/UserRepository';
import { LoginUserDTO } from '../../dto/auth/LoginUserDTO';
import { InvalidCredentialsError, UserNotFoundError } from '../../../01-domain/entity/UserErrors';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import { JWTInterface } from '../../interface/JWTInterface';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { TokenPurpose } from '../../../00-constants/TokenPurpose';

/**
 * Caso de uso para login de usuario
 */
export class LoginUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private encryptionService: EncryptionInterface,
        private jwtService: JWTInterface,
        private logger: LoggerWrapperInterface
    ) { }

    /**
     * Ejecuta el login de usuario.
     * @param data - Credenciales de login (email y password)
     * @returns Objeto con token JWT y entidad User
     * @throws {UserNotFoundError | InvalidCredentialsError}
     */
    async execute(data: LoginUserDTO): Promise<{ token: string; user: User }> {
        // Buscar usuario por email
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            await this.logger.warn('Intento de login fallido: usuario no encontrado', {
                email: data.email,
                action: 'LOGIN_FAIL',
            });
            throw new UserNotFoundError('Usuario no encontrado');
        }

        // Verificar si el usuario está activo
        if (!user.isActive) {
            await this.logger.warn('Intento de login fallido: usuario inactivo', {
                userId: user.id,
                email: user.email,
                action: 'LOGIN_FAIL',
            });
            throw new InvalidCredentialsError('Usuario inactivo');
        }

        // Verificar contraseña
        const isPasswordValid = await this.encryptionService.verifyPassword(data.password, user.password);
        if (!isPasswordValid) {
            await this.logger.warn('Intento de login fallido: credenciales inválidas', {
                userId: user.id,
                email: user.email,
                action: 'LOGIN_FAIL',
            });
            throw new InvalidCredentialsError('Credenciales inválidas');
        }

        // Generar token JWT
        if (user.id === undefined) {
            throw new Error('El usuario no tiene ID asignado');
        }
        const token = await this.jwtService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            purpose: TokenPurpose.ACCESS
        }, TokenPurpose.ACCESS);

        await this.logger.info('Login exitoso', {
            userId: user.id,
            email: user.email,
            action: 'LOGIN_SUCCESS',
        });

        return { token, user };
    }
} 