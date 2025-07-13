/**
 * @fileoverview Implementación del servicio JWT
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import { JWTInterface, JWTPayload } from '../../02-application/interface/JWTInterface';
import { CustomJWTPayload } from '../../02-application/interface/CustomJWTPayload';
import { TokenExpiration } from '../../00-constants/TokenPurpose';

/**
 * Implementación del servicio JWT
 */
export class JWTService implements JWTInterface {
  private readonly secretKey: string;
  private readonly refreshSecretKey: string;
  private revokedTokens: Set<string> = new Set();

  constructor() {
    this.secretKey = process.env.JWT_SECRET_KEY || 'default-jwt-secret-change-in-production';
    this.refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY || 'default-refresh-secret-change-in-production';
  }

  /**
   * Genera un token JWT
   * @param payload - Payload del token
   * @param purpose - Propósito del token
   * @returns Token JWT generado
   */
  async generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, purpose: string): Promise<string> {
    try {
      const secret = purpose === 'REFRESH' ? this.refreshSecretKey : this.secretKey;
      const expiration = this.getExpirationTime(purpose);
      
      const tokenPayload: CustomJWTPayload = {
        ...payload,
        purpose: purpose as any,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiration
      };

      return jwt.sign(tokenPayload, secret, {
        expiresIn: expiration,
        issuer: 'industrial-inventory-api',
        audience: 'industrial-inventory-users'
      });
    } catch (error) {
      throw new Error(`Error al generar token JWT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token a verificar
   * @param purpose - Propósito esperado del token
   * @returns Payload del token
   */
  async verifyToken(token: string, purpose: string): Promise<JWTPayload> {
    try {
      // Verificar si el token está revocado
      if (this.revokedTokens.has(token)) {
        throw new Error('Token revocado');
      }

      const secret = purpose === 'REFRESH' ? this.refreshSecretKey : this.secretKey;
      
      const decoded = jwt.verify(token, secret, {
        issuer: 'industrial-inventory-api',
        audience: 'industrial-inventory-users'
      }) as CustomJWTPayload;

      // Verificar que el propósito coincida
      if (decoded.purpose !== purpose) {
        throw new Error('Propósito del token no coincide');
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        purpose: decoded.purpose,
        iat: decoded.iat,
        exp: decoded.exp
      };
    } catch (error) {
      throw new Error(`Error al verificar token JWT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Refresca un token JWT
   * @param refreshToken - Token de refresh
   * @returns Nuevo token de acceso
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.verifyToken(refreshToken, 'REFRESH');
      
      // Generar nuevo token de acceso
      return await this.generateToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      }, 'ACCESS');
    } catch (error) {
      throw new Error(`Error al refrescar token: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Revoca un token JWT
   * @param token - Token a revocar
   */
  async revokeToken(token: string): Promise<void> {
    try {
      this.revokedTokens.add(token);
      
      // Limpiar tokens revocados antiguos (más de 24 horas)
      setTimeout(() => {
        this.revokedTokens.delete(token);
      }, 24 * 60 * 60 * 1000);
    } catch (error) {
      throw new Error(`Error al revocar token: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica si un token está expirado
   * @param token - Token a verificar
   * @returns true si está expirado
   */
  async isTokenExpired(token: string): Promise<boolean> {
    try {
      const decoded = jwt.decode(token) as CustomJWTPayload;
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtiene el tiempo restante de un token
   * @param token - Token a verificar
   * @returns Tiempo restante en segundos
   */
  async getTokenTimeRemaining(token: string): Promise<number> {
    try {
      const decoded = jwt.decode(token) as CustomJWTPayload;
      if (!decoded || !decoded.exp) {
        return 0;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - currentTime);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtiene el tiempo de expiración según el propósito
   * @param purpose - Propósito del token
   * @returns Tiempo de expiración en segundos
   */
  private getExpirationTime(purpose: string): number {
    switch (purpose) {
      case 'ACCESS':
        return TokenExpiration.ACCESS_TOKEN;
      case 'REFRESH':
        return TokenExpiration.REFRESH_TOKEN;
      case 'RESET_PASSWORD':
        return TokenExpiration.RESET_PASSWORD;
      case 'VERIFY_EMAIL':
        return TokenExpiration.VERIFY_EMAIL;
      default:
        return TokenExpiration.ACCESS_TOKEN;
    }
  }
}
