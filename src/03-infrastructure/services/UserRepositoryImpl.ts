import { pool } from "../db/database";
import { User } from "../../01-domain/entity/User";
import { UserRepository } from "../../01-domain/repository/UserRepository";
import { UserQueries } from "../db/sqlQueries/UserQueries";

export class UserRepositoryImpl implements UserRepository {
    async create(user: User): Promise<void> {
        const result = await pool.query(UserQueries.create, [
            user.getEmail(),
            user.getPassword(),
            user.getName(),
            user.getRole(),
            user.getIsActive(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        ]);
        
        // Asignar el ID generado por la base de datos
        if (result.rows.length > 0) {
            user.setId(result.rows[0].id);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(UserQueries.findByEmail, [email]);
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new User(
            row.id,
            row.email,
            row.password,
            row.name,
            row.role,
            row.is_active,
            row.created_at,
            row.updated_at
        );
    }

    async findById(id: number): Promise<User | null> {
        const result = await pool.query(UserQueries.findById, [id]);
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new User(
            row.id,
            row.email,
            row.password,
            row.name,
            row.role,
            row.is_active,
            row.created_at,
            row.updated_at
        );
    }

    async update(user: User): Promise<void> {
        await pool.query(UserQueries.update, [
            user.getEmail(),
            user.getPassword(),
            user.getName(),
            user.getRole(),
            user.getIsActive(),
            user.getUpdatedAt(),
            user.getId()
        ]);
    }

    async delete(id: number): Promise<void> {
        await pool.query(UserQueries.delete, [id]);
    }

    async findAll(): Promise<User[]> {
        const result = await pool.query(UserQueries.findAll);
        return result.rows.map(row => new User(
            row.id,
            row.email,
            row.password,
            row.name,
            row.role,
            row.is_active,
            row.created_at,
            row.updated_at
        ));
    }
} 