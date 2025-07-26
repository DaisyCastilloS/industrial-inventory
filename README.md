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
- [🚀 Instalación y Despliegue Rápido](#-instalación-y-despliegue-rápido)
- [📖 Comandos Principales](#-comandos-principales)
- [🗄️ Esquema y Datos de Ejemplo](#-esquema-y-datos-de-ejemplo)
- [🔐 Autenticación y Roles](#-autenticación-y-roles)
- [🔌 API Endpoints](#-api-endpoints)
- [🧪 Testing](#-testing)
- [📝 Commits y Estilo de Código](#-commits-y-estilo-de-código)
- [🔒 Seguridad](#-seguridad)
- [🐳 Docker Compose](#-docker-compose)
- [📝 Troubleshooting](#-troubleshooting)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 🏦 Descripción General

Este sistema permite gestionar el inventario de productos industriales, movimientos de stock, auditoría, usuarios, proveedores, ubicaciones y categorías. Incluye autenticación JWT, control de roles, alertas de stock crítico y documentación Swagger.

---

## 🏗️ Arquitectura y Estructura del Proyecto

```
src/
├── core/
│   ├── application/     # Casos de uso y DTOs
│   └── domain/         # Entidades y lógica de negocio
├── infrastructure/     # Implementaciones técnicas (DB, servicios)
├── presentation/       # Controladores y servidor Express
└── shared/            # Utilidades y constantes compartidas
```

---

## 🛠️ Tecnologías

- **Backend:** TypeScript, Node.js, Express.js
- **Base de Datos:** PostgreSQL con pg driver
- **Testing:** Jest, Supertest
- **Logging:** Winston para logging estructurado
- **Validación:** Zod para validación de datos
- **Seguridad:** bcrypt, jsonwebtoken, helmet, CORS
- **Documentación:** Swagger/OpenAPI
- **Calidad:** ESLint, Prettier, Husky, commitlint
- **Orquestación:** Docker Compose
- **Gestor de Paquetes:** pnpm

---

## 🚀 Instalación y Despliegue Rápido

### 1. Instalación Inicial
```bash
# Clonar y instalar dependencias
git clone <repository-url>
cd Industrial-Inventory
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### 2. Iniciar con Docker
```bash
# Construir e iniciar contenedores
pnpm run docker:up

# Verificar estado
pnpm run docker:ps
```

### 3. Desarrollo
```bash
# Iniciar servidor en modo desarrollo
pnpm run dev
```

### 4. Verificar Instalación
```bash
# Health check
curl http://localhost:3000/health

# Documentación Swagger
open http://localhost:3000/docs
```

---

## 📖 Comandos Principales

### 🚀 Desarrollo
```bash
pnpm run dev          # Servidor de desarrollo
pnpm run build        # Compilar TypeScript
pnpm run start        # Servidor de producción
```

### 🧪 Testing
```bash
pnpm run test:unit    # Tests unitarios
pnpm run test:integration # Tests de integración
pnpm run test:e2e     # Tests end-to-end
pnpm run test         # Todos los tests
pnpm run test:watch   # Tests en modo watch
pnpm run test:coverage # Tests con coverage
pnpm run test:js      # Test exhaustivo (legacy)
```

### 🐳 Docker
```bash
pnpm run docker:up    # Levantar contenedores
pnpm run docker:down  # Detener contenedores
pnpm run docker:reset # Reset completo
```

### 🗄️ Base de Datos
```bash
pnpm run db:fix       # Aplicar particiones
pnpm run db:indexes   # Crear índices
pnpm run docker:reset # Reset completo de DB
```

### 🎨 Calidad de Código
```bash
pnpm run format       # Formatear código
pnpm run lint         # Lint con auto-fix
```

---

## 🗄️ Esquema y Datos de Ejemplo

### Usuarios de Prueba
- **Admin:** `admin@industrial.com` / `123456`
- **Manager:** `manager@industrial.com` / `123456`
- **User:** `user@industrial.com` / `123456`

### Productos de Ejemplo

| SKU              | Nombre                          | Categoría     | Stock | Precio   |
|------------------|---------------------------------|---------------|-------|----------|
| SENS-PRES-001    | Sensor de Presión Industrial    | Sensores      | 15    | 1250.00  |
| TRANS-TEMP-002   | Transmisor de Temperatura RTD   | Transmisores  | 25    | 890.00   |
| VALV-CONT-003    | Válvula de Control Neumática    | Válvulas      | 8     | 2100.00  |
| SEG-CASCO-004    | Casco de Seguridad Industrial   | Seguridad     | 100   | 45.00    |
| HERR-MULTI-005   | Multímetro Digital Profesional  | Herramientas  | 30    | 180.00   |

### Ubicaciones
- Bodega Central, Bodega Sur, Bodega Oeste, Almacén Temporal

### Proveedores
- Industrial Supplies Co., Mining Equipment Ltd., Safety Gear Pro, Tech Components Inc.

---

## 🔐 Autenticación y Roles

### Roles Soportados
- **ADMIN:** Acceso completo a todas las funcionalidades
- **MANAGER:** Gestión de productos y movimientos
- **SUPERVISOR:** Supervisión y reportes
- **USER:** Operaciones básicas de inventario
- **AUDITOR:** Solo lectura y auditoría
- **VIEWER:** Solo visualización

### Login de Ejemplo
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@industrial.com",
    "password": "123456"
  }'
```

---

## 🔌 API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Login y obtención de JWT

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Movimientos
- `GET /api/product-movements` - Listar movimientos
- `POST /api/product-movements` - Registrar movimiento
- `GET /api/product-movements/:id` - Obtener movimiento

### Categorías, Ubicaciones, Proveedores
- Operaciones CRUD completas para cada entidad

### Auditoría
- `GET /api/audit-logs` - Logs de auditoría (solo ADMIN/AUDITOR)

### Reportes
- `GET /api/reports/critical-stock` - Productos en stock crítico

---

## 🧪 Testing

### Estructura de Tests (Clean Architecture)
```
tests/
├── unit/              # Tests unitarios por capa
│   ├── domain/        # Entidades y lógica de negocio
│   ├── application/   # Casos de uso
│   ├── infrastructure/ # Servicios y repositorios
│   └── presentation/  # Controladores
├── integration/       # Tests de integración
│   ├── api/          # Tests de endpoints
│   └── database/     # Tests de base de datos
└── e2e/              # Tests end-to-end
```

### Comandos de Testing
```bash
# Tests unitarios
pnpm run test:unit

# Tests de integración
pnpm run test:integration

# Tests end-to-end
pnpm run test:e2e

# Todos los tests
pnpm run test

# Tests con coverage
pnpm run test:coverage

# Tests en modo watch
pnpm run test:watch

# Test exhaustivo de endpoints (legacy)
pnpm run test:js
```

### Test Exhaustivo de Endpoints
```bash
# Test completo de todos los endpoints con diferentes roles
pnpm run test tests/integration/api/exhaustive-endpoints.test.ts
```

**Características del test exhaustivo:**
- ✅ Prueba todos los roles: `ADMIN`, `MANAGER`, `SUPERVISOR`, `USER`, `AUDITOR`, `VIEWER`
- ✅ Valida endpoints de autenticación (register/login)
- ✅ Prueba operaciones CRUD para todos los recursos
- ✅ Verifica permisos y autorizaciones por rol
- ✅ Incluye health checks y endpoints de auditoría
- ✅ Genera reporte detallado de resultados
- ✅ Timeout de 5 minutos por rol para tests completos

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

### Conventional Commits
```bash
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorizar código
test: agregar tests
chore: tareas de mantenimiento
```

### Pre-commit Hooks
- ESLint con auto-fix
- Prettier para formateo
- Tests automáticos
- Conventional Commits validation

---

## 🔒 Seguridad

### Características de Seguridad
- **Autenticación:** JWT con expiración configurable
- **Autorización:** Control de roles granular
- **Validación:** Zod para validación de entrada
- **Encriptación:** bcrypt para contraseñas
- **Headers:** Helmet para headers de seguridad
- **CORS:** Configuración de CORS
- **Rate Limiting:** Protección contra ataques
- **SQL Injection:** Prevención con parámetros preparados

### Variables de Entorno Requeridas
```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5433
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=development
```

---

## 🐳 Docker Compose

### Servicios
- **inventory-db:** PostgreSQL 15 con datos iniciales
- **Backend:** Node.js con TypeScript

### Volúmenes
- Datos persistentes de PostgreSQL
- Scripts SQL de inicialización

### Comandos Útiles
```bash
# Ver logs
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Limpiar todo
docker compose down -v
```

---

## 📝 Troubleshooting

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar contenedor
pnpm run docker:ps

# Ver logs
docker compose logs inventory-db

# Resetear base de datos
pnpm run docker:reset
```

#### Error de Puerto en Uso
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso
lsof -ti:3000 | xargs kill -9
```

#### Error de Dependencias
```bash
# Limpiar e instalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| `AUTH_ERROR_001` | Token no proporcionado | Incluir `Authorization: Bearer <token>` |
| `AUTH_ERROR_002` | Token inválido | Hacer login nuevamente |
| `AUTH_ERROR_003` | Permisos insuficientes | Verificar rol del usuario |
| `VALIDATION_ERROR_001` | Datos inválidos | Revisar formato de entrada |
| `RESOURCE_ERROR_001` | Recurso no encontrado | Verificar ID o parámetros |
| `STOCK_ERROR_001` | Stock insuficiente | Verificar cantidad disponible |

---

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Usar TypeScript strict mode
- Seguir Clean Architecture
- Escribir tests para nuevas funcionalidades
- Usar Conventional Commits
- Documentar APIs nuevas

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📚 Documentación Adicional

- **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Scripts SQL:** Ver [scripts/README.md](scripts/README.md)
- **Estructura de Base de Datos:** Consultar `scripts/init.sql`
- **Estructura de Tests:** Ver directorio `tests/` organizado por Clean Architecture

---

**¡Bienvenido a la gestión industrial moderna!** 🏭✨
