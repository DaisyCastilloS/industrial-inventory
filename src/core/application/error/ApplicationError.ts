/**
 * @fileoverview Sistema unificado de manejo de errores
 * @author Daisy Castillo
 * @version 1.0.0
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export enum ErrorCode {
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Business errors
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PRODUCT_DISCONTINUED = 'PRODUCT_DISCONTINUED',
  INVALID_MOVEMENT = 'INVALID_MOVEMENT',

  // Auth errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_INACTIVE = 'RESOURCE_INACTIVE',

  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',

  // Configuration errors
  INVALID_CONFIG = 'INVALID_CONFIG',
  MISSING_CONFIG = 'MISSING_CONFIG',

  // Security errors
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  DECRYPTION_ERROR = 'DECRYPTION_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  WEAK_PASSWORD = 'WEAK_PASSWORD',

  // Token errors
  TOKEN_GENERATION_ERROR = 'TOKEN_GENERATION_ERROR',
  TOKEN_VERIFICATION_ERROR = 'TOKEN_VERIFICATION_ERROR',
  TOKEN_REFRESH_ERROR = 'TOKEN_REFRESH_ERROR',
  TOKEN_REVOCATION_ERROR = 'TOKEN_REVOCATION_ERROR',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  INVALID_TOKEN_PURPOSE = 'INVALID_TOKEN_PURPOSE',
}

interface ErrorMetadata {
  code: ErrorCode;
  type: ErrorType;
  httpStatus: number;
  isOperational: boolean;
}

export class ApplicationError extends Error {
  public readonly type: ErrorType;
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    metadata: ErrorMetadata,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = metadata.type;
    this.code = metadata.code;
    this.httpStatus = metadata.httpStatus;
    this.isOperational = metadata.isOperational;
    this.context = context;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      httpStatus: this.httpStatus,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  public static validation(
    message: string,
    code: ErrorCode = ErrorCode.INVALID_INPUT,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.VALIDATION,
        code,
        httpStatus: 400,
        isOperational: true,
      },
      context
    );
  }

  public static business(
    message: string,
    code: ErrorCode,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.BUSINESS,
        code,
        httpStatus: 422,
        isOperational: true,
      },
      context
    );
  }

  public static unauthorized(
    message: string,
    code: ErrorCode = ErrorCode.INVALID_CREDENTIALS,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.UNAUTHORIZED,
        code,
        httpStatus: 401,
        isOperational: true,
      },
      context
    );
  }

  public static forbidden(
    message: string,
    code: ErrorCode = ErrorCode.INSUFFICIENT_PERMISSIONS,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.FORBIDDEN,
        code,
        httpStatus: 403,
        isOperational: true,
      },
      context
    );
  }

  public static notFound(
    message: string,
    code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.NOT_FOUND,
        code,
        httpStatus: 404,
        isOperational: true,
      },
      context
    );
  }

  public static conflict(
    message: string,
    code: ErrorCode = ErrorCode.RESOURCE_ALREADY_EXISTS,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.CONFLICT,
        code,
        httpStatus: 409,
        isOperational: true,
      },
      context
    );
  }

  public static internal(
    message: string,
    code: ErrorCode = ErrorCode.DATABASE_ERROR,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.INTERNAL,
        code,
        httpStatus: 500,
        isOperational: false,
      },
      context
    );
  }

  public static serviceUnavailable(
    message: string,
    code: ErrorCode = ErrorCode.EXTERNAL_SERVICE_ERROR,
    context?: Record<string, any>
  ): ApplicationError {
    return new ApplicationError(
      message,
      {
        type: ErrorType.SERVICE_UNAVAILABLE,
        code,
        httpStatus: 503,
        isOperational: true,
      },
      context
    );
  }
}
