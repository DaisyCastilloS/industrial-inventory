export const UserQueries = {
  insert: `
    INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
  update: `
    UPDATE users SET email = $1, password = $2, name = $3, role = $4, is_active = $5, updated_at = $6
    WHERE id = $7
    RETURNING *
  `,
  softDelete: `
    UPDATE users SET is_active = false, updated_at = $2 WHERE id = $1
    RETURNING *
  `,
  findById: `SELECT * FROM users WHERE id = $1`,
  findByEmail: `SELECT * FROM users WHERE email = $1`,
  findByRole: `SELECT * FROM users WHERE role = $1`,
  findActive: `SELECT * FROM users WHERE is_active = true`,
  existsByEmail: `SELECT COUNT(*) FROM users WHERE email = $1`,
  
  findByField: (field: string) => {
    const allowedFields = [
      'id', 'email', 'password', 'name', 'role', 'is_active', 
      'created_at', 'updated_at'
    ];
    
    if (!allowedFields.includes(field)) {
      throw new Error(`Campo no permitido: ${field}`);
    }
    
    return `SELECT * FROM users WHERE ${field} = $1`;
  },
  
  stats: {
    total: `SELECT COUNT(*) FROM users`,
    active: `SELECT COUNT(*) FROM users WHERE is_active = true`,
    byRole: `SELECT role, COUNT(*) FROM users GROUP BY role`,
  },
};
