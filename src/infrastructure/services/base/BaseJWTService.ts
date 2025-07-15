/**
 * @fileoverview Servicio base para manejo de JWT
 * @author Daisy Castillo
 * @version 1.0.0
 */

import jwt, { SignOptions, VerifyOptions, JwtHeader } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { WinstonLogger } from '../../logger/WinstonLogger';
import { JWTInterface, JWTPayload } from '../../../core/application/interface/JWTInterface';
import { CustomJWTPayload } from '../../../core/application/interface/CustomJWTPayload';
import { TokenPurpose, TokenExpiration } from '../../../shared/constants/TokenPurpose';
import { ApplicationError, ErrorCode, ErrorType } from '../../../core/application/error/ApplicationError';
import { LoggerWrapperInterface } from '../../../core/application/interface/LoggerWrapperInterface';

interface JWTOptions extends SignOptions {
  header?: JwtHeader;
}

export abstract class BaseJWTService implements JWTInterface {
  protected readonly secretKey: Buffer;
  protected readonly refreshSecretKey: Buffer;
  protected readonly revokedTokens: Map<string, number> = new Map();
  protected readonly logger: LoggerWrapperInterface;
  protected readonly defaultOptions: JWTOptions;
  protected readonly defaultVerifyOptions: VerifyOptions;

  constructor() {
    this.validateEnvironmentVariables();
    this.logger = new WinstonLogger();

    // Initialize secret keys with proper length
    const defaultSecret = randomBytes(32).toString('hex');
    const defaultRefreshSecret = randomBytes(32).toString('hex');

    // Convert secret keys to Buffer
    this.secretKey = Buffer.from(process.env.JWT_SECRET_KEY || defaultSecret, 'hex');
    this.refreshSecretKey = Buffer.from(process.env.JWT_REFRESH_SECRET_KEY || defaultRefreshSecret, 'hex');

    const audience = 'industrial-inventory-users';
    const issuer = 'industrial-inventory-api';

    this.defaultOptions = {
      algorithm: 'HS256', // Changed from HS512 to HS256 for better compatibility
      audience,
      issuer,
    };

    this.defaultVerifyOptions = {
      algorithms: ['HS256'], // Changed from HS512 to HS256 for better compatibility
      audience,
      issuer,
    };

    // Limpiar tokens revocados periódicamente
    const cleanupInterval = setInterval(() => this.cleanupRevokedTokens(), 60 * 60 * 1000); // Cada hora
    cleanupInterval.unref(); // Allow the process to exit even if interval is running
  }

  private validateEnvironmentVariables(): void {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET_KEY) {
        throw new ApplicationError(
          'JWT_SECRET_KEY no está configurada en producción',
          {
            type: ErrorType.INTERNAL,
            code: ErrorCode.INVALID_CONFIG,
            httpStatus: 500,
            isOperational: false,
          }
        );
      }
      if (!process.env.JWT_REFRESH_SECRET_KEY) {
        throw new ApplicationError(
          'JWT_REFRESH_SECRET_KEY no está configurada en producción',
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

  private cleanupRevokedTokens(): void {
    const now = Date.now();
    for (const [token, expirationTime] of this.revokedTokens.entries()) {
      if (now >= expirationTime) {
        this.revokedTokens.delete(token);
      }
    }
  }

  private validateTokenPayload(payload: any): void {
    if (!payload.userId || !payload.email || !payload.role) {
      throw new ApplicationError('Payload del token inválido', {
        type: ErrorType.VALIDATION,
        code: ErrorCode.INVALID_INPUT,
        httpStatus: 400,
        isOperational: true,
      });
    }
  }

  /**
   * Genera un token JWT
   */
  async generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    purpose: TokenPurpose
  ): Promise<string> {
    try {
      this.validateTokenPayload(payload);

      // Validar que el propósito sea válido
      if (!Object.values(TokenPurpose).includes(purpose)) {
        throw new ApplicationError('Propósito de token inválido', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_INPUT,
          httpStatus: 400,
          isOperational: true,
        });
      }

      const secret =
        purpose === TokenPurpose.REFRESH ? this.refreshSecretKey : this.secretKey;
      const expiration = this.getExpirationTime(purpose);

      const tokenPayload: CustomJWTPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        purpose,
        iat: Math.floor(Date.now() / 1000),
        // Remove exp property - let the library handle it with expiresIn option
      };

      const options: JWTOptions = {
        ...this.defaultOptions,
        expiresIn: expiration,
        jwtid: randomBytes(16).toString('hex'),
      };

      try {
        console.log('=== DEBUG JWT ===');
        console.log('Payload:', JSON.stringify(tokenPayload, null, 2));
        console.log('Secret length:', secret.length);
        console.log('Options:', JSON.stringify(options, null, 2));
        console.log('Purpose:', purpose);
        console.log('==================');

        this.logger.error('Intentando generar token JWT', {
          payload: tokenPayload,
          secretLength: secret.length,
          options,
          purpose,
        });

        const token = jwt.sign(tokenPayload, secret, options);

        console.log('=== TOKEN GENERATED ===');
        console.log('Token length:', token.length);
        console.log('=======================');

        this.logger.error('Token JWT generado exitosamente', {
          userId: payload.userId,
          purpose,
          expiresIn: expiration,
          tokenLength: token.length,
        });

        return token;
      } catch (signError) {
        console.log('=== JWT ERROR ===');
        console.log('Error:', signError);
        console.log('Error message:', signError instanceof Error ? signError.message : 'Unknown error');
        console.log('Error stack:', signError instanceof Error ? signError.stack : 'No stack');
        console.log('==================');

        this.logger.error('Error al firmar token JWT', {
          error: signError instanceof Error ? signError.message : 'Error desconocido',
          errorStack: signError instanceof Error ? signError.stack : undefined,
          userId: payload.userId,
          purpose,
          payload: tokenPayload,
          secretLength: secret.length,
          options,
        });
        throw new ApplicationError(
          'Error al generar token JWT',
          {
            type: ErrorType.INTERNAL,
            code: ErrorCode.TOKEN_GENERATION_ERROR,
            httpStatus: 500,
            isOperational: true,
          },
          { error: signError instanceof Error ? signError.message : 'Error desconocido' }
        );
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      this.logger.error('Error inesperado al generar token JWT', {
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      throw new ApplicationError(
        'Error al generar token JWT',
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
   * Verifica y decodifica un token JWT
   */
  async verifyToken(token: string, purpose: TokenPurpose): Promise<JWTPayload> {
    try {
      if (this.revokedTokens.has(token)) {
        throw new ApplicationError('Token revocado', {
          type: ErrorType.UNAUTHORIZED,
          code: ErrorCode.TOKEN_REVOKED,
          httpStatus: 401,
          isOperational: true,
        });
      }

      const secret =
        purpose === TokenPurpose.REFRESH ? this.refreshSecretKey : this.secretKey;

      const decoded = jwt.verify(
        token,
        secret,
        this.defaultVerifyOptions
      ) as unknown as CustomJWTPayload;

      if (decoded.purpose !== purpose) {
        throw new ApplicationError('Propósito del token no coincide', {
          type: ErrorType.UNAUTHORIZED,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 401,
          isOperational: true,
        });
      }

      if (!decoded.exp) {
        throw new ApplicationError(
          'Token inválido: falta fecha de expiración',
          {
            type: ErrorType.UNAUTHORIZED,
            code: ErrorCode.INVALID_TOKEN,
            httpStatus: 401,
            isOperational: true,
          }
        );
      }

      this.logger.debug('Token JWT verificado', {
        userId: decoded.userId,
        purpose,
        expiresIn: decoded.exp - Math.floor(Date.now() / 1000),
      });

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        purpose: decoded.purpose,
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApplicationError('Token expirado', {
          type: ErrorType.UNAUTHORIZED,
          code: ErrorCode.TOKEN_EXPIRED,
          httpStatus: 401,
          isOperational: true,
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApplicationError('Token inválido', {
          type: ErrorType.UNAUTHORIZED,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 401,
          isOperational: true,
        });
      }
      throw new ApplicationError(
        'Error al verificar token JWT',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.TOKEN_VERIFICATION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Refresca un token JWT
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.verifyToken(refreshToken, TokenPurpose.REFRESH);

      // Revocar el token de refresco usado
      await this.revokeToken(refreshToken);

      return await this.generateToken(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          purpose: TokenPurpose.ACCESS,
        },
        TokenPurpose.ACCESS
      );
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al refrescar token',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.TOKEN_REFRESH_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Revoca un token JWT
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as CustomJWTPayload;
      if (!decoded || !decoded.exp) {
        throw new ApplicationError('Token inválido', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 400,
          isOperational: true,
        });
      }

      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      this.revokedTokens.set(token, expirationTime);

      this.logger.debug('Token JWT revocado', {
        userId: decoded.userId,
        purpose: decoded.purpose,
        expiresAt: new Date(expirationTime).toISOString(),
      });
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        'Error al revocar token',
        {
          type: ErrorType.INTERNAL,
          code: ErrorCode.TOKEN_REVOCATION_ERROR,
          httpStatus: 500,
          isOperational: true,
        },
        { error: error instanceof Error ? error.message : 'Error desconocido' }
      );
    }
  }

  /**
   * Verifica si un token está expirado
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
      this.logger.debug('Error al verificar expiración del token', {
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      return true;
    }
  }

  /**
   * Obtiene el tiempo restante de un token
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
      this.logger.debug('Error al obtener tiempo restante del token', {
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      return 0;
    }
  }

  /**
   * Obtiene el tiempo de expiración según el propósito
   */
  protected getExpirationTime(purpose: TokenPurpose): number {
    switch (purpose) {
      case TokenPurpose.ACCESS:
        return TokenExpiration.ACCESS_TOKEN;
      case TokenPurpose.REFRESH:
        return TokenExpiration.REFRESH_TOKEN;
      case TokenPurpose.RESET_PASSWORD:
        return TokenExpiration.RESET_PASSWORD;
      case TokenPurpose.VERIFY_EMAIL:
        return TokenExpiration.VERIFY_EMAIL;
      case TokenPurpose.API_KEY:
        return TokenExpiration.API_KEY;
      case TokenPurpose.TEMPORARY_ACCESS:
        return TokenExpiration.TEMPORARY_ACCESS;
      case TokenPurpose.IMPERSONATION:
        return TokenExpiration.IMPERSONATION;
      default:
        return TokenExpiration.ACCESS_TOKEN;
    }
  }
}
