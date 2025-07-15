/**
 * @fileoverview Sistema de cache para estadísticas de AuditLog
 * @author Daisy Castillo
 * @version 1.0.0
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
}

/**
 * Sistema de cache para optimizar consultas de estadísticas de auditoría
 */
export class AuditLogCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: parseInt(process.env.AUDIT_LOG_CACHE_TTL || '300000'), // 5 minutos
      maxSize: parseInt(process.env.AUDIT_LOG_CACHE_MAX_SIZE || '1000'),
      cleanupInterval: parseInt(
        process.env.AUDIT_LOG_CACHE_CLEANUP_INTERVAL || '60000'
      ), // 1 minuto
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * Obtiene datos del cache o los obtiene de la función proporcionada
   */
  async getCachedStats<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    // Verificar si el cache es válido
    if (entry && now - entry.timestamp < entryTTL) {
      return entry.data;
    }

    // Obtener datos frescos
    const data = await fetchFn();

    // Guardar en cache
    this.setCacheEntry(key, data, entryTTL);

    return data;
  }

  /**
   * Establece una entrada en el cache
   */
  private setCacheEntry<T>(key: string, data: T, ttl: number): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Elimina la entrada más antigua del cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Limpia entradas expiradas del cache
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Inicia el timer de limpieza automática
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Obtiene estadísticas del cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Se puede implementar tracking de hits/misses
      missRate: 0,
    };
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtiene una entrada específica del cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data;
    }
    return null;
  }

  /**
   * Establece una entrada en el cache manualmente
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.setCacheEntry(key, data, ttl || this.config.defaultTTL);
  }

  /**
   * Elimina una entrada específica del cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Verifica si una clave existe en el cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Obtiene todas las claves del cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Detiene el timer de limpieza
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

/**
 * Instancia global del cache de auditoría
 */
export const auditLogCache = new AuditLogCache();

/**
 * Decorador para cachear métodos automáticamente
 */
export function Cached(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`;

      return auditLogCache.getCachedStats(
        key,
        () => originalMethod.apply(this, args),
        ttl
      );
    };

    return descriptor;
  };
}
