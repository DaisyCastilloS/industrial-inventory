/**
 * @fileoverview Base use case class with common functionality
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { LoggerWrapperInterface } from '../interface/LoggerWrapperInterface';
import {
  ApplicationError,
  ErrorType,
  ErrorCode,
} from '../error/ApplicationError';

export interface UseCaseContext {
  userId?: number;
  action: string;
  entityName: string;
  [key: string]: any;
}

export interface UseCaseOptions {
  skipValidation?: boolean;
  skipLogging?: boolean;
  customContext?: Record<string, any>;
}

export abstract class BaseUseCase<TInput = void, TOutput = void> {
  constructor(
    protected logger: LoggerWrapperInterface,
    protected context: UseCaseContext
  ) {}

  /**
   * Main execution method
   */
  public async execute(
    input: TInput,
    options: UseCaseOptions = {}
  ): Promise<TOutput> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    try {
      // Pre-execution validation
      if (!options.skipValidation) {
        await this.preValidate(input);
      }

      // Execute business logic
      const result = await this.executeInternal(input);

      // Post-execution validation
      if (!options.skipValidation) {
        await this.postValidate(result);
      }

      // Log success
      if (!options.skipLogging) {
        await this.logSuccess(input, result, {
          traceId,
          executionTime: Date.now() - startTime,
          ...options.customContext,
        });
      }

      return result;
    } catch (error) {
      // Transform error if needed
      const applicationError = this.transformError(error);

      // Log error
      if (!options.skipLogging) {
        await this.logError(applicationError, input, {
          traceId,
          executionTime: Date.now() - startTime,
          ...options.customContext,
        });
      }

      throw applicationError;
    }
  }

  /**
   * Internal execution method to be implemented by subclasses
   */
  protected abstract executeInternal(input: TInput): Promise<TOutput>;

  /**
   * Pre-execution validation
   */
  protected async preValidate(input: TInput): Promise<void> {
    // Override in subclasses for input validation
  }

  /**
   * Post-execution validation
   */
  protected async postValidate(result: TOutput): Promise<void> {
    // Override in subclasses for result validation
  }

  /**
   * Success logging
   */
  protected async logSuccess(
    input: TInput,
    result: TOutput,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.logger.info(`[${this.context.action}] Success`, {
      entityName: this.context.entityName,
      input: this.sanitizeInput(input),
      result: this.sanitizeResult(result),
      userId: this.context.userId,
      ...metadata,
    });
  }

  /**
   * Error logging
   */
  protected async logError(
    error: ApplicationError,
    input: TInput,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.logger.error(
      `[${this.context.action}] Error: ${error.message}`,
      {
        entityName: this.context.entityName,
        errorType: error.type,
        errorCode: error.code,
        input: this.sanitizeInput(input),
        userId: this.context.userId,
        stack: error.stack,
        ...metadata,
      }
    );
  }

  /**
   * Input sanitization for logging
   */
  protected sanitizeInput(input: TInput): any {
    if (!input) return input;

    const sanitized = { ...(input as any) };

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;

    return sanitized;
  }

  /**
   * Result sanitization for logging
   */
  protected sanitizeResult(result: TOutput): any {
    if (!result) return result;

    const sanitized = { ...(result as any) };

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;

    return sanitized;
  }

  /**
   * Error transformation
   */
  protected transformError(error: any): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    // Handle known error types
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return ApplicationError.validation(error.message);
      }
      if (error.name === 'TypeError') {
        return ApplicationError.validation(
          error.message,
          ErrorCode.INVALID_FORMAT
        );
      }
      if (error.name === 'ReferenceError') {
        return ApplicationError.internal(error.message);
      }
    }

    // Default to internal error
    return ApplicationError.internal(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      ErrorCode.DATABASE_ERROR,
      { originalError: error }
    );
  }

  /**
   * Generate trace ID for request tracking
   */
  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Base class for list use cases with pagination
 */
export abstract class BaseListUseCase<TOutput> extends BaseUseCase<
  { page?: number; limit?: number; filters?: Record<string, any> },
  {
    data: TOutput[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
> {
  protected abstract findAll(filters?: Record<string, any>): Promise<TOutput[]>;

  protected async executeInternal({
    page = 1,
    limit = 10,
    filters = {},
  }): Promise<{
    data: TOutput[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const entities = await this.findAll(filters);
    const total = entities.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = entities.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }
}

/**
 * Base class for create use cases
 */
export abstract class BaseCreateUseCase<TInput, TOutput> extends BaseUseCase<
  TInput,
  TOutput
> {
  protected abstract validateCreateInput(input: TInput): Promise<void>;
  protected abstract performCreate(input: TInput): Promise<TOutput>;
  protected abstract validateCreatedEntity(entity: TOutput): Promise<void>;

  protected async executeInternal(input: TInput): Promise<TOutput> {
    await this.validateCreateInput(input);
    const entity = await this.performCreate(input);
    await this.validateCreatedEntity(entity);
    return entity;
  }
}

/**
 * Base class for update use cases
 */
export abstract class BaseUpdateUseCase<
  TInput extends { id: number },
  TOutput,
> extends BaseUseCase<TInput, TOutput> {
  protected abstract validateUpdateInput(input: TInput): Promise<void>;
  protected abstract findEntityById(id: number): Promise<TOutput>;
  protected abstract performUpdate(
    current: TOutput,
    input: TInput
  ): Promise<TOutput>;
  protected abstract validateUpdatedEntity(entity: TOutput): Promise<void>;

  protected async executeInternal(input: TInput): Promise<TOutput> {
    await this.validateUpdateInput(input);

    const current = await this.findEntityById(input.id);
    if (!current) {
      throw ApplicationError.notFound(
        `${this.context.entityName} not found`,
        ErrorCode.RESOURCE_NOT_FOUND,
        { id: input.id }
      );
    }

    const updated = await this.performUpdate(current, input);
    await this.validateUpdatedEntity(updated);
    return updated;
  }
}

/**
 * Base class for delete use cases
 */
export abstract class BaseDeleteUseCase extends BaseUseCase<number, void> {
  protected abstract findEntityById(id: number): Promise<any>;
  protected abstract performDelete(id: number): Promise<void>;

  protected async executeInternal(id: number): Promise<void> {
    const entity = await this.findEntityById(id);
    if (!entity) {
      throw ApplicationError.notFound(
        `${this.context.entityName} not found`,
        ErrorCode.RESOURCE_NOT_FOUND,
        { id }
      );
    }

    await this.performDelete(id);
  }
}

export abstract class BaseGetByIdUseCase<TOutput> extends BaseUseCase<
  number,
  TOutput
> {
  protected abstract findById(id: number): Promise<any>;
  protected abstract validateEntity(entity: any): void;
  protected abstract mapToDTO(entity: any): TOutput;

  protected async executeInternal(id: number): Promise<TOutput> {
    const entity = await this.findById(id);
    this.validateEntity(entity);
    return this.mapToDTO(entity);
  }
}
