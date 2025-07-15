/**
 * @fileoverview Interfaz para el wrapper de logging
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Niveles de log disponibles
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Interfaz para el wrapper de logging
 */
export interface LoggerWrapperInterface {
  /**
   * Registra un mensaje de error
   * @param message - Mensaje del error
   * @param metadata - Metadatos adicionales
   */
  error(message: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Registra un mensaje de advertencia
   * @param message - Mensaje de advertencia
   * @param metadata - Metadatos adicionales
   */
  warn(message: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Registra un mensaje informativo
   * @param message - Mensaje informativo
   * @param metadata - Metadatos adicionales
   */
  info(message: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Registra un mensaje de debug
   * @param message - Mensaje de debug
   * @param metadata - Metadatos adicionales
   */
  debug(message: string, metadata?: Record<string, any>): Promise<void>;

  /**
   * Registra un mensaje con nivel personalizado
   * @param level - Nivel del log
   * @param message - Mensaje
   * @param metadata - Metadatos adicionales
   */
  log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Registra un evento de auditoría
   * @param action - Acción realizada
   * @param entityType - Tipo de entidad
   * @param entityId - ID de la entidad
   * @param userId - ID del usuario que realizó la acción
   * @param metadata - Metadatos adicionales
   */
  audit(
    action: string,
    entityType: string,
    entityId: number,
    userId?: number,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Registra un evento de seguridad
   * @param event - Evento de seguridad
   * @param userId - ID del usuario involucrado
   * @param ipAddress - Dirección IP
   * @param metadata - Metadatos adicionales
   */
  security(
    event: string,
    userId?: number,
    ipAddress?: string,
    metadata?: Record<string, any>
  ): Promise<void>;
}
