import winston from 'winston';
import {
  LoggerWrapperInterface,
  LogLevel,
} from '../../core/application/interface/LoggerWrapperInterface';

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
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/audit.log',
          level: 'info',
          maxsize: 5242880,
          maxFiles: 10,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/security.log',
          level: 'warn',
          maxsize: 5242880,
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    });

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

  async error(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.error(message, {
      level: LogLevel.ERROR,
      ...metadata,
    });
  }

  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.warn(message, {
      level: LogLevel.WARN,
      ...metadata,
    });
  }

  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.info(message, {
      level: LogLevel.INFO,
      ...metadata,
    });
  }

  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.debug(message, {
      level: LogLevel.DEBUG,
      ...metadata,
    });
  }

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
