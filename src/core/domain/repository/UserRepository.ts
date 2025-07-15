/**
 * @fileoverview Interfaz del repositorio de usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { User, IUser } from '../entity/User';
import { UserRole } from '../../../shared/constants/RoleTypes';
import { AuditLog } from '../entity/AuditLog';
import { IBaseRepository } from './base/BaseRepository';
import { ServiceResult } from '../../../infrastructure/services/base/ServiceTypes';

// Tipos semánticos importados de la entidad User
import type { UserEmail, UserName } from '../entity/User';

/**
 * Interfaz del repositorio de usuarios
 *
 * Todos los métodos usan tipado semántico y retornan entidades de dominio.
 */
export interface IUserRepository extends IBaseRepository<User> {
  /**
   * Busca un usuario por email (tipado semántico)
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  findByEmail(email: UserEmail | string): Promise<ServiceResult<User | null>>;

  /**
   * Obtiene usuarios activos
   * @returns Lista de usuarios activos
   */
  findActive(): Promise<ServiceResult<User[]>>;

  /**
   * Busca usuarios por rol
   * @param role - Rol de usuario
   * @returns Lista de usuarios con el rol especificado
   */
  findByRole(role: UserRole): Promise<ServiceResult<User[]>>;

  /**
   * Verifica si existe un usuario con el email dado (tipado semántico)
   * @param email - Email a verificar
   * @returns true si existe
   */
  existsByEmail(email: UserEmail | string): Promise<boolean>;

  /**
   * Obtiene el historial de auditoría de un usuario
   * @param userId - ID del usuario
   * @returns Lista de logs de auditoría del usuario
   */
  getAuditTrail(userId: number): Promise<ServiceResult<AuditLog<IUser>[]>>;
}
