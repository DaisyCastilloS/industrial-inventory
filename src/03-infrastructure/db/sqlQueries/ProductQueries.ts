export const ProductQueries = {
    create: `INSERT INTO products (name, description, price, quantity, category_id, location, critical_stock, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;`,
    
    update: `UPDATE products 
             SET name = $1, description = $2, price = $3, quantity = $4, 
                 category_id = $5, location = $6, critical_stock = $7, is_active = $8, updated_at = NOW()
             WHERE id = $9;`,
    
    delete: `DELETE FROM products WHERE id = $1;`,
    
    findById: `SELECT * FROM products WHERE id = $1;`,
    
    findAll: `SELECT * FROM products ORDER BY created_at DESC;`,
    
    findByCategory: `SELECT * FROM products WHERE category_id = $1 AND is_active = true;`,
    
    findActive: `SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC;`,
    
    findLowStock: `SELECT * FROM products WHERE quantity <= critical_stock AND is_active = true;`,
    
    searchByName: `SELECT * FROM products 
                   WHERE (name ILIKE $1 OR description ILIKE $1) AND is_active = true 
                   ORDER BY created_at DESC;`
};