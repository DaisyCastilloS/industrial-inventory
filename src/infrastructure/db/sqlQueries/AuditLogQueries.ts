export const AuditLogQueries = {
  // Queries CRUD básicas
  insert: `
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, ip_address, user_agent, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,

  findById: `SELECT * FROM audit_logs WHERE id = $1`,

  findAll: `SELECT * FROM audit_logs ORDER BY created_at DESC`,

  // Queries de búsqueda por criterios específicos
  findByTable: `SELECT * FROM audit_logs WHERE table_name = $1 ORDER BY created_at DESC`,

  findByRecord: `SELECT * FROM audit_logs WHERE table_name = $1 AND record_id = $2 ORDER BY created_at DESC`,

  findByUser: `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC`,

  findByAction: `SELECT * FROM audit_logs WHERE action = $1 ORDER BY created_at DESC`,

  findByIpAddress: `SELECT * FROM audit_logs WHERE ip_address = $1 ORDER BY created_at DESC`,

  findByTableAndAction: `SELECT * FROM audit_logs WHERE table_name = $1 AND action = $2 ORDER BY created_at DESC`,

  // Queries de búsqueda por rango de fechas
  findByDateRange: `SELECT * FROM audit_logs WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at DESC`,

  findByDateRangeAndTable: `SELECT * FROM audit_logs WHERE table_name = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at DESC`,

  findByDateRangeAndUser: `SELECT * FROM audit_logs WHERE user_id = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at DESC`,

  // Queries de logs recientes
  findRecent: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`,

  findRecentByTable: `SELECT * FROM audit_logs WHERE table_name = $1 ORDER BY created_at DESC LIMIT $2`,

  findRecentByUser: `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,

  // Queries de estadísticas
  stats: {
    // Estadísticas globales
    total: `SELECT COUNT(*) FROM audit_logs`,

    byTable: `
      SELECT table_name, COUNT(*) as count 
      FROM audit_logs 
      GROUP BY table_name 
      ORDER BY count DESC
    `,

    byAction: `
      SELECT action, COUNT(*) as count 
      FROM audit_logs 
      GROUP BY action 
      ORDER BY count DESC
    `,

    byUser: `
      SELECT user_id, COUNT(*) as count 
      FROM audit_logs 
      GROUP BY user_id 
      ORDER BY count DESC
    `,

    // Estadísticas por período
    byDateRange: `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT table_name) as unique_tables,
        COUNT(DISTINCT action) as unique_actions
      FROM audit_logs 
      WHERE created_at BETWEEN $1 AND $2
    `,

    // Estadísticas detalladas por tabla
    byTableAndAction: `
      SELECT 
        table_name,
        action,
        COUNT(*) as count
      FROM audit_logs 
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY table_name, action
      ORDER BY table_name, count DESC
    `,

    // Estadísticas por usuario
    byUserAndAction: `
      SELECT 
        user_id,
        action,
        COUNT(*) as count
      FROM audit_logs 
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY user_id, action
      ORDER BY user_id, count DESC
    `,

    // Estadísticas de actividad por hora
    byHour: `
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM audit_logs 
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `,

    // Estadísticas de actividad por día
    byDay: `
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as count
      FROM audit_logs 
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY day
    `,
  },

  // Queries de limpieza y mantenimiento
  maintenance: {
    // Eliminar logs antiguos
    deleteOldLogs: `DELETE FROM audit_logs WHERE created_at < $1`,

    // Contar logs antiguos
    countOldLogs: `SELECT COUNT(*) FROM audit_logs WHERE created_at < $1`,

    // Obtener logs por tamaño (para análisis de espacio)
    getLogsBySize: `
      SELECT 
        table_name,
        COUNT(*) as log_count,
        SUM(LENGTH(COALESCE(old_values::text, '')) + LENGTH(COALESCE(new_values::text, ''))) as total_size
      FROM audit_logs 
      GROUP BY table_name
      ORDER BY total_size DESC
    `,

    // Optimizar tabla (vacuum)
    optimizeTable: `VACUUM ANALYZE audit_logs`,
  },

  // Queries de búsqueda avanzada
  search: {
    // Búsqueda por texto en valores
    byTextInValues: `
      SELECT * FROM audit_logs 
      WHERE (old_values::text ILIKE $1 OR new_values::text ILIKE $1)
      ORDER BY created_at DESC
    `,

    // Búsqueda por múltiples criterios
    byMultipleCriteria: `
      SELECT * FROM audit_logs 
      WHERE ($1::text IS NULL OR table_name = $1)
        AND ($2::integer IS NULL OR user_id = $2)
        AND ($3::text IS NULL OR action = $3)
        AND ($4::timestamp IS NULL OR created_at >= $4)
        AND ($5::timestamp IS NULL OR created_at <= $5)
      ORDER BY created_at DESC
    `,

    // Búsqueda por cambios específicos
    bySpecificChange: `
      SELECT * FROM audit_logs 
      WHERE table_name = $1 
        AND record_id = $2 
        AND action = $3
      ORDER BY created_at DESC
    `,
  },

  // Queries de auditoría específica
  audit: {
    // Obtener historial completo de un registro
    getRecordHistory: `
      SELECT * FROM audit_logs 
      WHERE table_name = $1 AND record_id = $2 
      ORDER BY created_at ASC
    `,

    // Obtener cambios recientes de un usuario
    getUserRecentActivity: `
      SELECT * FROM audit_logs 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `,

    // Obtener actividad por IP
    getActivityByIp: `
      SELECT * FROM audit_logs 
      WHERE ip_address = $1 
      ORDER BY created_at DESC
    `,

    // Obtener estadísticas de seguridad
    getSecurityStats: `
      SELECT 
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_actions,
        MIN(created_at) as first_action,
        MAX(created_at) as last_action
      FROM audit_logs 
      WHERE created_at BETWEEN $1 AND $2
    `,
  },
};
