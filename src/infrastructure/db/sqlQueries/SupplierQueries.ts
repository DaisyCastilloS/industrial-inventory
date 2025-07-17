export const SupplierQueries = {
  insert: `
    INSERT INTO suppliers (name, contact_name, contact_email, phone, address, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,
  update: `
    UPDATE suppliers SET name = $1, contact_name = $2, contact_email = $3, phone = $4, address = $5, is_active = $6, updated_at = $7
    WHERE id = $8
    RETURNING *
  `,
  softDelete: `
    UPDATE suppliers SET is_active = false, updated_at = $2 WHERE id = $1
    RETURNING *
  `,
  findById: `SELECT * FROM suppliers WHERE id = $1`,
  findByName: `SELECT * FROM suppliers WHERE name = $1`,
  findActive: `SELECT * FROM suppliers WHERE is_active = true`,
  existsByName: `SELECT COUNT(*) FROM suppliers WHERE name = $1`,
  
  findByField: (field: string) => {
    const allowedFields = [
      'id', 'name', 'contact_name', 'contact_email', 'phone', 
      'address', 'is_active', 'created_at', 'updated_at'
    ];
    
    if (!allowedFields.includes(field)) {
      throw new Error(`Campo no permitido: ${field}`);
    }
    
    return `SELECT * FROM suppliers WHERE ${field} = $1`;
  },
  
  stats: {
    total: `SELECT COUNT(*) FROM suppliers`,
    active: `SELECT COUNT(*) FROM suppliers WHERE is_active = true`,
  },
};
