/**
 * @fileoverview Servicio de autenticación y autorización
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { User, IUser } from '../../01-domain/entity/User';
import { IUserRepository } from '../../01-domain/repository/UserRepository';
import { EncryptionService } from './EncryptionService';
import { JWTService } from './JWTService';
import { LoggerWrapperInterface } from '../../02-application/interface/LoggerWrapperInterface';
import { UserNotFoundError, InvalidCredentialsError, UserAlreadyExistsError } from '../../01-domain/entity/UserErrors';
import { UserRole } from '../../00-constants/RoleTypes';

/**
 * Servicio de autenticación y autorización
 */
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly jwtService: JWTService,
    private readonly logger: LoggerWrapperInterface
  ) {}

  /**
   * Registra un nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param name - Nombre del usuario
   * @param role - Rol del usuario
   * @returns Usuario creado
   */
  async registerUser(email: string, password: string, name: string, role: string): Promise<User> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserAlreadyExistsError(`Usuario con email ${email} ya existe`);
      }

      // Encriptar contraseña
      const hashedPassword = await this.encryptionService.hashPassword(password);

      // Crear nuevo usuario
      const userData: IUser = {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user = new User(userData);

      // Guardar en BD
      const createdUser = await this.userRepository.create(user);

      // Log de auditoría
      await this.logger.audit('USER_REGISTER', 'User', createdUser.id || 0, undefined, {
        email,
        role,
        ipAddress: 'N/A'
      });

      return createdUser;
    } catch (error) {
      await this.logger.error('Error en registro de usuario', {
        email,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Autentica un usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Token JWT y datos del usuario
   */
  async loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new UserNotFoundError(`Usuario con email ${email} no encontrado`);
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        throw new InvalidCredentialsError('Usuario inactivo');
      }

      // Verificar contraseña
      const isPasswordValid = await this.encryptionService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new InvalidCredentialsError('Credenciales inválidas');
      }

      // Generar token JWT
      const token = await this.jwtService.generateToken({
        userId: user.id || 0,
        email: user.email,
        role: user.role,
        purpose: 'ACCESS' as any
      }, 'ACCESS');

      // Log de auditoría
      await this.logger.audit('USER_LOGIN', 'User', user.id || 0, user.id || 0, {
        email,
        ipAddress: 'N/A'
      });

      return { token, user };
    } catch (error) {
      await this.logger.error('Error en login de usuario', {
        email,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene permisos para una acción
   * @param userId - ID del usuario
   * @param requiredRoles - Roles requeridos
   * @returns true si tiene permisos
   */
  async hasPermission(userId: number, requiredRoles: string[]): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      return requiredRoles.includes(user.role);
    } catch (error) {
      await this.logger.error('Error verificando permisos', {
        userId,
        requiredRoles,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Refresca un token JWT
   * @param refreshToken - Token de refresh
   * @returns Nuevo token de acceso
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      return await this.jwtService.refreshToken(refreshToken);
    } catch (error) {
      await this.logger.error('Error refrescando token', {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Revoca un token JWT
   * @param token - Token a revocar
   */
  async logout(token: string): Promise<void> {
    try {
      await this.jwtService.revokeToken(token);
      
      // Log de auditoría
      await this.logger.audit('USER_LOGOUT', 'User', 0, undefined, {
        token: token.substring(0, 20) + '...'
      });
    } catch (error) {
      await this.logger.error('Error en logout', {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param userId - ID del usuario
   * @param currentPassword - Contraseña actual
   * @param newPassword - Nueva contraseña
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError(`Usuario con ID ${userId} no encontrado`);
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await this.encryptionService.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new InvalidCredentialsError('Contraseña actual incorrecta');
      }

      // Encriptar nueva contraseña
      const hashedNewPassword = await this.encryptionService.hashPassword(newPassword);
      
      // Actualizar contraseña en el repositorio
      const updatedUserData = {
        ...user.toJSON(),
        password: hashedNewPassword
      };
      await this.userRepository.update(user.id || 0, updatedUserData);

      // Log de auditoría
      await this.logger.audit('PASSWORD_CHANGE', 'User', userId, userId);
    } catch (error) {
      await this.logger.error('Error cambiando contraseña', {
        userId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Verifica si un token es válido
   * @param token - Token a verificar
   * @returns true si es válido
   */
  async isTokenValid(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyToken(token, 'ACCESS');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información del usuario desde un token
   * @param token - Token JWT
   * @returns Información del usuario
   */
  async getUserFromToken(token: string): Promise<{ userId: number; email: string; role: string } | null> {
    try {
      const payload = await this.jwtService.verifyToken(token, 'ACCESS');
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      return null;
    }
  }
}
