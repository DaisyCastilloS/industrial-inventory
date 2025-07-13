export const ProductQueries = {
    create: `INSERT INTO products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id;`,
    update: `UPDATE products SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5;`,
    delete: `DELETE FROM products WHERE id = $1;`,
    findById: `SELECT * FROM products WHERE id = $1;`,
    findAll: `SELECT * FROM products;`,
};