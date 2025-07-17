/**
 * @fileoverview Interfaz para el servicio JWT
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { TokenPurpose } from '../../../shared/constants/TokenPurpose';

/**
 * Payload del token JWT
 */
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  purpose: TokenPurpose;
  iat?: number;
  exp?: number;
}

/**
 * Interfaz para el servicio JWT
 */
export interface JWTInterface {
  /**
   * Genera un token JWT
   * @param payload - Payload del token
   * @param purpose - Propósito del token
   * @returns Token JWT generado
   */
  generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    purpose: TokenPurpose
  ): Promise<string>;

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token a verificar
   * @param purpose - Propósito esperado del token
   * @returns Payload del token
   */
  verifyToken(token: string, purpose: TokenPurpose): Promise<JWTPayload>;

  /**
   * Refresca un token JWT
   * @param refreshToken - Token de refresh
   * @returns Nuevo token de acceso
   */
  refreshToken(refreshToken: string): Promise<string>;

  /**
   * Revoca un token JWT
   * @param token - Token a revocar
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Verifica si un token está expirado
   * @param token - Token a verificar
   * @returns true si está expirado
   */
  isTokenExpired(token: string): Promise<boolean>;

  /**
   * Obtiene el tiempo restante de un token
   * @param token - Token a verificar
   * @returns Tiempo restante en segundos
   */
  getTokenTimeRemaining(token: string): Promise<number>;
}
