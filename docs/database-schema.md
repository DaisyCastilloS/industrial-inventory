# 🗄️ Esquema de Base de Datos - Sistema de Inventario Industrial

## 📋 Resumen del Sistema

El sistema de inventario industrial maneja instrumentos mineros, usuarios, categorías, ubicaciones y auditoría completa.

---

## 🏗️ Estructura de Tablas

### 1. **users** - Gestión de Usuarios
```sql
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
```

**Campos:**
- `id` - Identificador único del usuario
- `email` - Email único del usuario
- `password` - Contraseña encriptada con bcrypt
- `name` - Nombre completo del usuario
- `role` - Rol del usuario (ADMIN, USER, VIEWER)
- `is_active` - Estado activo/inactivo del usuario
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última actualización

---

### 2. **categories** - Categorías de Productos
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Campos:**
- `id` - Identificador único de la categoría
- `name` - Nombre de la categoría (único)
- `description` - Descripción de la categoría
- `parent_id` - Categoría padre (para jerarquías)
- `is_active` - Estado activo/inactivo
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última actualización

---

### 3. **locations** - Ubicaciones de Almacén
```sql
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
```

**Campos:**
- `id` - Identificador único de la ubicación
- `name` - Nombre de la ubicación
- `description` - Descripción detallada
- `zone` - Zona del almacén
- `shelf` - Estante específico
- `is_active` - Estado activo/inactivo
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última actualización

---

### 4. **suppliers** - Proveedores
```sql
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
```

**Campos:**
- `id` - Identificador único del proveedor
- `name` - Nombre de la empresa proveedora
- `contact_person` - Persona de contacto
- `email` - Email de contacto
- `phone` - Teléfono de contacto
- `address` - Dirección del proveedor
- `is_active` - Estado activo/inactivo
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última actualización

---

### 5. **products** - Productos/Instrumentos Industriales
```sql
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
```

**Campos:**
- `id` - Identificador único del producto
- `name` - Nombre del instrumento industrial
- `description` - Descripción detallada
- `sku` - Código SKU único del producto
- `price` - Precio unitario
- `quantity` - Cantidad en stock
- `critical_stock` - Stock mínimo crítico
- `category_id` - Categoría del producto (FK)
- `location_id` - Ubicación en almacén (FK)
- `supplier_id` - Proveedor del producto (FK)
- `is_active` - Estado activo/inactivo
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última actualización

---

### 6. **product_movements** - Movimientos de Inventario
```sql
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
```

**Campos:**
- `id` - Identificador único del movimiento
- `product_id` - Producto afectado (FK)
- `movement_type` - Tipo de movimiento (IN, OUT, ADJUSTMENT)
- `quantity` - Cantidad movida
- `previous_quantity` - Cantidad anterior
- `new_quantity` - Nueva cantidad
- `reason` - Motivo del movimiento
- `user_id` - Usuario que realizó el movimiento (FK)
- `created_at` - Fecha del movimiento

---

### 7. **audit_logs** - Logs de Auditoría
```sql
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
```

**Campos:**
- `id` - Identificador único del log
- `table_name` - Tabla afectada
- `record_id` - ID del registro afectado
- `action` - Acción realizada (CREATE, UPDATE, DELETE)
- `old_values` - Valores anteriores (JSON)
- `new_values` - Valores nuevos (JSON)
- `user_id` - Usuario que realizó la acción (FK)
- `ip_address` - Dirección IP del usuario
- `user_agent` - User agent del navegador
- `created_at` - Fecha del log

---

## 🔗 Relaciones entre Tablas

### Relaciones Principales:
1. **products → categories** (N:1)
   - Un producto pertenece a una categoría
   - Una categoría puede tener muchos productos

2. **products → locations** (N:1)
   - Un producto está en una ubicación
   - Una ubicación puede tener muchos productos

3. **products → suppliers** (N:1)
   - Un producto tiene un proveedor
   - Un proveedor puede tener muchos productos

4. **product_movements → products** (N:1)
   - Un movimiento afecta a un producto
   - Un producto puede tener muchos movimientos

5. **product_movements → users** (N:1)
   - Un movimiento es realizado por un usuario
   - Un usuario puede realizar muchos movimientos

6. **audit_logs → users** (N:1)
   - Un log es generado por un usuario
   - Un usuario puede generar muchos logs

7. **categories → categories** (1:N)
   - Una categoría puede tener subcategorías
   - Relación jerárquica (parent_id)

---

## 📊 Índices Recomendados

```sql
-- Índices para performance
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_location_id ON products (location_id);
CREATE INDEX idx_products_supplier_id ON products (supplier_id);
CREATE INDEX idx_products_is_active ON products (is_active);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_name ON products (name);

CREATE INDEX idx_product_movements_product_id ON product_movements (product_id);
CREATE INDEX idx_product_movements_user_id ON product_movements (user_id);
CREATE INDEX idx_product_movements_created_at ON product_movements (created_at);

CREATE INDEX idx_audit_logs_table_name ON audit_logs (table_name);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_is_active ON categories (is_active);
```

---

## 🔒 Restricciones y Validaciones

### Restricciones de Integridad:
- **FK constraints** en todas las relaciones
- **CHECK constraints** para roles y tipos de movimiento
- **UNIQUE constraints** para emails, SKUs y nombres únicos
- **NOT NULL** en campos obligatorios

### Validaciones de Negocio:
- **Stock crítico** - Alertas cuando quantity <= critical_stock
- **Movimientos negativos** - Prevenir stock negativo
- **Roles de usuario** - Permisos basados en roles
- **Auditoría completa** - Tracking de todos los cambios

---

## 📈 Consideraciones de Escalabilidad

### Particionamiento:
- **audit_logs** por fecha (mensual)
- **product_movements** por fecha (mensual)

### Optimizaciones:
- **Índices compuestos** para consultas frecuentes
- **Materialized views** para reportes complejos
- **Caching** para datos de referencia

### Backup y Recuperación:
- **Backup diario** de todas las tablas
- **Point-in-time recovery** para auditoría
- **Replicación** para alta disponibilidad

---

## 🚀 Migración desde el Esquema Actual

### Pasos para Migración:
1. **Crear nuevas tablas** (categories, locations, suppliers, etc.)
2. **Migrar datos existentes** de products
3. **Agregar constraints** gradualmente
4. **Implementar triggers** para auditoría
5. **Actualizar código** para usar nuevas relaciones

### Scripts de Migración:
```sql
-- Migración de productos existentes
UPDATE products 
SET category_id = 1, location_id = 1, supplier_id = 1 
WHERE category_id IS NULL;

-- Crear categorías por defecto
INSERT INTO categories (name, description) VALUES 
('Sensores', 'Instrumentos de medición y sensores'),
('Transmisores', 'Transmisores de señal y control'),
('Válvulas', 'Válvulas de control y regulación'),
('Herramientas', 'Herramientas especializadas');

-- Crear ubicaciones por defecto
INSERT INTO locations (name, zone, shelf) VALUES 
('Bodega Central', 'Zona Norte', 'Estante A'),
('Bodega Sur', 'Zona Mina', 'Estante B'),
('Bodega Oeste', 'Zona Central', 'Estante C');
```

---

## 📊 Vistas del Sistema

### 1. Vista `products_full_info`
```sql
CREATE VIEW products_full_info AS
SELECT 
    p.*,
    c.name as category_name,
    l.name as location_name,
    s.name as supplier_name,
    CASE 
        WHEN p.quantity <= p.critical_stock THEN 'CRITICAL'
        WHEN p.quantity <= (p.critical_stock * 1.5) THEN 'WARNING'
        ELSE 'NORMAL'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN suppliers s ON p.supplier_id = s.id;
```

**Uso**: Vista principal para consultar productos con toda su información relacionada y estado de stock.

### 2. Vista `critical_stock_products`
```sql
CREATE VIEW critical_stock_products AS
SELECT 
    p.*,
    c.name as category_name,
    l.name as location_name,
    s.name as supplier_name,
    (p.critical_stock - p.quantity) as units_needed
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.quantity <= p.critical_stock;
```

**Uso**: Monitoreo de productos en estado crítico de stock.

### 3. Vista `recent_movements`
```sql
CREATE VIEW recent_movements AS
SELECT 
    pm.*,
    p.name as product_name,
    p.sku,
    u.name as user_name,
    u.email as user_email
FROM product_movements pm
JOIN products p ON pm.product_id = p.id
JOIN users u ON pm.user_id = u.id
ORDER BY pm.created_at DESC;
```

**Uso**: Seguimiento de movimientos recientes de inventario.

---

**Este esquema proporciona una base sólida para un sistema de inventario industrial escalable y robusto.** 