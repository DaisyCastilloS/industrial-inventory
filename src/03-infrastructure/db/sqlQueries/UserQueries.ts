export const UserQueries = {
    create: `
        INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `,
    
    findByEmail: `
        SELECT id, email, password, name, role, is_active, created_at, updated_at
        FROM users
        WHERE email = $1
    `,
    
    findById: `
        SELECT id, email, password, name, role, is_active, created_at, updated_at
        FROM users
        WHERE id = $1
    `,
    
    findAll: `
        SELECT id, email, password, name, role, is_active, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
    `,
    
    update: `
        UPDATE users
        SET email = $1, password = $2, name = $3, role = $4, is_active = $5, updated_at = $6
        WHERE id = $7
    `,
    
    delete: `
        DELETE FROM users
        WHERE id = $1
    `,
    
    updatePassword: `
        UPDATE users
        SET password = $1, updated_at = $2
        WHERE id = $3
    `,
    
    updateStatus: `
        UPDATE users
        SET is_active = $1, updated_at = $2
        WHERE id = $3
    `
}; 