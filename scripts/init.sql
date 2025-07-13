-- =====================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS
-- Sistema de Inventario Industrial
-- =====================================================

-- Eliminar tablas si existen (para reinicios de desarrollo)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS product_movements;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;

-- =====================================================
-- 1. TABLA USUARIOS
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'VIEWER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA CATEGORÍAS
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA UBICACIONES
-- =====================================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    zone VARCHAR(50),
    shelf VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA PROVEEDORES
-- =====================================================
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. TABLA PRODUCTOS
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    critical_stock INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    location_id INTEGER REFERENCES locations(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA MOVIMIENTOS DE PRODUCTOS
-- =====================================================
CREATE TABLE product_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason VARCHAR(200),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA LOGS DE AUDITORÍA
-- =====================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para productos
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_location_id ON products (location_id);
CREATE INDEX idx_products_supplier_id ON products (supplier_id);
CREATE INDEX idx_products_is_active ON products (is_active);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_name ON products (name);

-- Índices para movimientos
CREATE INDEX idx_product_movements_product_id ON product_movements (product_id);
CREATE INDEX idx_product_movements_user_id ON product_movements (user_id);
CREATE INDEX idx_product_movements_created_at ON product_movements (created_at);

-- Índices para auditoría
CREATE INDEX idx_audit_logs_table_name ON audit_logs (table_name);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

-- Índices para usuarios
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- Índices para categorías
CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_is_active ON categories (is_active);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto
INSERT INTO users (email, password, name, role) VALUES 
('admin@industrial.com', '$2b$10$rQZ9vK9mQZ9vK9mQZ9vK9O', 'Administrador', 'ADMIN');

-- Categorías por defecto
INSERT INTO categories (name, description) VALUES 
('Sensores', 'Instrumentos de medición y sensores industriales'),
('Transmisores', 'Transmisores de señal y control de procesos'),
('Válvulas', 'Válvulas de control y regulación de fluidos'),
('Herramientas', 'Herramientas especializadas para minería'),
('Equipos de Seguridad', 'Equipos de protección personal y seguridad'),
('Componentes', 'Componentes electrónicos y mecánicos');

-- Ubicaciones por defecto
INSERT INTO locations (name, description, zone, shelf) VALUES 
('Bodega Central', 'Bodega principal del almacén', 'Zona Norte', 'Estante A'),
('Bodega Sur', 'Bodega de materiales críticos', 'Zona Mina', 'Estante B'),
('Bodega Oeste', 'Bodega de herramientas', 'Zona Central', 'Estante C'),
('Almacén Temporal', 'Almacén para materiales temporales', 'Zona Este', 'Estante D');

-- Proveedores por defecto
INSERT INTO suppliers (name, contact_person, email, phone) VALUES 
('Industrial Supplies Co.', 'Juan Pérez', 'juan@industrial.com', '+56 9 1234 5678'),
('Mining Equipment Ltd.', 'María González', 'maria@mining.com', '+56 9 8765 4321'),
('Safety Gear Pro', 'Carlos Rodríguez', 'carlos@safety.com', '+56 9 5555 1234'),
('Tech Components Inc.', 'Ana Silva', 'ana@tech.com', '+56 9 1111 2222');

-- Productos de ejemplo
INSERT INTO products (name, description, sku, price, quantity, critical_stock, category_id, location_id, supplier_id) VALUES 
('Sensor de Presión Industrial', 'Sensor de presión diferencial para monitoreo de fluidos en minería subterránea', 'SENS-PRES-001', 1250.00, 15, 5, 1, 1, 1),
('Transmisor de Temperatura RTD', 'Transmisor de temperatura con sensor RTD Pt100 para control de procesos mineros', 'TRANS-TEMP-002', 890.00, 25, 3, 2, 2, 2),
('Válvula de Control Neumática', 'Válvula de control neumática para regulación de flujo en sistemas de procesamiento', 'VALV-CONT-003', 2100.00, 8, 2, 3, 1, 1),
('Casco de Seguridad Industrial', 'Casco de seguridad certificado para uso en minería', 'SEG-CASCO-004', 45.00, 100, 10, 5, 3, 3),
('Multímetro Digital Profesional', 'Multímetro digital de alta precisión para mediciones eléctricas', 'HERR-MULTI-005', 180.00, 30, 5, 4, 2, 4);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA
-- =====================================================

-- Función para auditoría
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'CREATE', to_jsonb(NEW), current_setting('app.user_id', true)::integer);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.user_id', true)::integer);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_setting('app.user_id', true)::integer);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para auditoría
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
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar stock crítico
CREATE OR REPLACE FUNCTION check_critical_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity <= NEW.critical_stock THEN
        RAISE NOTICE 'Producto % está en stock crítico (Cantidad: %, Crítico: %)', 
            NEW.name, NEW.quantity, NEW.critical_stock;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar stock crítico
CREATE TRIGGER check_critical_stock_trigger
    AFTER INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION check_critical_stock();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de productos con información completa
CREATE VIEW products_full_info AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.sku,
    p.price,
    p.quantity,
    p.critical_stock,
    p.is_active,
    c.name as category_name,
    l.name as location_name,
    s.name as supplier_name,
    CASE 
        WHEN p.quantity <= p.critical_stock THEN 'CRÍTICO'
        WHEN p.quantity = 0 THEN 'SIN STOCK'
        ELSE 'NORMAL'
    END as stock_status,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN suppliers s ON p.supplier_id = s.id;

-- Vista de productos en stock crítico
CREATE VIEW critical_stock_products AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.quantity,
    p.critical_stock,
    c.name as category_name,
    l.name as location_name,
    s.name as supplier_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.quantity <= p.critical_stock AND p.is_active = true;

-- Vista de movimientos recientes
CREATE VIEW recent_movements AS
SELECT 
    pm.id,
    p.name as product_name,
    p.sku,
    pm.movement_type,
    pm.quantity,
    pm.previous_quantity,
    pm.new_quantity,
    pm.reason,
    u.name as user_name,
    pm.created_at
FROM product_movements pm
JOIN products p ON pm.product_id = p.id
JOIN users u ON pm.user_id = u.id
ORDER BY pm.created_at DESC;

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================

COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE categories IS 'Categorías de productos con jerarquía';
COMMENT ON TABLE locations IS 'Ubicaciones en el almacén';
COMMENT ON TABLE suppliers IS 'Proveedores de productos';
COMMENT ON TABLE products IS 'Productos/Instrumentos industriales';
COMMENT ON TABLE product_movements IS 'Movimientos de inventario';
COMMENT ON TABLE audit_logs IS 'Logs de auditoría del sistema';

COMMENT ON COLUMN products.sku IS 'Código SKU único del producto';
COMMENT ON COLUMN products.critical_stock IS 'Stock mínimo crítico para alertas';
COMMENT ON COLUMN product_movements.movement_type IS 'Tipo: IN (entrada), OUT (salida), ADJUSTMENT (ajuste)';
COMMENT ON COLUMN audit_logs.old_values IS 'Valores anteriores en formato JSON';
COMMENT ON COLUMN audit_logs.new_values IS 'Valores nuevos en formato JSON';
