/**
 * @fileoverview Interfaz para el servicio de encriptación
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Interfaz para el servicio de encriptación
 */
export interface EncryptionInterface {
  /**
   * Encripta una contraseña
   * @param password - Contraseña a encriptar
   * @returns Contraseña encriptada
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Verifica una contraseña contra su hash
   * @param password - Contraseña a verificar
   * @param hash - Hash de la contraseña
   * @returns true si la contraseña coincide
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;

  /**
   * Encripta datos sensibles
   * @param data - Datos a encriptar
   * @returns Datos encriptados
   */
  encrypt(data: string): Promise<string>;

  /**
   * Desencripta datos sensibles
   * @param encryptedData - Datos encriptados
   * @returns Datos desencriptados
   */
  decrypt(encryptedData: string): Promise<string>;

  /**
   * Genera un token seguro
   * @param length - Longitud del token
   * @returns Token generado
   */
  generateSecureToken(length?: number): Promise<string>;

  /**
   * Genera un salt para encriptación
   * @param rounds - Número de rondas
   * @returns Salt generado
   */
  generateSalt(rounds?: number): Promise<string>;
}
