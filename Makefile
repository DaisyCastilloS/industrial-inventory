# Makefile para desarrollo y despliegue local
# Uso: make <comando>

# =============================================================================
# 🚀 DESARROLLO
# =============================================================================

# Levantar entorno de desarrollo
up:
	docker-compose up -d

# Detener entorno de desarrollo
down:
	docker-compose down

# Reiniciar servicios
restart:
	docker-compose restart

# Ver logs en tiempo real
logs:
	docker-compose logs -f

# Ver logs de un servicio específico
logs-app:
	docker-compose logs -f app

logs-db:
	docker-compose logs -f postgres

# =============================================================================
# 🗄️ BASE DE DATOS
# =============================================================================

# Inicializar base de datos
db-init:
	pnpm run db:init

# Crear y poblar base de datos
db-setup: db-init
	@echo "✅ Base de datos configurada"

# Resetear base de datos
db-reset:
	docker-compose down -v
	docker-compose up -d postgres
	sleep 5
	pnpm run db:init

# =============================================================================
# 🧪 TESTING
# =============================================================================

# Ejecutar tests
test:
	pnpm test

# Ejecutar tests con coverage
test-coverage:
	pnpm test:coverage

# Ejecutar tests en modo watch
test-watch:
	pnpm test:watch

# Ejecutar tests de integración
test-integration:
	pnpm test:integration

# =============================================================================
# 🔧 DESARROLLO
# =============================================================================

# Instalar dependencias
install:
	pnpm install

# Ejecutar en modo desarrollo
dev:
	pnpm dev

# Construir proyecto
build:
	pnpm build

# Lint del código
lint:
	pnpm lint

# Lint con auto-fix
lint-fix:
	pnpm lint-fix

# Formatear código
format:
	pnpm format

# =============================================================================
# 🐳 DOCKER
# =============================================================================

# Construir imágenes Docker
deploy-build:
	docker-compose build

# Desplegar en producción
deploy-prod:
	docker-compose up -d --build

# Detener despliegue
deploy-stop:
	docker-compose down

# Limpiar imágenes Docker
docker-clean:
	docker system prune -f
	docker image prune -f

# =============================================================================
# 🔒 SEGURIDAD
# =============================================================================

# Verificar vulnerabilidades
security-audit:
	pnpm audit

# Actualizar dependencias
update-deps:
	pnpm update

# =============================================================================
# 📊 MONITOREO
# =============================================================================

# Ver estado de servicios
status:
	docker-compose ps

# Ver uso de recursos
resources:
	docker stats

# =============================================================================
# 🚀 DESPLIEGUE COMPLETO
# =============================================================================

# Despliegue completo desde cero
deploy-full: down docker-clean deploy-build deploy-prod
	@echo "✅ Despliegue completo finalizado"

# Setup completo del proyecto
setup: install db-setup
	@echo "✅ Setup completo del proyecto finalizado"

# =============================================================================
# 📚 AYUDA
# =============================================================================

# Mostrar ayuda
help:
	@echo "🚀 COMANDOS DISPONIBLES:"
	@echo ""
	@echo "📁 DESARROLLO:"
	@echo "  make up          - Levantar entorno"
	@echo "  make down        - Detener entorno"
	@echo "  make restart     - Reiniciar servicios"
	@echo "  make logs        - Ver logs"
	@echo "  make dev         - Ejecutar en desarrollo"
	@echo ""
	@echo "🗄️ BASE DE DATOS:"
	@echo "  make db-init     - Inicializar DB"
	@echo "  make db-setup    - Configurar DB completa"
	@echo "  make db-reset    - Resetear DB"
	@echo ""
	@echo "🧪 TESTING:"
	@echo "  make test        - Ejecutar tests"
	@echo "  make test-coverage - Tests con coverage"
	@echo "  make test-watch  - Tests en modo watch"
	@echo ""
	@echo "🔧 DESARROLLO:"
	@echo "  make install     - Instalar dependencias"
	@echo "  make build       - Construir proyecto"
	@echo "  make lint        - Lint del código"
	@echo "  make format      - Formatear código"
	@echo ""
	@echo "🐳 DOCKER:"
	@echo "  make deploy-build - Construir imágenes"
	@echo "  make deploy-prod  - Desplegar producción"
	@echo "  make docker-clean - Limpiar Docker"
	@echo ""
	@echo "🚀 DESPLIEGUE:"
	@echo "  make setup       - Setup completo"
	@echo "  make deploy-full - Despliegue completo"
	@echo ""
	@echo "📊 MONITOREO:"
	@echo "  make status      - Estado de servicios"
	@echo "  make resources   - Uso de recursos"

# Comando por defecto
.DEFAULT_GOAL := help
