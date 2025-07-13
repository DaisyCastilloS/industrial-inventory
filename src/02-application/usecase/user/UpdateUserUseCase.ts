/**
 * @fileoverview Caso de uso para actualizar usuarios
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { IUserRepository } from '../../../01-domain/repository/UserRepository';
import { UpdateUserDTO, validateUpdateUser } from '../../dto/user/UpdateUserDTO';
import { UserResponseDTO } from '../../dto/user/UserResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { EncryptionInterface } from '../../interface/EncryptionInterface';

/**
 * Caso de uso para actualizar usuarios
 */
export class UpdateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: LoggerWrapperInterface,
    private encryptionService: EncryptionInterface
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario
   * @param data - Datos a actualizar
   * @returns Usuario actualizado
   * @throws {Error} Si hay un error en la validación o actualización
   */
  async execute(id: number, data: UpdateUserDTO): Promise<UserResponseDTO> {
    try {
      // Validar ID
      if (!id || id <= 0) {
        throw new Error('ID de usuario inválido');
      }

      // Validar datos de entrada
      const validatedData = validateUpdateUser(data);

      // Verificar que el usuario existe
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }

      // Preparar datos de actualización
      const updateData: Partial<UpdateUserDTO> = {};

      // Si se está actualizando el email, verificar que no exista
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(validatedData.email);
        if (userWithEmail) {
          throw new Error('Ya existe un usuario con este email');
        }
        updateData.email = validatedData.email;
      }

      // Si se está actualizando la contraseña, encriptarla
      if (validatedData.password) {
        updateData.password = await this.encryptionService.hashPassword(validatedData.password);
      }

      // Agregar otros campos si están presentes
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.role !== undefined) updateData.role = validatedData.role;
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

      // Actualizar usuario
      const updatedUser = await this.userRepository.update(id, updateData);

      // Log de auditoría
      await this.logger.info('Usuario actualizado exitosamente', {
        userId: updatedUser.id,
        email: updatedUser.email,
        action: 'UPDATE_USER',
        metadata: {
          updatedFields: Object.keys(updateData),
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        }
      });

      // Retornar respuesta sin contraseña
      return {
        id: updatedUser.id!,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt!,
        updatedAt: updatedUser.updatedAt!
      };

    } catch (error) {
      // Log de error
      await this.logger.error('Error al actualizar usuario', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        userId: id,
        data: data,
        action: 'UPDATE_USER'
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura
   * @param id - ID del usuario
   * @param data - Datos a actualizar
   * @returns Resultado de la operación
   */
  async executeSafe(id: number, data: UpdateUserDTO): Promise<{ success: true; data: UserResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(id, data);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
} 