export const CategoryQueries = {
  insert: `
    INSERT INTO categories (name, description, parent_id, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
  update: `
    UPDATE categories SET name = $1, description = $2, parent_id = $3, is_active = $4, updated_at = $5
    WHERE id = $6
    RETURNING *
  `,
  softDelete: `
    UPDATE categories SET is_active = false, updated_at = $2 WHERE id = $1
    RETURNING *
  `,
  findById: `SELECT * FROM categories WHERE id = $1`,
  findByName: `SELECT * FROM categories WHERE name = $1`,
  findByParent: `SELECT * FROM categories WHERE parent_id = $1`,
  findRoot: `SELECT * FROM categories WHERE parent_id IS NULL AND is_active = true`,
  findByDescription: `SELECT * FROM categories WHERE description ILIKE $1`,
  existsByName: `SELECT COUNT(*) FROM categories WHERE name = $1`,
  findByField: field => `SELECT * FROM categories WHERE ${field} = $1`,
  stats: {
    total: `SELECT COUNT(*) FROM categories`,
    active: `SELECT COUNT(*) FROM categories WHERE is_active = true`,
    root: `SELECT COUNT(*) FROM categories WHERE parent_id IS NULL AND is_active = true`,
  },
};
