/**
 * @fileoverview Implementación de infraestructura del repositorio de usuarios
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { User, IUser, UserEmail } from "../../01-domain/entity/User";
import { IUserRepository } from "../../01-domain/repository/UserRepository";
import { UserQueries } from "../db/sqlQueries/UserQueries";
import { UserRole } from "../../00-constants/RoleTypes";
import { AuditLog } from "../../01-domain/entity/AuditLog";

export class UserRepositoryImpl implements IUserRepository {
    /**
     * Crea un nuevo usuario en la base de datos
     * @param user - Datos del usuario
     * @returns Usuario creado
     */
    async create(user: IUser): Promise<User> {
        const result = await pool.query(UserQueries.create, [
            user.email,
            user.password,
            user.name,
            user.role,
            user.isActive,
            user.createdAt || new Date(),
            user.updatedAt || new Date()
        ]);
        if (result.rows.length > 0) {
            return this.mapRowToUser(result.rows[0]);
        }
        throw new Error('Error al crear usuario');
    }

    /**
     * Busca un usuario por email (tipado semántico)
     * @param email - Email del usuario
     * @returns Usuario encontrado o null
     */
    async findByEmail(email: UserEmail | string): Promise<User | null> {
        const result = await pool.query(UserQueries.findByEmail, [email]);
        if (result.rows.length === 0) return null;
        return this.mapRowToUser(result.rows[0]);
    }

    /**
     * Busca un usuario por ID
     * @param id - ID del usuario
     * @returns Usuario encontrado o null
     */
    async findById(id: number): Promise<User | null> {
        const result = await pool.query(UserQueries.findById, [id]);
        if (result.rows.length === 0) return null;
        return this.mapRowToUser(result.rows[0]);
    }

    async update(id: number, userData: Partial<IUser>): Promise<User> {
        const existingUser = await this.findById(id);
        if (!existingUser) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }
        const updatedData = {
            email: userData.email || existingUser.email,
            password: userData.password || existingUser.password,
            name: userData.name || existingUser.name,
            role: userData.role || existingUser.role,
            isActive: userData.isActive !== undefined ? userData.isActive : existingUser.isActive,
            updatedAt: new Date()
        };
        await pool.query(UserQueries.update, [
            updatedData.email,
            updatedData.password,
            updatedData.name,
            updatedData.role,
            updatedData.isActive,
            updatedData.updatedAt,
            id
        ]);
        return await this.findById(id) as User;
    }

    async delete(id: number): Promise<void> {
        await pool.query(UserQueries.delete, [id]);
    }

    async findAll(): Promise<User[]> {
        const result = await pool.query(UserQueries.findAll);
        return result.rows.map(this.mapRowToUser);
    }

    async findActive(): Promise<User[]> {
        const result = await pool.query(
            `SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC`
        );
        return result.rows.map(this.mapRowToUser);
    }

    async findByRole(role: UserRole): Promise<User[]> {
        const result = await pool.query(
            `SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC`,
            [role]
        );
        return result.rows.map(this.mapRowToUser);
    }

    async activate(id: number): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }
        user.activate();
        return this.update(id, { isActive: true });
    }

    async deactivate(id: number): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }
        user.deactivate();
        return this.update(id, { isActive: false });
    }

    /**
     * Verifica si existe un usuario con el email dado (tipado semántico)
     * @param email - Email a verificar
     * @returns true si existe
     */
    async existsByEmail(email: UserEmail | string): Promise<boolean> {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM users WHERE email = $1`,
            [email]
        );
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Obtiene el historial de auditoría de un usuario
     * @param userId - ID del usuario
     * @returns Lista de logs de auditoría del usuario
     */
    async getAuditTrail(userId: number): Promise<AuditLog<IUser>[]> {
        const result = await pool.query(
            `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows.map((row: any) => new AuditLog<IUser>(row));
    }

    // --- Método privado para mapear una fila de la BD a la entidad User ---
    private mapRowToUser(row: any): User {
        return new User({
            id: row.id,
            email: row.email,
            password: row.password,
            name: row.name,
            role: row.role,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }
} 