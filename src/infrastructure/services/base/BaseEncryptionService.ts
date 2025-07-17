/**
 * @fileoverview Clase base para servicios de encriptación
 * @author Daisy Castillo
 * @version 1.0.0
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { EncryptionInterface } from '../../../core/application/interface/EncryptionInterface';
import {
  ApplicationError,
  ErrorCode,
  ErrorType,
} from '../../../core/application/error/ApplicationError';

interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Clase base para servicios de encriptación
 */
export abstract class BaseEncryptionService implements EncryptionInterface {
  protected readonly saltRounds: number;
  protected readonly algorithm: string;
  protected readonly secretKey: Buffer;
  protected readonly keyLength: number;
  protected readonly minPasswordLength: number;
  protected readonly maxPasswordLength: number;
  protected readonly minSaltRounds: number = 10;
  protected readonly maxSaltRounds: number = 20;

  constructor() {
    this.validateEnvironmentVariables();
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.algorithm = 'aes-256-gcm'; // Usando GCM para autenticación
    this.keyLength = 32; // 256 bits
    this.minPasswordLength = 8;
    this.maxPasswordLength = 72; // Límite de bcrypt
    this.secretKey = this.deriveKey(
      process.env.ENCRYPTION_SECRET_KEY ||
        'default-secret-key-change-in-production',
      process.env.ENCRYPTION_SALT || 'default-salt-change-in-production'
    );
  }

  private validateEnvironmentVariables(): void {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ENCRYPTION_SECRET_KEY) {
        throw new ApplicationError(
          'ENCRYPTION_SECRET_KEY no está configurada en producción',
          {
            type: ErrorType.INTERNAL,
            code: ErrorCode.INVALID_CONFIG,
            httpStatus: 500,
            isOperational: false,
          }
        );
      }
      if (!process.env.ENCRYPTION_SALT) {
        throw new ApplicationError(
          'ENCRYPTION_SALT no está configurada en producción',
          {
            type: ErrorType.INTERNAL,
            code: ErrorCode.INVALID_CONFIG,
            httpStatus: 500,
            isOperational: false,
          }
        );
      }
    }
  }

  private deriveKey(password: string, salt: string): Buffer {
    return crypto.scryptSync(password, salt, this.keyLength);
  }

  private validatePassword(password: string): void {
    if (typeof password !== 'string') {
      throw new ApplicationError('La contraseña debe ser una cadena de texto', {
        type: ErrorType.VALIDATION,
        code: ErrorCode.INVALID_INPUT,
        httpStatus: 400,
        isOperational: true,
      });
    }

    if (password.length < this.minPasswordLength) {
      throw new ApplicationError(
        `La contraseña debe tener al menos ${this.minPasswordLength} caracteres`,
        {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        }
      );
    }

    if (password.length > this.maxPasswordLength) {
      throw new ApplicationError(
        `La contraseña no puede tener más de ${this.maxPasswordLength} caracteres`,
        {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        }
      );
    }

    // Validar caracteres especiales
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new ApplicationError(
        'La contraseña debe contener al menos un carácter especial',
        {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        }
      );
    }

    // Validar números
    if (!/\d/.test(password)) {
      throw new ApplicationError(
        'La contraseña debe contener al menos un número',
        {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        }
      );
    }

    // Validar mayúsculas
    if (!/[A-Z]/.test(password)) {
      throw new ApplicationError(
        'La contraseña debe contener al menos una letra mayúscula',
        {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        }
      );
    }

    // Validar minúsculas
    if (!/[a-z]/.test(password)) {
      throw new ApplicationError(
        'La contraseña debe contener al menos una letra minúscula',
        {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        }
      );
    }
  }

  /**
   * Encripta una contraseña usando bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      this.validatePassword(password);
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al encriptar contraseña',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.ENCRYPTION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Verifica una contraseña contra su hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      this.validatePassword(password);

      if (!hash || typeof hash !== 'string' || !hash.startsWith('$2')) {
        throw new ApplicationError('Hash inválido', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_FORMAT,
          httpStatus: 400,
          isOperational: true,
        });
      }

      return await bcrypt.compare(password, hash);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al verificar contraseña',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.ENCRYPTION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Encripta datos sensibles usando AES-256-GCM
   */
  async encrypt(data: string): Promise<string> {
    try {
      if (typeof data !== 'string') {
        throw new ApplicationError('Los datos a encriptar deben ser una cadena de texto', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_FORMAT,
          httpStatus: 400,
          isOperational: true,
        });
      }

      // Special marker for empty string
      if (data === '') {
        return 'EMPTY_STRING';
      }

      const iv = crypto.randomBytes(12); // GCM recomienda 12 bytes
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.secretKey,
        iv
      ) as crypto.CipherGCM;

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag().toString('hex');

      // Combinar IV, tag y datos encriptados en un solo string
      return `${iv.toString('hex')}:${tag}:${encrypted}`;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al encriptar datos',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.ENCRYPTION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Desencripta datos usando AES-256-GCM
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      if (typeof encryptedData !== 'string') {
        throw new ApplicationError('Los datos encriptados deben ser una cadena de texto', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_FORMAT,
          httpStatus: 400,
          isOperational: true,
        });
      }

      // Check for empty string marker
      if (encryptedData === 'EMPTY_STRING') {
        return '';
      }

      const [ivHex, tagHex, encryptedHex] = encryptedData.split(':');

      if (!ivHex || !tagHex || !encryptedHex) {
        throw new ApplicationError('Formato de datos encriptados inválido', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_FORMAT,
          httpStatus: 400,
          isOperational: true,
        });
      }

      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.secretKey,
        iv
      ) as crypto.DecipherGCM;

      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al desencriptar datos',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.DECRYPTION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Genera un token seguro usando crypto
   */
  async generateSecureToken(length: number = 32): Promise<string> {
    try {
      if (length < 16 || length > 128) {
        throw new ApplicationError(
          'La longitud del token debe estar entre 16 y 128 caracteres',
          {
            type: ErrorType.VALIDATION,
            code: ErrorCode.INVALID_INPUT,
            httpStatus: 400,
            isOperational: true,
          }
        );
      }

      const buffer = crypto.randomBytes(length);
      return buffer.toString('hex');
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al generar token seguro',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.TOKEN_GENERATION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Genera un salt usando bcrypt
   */
  async generateSalt(rounds: number = 12): Promise<string> {
    try {
      if (rounds < this.minSaltRounds || rounds > this.maxSaltRounds) {
        throw new ApplicationError(
          `El número de rondas debe estar entre ${this.minSaltRounds} y ${this.maxSaltRounds}`,
          {
            type: ErrorType.VALIDATION,
            code: ErrorCode.INVALID_INPUT,
            httpStatus: 400,
            isOperational: true,
          }
        );
      }

      return await bcrypt.genSalt(rounds);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al generar salt',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.ENCRYPTION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Genera un hash usando bcrypt
   */
  async hash(password: string): Promise<string> {
    return this.hashPassword(password);
  }

  /**
   * Compara una contraseña con su hash usando bcrypt
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return this.verifyPassword(password, hash);
  }
}
