/**
 * @fileoverview Implementación del servicio de encriptación
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { EncryptionInterface } from '../../02-application/interface/EncryptionInterface';

/**
 * Implementación del servicio de encriptación
 */
export class EncryptionService implements EncryptionInterface {
  private readonly saltRounds: number;
  private readonly algorithm: string;
  private readonly secretKey: string;

  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPTION_SECRET_KEY || 'default-secret-key-change-in-production';
  }

  /**
   * Encripta una contraseña
   * @param password - Contraseña a encriptar
   * @returns Contraseña encriptada
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error(`Error al encriptar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica una contraseña contra su hash
   * @param password - Contraseña a verificar
   * @param hash - Hash de la contraseña
   * @returns true si la contraseña coincide
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Error al verificar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Encripta datos sensibles
   * @param data - Datos a encriptar
   * @returns Datos encriptados
   */
  async encrypt(data: string): Promise<string> {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.secretKey);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Error al encriptar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Desencripta datos sensibles
   * @param encryptedData - Datos encriptados
   * @returns Datos desencriptados
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      
      const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Error al desencriptar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera un token seguro
   * @param length - Longitud del token
   * @returns Token generado
   */
  async generateSecureToken(length: number = 32): Promise<string> {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      throw new Error(`Error al generar token seguro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera un salt para encriptación
   * @param rounds - Número de rondas
   * @returns Salt generado
   */
  async generateSalt(rounds: number = 12): Promise<string> {
    try {
      return await bcrypt.genSalt(rounds);
    } catch (error) {
      throw new Error(`Error al generar salt: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Alias para hashPassword - compatibilidad con tests
   * @param password - Contraseña a encriptar
   * @returns Contraseña encriptada
   */
  async hash(password: string): Promise<string> {
    return this.hashPassword(password);
  }

  /**
   * Alias para verifyPassword - compatibilidad con tests
   * @param password - Contraseña a verificar
   * @param hash - Hash de la contraseña
   * @returns true si la contraseña coincide
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return this.verifyPassword(password, hash);
  }
}
