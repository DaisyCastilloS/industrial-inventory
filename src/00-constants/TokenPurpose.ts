/**
 * @fileoverview Constantes para propósitos de tokens JWT
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Propósitos de tokens JWT
 * @enum {string}
 */
export enum TokenPurpose {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}

/**
 * Configuración de expiración de tokens (en segundos)
 * @enum {number}
 */
export enum TokenExpiration {
  ACCESS_TOKEN = 3600, // 1 hora
  REFRESH_TOKEN = 2592000, // 30 días
  RESET_PASSWORD = 1800, // 30 minutos
  VERIFY_EMAIL = 3600, // 1 hora
}

/**
 * Configuración de rate limiting
 * @enum {number}
 */
export enum RateLimit {
  LOGIN_ATTEMPTS = 5, // intentos por IP
  LOGIN_WINDOW = 900, // 15 minutos
  API_REQUESTS = 100, // requests por minuto
  API_WINDOW = 60, // 1 minuto
}
