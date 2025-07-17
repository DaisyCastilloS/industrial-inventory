export const LocationQueries = {
  insert: `
    INSERT INTO locations (name, description, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  update: `
    UPDATE locations SET name = $1, description = $2, is_active = $3, updated_at = $4
    WHERE id = $5
    RETURNING *
  `,
  softDelete: `
    UPDATE locations SET is_active = false, updated_at = $2 WHERE id = $1
    RETURNING *
  `,
  findById: `SELECT * FROM locations WHERE id = $1`,
  findByName: `SELECT * FROM locations WHERE name = $1`,
  findActive: `SELECT * FROM locations WHERE is_active = true`,
  existsByName: `SELECT COUNT(*) FROM locations WHERE name = $1`,
  
  findByField: (field: string) => {
    const allowedFields = [
      'id', 'name', 'description', 'is_active', 'created_at', 'updated_at'
    ];
    
    if (!allowedFields.includes(field)) {
      throw new Error(`Campo no permitido: ${field}`);
    }
    
    return `SELECT * FROM locations WHERE ${field} = $1`;
  },
  
  stats: {
    total: `SELECT COUNT(*) FROM locations`,
    active: `SELECT COUNT(*) FROM locations WHERE is_active = true`,
  },
};
