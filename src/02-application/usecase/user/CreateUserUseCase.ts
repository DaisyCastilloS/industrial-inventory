/**
 * @fileoverview Caso de uso para crear usuarios
 * @author Daisy Castillo
 * @version 1.0.1
 */

import { User, IUser } from '../../../01-domain/entity/User';
import { IUserRepository } from '../../../01-domain/repository/UserRepository';
import { CreateUserDTO, validateCreateUser } from '../../dto/user/CreateUserDTO';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { EncryptionInterface } from '../../interface/EncryptionInterface';

/**
 * Caso de uso para crear usuarios
 */
export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: LoggerWrapperInterface,
    private encryptionService: EncryptionInterface
  ) {}

  /**
   * Ejecuta el caso de uso para crear un usuario.
   * @param data - Datos del usuario a crear (DTO)
   * @returns DTO del usuario creado
   * @throws {Error} Si hay un error en la validación o creación
   */
  async execute(data: CreateUserDTO): Promise<UserResponseDTO> {
    try {
      // Validar datos de entrada
      const validatedData = validateCreateUser(data);

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(validatedData.email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Encriptar contraseña
      const hashedPassword = await this.encryptionService.hashPassword(validatedData.password);

      // Crear entidad de usuario
      const userData: IUser = {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        isActive: validatedData.isActive
      };

      const user = new User(userData);

      // Persistir usuario
      const createdUser = await this.userRepository.create(user);

      // Log de auditoría
      await this.logger.info('Usuario creado exitosamente', {
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        action: 'CREATE_USER',
        metadata: {
          name: createdUser.name,
          isActive: createdUser.isActive
        }
      });

      // Retornar respuesta sin contraseña
      return {
        id: createdUser.id!,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt!,
        updatedAt: createdUser.updatedAt!
      };

    } catch (error) {
      // Log de error
      await this.logger.error('Error al crear usuario', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        data: { email: data.email, name: data.name, role: data.role },
        action: 'CREATE_USER'
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura, capturando errores y retornando un resultado tipado.
   * @param data - Datos del usuario a crear (DTO)
   * @returns Resultado de la operación (éxito o error)
   */
  async executeSafe(data: CreateUserDTO): Promise<{ success: true; data: UserResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(data);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
} 