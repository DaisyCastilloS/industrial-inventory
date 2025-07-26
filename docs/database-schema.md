# 🗄️ Esquema de Base de Datos - Sistema de Inventario Industrial

## 📊 Diagrama UML del Esquema

```mermaid
erDiagram
    users {
        serial id PK
        varchar email UK
        varchar password
        varchar name
        varchar role
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp last_login
        smallint failed_attempts
    }

    categories {
        serial id PK
        varchar name UK
        text description
        integer parent_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
        integer level
    }

    locations {
        serial id PK
        varchar name UK
        text description
        varchar code
        varchar type
        varchar zone
        varchar shelf
        integer capacity
        integer current_usage
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    suppliers {
        serial id PK
        varchar name UK
        text description
        varchar contact_person
        varchar email
        varchar phone
        text address
        decimal rating
        timestamp last_delivery_date
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    products {
        serial id PK
        varchar name
        text description
        varchar sku UK
        numeric price
        integer quantity
        integer critical_stock
        integer category_id FK
        integer location_id FK
        integer supplier_id FK
        timestamp last_restock_date
        timestamp last_movement_date
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    product_movements {
        serial id PK
        integer product_id FK
        varchar movement_type
        integer quantity
        integer previous_quantity
        integer new_quantity
        varchar reason
        integer user_id FK
        boolean is_active
        timestamp created_at
    }

    audit_logs {
        serial id PK
        varchar table_name
        integer record_id
        varchar action
        jsonb old_values
        jsonb new_values
        integer user_id FK
        inet ip_address
        text user_agent
        timestamp created_at
    }

    %% Relaciones
    users ||--o{ product_movements : "user_id"
    users ||--o{ audit_logs : "user_id"
    
    categories ||--o{ categories : "parent_id (self-reference)"
    categories ||--o{ products : "category_id"
    
    locations ||--o{ products : "location_id"
    suppliers ||--o{ products : "supplier_id"
    
    products ||--o{ product_movements : "product_id"
```

## 🏗️ Estructura de las Entidades

### 👥 **Users** (Usuarios)
- **Propósito:** Gestión de usuarios y autenticación
- **Roles:** ADMIN, USER, VIEWER, MANAGER, SUPERVISOR, AUDITOR
- **Características:** Control de intentos fallidos, último login

### 📂 **Categories** (Categorías)
- **Propósito:** Clasificación jerárquica de productos
- **Características:** Auto-referencia para estructura de árbol
- **Niveles:** Soporte para categorías padre-hijo

### 📍 **Locations** (Ubicaciones)
- **Propósito:** Gestión de almacenes y ubicaciones físicas
- **Características:** Control de capacidad y uso actual
- **Tipos:** WAREHOUSE, STORAGE, etc.

### 🏢 **Suppliers** (Proveedores)
- **Propósito:** Gestión de proveedores y contactos
- **Características:** Sistema de rating, información de contacto
- **Validación:** Formato de email

### 📦 **Products** (Productos)
- **Propósito:** Gestión del inventario principal
- **Características:** SKU único, stock crítico, precios
- **Relaciones:** Categoría, ubicación, proveedor

### 🔄 **Product Movements** (Movimientos)
- **Propósito:** Auditoría de movimientos de stock
- **Tipos:** IN, OUT, ADJUSTMENT
- **Particionamiento:** Por fecha (mensual)

### 📋 **Audit Logs** (Logs de Auditoría)
- **Propósito:** Trazabilidad completa de cambios
- **Características:** JSONB para valores antiguos/nuevos
- **Particionamiento:** Por fecha (mensual)

## 🔧 Optimizaciones Implementadas

### 📈 **Índices**
- **Búsqueda por texto:** Trigram indexes para nombres
- **Índices parciales:** Solo registros activos
- **Índices compuestos:** Para consultas frecuentes
- **Índices INCLUDE:** Para consultas eficientes

### 🗂️ **Particionamiento**
- **product_movements:** Particiones mensuales (2024-2026)
- **audit_logs:** Particiones mensuales (2024-2026)
- **Beneficios:** Mejor rendimiento en consultas históricas

### 📊 **Vistas Materializadas**
- **mv_critical_stock_products:** Productos en stock crítico
- **mv_category_tree:** Estructura jerárquica de categorías
- **mv_product_stats:** Estadísticas de productos

### 🔄 **Triggers y Funciones**
- **Auditoría automática:** Todos los cambios se registran
- **Actualización de timestamps:** updated_at automático
- **Funciones de mantenimiento:** Refresco de vistas

## 🛡️ Restricciones y Validaciones

### ✅ **Constraints de Integridad**
- **Claves únicas:** email, sku, nombres
- **Validaciones de dominio:** roles, tipos de movimiento
- **Checks de negocio:** precios positivos, cantidades válidas

### 🔒 **Seguridad**
- **Encriptación:** Contraseñas con bcrypt
- **Control de acceso:** Roles granulares
- **Auditoría:** Trazabilidad completa

## 📋 **Datos de Ejemplo**

El sistema incluye datos iniciales para:
- Usuario administrador por defecto
- Categorías básicas (Sensores, Transmisores, Válvulas, etc.)
- Ubicaciones de almacén
- Proveedores de ejemplo
- Productos industriales de muestra

---

**🎯 Este esquema está optimizado para:**
- **Escalabilidad:** Particionamiento y índices
- **Rendimiento:** Vistas materializadas y consultas optimizadas
- **Auditoría:** Trazabilidad completa de cambios
- **Flexibilidad:** Estructura jerárquica de categorías
- **Seguridad:** Control de acceso granular 