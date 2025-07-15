/**
 * @fileoverview Implementación del repositorio de usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import { User, IUser, UserEmail } from '../../core/domain/entity/User';
import { IUserRepository } from '../../core/domain/repository/UserRepository';
import { UserRole } from '../../shared/constants/RoleTypes';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';
import { AuditLog } from '../../core/domain/entity/AuditLog';

export class UserRepositoryImpl
  extends BaseRepositoryImpl<User>
  implements IUserRepository
{
  protected tableName = 'users';
  protected entityClass = User;

  /**
   * Busca un usuario por email
   */
  async findByEmail(
    email: UserEmail | string
  ): Promise<ServiceResult<User | null>> {
    try {
      const result = await this.findByField('email', email);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || new Error('No data returned'),
        };
      }
      return { success: true, data: result.data[0] || null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Busca usuarios por nombre
   */
  async findByName(name: string): Promise<ServiceResult<User[]>> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE name ILIKE $1 ORDER BY created_at DESC`;
      const result = await pool.query(query, [`%${name}%`]);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Busca usuarios por rol
   */
  async findByRole(role: UserRole): Promise<ServiceResult<User[]>> {
    try {
      const result = await this.findByField('role', role);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || new Error('No data returned'),
        };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Busca usuarios activos
   */
  async findActive(): Promise<ServiceResult<User[]>> {
    try {
      const result = await this.findByField('is_active', true);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || new Error('No data returned'),
        };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Busca usuarios inactivos
   */
  async findInactive(): Promise<ServiceResult<User[]>> {
    try {
      const result = await this.findByField('is_active', false);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || new Error('No data returned'),
        };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Verifica si existe un usuario con el email dado
   */
  async existsByEmail(email: UserEmail | string): Promise<boolean> {
    const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Actualiza la contraseña de un usuario
   */
  async updatePassword(
    id: number,
    hashedPassword: string
  ): Promise<ServiceResult<User>> {
    try {
      const query = `UPDATE ${this.tableName} SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
      const result = await pool.query(query, [hashedPassword, id]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: new Error(`Usuario con ID ${id} no encontrado`),
        };
      }
      return { success: true, data: this.mapRowToEntity(result.rows[0]) };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Actualiza el estado de un usuario
   */
  async updateStatus(
    id: number,
    isActive: boolean
  ): Promise<ServiceResult<User>> {
    try {
      const query = `UPDATE ${this.tableName} SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
      const result = await pool.query(query, [isActive, id]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: new Error(`Usuario con ID ${id} no encontrado`),
        };
      }
      return { success: true, data: this.mapRowToEntity(result.rows[0]) };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Obtiene el historial de auditoría de un usuario
   */
  async getAuditTrail(id: number): Promise<ServiceResult<AuditLog<IUser>[]>> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE table_name = 'users' AND record_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [id]);
      return { success: true, data: result.rows };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<UserRole, number>;
  }> {
    const totalQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
    const activeQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE is_active = true`;
    const roleQuery = `SELECT role, COUNT(*) as count FROM ${this.tableName} GROUP BY role`;

    const [totalResult, activeResult, roleResult] = await Promise.all([
      pool.query(totalQuery),
      pool.query(activeQuery),
      pool.query(roleQuery),
    ]);

    const usersByRole: Record<UserRole, number> = {
      ADMIN: 0,
      USER: 0,
      VIEWER: 0,
      MANAGER: 0,
      SUPERVISOR: 0,
      AUDITOR: 0,
    };

    roleResult.rows.forEach(row => {
      usersByRole[row.role as UserRole] = parseInt(row.count);
    });

    return {
      totalUsers: parseInt(totalResult.rows[0].count),
      activeUsers: parseInt(activeResult.rows[0].count),
      usersByRole,
    };
  }
}
