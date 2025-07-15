/**
 * @fileoverview Consultas SQL optimizadas para productos
 * @author Daisy Castillo
 */

export const ProductQueries = {
  findCriticalStock: `
    SELECT p.*, 
           c.name as category_name,
           l.name as location_name,
           s.name as supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN locations l ON p.location_id = l.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.is_active = true 
    AND p.quantity <= p.critical_stock 
    AND p.quantity > 0
    ORDER BY p.quantity ASC
  `,

  findOutOfStock: `
    SELECT p.*, 
           c.name as category_name,
           l.name as location_name,
           s.name as supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN locations l ON p.location_id = l.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.is_active = true 
    AND p.quantity = 0
    ORDER BY p.updated_at DESC
  `,

  findNormalStock: `
    SELECT p.*, 
           c.name as category_name,
           l.name as location_name,
           s.name as supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN locations l ON p.location_id = l.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.is_active = true 
    AND p.quantity > p.critical_stock
    ORDER BY p.quantity DESC
  `,

  searchByName: `
    SELECT p.*, 
           c.name as category_name,
           l.name as location_name,
           s.name as supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN locations l ON p.location_id = l.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.is_active = true 
    AND p.name ILIKE $1
    ORDER BY p.name ASC
  `,

  getInventoryStats: `
    SELECT 
      COUNT(*) as total_products,
      COUNT(*) FILTER (WHERE is_active = true) as active_products,
      COUNT(*) FILTER (WHERE quantity <= critical_stock AND quantity > 0) as critical_stock_count,
      COUNT(*) FILTER (WHERE quantity = 0) as out_of_stock_count,
      COALESCE(SUM(price * quantity), 0) as total_value
    FROM products
  `,

  getAuditTrail: `
    SELECT 
      al.*,
      u.name as user_name,
      u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.entity_type = 'Product'
    AND al.entity_id = $1
    ORDER BY al.created_at DESC
  `,

  // Vista materializada para productos con información completa
  createProductsFullInfoView: `
    CREATE MATERIALIZED VIEW IF NOT EXISTS products_full_info AS
    SELECT 
      p.*,
      c.name as category_name,
      l.name as location_name,
      s.name as supplier_name,
      CASE 
        WHEN p.quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN p.quantity <= p.critical_stock THEN 'CRITICAL'
        ELSE 'NORMAL'
      END as stock_status,
      (p.price * p.quantity) as inventory_value
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN locations l ON p.location_id = l.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WITH DATA;
  `,

  // Vista materializada para productos en stock crítico
  createCriticalStockView: `
    CREATE MATERIALIZED VIEW IF NOT EXISTS critical_stock_products AS
    SELECT 
      p.*,
      c.name as category_name,
      l.name as location_name,
      s.name as supplier_name,
      'CRITICAL' as stock_status,
      (p.price * p.quantity) as inventory_value
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN locations l ON p.location_id = l.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.quantity <= p.critical_stock AND p.quantity > 0
    WITH DATA;
  `,

  // Índices para optimizar consultas frecuentes
  createIndexes: `
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_location ON products(location_id);
    CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_products_stock ON products(quantity, critical_stock);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
  `,

  // Refrescar vistas materializadas
  refreshViews: `
    REFRESH MATERIALIZED VIEW products_full_info;
    REFRESH MATERIALIZED VIEW critical_stock_products;
  `,
};
