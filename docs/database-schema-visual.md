# 🎨 Esquema Visual de Base de Datos - Sistema de Inventario Industrial

## 🗺️ Diagrama ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    %% =====================================================
    %% USUARIOS - AZUL
    %% =====================================================
    USERS {
        int id PK "🔑 ID único"
        string email UK "📧 Email único"
        string password "🔒 Contraseña encriptada"
        string name "👤 Nombre completo"
        enum role "🎭 Rol (ADMIN/USER/VIEWER)"
        boolean is_active "✅ Estado activo"
        timestamp created_at "📅 Fecha creación"
        timestamp updated_at "🔄 Última actualización"
    }

    %% =====================================================
    %% CATEGORÍAS - VERDE
    %% =====================================================
    CATEGORIES {
        int id PK "🔑 ID único"
        string name UK "🏷️ Nombre categoría"
        text description "📝 Descripción"
        int parent_id FK "👥 Categoría padre"
        boolean is_active "✅ Estado activo"
        timestamp created_at "📅 Fecha creación"
        timestamp updated_at "🔄 Última actualización"
    }

    %% =====================================================
    %% UBICACIONES - NARANJA
    %% =====================================================
    LOCATIONS {
        int id PK "🔑 ID único"
        string name "📍 Nombre ubicación"
        text description "📝 Descripción"
        string zone "🏢 Zona del almacén"
        string shelf "📦 Estante específico"
        boolean is_active "✅ Estado activo"
        timestamp created_at "📅 Fecha creación"
        timestamp updated_at "🔄 Última actualización"
    }

    %% =====================================================
    %% PROVEEDORES - MORADO
    %% =====================================================
    SUPPLIERS {
        int id PK "🔑 ID único"
        string name "🏢 Nombre empresa"
        string contact_person "👤 Persona contacto"
        string email "📧 Email contacto"
        string phone "📞 Teléfono"
        text address "🏠 Dirección"
        boolean is_active "✅ Estado activo"
        timestamp created_at "📅 Fecha creación"
        timestamp updated_at "🔄 Última actualización"
    }

    %% =====================================================
    %% PRODUCTOS - ROJO
    %% =====================================================
    PRODUCTS {
        int id PK "🔑 ID único"
        string name "🔧 Nombre instrumento"
        text description "📝 Descripción detallada"
        string sku UK "🏷️ Código SKU único"
        numeric price "💰 Precio unitario"
        int quantity "📦 Cantidad en stock"
        int critical_stock "⚠️ Stock mínimo crítico"
        int category_id FK "📂 Categoría"
        int location_id FK "📍 Ubicación"
        int supplier_id FK "🏢 Proveedor"
        boolean is_active "✅ Estado activo"
        timestamp created_at "📅 Fecha creación"
        timestamp updated_at "🔄 Última actualización"
    }

    %% =====================================================
    %% MOVIMIENTOS - AMARILLO
    %% =====================================================
    PRODUCT_MOVEMENTS {
        int id PK "🔑 ID único"
        int product_id FK "🔧 Producto afectado"
        enum movement_type "🔄 Tipo (IN/OUT/ADJUSTMENT)"
        int quantity "📊 Cantidad movida"
        int previous_quantity "📊 Cantidad anterior"
        int new_quantity "📊 Nueva cantidad"
        string reason "💭 Motivo del movimiento"
        int user_id FK "👤 Usuario que realizó"
        timestamp created_at "📅 Fecha movimiento"
    }

    %% =====================================================
    %% AUDITORÍA - GRIS
    %% =====================================================
    AUDIT_LOGS {
        int id PK "🔑 ID único"
        string table_name "📋 Tabla afectada"
        int record_id "🔍 ID del registro"
        enum action "⚡ Acción (CREATE/UPDATE/DELETE)"
        jsonb old_values "📄 Valores anteriores"
        jsonb new_values "📄 Valores nuevos"
        int user_id FK "👤 Usuario que realizó"
        inet ip_address "🌐 Dirección IP"
        text user_agent "🌍 User agent"
        timestamp created_at "📅 Fecha del log"
    }

    %% =====================================================
    %% RELACIONES
    %% =====================================================
    
    %% Relaciones principales
    PRODUCTS ||--o{ PRODUCT_MOVEMENTS : "registra movimientos"
    PRODUCTS }o--|| CATEGORIES : "pertenece a"
    PRODUCTS }o--|| LOCATIONS : "se ubica en"
    PRODUCTS }o--|| SUPPLIERS : "proporcionado por"
    PRODUCT_MOVEMENTS }o--|| USERS : "realizado por"
    AUDIT_LOGS }o--|| USERS : "generado por"
    
    %% Relación jerárquica de categorías
    CATEGORIES ||--o{ CATEGORIES : "subcategorías"
    
    %% Relación de auditoría con todas las tablas
    PRODUCTS ||--o{ AUDIT_LOGS : "auditado"
    CATEGORIES ||--o{ AUDIT_LOGS : "auditado"
    LOCATIONS ||--o{ AUDIT_LOGS : "auditado"
    SUPPLIERS ||--o{ AUDIT_LOGS : "auditado"
```

---

## 🎯 **Explicación Visual por Colores**

### 🔵 **AZUL - USUARIOS**
- **Función**: Gestión de acceso y autenticación
- **Características**: Roles, permisos, seguridad
- **Relaciones**: Con movimientos y auditoría

### 🟢 **VERDE - CATEGORÍAS**
- **Función**: Clasificación jerárquica de productos
- **Características**: Estructura organizacional
- **Relaciones**: Con productos y subcategorías

### 🟠 **NARANJA - UBICACIONES**
- **Función**: Gestión física del almacén
- **Características**: Zonas, estantes, organización espacial
- **Relaciones**: Con productos

### 🟣 **MORADO - PROVEEDORES**
- **Función**: Gestión de proveedores externos
- **Características**: Información de contacto, trazabilidad
- **Relaciones**: Con productos

### 🔴 **ROJO - PRODUCTOS**
- **Función**: Entidad central del sistema
- **Características**: Stock, precios, SKUs, estado crítico
- **Relaciones**: Con todas las entidades principales

### 🟡 **AMARILLO - MOVIMIENTOS**
- **Función**: Trazabilidad de inventario
- **Características**: Historial de cambios, auditoría
- **Relaciones**: Con productos y usuarios

### ⚫ **GRIS - AUDITORÍA**
- **Función**: Seguridad y cumplimiento
- **Características**: Logs automáticos, trazabilidad completa
- **Relaciones**: Con todas las entidades

---

## 📊 **Flujo de Datos Visual**

```mermaid
graph TD
    A[👤 Usuario] --> B[🔐 Autenticación]
    B --> C{🎭 Rol?}
    
    C -->|ADMIN| D[🔧 Gestión Completa]
    C -->|USER| E[📦 Gestión Inventario]
    C -->|VIEWER| F[👀 Solo Consulta]
    
    D --> G[📂 Categorías]
    D --> H[📍 Ubicaciones]
    D --> I[🏢 Proveedores]
    D --> J[🔧 Productos]
    D --> K[📊 Movimientos]
    D --> L[📋 Auditoría]
    
    E --> J
    E --> K
    
    F --> M[📈 Reportes]
    
    J --> N[⚠️ Stock Crítico?]
    N -->|SÍ| O[🚨 Alerta]
    N -->|NO| P[✅ Normal]
    
    K --> Q[📊 Actualizar Stock]
    Q --> R[📋 Registrar Movimiento]
    R --> S[📄 Log Auditoría]
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style E fill:#FF5722
    style F fill:#607D8B
    style J fill:#F44336
    style K fill:#FFC107
    style L fill:#795548
    style O fill:#FF0000
    style P fill:#4CAF50
```

---

## 🏗️ **Arquitectura de Capas**

```mermaid
graph TB
    subgraph "🎨 PRESENTACIÓN"
        A[🌐 API REST]
        B[📱 Swagger UI]
        C[🔐 Autenticación]
    end
    
    subgraph "⚙️ APLICACIÓN"
        D[📋 Use Cases]
        E[🔧 DTOs]
        F[📝 Validaciones]
    end
    
    subgraph "🏢 DOMINIO"
        G[📦 Entities]
        H[📂 Repositories]
        I[🔍 Business Rules]
    end
    
    subgraph "🗄️ INFRAESTRUCTURA"
        J[💾 PostgreSQL]
        K[📊 Database]
        L[🔧 Services]
    end
    
    A --> D
    B --> A
    C --> A
    D --> G
    E --> D
    F --> E
    G --> H
    H --> J
    I --> G
    J --> K
    L --> J
    
    style A fill:#E3F2FD
    style B fill:#E8F5E8
    style C fill:#FFF3E0
    style D fill:#F3E5F5
    style E fill:#E0F2F1
    style F fill:#FFF8E1
    style G fill:#FCE4EC
    style H fill:#F1F8E9
    style I fill:#E8EAF6
    style J fill:#FFEBEE
    style K fill:#E0F7FA
    style L fill:#F9FBE7
```

---

## 📈 **Estados de Stock Visual**

```mermaid
stateDiagram-v2
    [*] --> Normal
    Normal --> Crítico: quantity <= critical_stock
    Normal --> SinStock: quantity = 0
    Crítico --> Normal: quantity > critical_stock
    Crítico --> SinStock: quantity = 0
    SinStock --> Normal: quantity > 0
    
    state Normal {
        [*] --> Verde
        Verde --> Amarillo: quantity < 50%
        Amarillo --> Verde: quantity >= 50%
    }
    
    state Crítico {
        [*] --> Rojo
        Rojo --> Naranja: quantity > 0
        Naranja --> Rojo: quantity = 0
    }
    
    state SinStock {
        [*] --> Gris
        Gris --> Verde: quantity > 0
    }
```

---

## 🎯 **Casos de Uso Visuales**

### 📦 **Gestión de Inventario**
```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant A as 🔐 Auth
    participant P as 🔧 Producto
    participant M as 📊 Movimiento
    participant L as 📋 Auditoría
    
    U->>A: Login
    A->>U: Token JWT
    U->>P: Crear/Actualizar Producto
    P->>M: Registrar Movimiento
    M->>L: Log Auditoría
    L->>U: Confirmación
```

### 🚨 **Alerta de Stock Crítico**
```mermaid
sequenceDiagram
    participant S as ⚠️ Sistema
    participant P as 🔧 Producto
    participant T as 🔔 Trigger
    participant N as 📧 Notificación
    participant A as 👤 Admin
    
    S->>P: Verificar Stock
    P->>T: Stock <= Crítico
    T->>N: Generar Alerta
    N->>A: Enviar Notificación
    A->>P: Revisar Producto
```

---

## 🎨 **Leyenda de Símbolos**

| Símbolo | Significado | Color |
|---------|-------------|-------|
| 🔑 | Clave Primaria | Dorado |
| 🔒 | Seguridad/Encriptación | Azul |
| 📧 | Email/Comunicación | Verde |
| 👤 | Usuario/Persona | Azul claro |
| 🏷️ | Identificador único | Naranja |
| 📦 | Inventario/Stock | Rojo |
| ⚠️ | Alerta/Crítico | Rojo |
| 📊 | Datos/Métricas | Azul |
| 📋 | Auditoría/Logs | Gris |
| 🔄 | Movimiento/Cambio | Amarillo |
| 📅 | Fecha/Tiempo | Verde |
| ✅ | Activo/Válido | Verde |
| ❌ | Inactivo/Error | Rojo |

---

**Este esquema visual proporciona una comprensión clara y didáctica de la arquitectura del sistema de inventario industrial.** 🎨✨ 