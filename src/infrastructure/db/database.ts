/**
 * @fileoverview Configuración optimizada de base de datos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Pool, PoolConfig, PoolClient } from 'pg';
import { LoggerWrapperInterface } from '../../core/application/interface/LoggerWrapperInterface';
import { WinstonLogger } from '../logger/WinstonLogger';
import {
  ApplicationError,
  ErrorCode,
  ErrorType,
} from '../../core/application/error/ApplicationError';

interface PoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  maxConnections: number;
  connectionTimeouts: number;
  queryTimeouts: number;
  lastError?: Error;
  lastErrorTime?: Date;
}

class DatabasePool {
  private static instance: DatabasePool;
  private pool: Pool;
  private logger: LoggerWrapperInterface;
  private isConnected: boolean = false;
  private metrics: PoolMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingClients: 0,
    maxConnections: 0,
    connectionTimeouts: 0,
    queryTimeouts: 0,
  };
  private healthCheckInterval?: NodeJS.Timeout;

  private constructor() {
    this.logger = new WinstonLogger();
    const config: PoolConfig = this.createPoolConfig();
    this.pool = new Pool(config);
    this.setupEventHandlers();
    this.startHealthCheck();
  }

  private createPoolConfig(): PoolConfig {
    const maxConnections = Number(process.env.DB_POOL_MAX) || 20;

    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      // Pool configuration
      max: maxConnections,
      min: Math.floor(maxConnections * 0.2), // Mantener al menos 20% de conexiones
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,

      // Production SSL
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: false,
              ca: process.env.DB_SSL_CA,
              key: process.env.DB_SSL_KEY,
              cert: process.env.DB_SSL_CERT,
            }
          : undefined,

      // Query configuration
      statement_timeout: 30000,
      query_timeout: 30000,

      // Connection maintenance
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,

      // Application name for monitoring
      application_name: process.env.APP_NAME || 'industrial-inventory',
    };
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', (client: PoolClient) => {
      this.isConnected = true;
      this.metrics.totalConnections++;
      this.metrics.activeConnections++;

      // Setup client-specific error handler
      client.on('error', (err: Error) => {
        this.handleError('Client error:', err);
      });

      this.logger.info('Nueva conexión establecida', {
        metrics: this.getMetricsSnapshot(),
      });
    });

    this.pool.on('acquire', () => {
      this.metrics.activeConnections++;
      this.metrics.idleConnections--;
    });

    this.pool.on('release', () => {
      this.metrics.activeConnections--;
      this.metrics.idleConnections++;
    });

    this.pool.on('error', (err: Error) => {
      this.handleError('Pool error:', err);
    });

    this.pool.on('remove', () => {
      this.metrics.totalConnections--;
      this.logger.info('Conexión removida del pool', {
        metrics: this.getMetricsSnapshot(),
      });
    });
  }

  private startHealthCheck(): void {
    const interval = Number(process.env.DB_HEALTH_CHECK_INTERVAL) || 30000;

    this.healthCheckInterval = setInterval(async () => {
      try {
        const isHealthy = await this.checkConnection();
        const metrics = await this.getMetrics();

        this.logger.info('Health check completado', {
          healthy: isHealthy,
          metrics,
        });

        // Auto-healing: reiniciar pool si hay demasiados errores
        if (metrics.connectionTimeouts > 5 || metrics.queryTimeouts > 10) {
          await this.restartPool();
        }
      } catch (error) {
        this.handleError('Error en health check:', error);
      }
    }, interval);
  }

  private async restartPool(): Promise<void> {
    this.logger.warn('Reiniciando pool de conexiones', {
      reason: 'Demasiados errores detectados',
      metrics: this.getMetricsSnapshot(),
    });

    try {
      await this.end();
      this.pool = new Pool(this.createPoolConfig());
      this.setupEventHandlers();
      this.metrics = {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        waitingClients: 0,
        maxConnections: this.pool.options.max || 20,
        connectionTimeouts: 0,
        queryTimeouts: 0,
      };
    } catch (error) {
      this.handleError('Error al reiniciar pool:', error);
    }
  }

  private handleError(context: string, error: any): void {
    this.metrics.lastError = error;
    this.metrics.lastErrorTime = new Date();

    if (error.message.includes('timeout')) {
      if (error.message.includes('connection')) {
        this.metrics.connectionTimeouts++;
      } else {
        this.metrics.queryTimeouts++;
      }
    }

    this.logger.error(context, {
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: this.getMetricsSnapshot(),
    });
  }

  private getMetricsSnapshot(): PoolMetrics {
    return {
      ...this.metrics,
      maxConnections: this.pool.options.max || 20,
      waitingClients: this.pool.waitingCount,
    };
  }

  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async checkConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      this.handleError('Error al verificar conexión:', error);
      return false;
    }
  }

  public async getMetrics(): Promise<PoolMetrics> {
    const currentMetrics = this.getMetricsSnapshot();

    try {
      const result = await this.pool.query(
        'SELECT count(*) as active_connections FROM pg_stat_activity WHERE datname = $1',
        [process.env.DB_NAME]
      );
      currentMetrics.activeConnections = parseInt(
        result.rows[0].active_connections,
        10
      );
    } catch (error) {
      this.handleError('Error al obtener métricas:', error);
    }

    return currentMetrics;
  }

  public async end(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    try {
      await this.pool.end();
      this.isConnected = false;
      this.logger.info('Conexión con la base de datos cerrada', {
        metrics: this.getMetricsSnapshot(),
      });
    } catch (error) {
      throw new ApplicationError(
        'Error al cerrar la conexión con la base de datos',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.DATABASE_ERROR,
          httpStatus: 500,
          isOperational: false,
        },
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
}

// Exportar instancia única del pool
export const pool = DatabasePool.getInstance().getPool();

// Exportar clase para casos especiales
export default DatabasePool;
