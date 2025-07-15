/**
 * @fileoverview Scripts de mantenimiento para el sistema de auditoría
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { pool } from '../src/infrastructure/db/database';
import { auditLogCache } from '../src/infrastructure/services/AuditLogCache';

interface MaintenanceOptions {
  retentionDays: number;
  batchSize: number;
  dryRun: boolean;
}

/**
 * Limpia logs antiguos de auditoría
 */
export async function cleanupOldLogs(options: Partial<MaintenanceOptions> = {}): Promise<{
  deletedCount: number;
  totalCount: number;
  executionTime: number;
}> {
  const config = {
    retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90'),
    batchSize: parseInt(process.env.AUDIT_LOG_BATCH_SIZE || '1000'),
    dryRun: process.env.AUDIT_LOG_DRY_RUN === 'true',
    ...options
  };

  const startTime = Date.now();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

  console.log(`🧹 Iniciando limpieza de logs de auditoría...`);
  console.log(`📅 Fecha de corte: ${cutoffDate.toISOString()}`);
  console.log(`🔧 Modo dry-run: ${config.dryRun}`);
  console.log(`📦 Tamaño de lote: ${config.batchSize}`);

  // Contar logs a eliminar
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM audit_logs WHERE created_at < $1',
    [cutoffDate]
  );
  const totalCount = parseInt(countResult.rows[0].count);

  if (totalCount === 0) {
    console.log('✅ No hay logs antiguos para eliminar');
    return { deletedCount: 0, totalCount: 0, executionTime: Date.now() - startTime };
  }

  console.log(`📊 Total de logs a eliminar: ${totalCount}`);

  let deletedCount = 0;
  let processedCount = 0;

  // Eliminar en lotes
  while (processedCount < totalCount) {
    const batchResult = await pool.query(
      `DELETE FROM audit_logs 
       WHERE id IN (
         SELECT id FROM audit_logs 
         WHERE created_at < $1 
         ORDER BY created_at ASC 
         LIMIT $2
       )`,
      [cutoffDate, config.batchSize]
    );

    const batchDeleted = batchResult.rowCount || 0;
    deletedCount += batchDeleted;
    processedCount += config.batchSize;

    console.log(`📦 Lote procesado: ${batchDeleted} logs eliminados (${processedCount}/${totalCount})`);

    // Pequeña pausa para no sobrecargar la BD
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const executionTime = Date.now() - startTime;
  console.log(`✅ Limpieza completada: ${deletedCount} logs eliminados en ${executionTime}ms`);

  return { deletedCount, totalCount, executionTime };
}

/**
 * Optimiza la tabla de auditoría
 */
export async function optimizeAuditTable(): Promise<{
  success: boolean;
  executionTime: number;
  message: string;
}> {
  const startTime = Date.now();

  try {
    console.log('🔧 Optimizando tabla audit_logs...');

    // VACUUM ANALYZE para optimizar la tabla
    await pool.query('VACUUM ANALYZE audit_logs');
    
    // Actualizar estadísticas
    await pool.query('ANALYZE audit_logs');

    const executionTime = Date.now() - startTime;
    console.log(`✅ Optimización completada en ${executionTime}ms`);

    return {
      success: true,
      executionTime,
      message: 'Tabla audit_logs optimizada exitosamente'
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ Error durante la optimización: ${error}`);
    
    return {
      success: false,
      executionTime,
      message: `Error: ${error}`
    };
  }
}

/**
 * Genera reporte de estadísticas de auditoría
 */
export async function generateAuditReport(): Promise<{
  totalLogs: number;
  logsByTable: Array<{ tableName: string; count: number }>;
  logsByAction: Array<{ action: string; count: number }>;
  logsByUser: Array<{ userId: number; count: number }>;
  recentActivity: Array<{ date: string; count: number }>;
  storageSize: string;
}> {
  console.log('📊 Generando reporte de auditoría...');

  // Estadísticas generales
  const totalResult = await pool.query('SELECT COUNT(*) FROM audit_logs');
  const totalLogs = parseInt(totalResult.rows[0].count);

  // Logs por tabla
  const tableStatsResult = await pool.query(`
    SELECT table_name, COUNT(*) as count 
    FROM audit_logs 
    GROUP BY table_name 
    ORDER BY count DESC
  `);
  const logsByTable = tableStatsResult.rows.map(row => ({
    tableName: row.table_name,
    count: parseInt(row.count)
  }));

  // Logs por acción
  const actionStatsResult = await pool.query(`
    SELECT action, COUNT(*) as count 
    FROM audit_logs 
    GROUP BY action 
    ORDER BY count DESC
  `);
  const logsByAction = actionStatsResult.rows.map(row => ({
    action: row.action,
    count: parseInt(row.count)
  }));

  // Logs por usuario
  const userStatsResult = await pool.query(`
    SELECT user_id, COUNT(*) as count 
    FROM audit_logs 
    WHERE user_id IS NOT NULL
    GROUP BY user_id 
    ORDER BY count DESC 
    LIMIT 10
  `);
  const logsByUser = userStatsResult.rows.map(row => ({
    userId: parseInt(row.user_id),
    count: parseInt(row.count)
  }));

  // Actividad reciente (últimos 7 días)
  const recentActivityResult = await pool.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM audit_logs 
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);
  const recentActivity = recentActivityResult.rows.map(row => ({
    date: row.date,
    count: parseInt(row.count)
  }));

  // Tamaño de almacenamiento
  const sizeResult = await pool.query(`
    SELECT pg_size_pretty(pg_total_relation_size('audit_logs')) as size
  `);
  const storageSize = sizeResult.rows[0].size;

  console.log('✅ Reporte generado exitosamente');

  return {
    totalLogs,
    logsByTable,
    logsByAction,
    logsByUser,
    recentActivity,
    storageSize
  };
}

/**
 * Limpia el cache de auditoría
 */
export async function clearAuditCache(): Promise<{
  success: boolean;
  cacheSize: number;
  message: string;
}> {
  try {
    console.log('🗑️ Limpiando cache de auditoría...');
    
    const cacheStats = auditLogCache.getCacheStats();
    auditLogCache.clear();
    
    console.log(`✅ Cache limpiado. Tamaño anterior: ${cacheStats.size} entradas`);
    
    return {
      success: true,
      cacheSize: cacheStats.size,
      message: 'Cache de auditoría limpiado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error limpiando cache: ${error}`);
    
    return {
      success: false,
      cacheSize: 0,
      message: `Error: ${error}`
    };
  }
}

/**
 * Ejecuta todas las tareas de mantenimiento
 */
export async function runMaintenance(): Promise<void> {
  console.log('🚀 Iniciando tareas de mantenimiento de auditoría...\n');

  // 1. Limpiar logs antiguos
  console.log('1️⃣ Limpiando logs antiguos...');
  const cleanupResult = await cleanupOldLogs();
  console.log(`   ✅ ${cleanupResult.deletedCount} logs eliminados\n`);

  // 2. Optimizar tabla
  console.log('2️⃣ Optimizando tabla...');
  const optimizeResult = await optimizeAuditTable();
  console.log(`   ${optimizeResult.success ? '✅' : '❌'} ${optimizeResult.message}\n`);

  // 3. Limpiar cache
  console.log('3️⃣ Limpiando cache...');
  const cacheResult = await clearAuditCache();
  console.log(`   ${cacheResult.success ? '✅' : '❌'} ${cacheResult.message}\n`);

  // 4. Generar reporte
  console.log('4️⃣ Generando reporte...');
  const report = await generateAuditReport();
  console.log(`   ✅ Reporte generado: ${report.totalLogs} logs totales, ${report.storageSize} de almacenamiento\n`);

  console.log('🎉 Mantenimiento completado exitosamente');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'cleanup':
      cleanupOldLogs().then(console.log).catch(console.error);
      break;
    case 'optimize':
      optimizeAuditTable().then(console.log).catch(console.error);
      break;
    case 'report':
      generateAuditReport().then(console.log).catch(console.error);
      break;
    case 'clear-cache':
      clearAuditCache().then(console.log).catch(console.error);
      break;
    case 'maintenance':
      runMaintenance().catch(console.error);
      break;
    default:
      console.log('Uso: npm run audit:maintenance [cleanup|optimize|report|clear-cache|maintenance]');
  }
} 