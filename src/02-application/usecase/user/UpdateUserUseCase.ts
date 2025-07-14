/**
 * @fileoverview Caso de uso para actualizar usuarios
 * @author Daisy Castillo
 * @version 1.0.1
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
    private encryptionService: EncryptionInterface,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para actualizar un usuario.
   * @param id - ID numérico del usuario a actualizar
   * @param data - Datos a actualizar (DTO)
   * @returns DTO del usuario actualizado
   * @throws {Error} Si hay un error en la validación o actualización
   */
  async execute(id: number, data: UpdateUserDTO): Promise<UserResponseDTO> {
    try {
      this.validateId(id);
      const validatedData = validateUpdateUser(data);
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
      // Validar email único si se actualiza
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(validatedData.email);
        if (userWithEmail) {
          throw new Error('Ya existe un usuario con este email');
        }
      }
      // Preparar datos de actualización
      const updateData = await this.prepareUpdateData(validatedData);
      const updatedUser = await this.userRepository.update(id, updateData);
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
   * Ejecuta el caso de uso de forma segura, capturando errores y retornando un resultado tipado.
   * @param id - ID numérico del usuario a actualizar
   * @param data - Datos a actualizar (DTO)
   * @returns Resultado de la operación (éxito o error)
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

  /**
   * Valida el ID del usuario
   * @param id - ID a validar
   * @throws {Error} Si el ID es inválido
   */
  private validateId(id: number): void {
    if (!id || id <= 0) {
      throw new Error('ID de usuario inválido');
    }
  }

  /**
   * Prepara los datos de actualización a partir de los datos validados
   * @param validatedData - Datos validados
   * @returns Objeto con los campos a actualizar
   */
  private async prepareUpdateData(validatedData: UpdateUserDTO): Promise<Partial<UpdateUserDTO>> {
    const updateData: Partial<UpdateUserDTO> = {};
    if (validatedData.email !== undefined) updateData.email = validatedData.email;
    if (validatedData.password) {
      updateData.password = await this.encryptionService.hashPassword(validatedData.password);
    }
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.role !== undefined) updateData.role = validatedData.role;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    return updateData;
  }
} 