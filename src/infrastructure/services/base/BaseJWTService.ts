import { randomBytes } from 'crypto';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { JWTInterface, JWTPayload } from '../../../core/application/interface/JWTInterface';
import { LoggerWrapperInterface } from '../../../core/application/interface/LoggerWrapperInterface';
import { WinstonLogger } from '../../logger/WinstonLogger';
import { JWTOptions, VerifyOptions } from './ServiceTypes';
import { TokenPurpose } from '../../../shared/constants/TokenPurpose';
import { ApplicationError, ErrorType, ErrorCode } from '../../../core/application/error/ApplicationError';

type CustomSignOptions = {
  algorithm: jwt.Algorithm;
  audience: string;
  issuer: string;
  jwtid?: string;
  expiresIn?: string | number;
};

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

    const defaultSecret = randomBytes(32).toString('hex');
    const defaultRefreshSecret = randomBytes(32).toString('hex');

    this.secretKey = Buffer.from(process.env.JWT_SECRET_KEY || defaultSecret, 'hex');
    this.refreshSecretKey = Buffer.from(process.env.JWT_REFRESH_SECRET_KEY || defaultRefreshSecret, 'hex');

    const audience = 'industrial-inventory-users';
    const issuer = 'industrial-inventory-api';

    this.defaultOptions = {
      algorithm: 'HS256' as const,
      audience,
      issuer,
    };

    this.defaultVerifyOptions = {
      algorithms: ['HS256'],
      audience,
      issuer,
    };

    const cleanupInterval = setInterval(() => this.cleanupRevokedTokens(), 60 * 60 * 1000);
    cleanupInterval.unref();
  }

  private validateEnvironmentVariables(): void {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET_KEY) {
        throw new ApplicationError('JWT_SECRET_KEY not set in production', {
          type: ErrorType.INTERNAL,
          code: ErrorCode.INVALID_CONFIG,
          httpStatus: 500,
          isOperational: false,
        });
      }
      if (!process.env.JWT_REFRESH_SECRET_KEY) {
        throw new ApplicationError('JWT_REFRESH_SECRET_KEY not set in production', {
          type: ErrorType.INTERNAL,
          code: ErrorCode.INVALID_CONFIG,
          httpStatus: 500,
          isOperational: false,
        });
      }
    }
  }

  private cleanupRevokedTokens(): void {
    const now = Date.now();
    for (const [token, expiry] of this.revokedTokens.entries()) {
      if (now > expiry) {
        this.revokedTokens.delete(token);
      }
    }
  }

  private getSecretForPurpose(purpose: TokenPurpose): string {
    return purpose === TokenPurpose.REFRESH
      ? process.env.JWT_REFRESH_SECRET || 'your_jwt_secret'
      : process.env.JWT_SECRET || 'your_jwt_secret';
  }

  private getExpiryForPurpose(purpose: TokenPurpose): number {
    return purpose === TokenPurpose.REFRESH ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days or 1 hour in seconds
  }

  private validatePayload(payload: any): asserts payload is Omit<JWTPayload, 'iat' | 'exp'> {
    if (!payload || typeof payload !== 'object') {
      throw new ApplicationError('Payload del token inválido', {
        type: ErrorType.VALIDATION,
        code: ErrorCode.INVALID_TOKEN,
        httpStatus: 400,
        isOperational: true,
      });
    }

    if (typeof payload.userId !== 'number') {
      throw new ApplicationError('Payload del token inválido: userId debe ser un número', {
        type: ErrorType.VALIDATION,
        code: ErrorCode.INVALID_TOKEN,
        httpStatus: 400,
        isOperational: true,
      });
    }

    if (typeof payload.email !== 'string') {
      throw new ApplicationError('Payload del token inválido: email debe ser una cadena', {
        type: ErrorType.VALIDATION,
        code: ErrorCode.INVALID_TOKEN,
        httpStatus: 400,
        isOperational: true,
      });
    }

    if (typeof payload.role !== 'string') {
      throw new ApplicationError('Payload del token inválido: role debe ser una cadena', {
        type: ErrorType.VALIDATION,
        code: ErrorCode.INVALID_TOKEN,
        httpStatus: 400,
        isOperational: true,
      });
    }
  }

  private validateTokenPurpose(purpose: any): asserts purpose is TokenPurpose {
    if (!Object.values(TokenPurpose).includes(purpose)) {
      throw new ApplicationError('Propósito de token inválido', {
        type: ErrorType.VALIDATION,
        code: ErrorCode.INVALID_TOKEN_PURPOSE,
        httpStatus: 400,
        isOperational: true,
      });
    }
  }

  async generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    purpose: TokenPurpose
  ): Promise<string> {
    try {
      this.validatePayload(payload);
      this.validateTokenPurpose(purpose);

      const secret = this.getSecretForPurpose(purpose);
      const expiresIn = this.getExpiryForPurpose(purpose);

      const signOptions: CustomSignOptions = {
        ...this.defaultOptions,
        jwtid: randomBytes(16).toString('hex'),
      };

      // Only set expiresIn if exp is not already in the payload
      if (!('exp' in payload)) {
        signOptions.expiresIn = expiresIn;
      }

      const token = jwt.sign(
        { ...payload, purpose },
        secret,
        signOptions as SignOptions
      );

      this.logger.info('Token generated', { 
        type: 'token_generation',
        purpose, 
        userId: payload.userId,
        metadata: { email: payload.email }
      });
      return token;
    } catch (error) {
      this.logger.error('Error generating token', { 
        type: 'token_generation_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: { userId: payload.userId }
      });
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError('Error al generar token', {
        type: ErrorType.INTERNAL,
        code: ErrorCode.TOKEN_GENERATION_ERROR,
        httpStatus: 500,
        isOperational: true,
      });
    }
  }

  async verifyToken(token: string, purpose: TokenPurpose): Promise<JWTPayload> {
    try {
      this.validateTokenPurpose(purpose);

      if (this.revokedTokens.has(token)) {
        throw new ApplicationError('Token revocado', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.TOKEN_REVOKED,
          httpStatus: 401,
          isOperational: true,
        });
      }

      const secret = this.getSecretForPurpose(purpose);
      let decoded: any;

      try {
        // Primero decodificamos sin verificar la firma
        decoded = jwt.decode(token);
        
        if (!decoded || typeof decoded !== 'object') {
          throw new ApplicationError('Token inválido', {
            type: ErrorType.VALIDATION,
            code: ErrorCode.INVALID_TOKEN,
            httpStatus: 401,
            isOperational: true,
          });
        }

        // Verificamos el propósito antes de la firma
        if (decoded.purpose !== purpose) {
          throw new ApplicationError('Propósito del token no coincide', {
            type: ErrorType.VALIDATION,
            code: ErrorCode.INVALID_TOKEN_PURPOSE,
            httpStatus: 401,
            isOperational: true,
          });
        }

        // Ahora verificamos la firma
        decoded = jwt.verify(token, secret, this.defaultVerifyOptions);

        if (!this.isJWTPayload(decoded)) {
          throw new ApplicationError('Token inválido', {
            type: ErrorType.VALIDATION,
            code: ErrorCode.INVALID_TOKEN,
            httpStatus: 401,
            isOperational: true,
          });
        }

      } catch (error) {
        if (error instanceof ApplicationError) {
          throw error;
        }
        
        // Handle JWT errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown JWT error';
        if (errorMessage.includes('expired') || errorMessage.includes('exp')) {
          throw new ApplicationError('Token expirado', {
            type: ErrorType.VALIDATION,
            code: ErrorCode.TOKEN_EXPIRED,
            httpStatus: 401,
            isOperational: true,
          });
        }
        throw new ApplicationError('Token inválido', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 401,
          isOperational: true,
        });
      }

      return decoded;

    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError('Error al verificar token', {
        type: ErrorType.INTERNAL,
        code: ErrorCode.TOKEN_VERIFICATION_ERROR,
        httpStatus: 500,
        isOperational: true,
      });
    }
  }

  private isJWTPayload(decoded: any): decoded is JWTPayload {
    return (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.userId === 'number' &&
      typeof decoded.email === 'string' &&
      typeof decoded.role === 'string' &&
      typeof decoded.purpose === 'string'
    );
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const decoded = await this.verifyToken(refreshToken, TokenPurpose.REFRESH);
      const { userId, email, role } = decoded;

      const newToken = await this.generateToken(
        { userId, email, role, purpose: TokenPurpose.ACCESS },
        TokenPurpose.ACCESS
      );

      // Revoke the used refresh token
      await this.revokeToken(refreshToken);

      await this.logger.info('Token refreshed', {
        type: 'token_refresh',
        userId,
        metadata: { email }
      });

      return newToken;
    } catch (error) {
      await this.logger.error('Error refreshing token', {
        type: 'token_refresh_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError('Error al refrescar token', {
        type: ErrorType.INTERNAL,
        code: ErrorCode.TOKEN_REFRESH_ERROR,
        httpStatus: 500,
        isOperational: true,
      });
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token);
      if (!this.isJWTPayload(decoded)) {
        throw new ApplicationError('Token inválido', {
          type: ErrorType.VALIDATION,
          code: ErrorCode.INVALID_TOKEN,
          httpStatus: 400,
          isOperational: true,
        });
      }

      const expiryMs = decoded.exp ? decoded.exp * 1000 : Date.now() + 3600000;
      this.revokedTokens.set(token, expiryMs);

      await this.logger.info('Token revoked', {
        type: 'token_revocation',
        userId: decoded.userId,
        metadata: { email: decoded.email }
      });
    } catch (error) {
      await this.logger.error('Error revoking token', {
        type: 'token_revocation_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError('Error al revocar token', {
        type: ErrorType.INTERNAL,
        code: ErrorCode.TOKEN_REVOCATION_ERROR,
        httpStatus: 500,
        isOperational: true,
      });
    }
  }

  async isTokenExpired(token: string): Promise<boolean> {
    try {
      const decoded = jwt.decode(token);
      if (!this.isJWTPayload(decoded)) {
        return true;
      }

      return !decoded.exp || Date.now() >= decoded.exp * 1000;
    } catch (error) {
      await this.logger.error('Error checking token expiration', {
        type: 'token_expiration_check_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return true;
    }
  }

  async getTokenTimeRemaining(token: string): Promise<number> {
    try {
      const decoded = jwt.decode(token);
      if (!this.isJWTPayload(decoded) || !decoded.exp) {
        return 0;
      }

      const remaining = (decoded.exp * 1000) - Date.now();
      return Math.max(0, Math.floor(remaining / 1000));
    } catch (error) {
      await this.logger.error('Error getting token time remaining', {
        type: 'token_time_remaining_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }
}
