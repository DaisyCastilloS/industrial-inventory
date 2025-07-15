/**
 * @fileoverview Utilidades para seguridad
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import crypto from 'crypto';
import { SecurityConfig } from '../constants/TokenPurpose';

/**
 * Genera un hash seguro
 */
export function generateHash(data: string, salt?: string): string {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(
      data,
      useSalt,
      SecurityConfig.DEFAULT_HASH_ROUNDS,
      SecurityConfig.MIN_KEY_LENGTH,
      'sha512'
    )
    .toString('hex');

  return `${useSalt}:${hash}`;
}

/**
 * Verifica un hash
 */
export function verifyHash(data: string, hashWithSalt: string): boolean {
  const [salt, originalHash] = hashWithSalt.split(':');
  const hash = crypto
    .pbkdf2Sync(
      data,
      salt,
      SecurityConfig.DEFAULT_HASH_ROUNDS,
      SecurityConfig.MIN_KEY_LENGTH,
      'sha512'
    )
    .toString('hex');

  return hash === originalHash;
}

/**
 * Genera un token aleatorio
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Genera un ID único
 */
export function generateUniqueId(): string {
  return crypto.randomUUID();
}

/**
 * Genera un nonce aleatorio
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Sanitiza una cadena para prevenir XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza un objeto para prevenir XSS
 */
export function sanitizeObject<T extends object>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key] as object) as any;
    }
  }
  return sanitized;
}

/**
 * Genera un hash para CSRF
 */
export function generateCSRFToken(sessionId: string): string {
  return crypto
    .createHmac('sha256', process.env.CSRF_SECRET || 'default-csrf-secret')
    .update(sessionId)
    .digest('hex');
}

/**
 * Verifica un token CSRF
 */
export function verifyCSRFToken(token: string, sessionId: string): boolean {
  const expectedToken = generateCSRFToken(sessionId);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

/**
 * Genera una clave de API
 */
export function generateApiKey(userId: number, scope: string[] = []): string {
  const payload = {
    userId,
    scope,
    timestamp: Date.now(),
  };

  const key = crypto
    .createHmac(
      'sha256',
      process.env.API_KEY_SECRET || 'default-api-key-secret'
    )
    .update(JSON.stringify(payload))
    .digest('hex');

  return `${Buffer.from(JSON.stringify(payload)).toString('base64')}.${key}`;
}

/**
 * Verifica una clave de API
 */
export function verifyApiKey(apiKey: string): {
  isValid: boolean;
  payload?: {
    userId: number;
    scope: string[];
    timestamp: number;
  };
} {
  try {
    const [payloadBase64, key] = apiKey.split('.');
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    const expectedKey = crypto
      .createHmac(
        'sha256',
        process.env.API_KEY_SECRET || 'default-api-key-secret'
      )
      .update(JSON.stringify(payload))
      .digest('hex');

    if (key !== expectedKey) {
      return { isValid: false };
    }

    return {
      isValid: true,
      payload,
    };
  } catch {
    return { isValid: false };
  }
}

/**
 * Genera un hash para caché
 */
export function generateCacheKey(
  ...parts: (string | number | boolean)[]
): string {
  return crypto.createHash('sha256').update(parts.join(':')).digest('hex');
}

/**
 * Genera un hash para firma de archivos
 */
export function generateFileSignature(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Verifica una firma de archivo
 */
export function verifyFileSignature(
  buffer: Buffer,
  signature: string
): boolean {
  const calculatedSignature = generateFileSignature(buffer);
  return calculatedSignature === signature;
}
