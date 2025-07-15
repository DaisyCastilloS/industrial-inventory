-- Script para crear índices optimizados para audit_logs
-- Ejecutar: psql -d your_database -f scripts/create-audit-log-indexes.sql

-- Índices básicos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Índices compuestos para consultas complejas
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON audit_logs(table_name, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date_table ON audit_logs(created_at, table_name);

-- Índices para búsquedas por rango de fechas
CREATE INDEX IF NOT EXISTS idx_audit_logs_date_range ON audit_logs(created_at) 
WHERE created_at > '2024-01-01'::timestamp;

-- Índices para estadísticas
CREATE INDEX IF NOT EXISTS idx_audit_logs_stats ON audit_logs(table_name, action, created_at);

-- Índices para búsquedas de texto en valores JSON
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_values_gin ON audit_logs USING gin(old_values);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values_gin ON audit_logs USING gin(new_values);

-- Índices parciales para optimizar consultas específicas
CREATE INDEX IF NOT EXISTS idx_audit_logs_recent ON audit_logs(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS idx_audit_logs_active_users ON audit_logs(user_id, created_at) 
WHERE user_id IS NOT NULL;

-- Índices para consultas de seguridad
CREATE INDEX IF NOT EXISTS idx_audit_logs_security ON audit_logs(ip_address, user_id, created_at);

-- Comentarios sobre el uso de cada índice
COMMENT ON INDEX idx_audit_logs_table_name IS 'Optimiza búsquedas por tabla';
COMMENT ON INDEX idx_audit_logs_user_id IS 'Optimiza búsquedas por usuario';
COMMENT ON INDEX idx_audit_logs_action IS 'Optimiza búsquedas por acción';
COMMENT ON INDEX idx_audit_logs_created_at IS 'Optimiza búsquedas por fecha y ordenamiento';
COMMENT ON INDEX idx_audit_logs_ip_address IS 'Optimiza búsquedas por IP';
COMMENT ON INDEX idx_audit_logs_table_record IS 'Optimiza búsquedas por tabla y registro específico';
COMMENT ON INDEX idx_audit_logs_user_action IS 'Optimiza búsquedas por usuario y acción';
COMMENT ON INDEX idx_audit_logs_table_action IS 'Optimiza búsquedas por tabla y acción';
COMMENT ON INDEX idx_audit_logs_date_table IS 'Optimiza búsquedas por fecha y tabla';
COMMENT ON INDEX idx_audit_logs_date_range IS 'Optimiza búsquedas en rango de fechas recientes';
COMMENT ON INDEX idx_audit_logs_stats IS 'Optimiza consultas de estadísticas';
COMMENT ON INDEX idx_audit_logs_old_values_gin IS 'Optimiza búsquedas de texto en valores antiguos';
COMMENT ON INDEX idx_audit_logs_new_values_gin IS 'Optimiza búsquedas de texto en valores nuevos';
COMMENT ON INDEX idx_audit_logs_recent IS 'Optimiza consultas de logs recientes';
COMMENT ON INDEX idx_audit_logs_active_users IS 'Optimiza consultas de usuarios activos';
COMMENT ON INDEX idx_audit_logs_security IS 'Optimiza consultas de seguridad';

-- Verificar que los índices se crearon correctamente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'audit_logs'
ORDER BY indexname; 