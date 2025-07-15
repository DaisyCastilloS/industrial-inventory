/**
 * @fileoverview Middleware de caché para respuestas HTTP
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        [key: string]: any;
      };
    }
  }
}

const logger = new WinstonLogger();

// Instancia global del caché
const cache = new NodeCache({
  stdTTL: 300, // 5 minutos por defecto
  checkperiod: 60, // Revisar expiración cada minuto
  useClones: false, // No clonar objetos para mejor rendimiento
  deleteOnExpire: true, // Eliminar automáticamente al expirar
});

/**
 * Genera una clave única para el caché basada en la request
 */
const generateCacheKey = (req: Request): string => {
  const baseKey = `${req.method}:${req.originalUrl}`;
  const queryKey =
    Object.keys(req.query).length > 0 ? `:${JSON.stringify(req.query)}` : '';
  const userKey = req.user?.id ? `:user${req.user.id}` : '';
  return `${baseKey}${queryKey}${userKey}`;
};

/**
 * Middleware de caché para respuestas HTTP
 * @param ttl Tiempo de vida en segundos
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // No cachear si hay errores
    if (res.statusCode !== 200) {
      return next();
    }

    const key = generateCacheKey(req);

    try {
      // Intentar obtener del caché
      const cachedResponse = cache.get(key);
      if (cachedResponse) {
        logger.debug('Cache hit', { key });
        return res.json(cachedResponse);
      }

      // Si no está en caché, interceptar la respuesta
      const originalJson = res.json;
      res.json = function (body: any) {
        // Guardar en caché antes de enviar
        cache.set(key, body, ttl);
        logger.debug('Cache set', { key, ttl });
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Error en cache middleware:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next();
    }
  };
};

/**
 * Invalida el caché para una ruta específica
 */
export const invalidateCache = (pattern: string): void => {
  const keys = cache.keys();
  const matchingKeys = keys.filter((key: string) => key.includes(pattern));
  cache.del(matchingKeys);
  logger.debug('Cache invalidated', { pattern, count: matchingKeys.length });
};

/**
 * Obtiene estadísticas del caché
 */
export const getCacheStats = (): {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
} => {
  return cache.getStats();
};
