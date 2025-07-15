/**
 * @fileoverview Constantes para configuración de seguridad y tokens
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
  API_KEY = 'API_KEY',
  TEMPORARY_ACCESS = 'TEMPORARY_ACCESS',
  IMPERSONATION = 'IMPERSONATION',
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
  API_KEY = 31536000, // 1 año
  TEMPORARY_ACCESS = 1800, // 30 minutos
  IMPERSONATION = 3600, // 1 hora
}

/**
 * Configuración de rate limiting
 * @enum {number}
 */
export enum RateLimit {
  // Autenticación
  LOGIN_ATTEMPTS = 5, // intentos por IP
  LOGIN_WINDOW = 900, // 15 minutos
  PASSWORD_RESET_ATTEMPTS = 3, // intentos por email
  PASSWORD_RESET_WINDOW = 3600, // 1 hora

  // API
  API_REQUESTS = 100, // requests por minuto
  API_WINDOW = 60, // 1 minuto
  API_BURST = 20, // requests en ráfaga

  // Endpoints específicos
  SEARCH_REQUESTS = 30, // búsquedas por minuto
  EXPORT_REQUESTS = 5, // exportaciones por hora
  REPORT_REQUESTS = 10, // reportes por hora
}

/**
 * Configuración de seguridad
 */
export const SecurityConfig = {
  // Contraseñas
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 72, // Límite de bcrypt
  MIN_SPECIAL_CHARS: 1,
  MIN_NUMBERS: 1,
  MIN_UPPERCASE: 1,

  // Sesiones
  MAX_SESSIONS_PER_USER: 5,
  SESSION_INACTIVITY_TIMEOUT: 1800, // 30 minutos

  // Tokens
  TOKEN_ROTATION_ENABLED: true,
  TOKEN_REUSE_DETECTION: true,
  TOKEN_BLACKLIST_SIZE: 10000,
  TOKEN_BLACKLIST_CLEANUP: 86400, // 24 horas

  // Cifrado
  ENCRYPTION_KEY_ROTATION: 90, // días
  MIN_KEY_LENGTH: 32, // bytes
  DEFAULT_HASH_ROUNDS: 12,
} as const;

/**
 * Headers de seguridad
 * @enum {string}
 */
export enum SecurityHeaders {
  CONTENT_SECURITY_POLICY = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self';",
  X_FRAME_OPTIONS = 'DENY',
  X_CONTENT_TYPE_OPTIONS = 'nosniff',
  REFERRER_POLICY = 'strict-origin-when-cross-origin',
  PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=()',
  STRICT_TRANSPORT_SECURITY = 'max-age=31536000; includeSubDomains',
}

/**
 * Configuración de cookies
 */
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 86400000, // 24 horas
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined,
  signed: true,
} as const;

/**
 * Configuración de CORS
 */
export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24 horas
} as const;
