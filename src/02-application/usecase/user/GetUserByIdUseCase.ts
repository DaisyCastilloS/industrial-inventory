/**
 * @fileoverview Caso de uso para obtener usuario por ID
 * @author Daisy Castillo
 * @version 1.0.1
 */

import { IUserRepository } from '../../../01-domain/repository/UserRepository';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para obtener usuario por ID
 */
export class GetUserByIdUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para obtener un usuario por su ID.
   * @param id - ID numérico del usuario a consultar
   * @returns DTO del usuario encontrado
   * @throws {Error} Si el usuario no existe o el ID es inválido
   */
  async execute(id: number): Promise<UserResponseDTO> {
    try {
      // Validar ID
      if (!id || id <= 0) {
        throw new Error('ID de usuario inválido');
      }

      // Buscar usuario
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }

      // Log de auditoría
      await this.logger.info('Usuario consultado exitosamente', {
        userId: user.id,
        email: user.email,
        action: 'GET_USER_BY_ID',
        metadata: {
          name: user.name,
          role: user.role,
          isActive: user.isActive
        }
      });

      // Retornar respuesta sin contraseña
      return {
        id: user.id!,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt!,
        updatedAt: user.updatedAt!
      };

    } catch (error) {
      // Log de error
      await this.logger.error('Error al obtener usuario por ID', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        userId: id,
        action: 'GET_USER_BY_ID'
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura, capturando errores y retornando un resultado tipado.
   * @param id - ID numérico del usuario a consultar
   * @returns Resultado de la operación (éxito o error)
   */
  async executeSafe(id: number): Promise<{ success: true; data: UserResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(id);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
} 