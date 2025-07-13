/**
 * @fileoverview Caso de uso para listar usuarios
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { IUserRepository } from '../../../01-domain/repository/UserRepository';
import { UserListResponseDTO } from '../../dto/user/UserResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { UserRole } from '../../../00-constants/RoleTypes';

/**
 * Interfaz para filtros de búsqueda de usuarios
 */
export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

/**
 * Interfaz para opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Caso de uso para listar usuarios
 */
export class ListUsersUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param filters - Filtros de búsqueda
   * @param pagination - Opciones de paginación
   * @returns Lista de usuarios
   */
  async execute(filters?: UserFilters, pagination?: PaginationOptions): Promise<UserListResponseDTO> {
    try {
      // Obtener todos los usuarios
      const users = await this.userRepository.findAll();

      // Aplicar filtros
      let filteredUsers = users;

      if (filters?.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }

      if (filters?.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
      }

      // Aplicar paginación
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      // Convertir a DTOs de respuesta
      const userDTOs = paginatedUsers.map(user => ({
        id: user.id!,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt!,
        updatedAt: user.updatedAt!
      }));

      // Calcular información de paginación
      const total = filteredUsers.length;
      const totalPages = Math.ceil(total / limit);

      // Log de auditoría
      await this.logger.info('Lista de usuarios consultada exitosamente', {
        action: 'LIST_USERS',
        metadata: {
          totalUsers: total,
          filteredCount: filteredUsers.length,
          returnedCount: userDTOs.length,
          page,
          limit,
          totalPages,
          filters: filters || {},
          pagination: pagination || {}
        }
      });

      return {
        users: userDTOs,
        total,
        page,
        limit,
        totalPages
      };

    } catch (error) {
      // Log de error
      await this.logger.error('Error al listar usuarios', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        action: 'LIST_USERS',
        filters,
        pagination
      });

      throw error;
    }
  }

  /**
   * Ejecuta el caso de uso de forma segura
   * @param filters - Filtros de búsqueda
   * @param pagination - Opciones de paginación
   * @returns Resultado de la operación
   */
  async executeSafe(filters?: UserFilters, pagination?: PaginationOptions): Promise<{ success: true; data: UserListResponseDTO } | { success: false; error: string }> {
    try {
      const result = await this.execute(filters, pagination);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
} 