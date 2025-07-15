/**
 * @fileoverview Interfaz para el wrapper del servidor Express
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Configuración del servidor
 */
export interface ServerConfig {
  port: number;
  host?: string;
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  compression?: boolean;
  trustProxy?: boolean;
}

/**
 * Middleware personalizado
 */
export type CustomMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Interfaz para el wrapper del servidor Express
 */
export interface ServerWrapperInterface {
  /**
   * Inicia el servidor
   * @param config - Configuración del servidor
   */
  start(config: ServerConfig): Promise<void>;

  /**
   * Detiene el servidor
   */
  stop(): Promise<void>;

  /**
   * Agrega middleware global
   * @param middleware - Middleware a agregar
   */
  use(middleware: CustomMiddleware): void;

  /**
   * Agrega middleware para una ruta específica
   * @param path - Ruta
   * @param middleware - Middleware a agregar
   */
  usePath(path: string, middleware: CustomMiddleware): void;

  /**
   * Agrega una ruta GET
   * @param path - Ruta
   * @param handler - Manejador de la ruta
   */
  get(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void;

  /**
   * Agrega una ruta POST
   * @param path - Ruta
   * @param handler - Manejador de la ruta
   */
  post(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void;

  /**
   * Agrega una ruta PUT
   * @param path - Ruta
   * @param handler - Manejador de la ruta
   */
  put(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void;

  /**
   * Agrega una ruta DELETE
   * @param path - Ruta
   * @param handler - Manejador de la ruta
   */
  delete(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void;

  /**
   * Agrega una ruta PATCH
   * @param path - Ruta
   * @param handler - Manejador de la ruta
   */
  patch(
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>
  ): void;

  /**
   * Agrega un router
   * @param path - Ruta base
   * @param router - Router a agregar
   */
  useRouter(path: string, router: any): void;

  /**
   * Configura el manejo de errores
   * @param errorHandler - Manejador de errores
   */
  setErrorHandler(
    errorHandler: (
      error: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) => void
  ): void;

  /**
   * Configura el manejo de rutas no encontradas
   * @param handler - Manejador para rutas no encontradas
   */
  setNotFoundHandler(handler: (req: Request, res: Response) => void): void;

  /**
   * Obtiene estadísticas del servidor
   * @returns Estadísticas del servidor
   */
  getStats(): Promise<{
    uptime: number;
    requests: number;
    errors: number;
    activeConnections: number;
  }>;

  /**
   * Verifica si el servidor está ejecutándose
   * @returns true si está ejecutándose
   */
  isRunning(): boolean;

  /**
   * Obtiene la URL del servidor
   * @returns URL del servidor
   */
  getUrl(): string;
}
