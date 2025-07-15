/**
 * @fileoverview Clase base para servicios de autenticación
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { User, IUser } from '../../../domain/entity/User';
import { IUserRepository } from '../../../domain/repository/UserRepository';
import { EncryptionInterface } from '../../../application/interface/EncryptionInterface';
import { JWTInterface } from '../../../application/interface/JWTInterface';
import { LoggerWrapperInterface } from '../../../application/interface/LoggerWrapperInterface';
import {
  UserNotFoundError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '../../../domain/entity/UserErrors';
import { UserRole } from '../../../../shared/constants/RoleTypes';

/**
 * Clase base para servicios de autenticación
 */
export abstract class BaseAuthService {
  constructor(
    protected readonly userRepository: IUserRepository,
    protected readonly encryptionService: EncryptionInterface,
    protected readonly jwtService: JWTInterface,
    protected readonly logger: LoggerWrapperInterface
  ) {}

  /**
   * Registra un nuevo usuario
   */
  async registerUser(
    email: string,
    password: string,
    name: string,
    role: string
  ): Promise<User> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserAlreadyExistsError(
          `Usuario con email ${email} ya existe`
        );
      }

      const hashedPassword =
        await this.encryptionService.hashPassword(password);

      const userData: IUser = {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = new User(userData);
      const createdUser = await this.userRepository.create(user);

      await this.logger.audit(
        'USER_REGISTER',
        'User',
        createdUser.id || 0,
        undefined,
        {
          email,
          role,
          ipAddress: 'N/A',
        }
      );

      return createdUser;
    } catch (error) {
      await this.logger.error('Error en registro de usuario', {
        email,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      throw error;
    }
  }

  /**
   * Autentica un usuario
   */
  async loginUser(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new UserNotFoundError(`Usuario con email ${email} no encontrado`);
      }

      if (!user.isActive) {
        throw new InvalidCredentialsError('Usuario inactivo');
      }

      const isPasswordValid = await this.encryptionService.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsError('Credenciales inválidas');
      }

      const token = await this.jwtService.generateToken(
        {
          userId: user.id || 0,
          email: user.email,
          role: user.role,
          purpose: 'ACCESS' as any,
        },
        'ACCESS'
      );

      await this.logger.audit(
        'USER_LOGIN',
        'User',
        user.id || 0,
        user.id || 0,
        {
          email,
          ipAddress: 'N/A',
        }
      );

      return { token, user };
    } catch (error) {
      await this.logger.error('Error en login de usuario', {
        email,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene permisos
   */
  async hasPermission(
    userId: number,
    requiredRoles: string[]
  ): Promise<boolean> {
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
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      return false;
    }
  }

  /**
   * Refresca un token JWT
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      return await this.jwtService.refreshToken(refreshToken);
    } catch (error) {
      await this.logger.error('Error refrescando token', {
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      throw error;
    }
  }

  /**
   * Revoca un token JWT
   */
  async logout(token: string): Promise<void> {
    try {
      await this.jwtService.revokeToken(token);

      await this.logger.audit('USER_LOGOUT', 'User', 0, undefined, {
        token: `${token.substring(0, 20)}...`,
      });
    } catch (error) {
      await this.logger.error('Error en logout', {
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError(`Usuario con ID ${userId} no encontrado`);
      }

      const isCurrentPasswordValid =
        await this.encryptionService.verifyPassword(
          currentPassword,
          user.password
        );
      if (!isCurrentPasswordValid) {
        throw new InvalidCredentialsError('Contraseña actual incorrecta');
      }

      const hashedNewPassword =
        await this.encryptionService.hashPassword(newPassword);

      const updatedUserData = {
        ...user.toJSON(),
        password: hashedNewPassword,
      };
      await this.userRepository.update(user.id || 0, updatedUserData);

      await this.logger.audit('PASSWORD_CHANGE', 'User', userId, userId);
    } catch (error) {
      await this.logger.error('Error cambiando contraseña', {
        userId,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      throw error;
    }
  }

  /**
   * Verifica si un token es válido
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
   */
  async getUserFromToken(
    token: string
  ): Promise<{ userId: number; email: string; role: string } | null> {
    try {
      const payload = await this.jwtService.verifyToken(token, 'ACCESS');
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      return null;
    }
  }
}
