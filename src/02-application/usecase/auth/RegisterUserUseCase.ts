/**
 * @fileoverview Caso de uso para registro de usuario
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { User, IUser } from '../../../01-domain/entity/User';
import { IUserRepository } from '../../../01-domain/repository/UserRepository';
import { RegisterUserDTO } from '../../dto/auth/RegisterUserDTO';
import { UserAlreadyExistsError } from '../../../01-domain/entity/UserErrors';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { UserRole } from '../../../00-constants/RoleTypes';

/**
 * Caso de uso para registro de usuario
 */
export class RegisterUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private encryptionService: EncryptionInterface,
        private logger: LoggerWrapperInterface
    ) { }

    /**
     * Ejecuta el registro de usuario.
     * @param data - Datos del usuario a registrar (DTO)
     * @returns Entidad User creada
     * @throws {UserAlreadyExistsError}
     */
    async execute(data: RegisterUserDTO): Promise<User> {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser) {
                await this.logger.warn('Intento de registro fallido: email ya registrado', {
                    email: data.email,
                    action: 'REGISTER_FAIL',
                });
                throw new UserAlreadyExistsError(`Ya existe un usuario con el email ${data.email}`);
            }

            // Encriptar contraseña
            const hashedPassword = await this.encryptionService.hashPassword(data.password);

            // Crear nuevo usuario usando la interfaz IUser
            const userData: IUser = {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role as UserRole,
                isActive: true // Por defecto activo
            };
            const user = new User(userData);

            // Guardar en base de datos
            await this.userRepository.create(user);

            await this.logger.info('Usuario registrado exitosamente', {
                userId: user.id,
                email: user.email,
                action: 'REGISTER_SUCCESS',
            });

            return user;
        } catch (error) {
            await this.logger.error('Error al registrar usuario', {
                error: error instanceof Error ? error.message : 'Error desconocido',
                email: data.email,
                action: 'REGISTER_FAIL',
            });
            throw error;
        }
    }
} 