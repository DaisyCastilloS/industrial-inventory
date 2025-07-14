/**
 * @fileoverview Interfaz del repositorio de usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { User, IUser } from '../entity/User';
import { UserRole } from '../../00-constants/RoleTypes';
import { AuditLog } from '../entity/AuditLog';

// Tipos semánticos importados de la entidad User
import type { UserEmail, UserName } from '../entity/User';

/**
 * Interfaz del repositorio de usuarios
 *
 * Todos los métodos usan tipado semántico y retornan entidades de dominio.
 */
export interface IUserRepository {
  /**
   * Crea un nuevo usuario
   * @param user - Datos del usuario
   * @returns Usuario creado
   */
  create(user: IUser): Promise<User>;

  /**
   * Busca un usuario por ID
   * @param id - ID del usuario
   * @returns Usuario encontrado o null
   */
  findById(id: number): Promise<User | null>;

  /**
   * Busca un usuario por email (tipado semántico)
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  findByEmail(email: UserEmail | string): Promise<User | null>;

  /**
   * Obtiene todos los usuarios
   * @returns Lista de usuarios
   */
  findAll(): Promise<User[]>;

  /**
   * Obtiene usuarios activos
   * @returns Lista de usuarios activos
   */
  findActive(): Promise<User[]>;

  /**
   * Busca usuarios por rol
   * @param role - Rol de usuario
   * @returns Lista de usuarios con el rol especificado
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Actualiza un usuario
   * @param id - ID del usuario
   * @param userData - Datos a actualizar
   * @returns Usuario actualizado
   */
  update(id: number, userData: Partial<IUser>): Promise<User>;

  /**
   * Elimina un usuario (soft delete)
   * @param id - ID del usuario
   */
  delete(id: number): Promise<void>;

  /**
   * Activa un usuario
   * @param id - ID del usuario
   * @returns Usuario activado
   */
  activate(id: number): Promise<User>;

  /**
   * Desactiva un usuario
   * @param id - ID del usuario
   * @returns Usuario desactivado
   */
  deactivate(id: number): Promise<User>;

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
  getAuditTrail(userId: number): Promise<AuditLog<IUser>[]>;
} 