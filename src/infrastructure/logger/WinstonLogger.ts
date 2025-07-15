/**
 * @fileoverview Implementación del logger con Winston
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import winston from 'winston';
import {
  LoggerWrapperInterface,
  LogLevel,
} from '../../core/application/interface/LoggerWrapperInterface';

/**
 * Implementación del logger con Winston
 */
export class WinstonLogger implements LoggerWrapperInterface {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'industrial-inventory-api',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
      transports: [
        // Log de errores
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        }),
        // Log de auditoría
        new winston.transports.File({
          filename: 'logs/audit.log',
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        // Log de seguridad
        new winston.transports.File({
          filename: 'logs/security.log',
          level: 'warn',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        // Log combinado
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // Agregar transporte de consola en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf((info: winston.Logform.TransformableInfo) =>
              String(info.message)
            )
          ),
        })
      );
    }
  }

  /**
   * Registra un mensaje de error
   * @param message - Mensaje del error
   * @param metadata - Metadatos adicionales
   */
  async error(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.error(message, {
      level: LogLevel.ERROR,
      ...metadata,
    });
  }

  /**
   * Registra un mensaje de advertencia
   * @param message - Mensaje de advertencia
   * @param metadata - Metadatos adicionales
   */
  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.warn(message, {
      level: LogLevel.WARN,
      ...metadata,
    });
  }

  /**
   * Registra un mensaje informativo
   * @param message - Mensaje informativo
   * @param metadata - Metadatos adicionales
   */
  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.info(message, {
      level: LogLevel.INFO,
      ...metadata,
    });
  }

  /**
   * Registra un mensaje de debug
   * @param message - Mensaje de debug
   * @param metadata - Metadatos adicionales
   */
  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.debug(message, {
      level: LogLevel.DEBUG,
      ...metadata,
    });
  }

  /**
   * Registra un mensaje con nivel personalizado
   * @param level - Nivel del log
   * @param message - Mensaje
   * @param metadata - Metadatos adicionales
   */
  async log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.logger.log(level, message, {
      level,
      ...metadata,
    });
  }

  /**
   * Registra un evento de auditoría
   * @param action - Acción realizada
   * @param entityType - Tipo de entidad
   * @param entityId - ID de la entidad
   * @param userId - ID del usuario que realizó la acción
   * @param metadata - Metadatos adicionales
   */
  async audit(
    action: string,
    entityType: string,
    entityId: number,
    userId?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.logger.info('AUDIT_EVENT', {
      level: LogLevel.INFO,
      action,
      entityType,
      entityId,
      userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Registra un evento de seguridad
   * @param event - Evento de seguridad
   * @param userId - ID del usuario involucrado
   * @param ipAddress - Dirección IP
   * @param metadata - Metadatos adicionales
   */
  async security(
    event: string,
    userId?: number,
    ipAddress?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.logger.warn('SECURITY_EVENT', {
      level: LogLevel.WARN,
      event,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }
}
