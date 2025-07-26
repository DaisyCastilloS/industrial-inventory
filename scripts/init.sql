-- =====================================================
-- SISTEMA DE INVENTARIO INDUSTRIAL - SCRIPT DE INICIALIZACIÓN
-- =====================================================
-- Este script inicializa completamente la base de datos
-- Incluye: esquema, particiones, índices, datos de ejemplo y triggers
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- SECCIÓN 1: LIMPIEZA DE OBJETOS EXISTENTES
-- =====================================================
-- Eliminar objetos si existen (orden inverso a dependencias)
DROP MATERIALIZED VIEW IF EXISTS mv_critical_stock_products;
DROP MATERIALIZED VIEW IF EXISTS mv_category_tree;
DROP MATERIALIZED VIEW IF EXISTS mv_product_stats;
DROP TABLE IF EXISTS audit_logs_y2024m01;
DROP TABLE IF EXISTS audit_logs_y2024m02;
DROP TABLE IF EXISTS audit_logs_y2024m03;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS product_movements_y2024m01;
DROP TABLE IF EXISTS product_movements_y2024m02;
DROP TABLE IF EXISTS product_movements_y2024m03;
DROP TABLE IF EXISTS product_movements;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;

-- =====================================================
-- SECCIÓN 2: CREACIÓN DE TABLAS BASE
-- =====================================================
-- =====================================================
-- 1. TABLA USUARIOS (Optimizada)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP,
    failed_attempts SMALLINT DEFAULT 0,
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'USER', 'VIEWER', 'MANAGER', 'SUPERVISOR', 'AUDITOR')),
    CONSTRAINT users_failed_attempts_check CHECK (failed_attempts >= 0 AND failed_attempts <= 5)
);

-- =====================================================
-- 2. TABLA CATEGORÍAS (Optimizada)
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    level INTEGER DEFAULT 0,
    CONSTRAINT categories_name_unique UNIQUE (name),
    CONSTRAINT categories_prevent_self_reference CHECK (id != parent_id)
);

-- =====================================================
-- 3. TABLA UBICACIONES (Optimizada)
-- =====================================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL DEFAULT 'GENERIC',
    type VARCHAR(50) NOT NULL DEFAULT 'WAREHOUSE',
    zone VARCHAR(50),
    shelf VARCHAR(50),
    capacity INTEGER,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT locations_name_unique UNIQUE (name),
    CONSTRAINT locations_capacity_check CHECK (capacity > 0),
    CONSTRAINT locations_usage_check CHECK (current_usage >= 0 AND (capacity IS NULL OR current_usage <= capacity))
);

-- =====================================================
-- 4. TABLA PROVEEDORES (Optimizada)
-- =====================================================
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    rating DECIMAL(2,1),
    last_delivery_date TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT suppliers_name_unique UNIQUE (name),
    CONSTRAINT suppliers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT suppliers_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- =====================================================
-- 5. TABLA PRODUCTOS (Optimizada)
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50),
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    critical_stock INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    location_id INTEGER REFERENCES locations(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    last_restock_date TIMESTAMP,
    last_movement_date TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT products_sku_unique UNIQUE (sku),
    CONSTRAINT products_price_check CHECK (price >= 0),
    CONSTRAINT products_quantity_check CHECK (quantity >= 0),
    CONSTRAINT products_critical_stock_check CHECK (critical_stock >= 0)
);

-- =====================================================
-- 6. TABLA MOVIMIENTOS DE PRODUCTOS (Particionada)
-- =====================================================
CREATE TABLE product_movements (
    id SERIAL,
    product_id INTEGER NOT NULL REFERENCES products(id),
    movement_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason VARCHAR(200),
    user_id INTEGER NOT NULL REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT product_movements_type_check CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    CONSTRAINT product_movements_quantity_check CHECK (quantity > 0),
    CONSTRAINT product_movements_quantities_check CHECK (
        (movement_type = 'IN' AND new_quantity = previous_quantity + quantity) OR
        (movement_type = 'OUT' AND new_quantity = previous_quantity - quantity) OR
        (movement_type = 'ADJUSTMENT')
    ),
    UNIQUE(id, created_at)
) PARTITION BY RANGE (created_at);

-- Crear particiones por mes para2024
CREATE TABLE product_movements_y2024m01 PARTITION OF product_movements
    FOR VALUES FROM ('2024-1-1') TO ('2024-2-1');
CREATE TABLE product_movements_y2024m02 PARTITION OF product_movements
    FOR VALUES FROM ('2024-2-1') TO ('2024-3-1');
CREATE TABLE product_movements_y2024m03 PARTITION OF product_movements
    FOR VALUES FROM ('2024-3-1') TO ('2024-4-1');

-- Crear particiones por mes para2025
CREATE TABLE product_movements_y2025m01 PARTITION OF product_movements
    FOR VALUES FROM ('2025-1-1') TO ('2025-2-1');
CREATE TABLE product_movements_y2025m02 PARTITION OF product_movements
    FOR VALUES FROM ('2025-2-1') TO ('2025-3-1');
CREATE TABLE product_movements_y2025m03 PARTITION OF product_movements
    FOR VALUES FROM ('2025-3-1') TO ('2025-4-1');
CREATE TABLE product_movements_y2025m04 PARTITION OF product_movements
    FOR VALUES FROM ('2025-4-1') TO ('2025-5-1');
CREATE TABLE product_movements_y2025m05 PARTITION OF product_movements
    FOR VALUES FROM ('2025-5-1') TO ('2025-6-1');
CREATE TABLE product_movements_y2025m06 PARTITION OF product_movements
    FOR VALUES FROM ('2025-6-1') TO ('2025-7-1');
CREATE TABLE product_movements_y2025m07 PARTITION OF product_movements
    FOR VALUES FROM ('2025-7-1') TO ('2025-8-1');
CREATE TABLE product_movements_y2025m08 PARTITION OF product_movements
    FOR VALUES FROM ('2025-8-1') TO ('2025-9-1');
CREATE TABLE product_movements_y2025m09 PARTITION OF product_movements
    FOR VALUES FROM ('2025-9-1') TO ('2025-10-1');
CREATE TABLE product_movements_y2025m10 PARTITION OF product_movements
    FOR VALUES FROM ('2025-10-1') TO ('2025-11-1');
CREATE TABLE product_movements_y2025m11 PARTITION OF product_movements
    FOR VALUES FROM ('2025-11-1') TO ('2025-12-1');

-- Crear particiones por mes para2026
CREATE TABLE product_movements_y2026m01 PARTITION OF product_movements
    FOR VALUES FROM ('2026-1-1') TO ('2026-2-1');
CREATE TABLE product_movements_y2026m02 PARTITION OF product_movements
    FOR VALUES FROM ('2026-2-1') TO ('2026-3-1');
CREATE TABLE product_movements_y2026m03 PARTITION OF product_movements
    FOR VALUES FROM ('2026-3-1') TO ('2026-4-1');
CREATE TABLE product_movements_y2026m04 PARTITION OF product_movements
    FOR VALUES FROM ('2026-4-1') TO ('2026-5-1');
CREATE TABLE product_movements_y2026m05 PARTITION OF product_movements
    FOR VALUES FROM ('2026-5-1') TO ('2026-6-1');
CREATE TABLE product_movements_y2026m06 PARTITION OF product_movements
    FOR VALUES FROM ('2026-6-1') TO ('2026-7-1');
CREATE TABLE product_movements_y2026m07 PARTITION OF product_movements
    FOR VALUES FROM ('2026-7-1') TO ('2026-8-1');
CREATE TABLE product_movements_y2026m08 PARTITION OF product_movements
    FOR VALUES FROM ('2026-8-1') TO ('2026-9-1');
CREATE TABLE product_movements_y2026m09 PARTITION OF product_movements
    FOR VALUES FROM ('2026-9-1') TO ('2026-10-1');
CREATE TABLE product_movements_y2026m10 PARTITION OF product_movements
    FOR VALUES FROM ('2026-10-1') TO ('2026-11-1');
CREATE TABLE product_movements_y2026m11 PARTITION OF product_movements
    FOR VALUES FROM ('2026-11-1') TO ('2026-12-1');
CREATE TABLE product_movements_y2026m12 PARTITION OF product_movements
    FOR VALUES FROM ('2026-12-1') TO ('2027-01-01');

-- =====================================================
-- 7. TABLA LOGS DE AUDITORÍA (Particionada)
-- =====================================================
CREATE TABLE audit_logs (
    id SERIAL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT audit_logs_action_check CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    CONSTRAINT audit_logs_table_check CHECK (table_name IN (
        'users', 'categories', 'locations', 'suppliers', 
        'products', 'product_movements'
    ))
) PARTITION BY RANGE (created_at);

-- Crear particiones por mes para2024
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_y2024m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE audit_logs_y2024m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- Crear particiones por mes para2025
CREATE TABLE audit_logs_y2025m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_logs_y2025m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE audit_logs_y2025m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE audit_logs_y2025m04 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE audit_logs_y2025m05 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE audit_logs_y2025m06 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE audit_logs_y2025m07 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE audit_logs_y2025m08 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE audit_logs_y2025m09 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE audit_logs_y2025m10 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE audit_logs_y2025m11 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Crear particiones por mes para2026
CREATE TABLE audit_logs_y2026m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_logs_y2026m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE audit_logs_y2026m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE audit_logs_y2026m04 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE audit_logs_y2026m05 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE audit_logs_y2026m06 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE audit_logs_y2026m07 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit_logs_y2026m08 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE audit_logs_y2026m09 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE audit_logs_y2026m10 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE audit_logs_y2026m11 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE audit_logs_y2026m12 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- =====================================================
-- ÍNDICES OPTIMIZADOS
-- =====================================================

-- Índices para búsqueda por texto usando trigrams
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_description_trgm ON products USING gin (description gin_trgm_ops);
CREATE INDEX idx_categories_name_trgm ON categories USING gin (name gin_trgm_ops);
CREATE INDEX idx_suppliers_name_trgm ON suppliers USING gin (name gin_trgm_ops);

-- Índices parciales para registros activos
CREATE INDEX idx_products_active ON products (id) WHERE is_active = true;
CREATE INDEX idx_categories_active ON categories (id) WHERE is_active = true;
CREATE INDEX idx_suppliers_active ON suppliers (id) WHERE is_active = true;
CREATE INDEX idx_locations_active ON locations (id) WHERE is_active = true;

-- Índices compuestos para búsquedas comunes
CREATE INDEX idx_products_category_active ON products (category_id, is_active);
CREATE INDEX idx_products_supplier_active ON products (supplier_id, is_active);
CREATE INDEX idx_products_location_active ON products (location_id, is_active);
CREATE INDEX idx_products_critical ON products (quantity, critical_stock) WHERE quantity <= critical_stock;

-- Índices para foreign keys y búsquedas frecuentes
CREATE INDEX idx_categories_parent ON categories (parent_id) INCLUDE (name, is_active);
CREATE INDEX idx_products_sku ON products (sku) INCLUDE (name, quantity, price);
CREATE INDEX idx_users_email ON users (email) INCLUDE (password, role, is_active);
CREATE INDEX idx_users_role ON users (role) WHERE is_active = true;

-- Índices para auditoría y movimientos
CREATE INDEX idx_audit_logs_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_logs_user_date ON audit_logs (user_id, created_at);
CREATE INDEX idx_product_movements_product ON product_movements (product_id, created_at);
CREATE INDEX idx_product_movements_user ON product_movements (user_id, created_at);

-- =====================================================
-- VISTAS MATERIALIZADAS
-- =====================================================

-- Vista materializada para productos en stock crítico
CREATE MATERIALIZED VIEW mv_critical_stock_products AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.quantity,
    p.critical_stock,
    c.name as category_name,
    s.name as supplier_name,
    l.name as location_name,
    p.last_restock_date,
    p.last_movement_date
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN locations l ON p.location_id = l.id
WHERE 
    p.is_active = true 
    AND p.quantity <= p.critical_stock
WITH DATA;

-- Vista materializada para árbol de categorías
CREATE MATERIALIZED VIEW mv_category_tree AS
WITH RECURSIVE category_tree AS (
    SELECT 
        id, name, parent_id, 1 as level,
        ARRAY[name]::VARCHAR[] as path_names,
        ARRAY[id]::INTEGER[] as path_ids
    FROM categories
    WHERE parent_id IS NULL AND is_active = true
    
    UNION ALL
    
    SELECT 
        c.id, c.name, c.parent_id, ct.level + 1,
        ct.path_names || c.name,
        ct.path_ids || c.id
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.is_active = true
)
SELECT 
    id,
    name,
    parent_id,
    level,
    path_names,
    path_ids,
    array_length(path_ids, 1) as depth
FROM category_tree
ORDER BY path_names
WITH DATA;

-- Vista materializada para estadísticas de productos
CREATE MATERIALIZED VIEW mv_product_stats AS
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.critical_stock,
    c.name as category_name,
    COALESCE(
        (SELECT SUM(CASE 
            WHEN pm.movement_type = 'IN' THEN pm.quantity 
            WHEN pm.movement_type = 'OUT' THEN -pm.quantity 
            ELSE 0 
        END)
        FROM product_movements pm 
        WHERE pm.product_id = p.id 
        AND pm.created_at >= NOW() - INTERVAL '30 days'),
        0
    ) as movement_last_30_days,
    (SELECT COUNT(*) 
     FROM product_movements pm 
     WHERE pm.product_id = p.id 
     AND pm.movement_type = 'OUT'
     AND pm.created_at >= NOW() - INTERVAL '30 days'
    ) as times_accessed_last_30_days,
    p.last_restock_date,
    p.last_movement_date
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
WITH DATA;

-- =====================================================
-- FUNCIONES Y TRIGGERS DE AUDITORÍA (corregidos)
-- =====================================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_table_name VARCHAR(50);
    audit_record_id INTEGER;
    audit_action VARCHAR(20);
    audit_old_values JSONB;
    audit_new_values JSONB;
    audit_user_id INTEGER;
    audit_ip_address INET;
    audit_user_agent TEXT;
    audit_created_at TIMESTAMP;
BEGIN
    audit_table_name := TG_TABLE_NAME;
    audit_record_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
    audit_action := CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' WHEN TG_OP = 'UPDATE' THEN 'UPDATE' WHEN TG_OP = 'DELETE' THEN 'DELETE' END;
    audit_old_values := CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END;
    audit_new_values := CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END;
    audit_user_id := current_setting('app.user_id', true)::integer;
    audit_ip_address := inet_client_addr();
    audit_user_agent := current_setting('app.user_agent', true);
    audit_created_at := NOW();

    INSERT INTO audit_logs (
        table_name, record_id, action, old_values, new_values, user_id, ip_address, user_agent, created_at
    ) VALUES (
        audit_table_name, audit_record_id, audit_action, audit_old_values, audit_new_values, audit_user_id, audit_ip_address, audit_user_agent, audit_created_at
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para auditoría (corregidos)
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_categories_trigger
    AFTER INSERT OR UPDATE OR DELETE ON categories
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_locations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON locations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_suppliers_trigger
    AFTER INSERT OR UPDATE OR DELETE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- FUNCIONES DE MANTENIMIENTO
-- =====================================================

-- Función para refrescar vistas materializadas
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_critical_stock_products;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_tree;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_stats;
END;
$$ LANGUAGE plpgsql;

-- Función para crear nueva partición
CREATE OR REPLACE FUNCTION create_next_partition(
    table_name text,
    start_date timestamp
)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date timestamp;
BEGIN
    end_date := start_date + INTERVAL '1 month';
    partition_name := table_name || '_y' || 
                     to_char(start_date, 'YYYY') || 
                     'm' || to_char(start_date, 'MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
         FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto
INSERT INTO users (email, password, name, role) VALUES 
('admin@industrial.com', '$2b$10$pvCGnRuIh27jTfCBC2hqO.n00BaUzoMq/gW6iHhAUuBBbpRRGINqW', 'Administrador', 'ADMIN');

-- Categorías por defecto
INSERT INTO categories (name, description) VALUES 
('Sensores', 'Instrumentos de medición y sensores industriales'),
('Transmisores', 'Transmisores de señal y control de procesos'),
('Válvulas', 'Válvulas de control y regulación de fluidos'),
('Herramientas', 'Herramientas especializadas para minería'),
('Equipos de Seguridad', 'Equipos de protección personal y seguridad'),
('Componentes', 'Componentes electrónicos y mecánicos');

-- Ubicaciones por defecto
INSERT INTO locations (name, description, zone, shelf, capacity) VALUES 
('Bodega Central', 'Bodega principal del almacén', 'Zona Norte', 'Estante A', 1000),
('Bodega Sur', 'Bodega de materiales críticos', 'Zona Mina', 'Estante B', 500),
('Bodega Oeste', 'Bodega de herramientas', 'Zona Central', 'Estante C', 300),
('Almacén Temporal', 'Almacén para materiales temporales', 'Zona Este', 'Estante D', 200);

-- Proveedores por defecto
INSERT INTO suppliers (name, description, contact_person, email, phone, rating) VALUES 
('Industrial Supplies Co.', 'Proveedor de insumos industriales', 'Juan Pérez', 'juan@industrial.com', '+56 9 1234 5678', 4.5),
('Mining Equipment Ltd.', 'Proveedor de equipos para minería', 'María González', 'maria@mining.com', '+56 9 8765 4321', 4.0),
('Safety Gear Pro', 'Proveedor de equipos de seguridad', 'Carlos Rodríguez', 'carlos@safety.com', '+56 9 5555 1234', 4.8),
('Tech Components Inc.', 'Proveedor de componentes tecnológicos', 'Ana Silva', 'ana@tech.com', '+56 9 1111 2222', 4.2);

-- Productos de ejemplo
INSERT INTO products (
    name, description, sku, price, quantity, critical_stock, 
    category_id, location_id, supplier_id, last_restock_date
) VALUES 
('Sensor de Presión Industrial', 'Sensor de presión diferencial para monitoreo de fluidos', 'SENS-PRES-001', 1250.00, 15, 5, 1, 1, 1, NOW()),
('Transmisor de Temperatura RTD', 'Transmisor de temperatura con sensor RTD Pt100', 'TRANS-TEMP-002', 890.00, 25, 3, 2, 2, 2, NOW()),
('Válvula de Control Neumática', 'Válvula de control neumática para regulación de flujo', 'VALV-CONT-003', 2100.00, 8, 2, 3, 1, 1, NOW()),
('Casco de Seguridad Industrial', 'Casco de seguridad certificado para minería', 'SEG-CASCO-004', 45.00, 100, 10, 5, 3, 3, NOW()),
('Multímetro Digital Profesional', 'Multímetro digital de alta precisión', 'HERR-MULTI-005', 180.00, 30, 5, 4, 2, 4, NOW());

-- Refrescar vistas materializadas
SELECT refresh_materialized_views();
