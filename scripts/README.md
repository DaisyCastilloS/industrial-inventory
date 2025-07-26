# 📁 Scripts SQL - Sistema de Inventario Industrial

## 📋 Descripción

Este directorio contiene todos los scripts SQL necesarios para la inicialización y mantenimiento de la base de datos del sistema de inventario industrial.

## 📂 Estructura de Archivos

### Scripts de Inicialización
- **`init.sql`** - Script principal que crea todo el esquema de la base de datos
  - Tablas principales (users, categories, locations, suppliers, products, product_movements, audit_logs)
  - Datos de ejemplo
  - Triggers de auditoría
  - Vistas materializadas

### Scripts de Mantenimiento
- **`fix-partitions.sql`** - Crea y corrige particiones para tablas grandes (audit_logs, product_movements)
- **`create-audit-log-indexes.sql`** - Crea índices optimizados para auditoría

## 🚀 Uso

### Inicialización Automática (Recomendado)
```bash
# Los scripts se ejecutan automáticamente al crear el contenedor
pnpm run docker:up
```

### Ejecución Manual de Scripts
```bash
# Crear y corregir particiones
pnpm run db:fix

# Crear índices de auditoría
pnpm run db:indexes
```

### Reset Completo
```bash
# Elimina todo y reinicializa desde cero
pnpm run docker:reset
```

## 🔧 Orden de Ejecución

1. **`init.sql`** - Esquema base y datos de ejemplo
2. **`fix-partitions.sql`** - Particionamiento de tablas
3. **`create-audit-log-indexes.sql`** - Índices de optimización

## 📊 Datos de Ejemplo Incluidos

### Usuarios
- **Admin:** admin@industrial.com / 123456
- **Manager:** manager@industrial.com / 123456
- **User:** user@industrial.com / 123456

### Categorías
- Sensores, Transmisores, Válvulas, Equipos de Seguridad, Herramientas

### Ubicaciones
- Bodega Central, Bodega Sur, Bodega Oeste, Almacén Temporal

### Proveedores
- Industrial Supplies Co., Mining Equipment Ltd., Safety Gear Pro, Tech Components Inc.

### Productos
- Sensores de presión, transmisores de temperatura, válvulas de control, etc.

## ⚠️ Notas Importantes

- Los scripts se ejecutan en orden alfabético dentro de `/docker-entrypoint-initdb.d/`
- Solo se ejecutan si la base de datos está vacía
- Para forzar re-ejecución, usar `pnpm run docker:reset`
- Los scripts están optimizados para rendimiento y escalabilidad

## 🐛 Troubleshooting

### Error: "relation already exists"
```bash
# Resetear completamente la base de datos
pnpm run docker:reset
```

### Error: "permission denied"
```bash
# Verificar que los archivos tienen permisos de lectura
chmod 644 scripts/*.sql
```

### Error: "connection refused"
```bash
# Verificar que el contenedor está corriendo
pnpm run docker:ps
```

## 🔧 Comandos Útiles

### Verificar Estado de la Base de Datos
```bash
# Ver logs del contenedor de base de datos
docker compose logs inventory-db

# Conectar directamente a PostgreSQL
docker compose exec inventory-db psql -U postgres -d inventory_db
```

### Backup y Restore
```bash
# Crear backup manual
docker compose exec inventory-db pg_dump -U postgres inventory_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose exec -T inventory-db psql -U postgres -d inventory_db < backup_file.sql
```

## 📈 Optimizaciones Incluidas

### Particionamiento
- Tabla `audit_logs` particionada por fecha
- Tabla `product_movements` particionada por fecha
- Mejora significativa en consultas de auditoría

### Índices
- Índices optimizados para búsquedas por fecha
- Índices compuestos para consultas complejas
- Índices para foreign keys

### Vistas Materializadas
- `products_full_info`: Información completa de productos
- `critical_stock_products`: Productos en stock crítico
- `recent_movements`: Últimos movimientos de inventario

---

**Nota:** Todos los scripts están optimizados para el entorno de producción y desarrollo. 