

import { LoggerWrapperInterface } from '../interface/LoggerWrapperInterface';
import {
  ApplicationError,
  ErrorType,
  ErrorCode,
} from '../error/ApplicationError';
import { BaseEntity } from '../../domain/repository/base/BaseRepository';
import {
  ServiceResult,
  PaginatedResult,
} from '../../../infrastructure/services/base/ServiceTypes';

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseUseCase<TInput = void, TOutput = void> {
  constructor(
    protected logger: LoggerWrapperInterface,
    protected context: UseCaseContext
  ) {}

  public async execute(
    input: TInput,
    options: UseCaseOptions = {}
  ): Promise<TOutput> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    try {
      if (!options.skipValidation) {
        await this.preValidate(input);
      }

      const result = await this.executeInternal(input);

      if (!options.skipValidation) {
        await this.postValidate(result);
      }

      if (!options.skipLogging) {
        await this.logSuccess(input, result, {
          traceId,
          executionTime: Date.now() - startTime,
          ...options.customContext,
        });
      }

      return result;
    } catch (error) {
      const applicationError = this.transformError(error);

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

  protected abstract executeInternal(input: TInput): Promise<TOutput>;

  protected async preValidate(input: TInput): Promise<void> {}

  protected async postValidate(result: TOutput): Promise<void> {}

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

  protected sanitizeInput(input: TInput): any {
    if (!input) return input;
    const sanitized = { ...(input as any) };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    return sanitized;
  }

  protected sanitizeResult(result: TOutput): any {
    if (!result) return result;
    const sanitized = { ...(result as any) };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    return sanitized;
  }

  protected transformError(error: any): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

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

    return ApplicationError.internal(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      ErrorCode.DATABASE_ERROR,
      { originalError: error }
    );
  }

  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export abstract class BaseListUseCase<TEntity extends BaseEntity, TOutput> extends BaseUseCase<
  { page?: number; limit?: number; filters?: Record<string, any> },
  PaginatedResponse<TOutput>
> {
  protected abstract findAll(filters?: Record<string, any>): Promise<ServiceResult<PaginatedResult<TEntity>>>;
  protected abstract mapToDTO(entity: TEntity): TOutput;

  protected async executeInternal({
    page = 1,
    limit = 10,
    filters = {},
  }): Promise<PaginatedResponse<TOutput>> {
    const result = await this.findAll(filters);
    if (!result || !result.data) {
      throw new Error('No results found');
    }

    return {
      data: result.data.items.map(entity => this.mapToDTO(entity)),
      total: result.data.total,
      page: result.data.page,
      limit: result.data.limit,
      totalPages: result.data.totalPages,
    };
  }
}

export abstract class BaseCreateUseCase<TInput, TEntity extends BaseEntity> extends BaseUseCase<
  TInput,
  TEntity
> {
  protected abstract validateCreateInput(input: TInput): Promise<void>;
  protected abstract performCreate(input: TInput): Promise<ServiceResult<TEntity>>;
  protected abstract validateCreatedEntity(entity: TEntity): Promise<void>;

  protected async executeInternal(input: TInput): Promise<TEntity> {
    await this.validateCreateInput(input);
    const result = await this.performCreate(input);
    if (!result || !result.data) {
      throw new Error('Failed to create entity');
    }
    await this.validateCreatedEntity(result.data);
    return result.data;
  }
}

export abstract class BaseUpdateUseCase<
  TInput extends { id: number },
  TEntity extends BaseEntity
> extends BaseUseCase<TInput, TEntity> {
  protected abstract validateUpdateInput(input: TInput): Promise<void>;
  protected abstract findEntityById(id: number): Promise<ServiceResult<TEntity>>;
  protected abstract performUpdate(
    current: TEntity,
    input: TInput
  ): Promise<ServiceResult<TEntity>>;
  protected abstract validateUpdatedEntity(entity: TEntity): Promise<void>;

  protected async executeInternal(input: TInput): Promise<TEntity> {
    await this.validateUpdateInput(input);

    const currentResult = await this.findEntityById(input.id);
    if (!currentResult || !currentResult.data) {
      throw ApplicationError.notFound(
        `${this.context.entityName} not found`,
        ErrorCode.RESOURCE_NOT_FOUND,
        { id: input.id }
      );
    }

    const result = await this.performUpdate(currentResult.data, input);
    if (!result || !result.data) {
      throw new Error('Failed to update entity');
    }

    await this.validateUpdatedEntity(result.data);
    return result.data;
  }
}

export abstract class BaseDeleteUseCase<TEntity extends BaseEntity> extends BaseUseCase<number, void> {
  protected abstract findEntityById(id: number): Promise<ServiceResult<TEntity>>;
  protected abstract performDelete(id: number): Promise<ServiceResult<void>>;

  protected async executeInternal(id: number): Promise<void> {
    const result = await this.findEntityById(id);
    if (!result || !result.data) {
      throw ApplicationError.notFound(
        `${this.context.entityName} not found`,
        ErrorCode.RESOURCE_NOT_FOUND,
        { id }
      );
    }

    await this.performDelete(id);
  }
}

export abstract class BaseGetByIdUseCase<TEntity extends BaseEntity, TOutput> extends BaseUseCase<
  number,
  TOutput
> {
  protected abstract findById(id: number): Promise<ServiceResult<TEntity>>;
  protected abstract validateEntity(entity: TEntity): void;
  protected abstract mapToDTO(entity: TEntity): TOutput;

  protected async executeInternal(id: number): Promise<TOutput> {
    const result = await this.findById(id);
    if (!result || !result.data) {
      throw ApplicationError.notFound(
        `${this.context.entityName} not found`,
        ErrorCode.RESOURCE_NOT_FOUND,
        { id }
      );
    }

    this.validateEntity(result.data);
    return this.mapToDTO(result.data);
  }
}
