# 🏭 Industrial Inventory System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Sistema de inventario industrial robusto, auditable y escalable, construido con Clean Architecture, TypeScript y PostgreSQL.

---

## 📋 Tabla de Contenidos

- [🏦 Descripción General](#-descripción-general)
- [🏗️ Arquitectura y Estructura del Proyecto](#-arquitectura-y-estructura-del-proyecto)
- [🛠️ Tecnologías](#-tecnologías)
- [🚀 Instalación y Despliegue Rápido con Docker Compose](#-instalación-y-despliegue-rápido-con-docker-compose)
- [📖 Uso y Comandos Principales](#-uso-y-comandos-principales)
- [🗄️ Esquema y Datos de Ejemplo](#-esquema-y-datos-de-ejemplo)
- [🔐 Autenticación y Roles](#-autenticación-y-roles)
- [🔌 API Endpoints](#-api-endpoints)
- [🔎 Vistas y Triggers Clave](#-vistas-y-triggers-clave)
- [📊 Logging y Auditoría](#-logging-y-auditoría)
- [🧪 Testing](#-testing)
- [📝 Commits y Estilo de Código](#-commits-y-estilo-de-código)
- [🔒 Seguridad](#-seguridad)
- [🐳 Docker Compose](#-docker-compose)
- [📝 Troubleshooting](#-troubleshooting)
- [🤝 Contribución](#-contribución)
- [🛣️ Roadmap](#-roadmap)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [📄 Licencia](#-licencia)
- [👥 Autores](#-autores)
- [🙏 Agradecimientos](#-agradecimientos)
- [📚 Documentación](#-documentación)

---

## 🏦 Descripción General

Este sistema permite gestionar el inventario de productos industriales, movimientos de stock, auditoría, usuarios, proveedores, ubicaciones y categorías. Incluye autenticación JWT, control de roles, alertas de stock crítico y documentación Swagger.

---

## 🏗️ Arquitectura y Estructura del Proyecto

```
src/
├── 00-constants/          # Constantes del sistema
├── 01-domain/            # Entidades y lógica de negocio
├── 02-application/       # Casos de uso y DTOs
├── 03-infrastructure/    # Implementaciones técnicas (DB, servicios)
└── 04-presentation/      # Controladores y servidor Express
```

---

## 🛠️ Tecnologías

- TypeScript (ES2020, strict mode)
- Node.js con Express.js
- PostgreSQL con pg driver
- Jest para testing (coverage 90%)
- Winston para logging estructurado
- Zod para validación de datos
- bcrypt para encriptación
- jsonwebtoken para autenticación
- Swagger/OpenAPI para documentación
- Husky + commitlint para Conventional Commits
- ESLint + Prettier para calidad de código
- Docker Compose para orquestación
- pnpm como gestor de paquetes

---

## 🚀 Instalación y Orden de Ejecución

### Primera vez que inicias el proyecto:
```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar archivo .env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=inventory_db
DB_PORT=5433  # Usamos 5433 para evitar conflictos con PostgreSQL local

# 3. Construir e iniciar contenedores
pnpm run docker:build
pnpm run docker:up

# 4. La base de datos se inicializa automáticamente con:
# - Tablas y estructura
# - Índices de optimización
# - Datos de ejemplo (usuarios, productos, categorías)
# - Triggers de auditoría
# - Vistas para reportes

# 5. Iniciar el servidor en modo desarrollo
pnpm run dev
```

### Verificar la instalación:
```bash
# Ver estado de los contenedores
pnpm run docker:ps

# Ver logs de la base de datos
pnpm run docker:logs

# Datos iniciales disponibles:
# - Usuario admin: admin@industrial.com
# - Categorías: Sensores, Transmisores, Válvulas, etc.
# - Ubicaciones: Bodega Central, Bodega Sur, etc.
# - Proveedores y productos de ejemplo
```

### Reiniciar la base de datos (si es necesario):
```bash
# Esto eliminará todos los datos y volverá a inicializar
pnpm run docker:db:reset
```

### Desarrollo diario:
```bash
# 1. Levantar los contenedores (si no están corriendo)
pnpm run docker:up

# 2. Iniciar el servidor en modo desarrollo
pnpm run dev
```

### Mantenimiento de la base de datos:
```bash
# Resetear completamente la base de datos (borra todo y reinicializa)
pnpm run docker:db:reset
```

### Antes de hacer commit:
```bash
# 1. Verificar tipos
pnpm run type-check

# 2. Ejecutar tests
pnpm run test

# 3. Verificar formato y linting
pnpm run format:check
pnpm run lint
```

### Despliegue en producción:
```bash
# 1. Instalar dependencias
pnpm install

# 2. Construir el proyecto
pnpm run build

# 3. Levantar contenedores
pnpm run docker:build
pnpm run docker:up

# 4. Iniciar en modo producción
pnpm run start
```

### Comandos útiles durante el desarrollo:
```bash
# Ver logs de los contenedores
pnpm run docker:logs

# Ver estado de los contenedores
pnpm run docker:ps

# Reiniciar contenedores
pnpm run docker:restart

# Detener todo
pnpm run docker:down
```

---

## 📖 Uso y Comandos Principales

- Consultar productos, crear, actualizar, eliminar, consultar reportes y logs.
- Ver ejemplos de uso en la sección de endpoints.

---

## 🗄️ Esquema y Datos de Ejemplo

### Productos de ejemplo

| SKU              | Nombre                          | Categoría     | Ubicación        | Proveedor                | Stock | Stock Crítico | Precio   |
|------------------|---------------------------------|---------------|------------------|--------------------------|-------|---------------|----------|
| SENS-PRES-001    | Sensor de Presión Industrial    | Sensores      | Bodega Central   | Industrial Supplies Co.  | 15    | 5             | 1250.00  |
| TRANS-TEMP-002   | Transmisor de Temperatura RTD   | Transmisores  | Bodega Sur       | Mining Equipment Ltd.    | 25    | 3             | 890.00   |
| VALV-CONT-003    | Válvula de Control Neumática    | Válvulas      | Bodega Central   | Industrial Supplies Co.  | 8     | 2             | 2100.00  |
| SEG-CASCO-004    | Casco de Seguridad Industrial   | Equipos de Seguridad | Bodega Oeste | Safety Gear Pro         | 100   | 10            | 45.00    |
| HERR-MULTI-005   | Multímetro Digital Profesional  | Herramientas  | Bodega Sur       | Tech Components Inc.     | 30    | 5             | 180.00   |

### Ubicaciones

- **Bodega Central** (Zona Norte, Estante A)
- **Bodega Sur** (Zona Mina, Estante B)
- **Bodega Oeste** (Zona Central, Estante C)
- **Almacén Temporal** (Zona Este, Estante D)

### Proveedores

- **Industrial Supplies Co.** (Juan Pérez)
- **Mining Equipment Ltd.** (María González)
- **Safety Gear Pro** (Carlos Rodríguez)
- **Tech Components Inc.** (Ana Silva)

---

## 🔐 Autenticación y Roles

- **Roles soportados:** `ADMIN`, `USER`, `VIEWER`
- **Registro:** `POST /auth/register`
- **Login:** `POST /auth/login` (devuelve JWT)

### Ejemplo de login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@industrial.com", "password": "123456"}'
```

---

## 🔌 API Endpoints

### Autenticación

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@industrial.com",
    "password": "123456"
  }'
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@industrial.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### Productos

#### Listar Productos
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/products?page=1&limit=10
```

**Respuesta exitosa:**
```json
{
  "data": [
    {
      "id": 1,
      "sku": "SENS-PRES-001",
      "name": "Sensor de Presión Industrial",
      "category": "Sensores",
      "location": "Bodega Central",
      "supplier": "Industrial Supplies Co.",
      "quantity": 15,
      "critical_stock": 5,
      "price": 1250.00,
      "stock_status": "NORMAL"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Crear Producto
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "COMP-RELE-006",
    "name": "Relé de Potencia Industrial",
    "description": "Relé electromecánico para control de motores",
    "price": 320.00,
    "quantity": 12,
    "critical_stock": 3,
    "category_id": 6,
    "location_id": 1,
    "supplier_id": 4
  }'
```

**Respuesta exitosa:**
```json
{
  "message": "Producto creado exitosamente",
  "data": {
    "id": 51,
    "sku": "COMP-RELE-006",
    "name": "Relé de Potencia Industrial",
    "price": 320.00,
    "quantity": 12,
    "critical_stock": 3,
    "stock_status": "NORMAL"
  }
}
```

### Movimientos de Inventario

#### Registrar Movimiento
```bash
curl -X POST http://localhost:3000/product-movements \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "type": "OUT",
    "quantity": 5,
    "reason": "Entrega a mantenimiento",
    "notes": "Solicitud #123"
  }'
```

**Respuesta exitosa:**
```json
{
  "message": "Movimiento registrado exitosamente",
  "data": {
    "id": 156,
    "product_id": 1,
    "type": "OUT",
    "quantity": 5,
    "previous_stock": 15,
    "new_stock": 10,
    "user_id": 1,
    "created_at": "2024-03-15T10:30:00Z"
  }
}
```

### Reportes

#### Stock Crítico
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/reports/critical-stock
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 3,
      "sku": "VALV-CONT-003",
      "name": "Válvula de Control Neumática",
      "quantity": 2,
      "critical_stock": 2,
      "units_needed": 0,
      "category": "Válvulas",
      "location": "Bodega Central"
    }
  ],
  "total": 1
}
```

---

## 🔎 Vistas y Triggers Clave

- **Auditoría automática:** Cada cambio en productos, categorías, ubicaciones y proveedores genera un registro en `audit_logs`.
- **Stock crítico:** Si el stock de un producto cae por debajo de su `critical_stock`, se genera una alerta y se refleja en la vista `critical_stock_products`.
- **Vistas útiles:**
  - `products_full_info`: Productos con toda la información relacionada.
  - `critical_stock_products`: Solo productos en stock crítico.
  - `recent_movements`: Últimos movimientos de inventario.

---

## 📊 Logging y Auditoría

- Logging estructurado con Winston
- Auditoría automática vía triggers en la base de datos

---

## 🧪 Testing

### Tests Unitarios y de Integración
```bash
# Ejecutar todos los tests
pnpm run test

# Ejecutar tests con coverage
pnpm run test:coverage

# Ejecutar tests en modo watch
pnpm run test:watch
```

### Test Exhaustivo de Endpoints
El proyecto incluye un test exhaustivo que valida todos los endpoints de la API con diferentes roles de usuario:

```bash
# Ejecutar test exhaustivo de endpoints
pnpm run test src/tests/exhaustive-endpoints.test.ts
```

**Características del test exhaustivo:**
- ✅ Prueba todos los roles: `ADMIN`, `MANAGER`, `SUPERVISOR`, `USER`, `AUDITOR`, `VIEWER`
- ✅ Valida endpoints de autenticación (register/login)
- ✅ Prueba operaciones CRUD para todos los recursos
- ✅ Verifica permisos y autorizaciones por rol
- ✅ Incluye health checks y endpoints de auditoría
- ✅ Genera reporte detallado de resultados
- ✅ Timeout de5nutos por rol para tests completos

**Ejemplo de salida:**
```
🚀 Iniciando test exhaustivo completo de TODOS los endpoints
================================================================================

🎭 Probando rol: ADMIN
==================================================
🔐 Registrando usuario ADMIN...

✅ [202403-15:3000DMIN - GET /health (20)
✅ [202403-15:3000] ADMIN - GET /api/products (20)
✅ [202403-15:3000 ADMIN - POST /api/categories (201...

📊 RESUMEN EXHAUSTIVO COMPLETO
================================================================================
👤 ADMIN:
   ✅ Exitosos: 25/25 (100)
👤 MANAGER:
   ✅ Exitosos:200(100.
```

**Endpoints probados:**
- Health Check (`/health`)
- Autenticación (`/auth/register`, `/auth/login`)
- Productos (`/api/products`)
- Categorías (`/api/categories`)
- Ubicaciones (`/api/locations`)
- Proveedores (`/api/suppliers`)
- Movimientos (`/api/product-movements`)
- Usuarios (`/api/users`) - solo ADMIN
- Auditoría (`/api/audit-logs`) - solo ADMIN/AUDITOR

---

## 📝 Commits y Estilo de Código

- Conventional Commits
- ESLint + Prettier
- Husky + commitlint

---

## 🔒 Seguridad

- JWT para autenticación
- Helmet, CORS y rate limiting en Express

---

## 🐳 Docker Compose

- Orquestación de base de datos y backend
- Volúmenes persistentes para datos

---

## 📝 Troubleshooting

- **¿No puedes conectarte a la base de datos?**
  - Verifica que el contenedor `inventory-db` esté corriendo:  `docker ps`
  - Revisa las variables de entorno en `.env` y en `docker-compose.yml`.
- **¿El backend no arranca?**
  - Asegúrate de que la base de datos esté lista antes de iniciar el backend.
  - Verifica logs con `pnpm run dev` y `docker logs inventory-db`.
- **¿No ves datos de ejemplo?**
  - El script `init.sql` se ejecuta automáticamente al crear el contenedor. Si necesitas reiniciar, elimina el volumen de Docker:
    ```bash
    docker compose down -v
    docker compose up -d
    ```

---

## 🚨 Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| `AUTH_ERROR_001` | Token no proporcionado | Incluir el header `Authorization: Bearer <token>` |
| `AUTH_ERROR_002` | Token inválido o expirado | Hacer login nuevamente para obtener un token válido |
| `AUTH_ERROR_003` | Permisos insuficientes | Verificar el rol del usuario |
| `VALIDATION_ERROR_001` | Datos de entrada inválidos | Revisar el formato y valores requeridos |
| `RESOURCE_ERROR_001` | Recurso no encontrado | Verificar el ID o parámetros de búsqueda |
| `STOCK_ERROR_001` | Stock insuficiente | Verificar la cantidad disponible antes de la operación |
| `DB_ERROR_001` | Error de base de datos | Contactar al administrador del sistema |

### Ejemplos de Errores

#### Error de Autenticación
```json
{
  "error": "Token no proporcionado",
  "code": "AUTH_ERROR_001",
  "timestamp": "2024-03-15T10:30:00Z"
}
```

#### Error de Validación
```json
{
  "error": "Datos de entrada inválidos",
  "code": "VALIDATION_ERROR_001",
  "details": [
    {
      "field": "quantity",
      "message": "La cantidad debe ser mayor a 0",
      "value": "-5"
    }
  ],
  "timestamp": "2024-03-15T10:30:00Z"
}
```

#### Error de Stock
```json
{
  "error": "Stock insuficiente",
  "code": "STOCK_ERROR_001",
  "details": {
    "product_id": 1,
    "requested": 10,
    "available": 5
  },
  "timestamp": "2024-03-15T10:30:00Z"
}
```

---

## 🤝 Contribución

¡Contribuciones bienvenidas! Abre un issue o pull request.

---

## 🛣️ Roadmap

- Mejoras en reportes y dashboards
- Integración con sistemas externos
- Notificaciones automáticas

---

## 🐛 Reportar Bugs

Abre un issue en GitHub con el mayor detalle posible.

---

## 📄 Licencia

MIT

---

## 👥 Autores

- [Daisy Castillo Sepulveda](https://github.com/DaisyCastilloS)

---

## 🙏 Agradecimientos

- Comunidad Open Source
- Usuarios y testers

---

## 📚 Documentación

- Documentación Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)
- Consulta las vistas SQL (`products_full_info`, `critical_stock_products`, `recent_movements`) para reportes avanzados.

---

¿Dudas? Abre un issue o contactame.

¿Quieres ejemplos más específicos de productos, ubicaciones o movimientos? ¡Dímelo!

¿Listo para usar en producción? Solo necesitas Docker Compose y tu archivo `.env` configurado.

---

**¡Bienvenido a la gestión industrial moderna!**
