/**
 * @fileoverview Servidor Express optimizado
 * @author Daisy Castillo
 * @version 1.0.0
 */

import express, {
  Express,
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from 'express';
import {
  ServerWrapperInterface,
  ServerConfig,
  CustomMiddleware,
} from '../../core/application/interface/ServerWrapperInterface';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import {
  ApplicationError,
  ErrorCode,
  ErrorType,
} from '../../core/application/error/ApplicationError';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

interface ServerStats {
  uptime: number;
  requests: {
    total: number;
    success: number;
    error: number;
    notFound: number;
  };
  responseTime: {
    avg: number;
    min: number;
    max: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  activeConnections: number;
}

export class ExpressServer implements ServerWrapperInterface {
  private readonly app: Express;
  private readonly port: number;
  private readonly logger: WinstonLogger;
  private server: any;
  private isRunningFlag: boolean = false;
  private stats: ServerStats = {
    uptime: 0,
    requests: {
      total: 0,
      success: 0,
      error: 0,
      notFound: 0,
    },
    responseTime: {
      avg: 0,
      min: Infinity,
      max: 0,
    },
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
    activeConnections: 0,
  };

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.logger = new WinstonLogger();
    this.setupBaseMiddleware();
    this.setupMonitoring();
  }

  private setupBaseMiddleware(): void {
    // Seguridad
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      })
    );

    // Rate limiting
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // límite por IP
        message: 'Demasiadas solicitudes, por favor intente más tarde',
      })
    );

    // Compresión
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.updateStats(res.statusCode, duration);

        this.logger.info('Request completed', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('user-agent'),
          ip: req.ip,
        });
      });

      next();
    });
  }

  private setupMonitoring(): void {
    // Actualizar estadísticas cada minuto
    setInterval(() => {
      const used = process.memoryUsage();
      this.stats.memory = {
        used: used.heapUsed,
        total: used.heapTotal,
        percentage: (used.heapUsed / used.heapTotal) * 100,
      };
      this.stats.uptime = process.uptime();

      // Log de métricas
      this.logger.info('Server metrics', { stats: this.stats });

      // Alerta si el uso de memoria es alto
      if (this.stats.memory.percentage > 85) {
        this.logger.warn('High memory usage detected', {
          memoryUsage: this.stats.memory,
        });
      }
    }, 60000);

    // Endpoint de health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        ...this.stats,
      });
    });
  }

  private updateStats(statusCode: number, duration: number): void {
    // Actualizar contadores de requests
    this.stats.requests.total++;
    if (statusCode >= 500) {
      this.stats.requests.error++;
    } else if (statusCode === 404) {
      this.stats.requests.notFound++;
    } else if (statusCode < 400) {
      this.stats.requests.success++;
    }

    // Actualizar tiempos de respuesta
    const { responseTime } = this.stats;
    responseTime.min = Math.min(responseTime.min, duration);
    responseTime.max = Math.max(responseTime.max, duration);
    responseTime.avg =
      (responseTime.avg * (this.stats.requests.total - 1) + duration) /
      this.stats.requests.total;
  }

  async start(config: ServerConfig): Promise<void> {
    try {
      return new Promise(resolve => {
        this.server = this.app.listen(this.port, () => {
          this.isRunningFlag = true;
          this.logger.info(
            `✅ Server running on http://localhost:${this.port}`
          );
          this.logger.info(
            `📚 Swagger docs available at http://localhost:${this.port}/docs`
          );
          resolve();
        });

        // Manejo de errores del servidor
        this.server.on('error', (error: Error) => {
          this.logger.error('Server error', { error });
          throw new ApplicationError(
            'Error al iniciar el servidor',
            {
              type: ErrorType.INTERNAL,
              code: ErrorCode.SERVER_ERROR,
              httpStatus: 500,
              isOperational: false,
            },
            { error: error.message }
          );
        });

        // Tracking de conexiones activas
        this.server.on('connection', () => {
          this.stats.activeConnections++;
        });

        this.server.on('close', () => {
          this.stats.activeConnections--;
        });
      });
    } catch (error) {
      this.logger.error('Failed to start server', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error?: Error) => {
          if (error) {
            this.logger.error('Error stopping server', { error });
            reject(error);
            return;
          }
          this.isRunningFlag = false;
          this.logger.info('Server stopped gracefully');
          resolve();
        });

        // Cerrar conexiones existentes después de 10 segundos
        setTimeout(() => {
          if (this.stats.activeConnections > 0) {
            this.logger.warn(
              `Forcing close of ${this.stats.activeConnections} connections`
            );
            this.server.forceShutdown();
          }
        }, 10000);
      } else {
        resolve();
      }
    });
  }

  use(middleware: CustomMiddleware): void {
    this.app.use(middleware);
  }

  usePath(path: string, middleware: CustomMiddleware): void {
    this.app.use(path, middleware);
  }

  get(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.app.get(path, handler);
  }

  post(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.app.post(path, handler);
  }

  put(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.app.put(path, handler);
  }

  delete(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.app.delete(path, handler);
  }

  patch(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.app.patch(path, handler);
  }

  useRouter(path: string, router: any): void {
    this.app.use(path, router);
  }

  setErrorHandler(
    errorHandler: (
      error: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) => void
  ): void {
    this.app.use(errorHandler);
  }

  setNotFoundHandler(handler: (req: Request, res: Response) => void): void {
    this.app.use('*', handler);
  }

  async getStats(): Promise<{
    uptime: number;
    requests: number;
    errors: number;
    activeConnections: number;
  }> {
    return {
      uptime: this.stats.uptime,
      requests: this.stats.requests.total,
      errors: this.stats.requests.error,
      activeConnections: this.stats.activeConnections,
    };
  }

  isRunning(): boolean {
    return this.isRunningFlag;
  }

  getUrl(): string {
    return `http://localhost:${this.port}`;
  }

  // Métodos de conveniencia para compatibilidad
  registerRoute(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    ...handlers: RequestHandler[]
  ): void {
    this.app[method](path, ...handlers);
  }

  useMiddleware(...args: any[]): void {
    this.app.use(...args);
  }

  getApp(): Express {
    return this.app;
  }
}
