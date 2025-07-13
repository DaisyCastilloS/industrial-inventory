/**
 * @fileoverview Caso de uso para eliminar usuarios
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { IUserRepository } from '../../../01-domain/repository/UserRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para eliminar usuarios
 */
export class DeleteUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario
   * @throws {Error} Si hay un error en la eliminación
   */
  async execute(id: number): Promise<void> {
    try {
      // Validar ID
      if (!id || id <= 0) {
        throw new Error('ID de usuario inválido');
      }

      // Verificar que el usuario existe
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }

      // Verificar que no sea el último administrador
      if (existingUser.isAdmin()) {
        const adminUsers = await this.userRepository.findByRole(existingUser.role);
        if (adminUsers.length <= 1) {
          throw new Error('No se puede eliminar el último administrador del sistema');
        }
      }

      // Eliminar usuario (soft delete)
      await this.userRepository.delete(id);

      // Log de auditoría
      await this.logger.info('Usuario eliminado exitosamente', {
        userId: id,
        email: existingUser.email,
        action: 'DELETE_USER',
        metadata: {
          name: existingUser.name,
          role: existingUser.role,
          isActive: existingUser.isActive
        }
      });

    } catch (error) {
      // Log de error
      await this.logger.error('Error al eliminar usuario', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        userId: id,
        action: 'DELETE_USER'
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura
   * @param id - ID del usuario
   * @returns Resultado de la operación
   */
  async executeSafe(id: number): Promise<{ success: true } | { success: false; error: string }> {
    try {
      await this.execute(id);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
} 