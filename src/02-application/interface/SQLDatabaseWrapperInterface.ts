/**
 * @fileoverview Interfaz para el wrapper de base de datos SQL
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Opciones de configuración de la base de datos
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeoutMillis?: number;
}

/**
 * Resultado de una consulta
 */
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  fields?: any[];
}

/**
 * Interfaz para el wrapper de base de datos SQL
 */
export interface SQLDatabaseWrapperInterface {
  /**
   * Conecta a la base de datos
   * @param config - Configuración de la base de datos
   */
  connect(config: DatabaseConfig): Promise<void>;

  /**
   * Desconecta de la base de datos
   */
  disconnect(): Promise<void>;

  /**
   * Ejecuta una consulta
   * @param query - Consulta SQL
   * @param params - Parámetros de la consulta
   * @returns Resultado de la consulta
   */
  query<T = any>(query: string, params?: any[]): Promise<QueryResult<T>>;

  /**
   * Ejecuta una transacción
   * @param callback - Función que ejecuta las operaciones de la transacción
   * @returns Resultado de la transacción
   */
  transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;

  /**
   * Inicia una transacción
   * @returns Cliente de transacción
   */
  beginTransaction(): Promise<any>;

  /**
   * Confirma una transacción
   * @param client - Cliente de transacción
   */
  commitTransaction(client: any): Promise<void>;

  /**
   * Revierte una transacción
   * @param client - Cliente de transacción
   */
  rollbackTransaction(client: any): Promise<void>;

  /**
   * Verifica la conexión a la base de datos
   * @returns true si está conectado
   */
  isConnected(): Promise<boolean>;

  /**
   * Obtiene estadísticas de la conexión
   * @returns Estadísticas de la conexión
   */
  getConnectionStats(): Promise<{
    totalConnections: number;
    idleConnections: number;
    activeConnections: number;
  }>;

  /**
   * Ejecuta una migración
   * @param sql - SQL de la migración
   */
  runMigration(sql: string): Promise<void>;

  /**
   * Establece el ID del usuario para auditoría
   * @param userId - ID del usuario
   */
  setCurrentUserId(userId: number): Promise<void>;

  /**
   * Obtiene el ID del usuario actual
   * @returns ID del usuario actual
   */
  getCurrentUserId(): Promise<number | null>;
}










