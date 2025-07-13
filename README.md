# 🏭 Industrial Inventory System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Sistema de inventario industrial robusto y escalable construido con Clean Architecture, TypeScript y PostgreSQL.

## 📋 Tabla de Contenidos

- [🏗️ Arquitectura](#️-arquitectura)
- [🛠️ Tecnologías](#️-tecnologías)
- [🚀 Instalación](#-instalación)
- [📖 Uso](#-uso)
- [🔌 API Endpoints](#-api-endpoints)
- [🔐 Autenticación](#-autenticación)
- [🧪 Testing](#-testing)
- [📝 Commits](#-commits)
- [🔒 Seguridad](#-seguridad)
- [📊 Logging](#-logging)
- [🐳 Docker Compose](#-docker-compose)
- [🤝 Contribución](#-contribución)
- [🛣️ Roadmap](#️-roadmap)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [📄 Licencia](#-licencia)
- [👥 Autores](#-autores)
- [🙏 Agradecimientos](#-agradecimientos)

## 🏗️ Arquitectura

Este proyecto sigue los principios de **Clean Architecture** con una estructura modular y escalable:

```
src/
├── 00-constants/          # Constantes del sistema
├── 01-domain/            # Lógica de negocio (entidades, reglas)
├── 02-application/       # Casos de uso y DTOs
├── 03-infrastructure/    # Implementaciones técnicas (DB, servicios)
└── 04-presentation/      # Controladores y servidor Express
```

### Capas de la Arquitectura

- **Domain Layer**: Entidades y reglas de negocio puras
- **Application Layer**: Casos de uso y lógica de aplicación
- **Infrastructure Layer**: Implementaciones técnicas (DB, servicios externos)
- **Presentation Layer**: Controladores y manejo de HTTP

## 🛠️ Tecnologías

### Core
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático y mejor DX
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Base de datos relacional robusta

### Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo automático
- **Husky** - Git hooks
- **commitlint** - Validación de commits

### Testing
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs

### Logging & Monitoreo
- **Winston** - Sistema de logging estructurado
- **Swagger/OpenAPI** - Documentación de API

### DevOps
- **Docker Compose** - Orquestación de contenedores
- **pnpm** - Gestor de paquetes rápido

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- pnpm 8.6.0+
- Docker y Docker Compose
- PostgreSQL (opcional, se incluye en Docker)

### Setup Rápido

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd Industrial-Inventory

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Levantar base de datos
make up

# 5. Inicializar base de datos
make db-setup

# 6. Ejecutar en desarrollo
make dev
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=inventory_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info
```

## 📖 Uso

### Comandos Principales

```bash
# Desarrollo
make dev              # Ejecutar en modo desarrollo
make build            # Construir proyecto
make lint             # Linting del código
make format           # Formatear código

# Base de datos
make up               # Levantar servicios Docker
make down             # Detener servicios
make db-setup         # Configurar base de datos
make db-reset         # Resetear base de datos

# Testing
make test             # Ejecutar tests
make test-coverage    # Tests con coverage

# Docker
make deploy-build     # Construir imágenes
make deploy-prod      # Desplegar en producción
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Compilar TypeScript
pnpm start            # Ejecutar en producción

# Base de datos
pnpm db:init          # Inicializar DB
pnpm db:up            # Levantar DB con Docker
pnpm db:down          # Detener DB

# Calidad de código
pnpm lint             # ESLint
pnpm lint-fix         # ESLint con auto-fix
pnpm format           # Prettier
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000
```

### Productos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/products` | Listar todos los productos | ✅ |
| `GET` | `/products/:id` | Obtener producto por ID | ✅ |
| `POST` | `/products` | Crear nuevo producto | ✅ |
| `PUT` | `/products/:id` | Actualizar producto | ✅ |
| `DELETE` | `/products/:id` | Eliminar producto | ✅ |

### Ejemplos de Uso

#### Crear Producto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tornillo M8x20",
    "description": "Tornillo métrico 8mm x 20mm",
    "price": 0.50,
    "quantity": 1000
  }'
```

#### Obtener Productos
```bash
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Documentación Swagger

Accede a la documentación interactiva en:
```
http://localhost:3000/docs
```

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación:

### Headers Requeridos
```http
Authorization: Bearer <your_jwt_token>
```

### Roles de Usuario

- **ADMIN**: Acceso completo al sistema
- **USER**: Acceso de lectura y operaciones básicas
- **VIEWER**: Solo acceso de lectura

### Middleware de Autenticación

```typescript
// Ejemplo de uso en rutas
app.use('/products', authMiddleware, roleMiddleware(['ADMIN', 'USER']));
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
make test

# Tests con coverage
make test-coverage

# Tests en modo watch
make test-watch

# Tests de integración
make test-integration
```

### Estructura de Tests

```
src/
├── __tests__/
│   ├── 01-domain/
│   ├── 02-application/
│   ├── 03-infrastructure/
│   └── 04-presentation/
```

### Ejemplo de Test

```typescript
describe('Product Entity', () => {
  it('should create a product with valid data', () => {
    const product = new Product(1, 'Test Product', 'Description', 10.99, 100);
    expect(product.getName()).toBe('Test Product');
    expect(product.getPrice()).toBe(10.99);
  });
});
```

## 📝 Commits

Este proyecto usa **Conventional Commits** con Husky y commitlint:

### Formato de Commits
```
type(scope): description

[optional body]

[optional footer]
```

### Tipos de Commits
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

### Scopes Disponibles
- `auth`: Autenticación y autorización
- `product`: Gestión de productos
- `db`: Base de datos
- `docker`: Configuración Docker
- `api`: Endpoints de API
- `middleware`: Middlewares
- `logging`: Sistema de logging

### Ejemplos

```bash
# Nueva funcionalidad
git commit -m "feat(product): add product search functionality"

# Corrección de bug
git commit -m "fix(auth): resolve JWT token validation issue"

# Documentación
git commit -m "docs(api): update API documentation"

# Refactorización
git commit -m "refactor(db): optimize database queries"
```

## 🔒 Seguridad

### Medidas Implementadas

- **JWT Tokens**: Autenticación segura
- **Role-based Access Control**: Control de acceso por roles
- **Input Validation**: Validación con Zod
- **SQL Injection Protection**: Uso de parámetros preparados
- **CORS**: Configuración de CORS
- **Rate Limiting**: Limitación de requests
- **Helmet**: Headers de seguridad

### Mejores Prácticas

- Variables de entorno para configuraciones sensibles
- Logging de eventos de seguridad
- Validación estricta de inputs
- Sanitización de datos
- Auditoría de dependencias

## 📊 Logging

### Configuración Winston

```typescript
// Niveles de log
error: 0,   // Errores críticos
warn: 1,    // Advertencias
info: 2,    // Información general
debug: 3,   // Información de debug
```

### Formato de Logs

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Product created successfully",
  "productId": 123,
  "userId": "user-456"
}
```

### Logs por Entorno

- **Development**: Logs detallados en consola
- **Production**: Logs estructurados en archivos
- **Testing**: Logs mínimos

## 🐳 Docker Compose

### Servicios Incluidos

```yaml
services:
  db:
    image: postgres:latest
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
```

### Comandos Docker

```bash
# Levantar servicios
make up

# Ver logs
make logs

# Detener servicios
make down

# Reiniciar
make restart

# Limpiar
make docker-clean
```

### Volúmenes

- `postgres_data`: Persistencia de datos PostgreSQL
- `./scripts/init.sql`: Script de inicialización

## 🤝 Contribución

### Guías de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'feat: add amazing feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Estándares de Código

- Usar TypeScript strict mode
- Seguir ESLint y Prettier
- Escribir tests para nuevas funcionalidades
- Documentar APIs con Swagger
- Usar Conventional Commits

### Checklist de PR

- [ ] Tests pasando
- [ ] Linting sin errores
- [ ] Documentación actualizada
- [ ] Commits siguiendo convenciones
- [ ] No breaking changes (o documentados)

## 🛣️ Roadmap

### Versión 1.1.0
- [ ] Sistema de categorías de productos
- [ ] Búsqueda avanzada con filtros
- [ ] Exportación de datos (CSV, Excel)
- [ ] Dashboard con métricas

### Versión 1.2.0
- [ ] Sistema de proveedores
- [ ] Gestión de órdenes de compra
- [ ] Notificaciones por email
- [ ] API rate limiting

### Versión 2.0.0
- [ ] Microservicios
- [ ] Event-driven architecture
- [ ] Cache con Redis
- [ ] Monitoreo con Prometheus

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no esté ya reportado
2. Revisa la documentación
3. Prueba en la última versión

### Información Requerida

- **Versión**: Node.js, TypeScript, etc.
- **Sistema Operativo**: Windows/macOS/Linux
- **Pasos para reproducir**: Lista detallada
- **Comportamiento esperado**: Qué debería pasar
- **Comportamiento actual**: Qué está pasando
- **Logs**: Errores relevantes

### Plantilla de Bug Report

```markdown
## Descripción
Descripción clara del problema

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

## Comportamiento Esperado
Descripción de lo que debería pasar

## Comportamiento Actual
Descripción de lo que está pasando

## Información Adicional
- OS: [e.g. macOS 12.0]
- Node.js: [e.g. 18.0.0]
- TypeScript: [e.g. 5.8.3]
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Daisy Castillo Sepulveda** - *Desarrollo inicial* - [@DaisyCastilloS](https://github.com/DaisyCastilloS)

## 🙏 Agradecimientos

- Clean Architecture por Robert C. Martin
- Comunidad de TypeScript
- Contribuidores de las librerías utilizadas
- Equipo de desarrollo y testing

---

<div align="center">

**¿Te gustó el proyecto? ¡Dale una ⭐!**

[Reportar Bug](https://github.com/tu-usuario/Industrial-Inventory/issues) • 
[Solicitar Feature](https://github.com/tu-usuario/Industrial-Inventory/issues) • 
[Contribuir](https://github.com/tu-usuario/Industrial-Inventory/pulls)

</div>
