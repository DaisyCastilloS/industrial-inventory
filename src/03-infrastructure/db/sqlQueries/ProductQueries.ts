export const ProductQueries = {
    create: `INSERT INTO products (name, description, sku, price, quantity, critical_stock, category_id, location_id, supplier_id, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`,
    
    update: `UPDATE products 
             SET name = $1, description = $2, sku = $3, price = $4, quantity = $5, 
                 critical_stock = $6, category_id = $7, location_id = $8, supplier_id = $9, is_active = $10, updated_at = NOW()
             WHERE id = $11;`,
    
    delete: `DELETE FROM products WHERE id = $1;`,
    
    findById: `SELECT * FROM products WHERE id = $1;`,
    
    findBySku: `SELECT * FROM products WHERE sku = $1;`,
    
    findAll: `SELECT * FROM products ORDER BY created_at DESC;`,
    
    findByCategory: `SELECT * FROM products WHERE category_id = $1 AND is_active = true;`,
    
    findByLocation: `SELECT * FROM products WHERE location_id = $1 AND is_active = true;`,
    
    findBySupplier: `SELECT * FROM products WHERE supplier_id = $1 AND is_active = true;`,
    
    findActive: `SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC;`,
    
    findCriticalStock: `SELECT * FROM products WHERE quantity <= critical_stock AND is_active = true;`,
    
    findOutOfStock: `SELECT * FROM products WHERE quantity = 0 AND is_active = true;`,
    
    findNormalStock: `SELECT * FROM products WHERE quantity > critical_stock AND is_active = true;`,
    
    findLowStock: `SELECT * FROM products WHERE quantity <= critical_stock AND is_active = true;`,
    
    searchByName: `SELECT * FROM products 
                   WHERE (name ILIKE $1 OR description ILIKE $1) AND is_active = true 
                   ORDER BY created_at DESC;`,
    
    getInventoryStats: `
        SELECT 
            COUNT(*) as total_products,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
            COUNT(CASE WHEN quantity <= critical_stock AND is_active = true THEN 1 END) as critical_stock_count,
            COUNT(CASE WHEN quantity = 0 AND is_active = true THEN 1 END) as out_of_stock_count,
            COALESCE(SUM(price * quantity), 0) as total_value
        FROM products
    `,
    
    getAuditTrail: `
        SELECT * FROM audit_logs 
        WHERE table_name = 'products' AND record_id = $1 
        ORDER BY created_at DESC
    `,

    existsBySku: `SELECT EXISTS(SELECT 1 FROM products WHERE sku = $1) as exists;`,
};