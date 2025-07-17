import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import { User, IUser, UserEmail } from '../../core/domain/entity/User';
import { IUserRepository } from '../../core/domain/repository/UserRepository';
import { UserRole } from '../../shared/constants/RoleTypes';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';
import { AuditLog } from '../../core/domain/entity/AuditLog';

export class UserRepositoryImpl
  extends BaseRepositoryImpl<User>
{
  protected tableName = 'users';
  protected entityClass = User;

  protected getAllowedFields(): string[] {
    return [
      'id',
      'created_at',
      'updated_at',
      'is_active',
      'email',
      'password',
      'name',
      'role'
    ];
  }

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

  async findByEmail(email: UserEmail | string): Promise<ServiceResult<User | null>> {
    // Debug: probar búsqueda directa
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE email = $1 AND is_active = true`;
      const result = await pool.query(query, [email]);
      console.log('DEBUG: findByEmail query result:', result.rows);
      return {
        success: true,
        data: result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null,
      };
    } catch (error) {
      console.log('DEBUG: findByEmail error:', error);
      return { success: false, error: error as Error };
    }
  }

  async findActive(): Promise<ServiceResult<User[]>> {
    const result = await this.findByField('is_active', true);
    return result;
  }

  async findByRole(role: UserRole): Promise<ServiceResult<User[]>> {
    const result = await this.findByField('role', role);
    return result;
  }

  async existsByEmail(email: UserEmail | string): Promise<boolean> {
    const result = await this.findByField('email', email);
    return !!(result.data && result.data.length > 0);
  }

  async getAuditTrail(userId: number): Promise<ServiceResult<AuditLog<IUser>[]>> {
    const query = `
      SELECT * FROM audit_logs 
      WHERE table_name = 'users' AND record_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return {
      success: true,
      data: result.rows,
    };
  }

  async create(user: IUser): Promise<ServiceResult<User>> {
    try {
      const query = `
        INSERT INTO ${this.tableName} (email, password, name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        user.email,
        user.password,
        user.name,
        user.role,
        user.isActive !== undefined ? user.isActive : true
      ];

      const result = await pool.query(query, values);
      const createdUser = this.mapRowToEntity(result.rows[0]);
      return { success: true, data: createdUser };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  protected mapFieldName(field: string): string {
    // Mapeo específico para campos de la entidad User
    const fieldMapping: { [key: string]: string } = {
      '_email': 'email',
      '_password': 'password',
      '_name': 'name',
      '_role': 'role',
      '_isActive': 'is_active',
      '_createdAt': 'created_at',
      '_updatedAt': 'updated_at',
      'email': 'email',
      'password': 'password',
      'name': 'name',
      'role': 'role',
      'isActive': 'is_active',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };
    
    return fieldMapping[field] || field;
  }
}
