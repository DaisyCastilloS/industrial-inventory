export const ProductMovementQueries = {
  insert: `
    INSERT INTO product_movements (product_id, user_id, quantity, movement_type, movement_date, notes, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,
  update: `
    UPDATE product_movements SET product_id = $1, user_id = $2, quantity = $3, movement_type = $4, movement_date = $5, notes = $6, updated_at = $7
    WHERE id = $8
    RETURNING *
  `,
  softDelete: `
    UPDATE product_movements SET notes = CONCAT(notes, ' [DELETED]'), updated_at = $2 WHERE id = $1
    RETURNING *
  `,
  findById: `SELECT * FROM product_movements WHERE id = $1`,
  findByProduct: `SELECT * FROM product_movements WHERE product_id = $1`,
  findByUser: `SELECT * FROM product_movements WHERE user_id = $1`,
  findByType: `SELECT * FROM product_movements WHERE movement_type = $1`,
  findAll: `SELECT * FROM product_movements`,
  findByField: field => `SELECT * FROM product_movements WHERE ${field} = $1`,
  stats: {
    total: `SELECT COUNT(*) FROM product_movements`,
    byType: `SELECT movement_type, COUNT(*) FROM product_movements GROUP BY movement_type`,
    byProduct: `SELECT product_id, COUNT(*) FROM product_movements GROUP BY product_id`,
  },
};
