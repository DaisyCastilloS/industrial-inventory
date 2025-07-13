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

## 🚀 Instalación y Despliegue Rápido con Docker Compose

1. **Configura tu archivo `.env`:**

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=inventory_db
DB_PORT=5432
```

2. **Levanta la base de datos y carga datos de ejemplo:**

```bash
docker compose up -d
```

Esto creará un contenedor PostgreSQL con el esquema, triggers, vistas y datos de ejemplo (usuarios, productos, ubicaciones, proveedores, etc).

3. **Inicia el backend (en otra terminal):**

```bash
pnpm install
pnpm run dev
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

| Método | Endpoint | Descripción | Rol mínimo |
|--------|----------|-------------|------------|
| `GET` | `/products` | Listar todos los productos | USER |
| `GET` | `/products/:id` | Obtener producto por ID | USER |
| `POST` | `/products` | Crear nuevo producto | USER |
| `PUT` | `/products/:id` | Actualizar producto | USER |
| `DELETE` | `/products/:id` | Eliminar producto | ADMIN |
| `GET` | `/reports/critical-stock` | Productos en stock crítico | ADMIN |
| `GET` | `/audit-logs` | Ver logs de auditoría | ADMIN |

### Ejemplo: Consultar productos

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/products
```

Respuesta:
```json
[
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
]
```

### Ejemplo: Crear producto

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

```bash
pnpm run test
```

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
