import { pool } from "../db/database";
import { User, IUser } from "../../01-domain/entity/User";
import { IUserRepository } from "../../01-domain/repository/UserRepository";
import { UserQueries } from "../db/sqlQueries/UserQueries";
import { UserRole } from "../../00-constants/RoleTypes";

export class UserRepositoryImpl implements IUserRepository {
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
        
        // Retornar usuario creado
        if (result.rows.length > 0) {
            return new User({
                id: result.rows[0].id,
                email: user.email,
                password: user.password,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt || new Date(),
                updatedAt: user.updatedAt || new Date()
            });
        }
        
        throw new Error('Error al crear usuario');
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(UserQueries.findByEmail, [email]);
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
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

    async findById(id: number): Promise<User | null> {
        const result = await pool.query(UserQueries.findById, [id]);
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
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

        return new User({
            id,
            ...updatedData,
            createdAt: existingUser.createdAt
        });
    }

    async delete(id: number): Promise<void> {
        await pool.query(UserQueries.delete, [id]);
    }

    async findAll(): Promise<User[]> {
        const result = await pool.query(UserQueries.findAll);
        return result.rows.map(row => new User({
            id: row.id,
            email: row.email,
            password: row.password,
            name: row.name,
            role: row.role,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async findActive(): Promise<User[]> {
        const result = await pool.query(
            `SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC`
        );
        return result.rows.map(row => new User({
            id: row.id,
            email: row.email,
            password: row.password,
            name: row.name,
            role: row.role,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async findByRole(role: UserRole): Promise<User[]> {
        const result = await pool.query(
            `SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC`,
            [role]
        );
        return result.rows.map(row => new User({
            id: row.id,
            email: row.email,
            password: row.password,
            name: row.name,
            role: row.role,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
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

    async existsByEmail(email: string): Promise<boolean> {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM users WHERE email = $1`,
            [email]
        );
        return parseInt(result.rows[0].count) > 0;
    }

    async getAuditTrail(userId: number): Promise<any[]> {
        const result = await pool.query(
            `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }
} 